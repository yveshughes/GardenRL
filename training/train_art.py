"""
GardenRL ART Training Script

Trains an LLM agent to grow hydroponic lettuce using OpenPipe ART
(Agent Reinforcement Training) with GRPO.

Architecture:
    ART (serverless GPU) -> LLM (meta-llama/Llama-3.1-8B-Instruct by default) -> GardenRL (OpenEnv environment)

    The LLM reads observations as text and outputs actions as XML.
    ART trains the model with GRPO based on harvest weight rewards.

Usage:
    # Default: serverless training via W&B (no local GPU needed)
    python train_art.py

    # With custom model
    python train_art.py --model OpenPipe/Qwen3-14B-Instruct

    # Resume from checkpoint
    python train_art.py --resume

    # Use local GPU instead (e.g. Northflank H100)
    python train_art.py --local --model Qwen/Qwen3-8B
"""

import argparse
import asyncio
import csv
from datetime import datetime
import io
import re
import statistics
import sys
from typing import Optional

try:
    import art
    from art import ServerlessBackend
except ImportError:
    print("ART not installed. Install with: pip install openpipe-art")
    print("  (for local GPU training: pip install 'openpipe-art[backend]')")
    sys.exit(1)

try:
    from art import LocalBackend
except ImportError:
    LocalBackend = None  # Only needed with --local flag

from pydantic import BaseModel

# Import from the installed GardenRL package (pip install -e .)
from GardenRL.server.GardenRL_environment import GardenrlEnvironment
from GardenRL.models import GardenrlAction

try:
    import pyarrow  # noqa: F401
    PYARROW_AVAILABLE = True
except ImportError:
    PYARROW_AVAILABLE = False

try:
    import wandb
    WANDB_AVAILABLE = True
except ImportError:
    WANDB_AVAILABLE = False


# Serverless backend currently rejects some legacy IDs.
# Normalize them to currently accepted base models.
DEFAULT_SERVERLESS_MODEL = "meta-llama/Llama-3.1-8B-Instruct"
SERVERLESS_MODEL_ALIASES = {
    # Serverless 30B target should be the Instruct variant.
    "Qwen/Qwen3-30B-A3B": "OpenPipe/Qwen3-30B-A3B-Instruct",
    "Qwen/Qwen3-30B-A3B-Instruct": "OpenPipe/Qwen3-30B-A3B-Instruct",
    "Qwen/Qwen3-30B-A3B-Base": "OpenPipe/Qwen3-30B-A3B-Instruct",
    "OpenPipe/Qwen3-30B-A3B-Base": "OpenPipe/Qwen3-30B-A3B-Instruct",
    # In this environment, serverless rejects this HF ID but accepts OpenPipe's.
    "Qwen/Qwen3-8B": "OpenPipe/Qwen3-14B-Instruct",
    "Qwen/Qwen3-8B-Base": "OpenPipe/Qwen3-14B-Instruct",
    # Llama base variant rejected, use Instruct.
    "meta-llama/Llama-3.1-8B": "meta-llama/Llama-3.1-8B-Instruct",
}

PROVEN_SERVERLESS_MODELS = [
    "OpenPipe/Qwen3-14B-Instruct",
    "meta-llama/Llama-3.1-8B-Instruct",
]

DOCUMENTED_SERVERLESS_MODELS = [
    "OpenPipe/Qwen3-14B-Instruct",
    "OpenPipe/Qwen3-30B-A3B-Instruct",
    "meta-llama/Llama-3.1-8B-Instruct",
    "openai/gpt-oss-20b",
]


def resolve_model_id(model_id: str, local: bool) -> tuple[str, Optional[str]]:
    """Resolve model ID to a serverless-compatible base model when needed."""
    if local:
        return model_id, None
    resolved = SERVERLESS_MODEL_ALIASES.get(model_id, model_id)
    if resolved != model_id:
        note = f"Resolved legacy model '{model_id}' -> '{resolved}' for serverless backend."
        return resolved, note
    return model_id, None


# ─────────────────────────────────────────────────────────────────────
# Scenario definition
# ─────────────────────────────────────────────────────────────────────

class GardenScenario(BaseModel):
    """A single training scenario with a unique seed."""
    seed: int
    description: str = "Grow healthy lettuce over 30 days"


def compute_min_harvest_day(episode_days: int) -> int:
    """Harvest is late in the episode, but keep short curricula harvest-able."""
    if episode_days >= 30:
        return 25
    return max(5, int(round(0.8 * episode_days)))


def build_system_prompt(episode_days: int, min_harvest_day: int) -> str:
    """Build an XML-only control prompt tuned to the configured episode horizon."""
    latest_start = max(min_harvest_day, episode_days - 1)
    return f"""\
You are an expert hydroponic farmer. Each day you get sensor readings and must respond with an XML action.

Goal: maximize harvest weight by day {episode_days}. Keep pH 5.5-6.5 (drift up), EC 1.2-2.0 (depletes), temp 18-22C.

Respond with ONLY these XML tags:
<reasoning>brief diagnosis</reasoning>
<action>adjust_ph_down|adjust_ph_up|add_nutrients|dilute_nutrients|maintain|harvest</action>
<amount>0.3</amount>

Rules:
- amount is optional, range 0.1-0.5
- harvest only after day {min_harvest_day}
- MUST harvest by day {latest_start}-{episode_days} or get zero reward
- no markdown, no code fences, no extra text
"""


def format_observation(obs, episode_days: int) -> str:
    """Format a GardenRL observation as text for the LLM."""
    lines = [
        f"Day {obs.day}/{episode_days}",
        f"pH: {obs.ph:.2f}",
        f"EC: {obs.ec:.2f} mS/cm",
        f"Water temp: {obs.water_temp:.1f}C",
        f"Leaf color: {obs.leaf_color}",
        f"Leaves: {obs.estimated_leaf_count}",
        f"Height: {obs.plant_height_cm:.1f} cm",
        f"Growth stage: {obs.growth_stage}",
    ]
    if obs.warnings:
        lines.append(f"Warnings: {', '.join(obs.warnings)}")
    return "\n".join(lines)


VALID_ACTIONS = [
    "adjust_ph_up",
    "adjust_ph_down",
    "add_nutrients",
    "dilute_nutrients",
    "maintain",
    "harvest",
]


def parse_text_action(
    response_text: str,
    day: int,
    min_harvest_day: int,
) -> tuple[GardenrlAction, bool, bool]:
    """Parse response into action; returns (action, strict_xml_ok, recovered_ok)."""
    strict_xml_ok = False
    recovered_ok = False
    action_type: Optional[str] = None

    # Strict XML parse first.
    action_match = re.search(r"<action>(.*?)</action>", response_text, re.DOTALL | re.IGNORECASE)
    if action_match:
        candidate = action_match.group(1).strip().lower()
        if candidate in VALID_ACTIONS:
            action_type = candidate
            strict_xml_ok = True
            recovered_ok = True

    # Fallback JSON parse.
    if action_type is None:
        json_match = re.search(
            r'"action(?:_type)?"\s*:\s*"([a-z_]+)"',
            response_text,
            re.IGNORECASE,
        )
        if json_match:
            candidate = json_match.group(1).strip().lower()
            if candidate in VALID_ACTIONS:
                action_type = candidate
                recovered_ok = True

    # Keyword fallback
    if action_type is None:
        lower_text = response_text.lower()
        for candidate in VALID_ACTIONS:
            if candidate in lower_text:
                action_type = candidate
                recovered_ok = True
                break

    if action_type is None:
        action_type = "maintain"

    # Can only harvest after configured day.
    if action_type == "harvest" and day < min_harvest_day:
        action_type = "maintain"

    # Extract amount
    amount: Optional[float] = None
    amount_patterns = [
        r'"amount"\s*:\s*([-+]?\d*\.?\d+)',
        r"<amount>(.*?)</amount>",
    ]
    for pattern in amount_patterns:
        amount_match = re.search(pattern, response_text, re.DOTALL | re.IGNORECASE)
        if amount_match:
            try:
                amount = float(amount_match.group(1).strip())
                amount = max(0.1, min(0.5, amount))
                break
            except ValueError:
                amount = None

    reasoning = response_text.strip()[:200] if response_text.strip() else ""

    return (
        GardenrlAction(
            action_type=action_type,
            ph_adjustment=amount if "ph" in action_type else None,
            nutrient_adjustment=amount if "nutrient" in action_type else None,
            reasoning=reasoning,
        ),
        strict_xml_ok,
        recovered_ok,
    )


def trim_trajectory_context(trajectory: art.Trajectory, context_turns: int) -> None:
    """Keep only a bounded number of (user, assistant) turns to limit sequence length."""
    if context_turns <= 0:
        return
    max_len = 1 + 2 * context_turns  # system + N user/assistant pairs
    while len(trajectory.messages_and_choices) > max_len:
        del trajectory.messages_and_choices[1:3]


def get_episode_days_for_step(step: int, total_steps: int, max_episode_days: int, curriculum: bool) -> int:
    """Optional short-to-long curriculum to reduce memory pressure early."""
    if not curriculum:
        return max_episode_days
    progress = float(step + 1) / float(max(total_steps, 1))
    if progress <= 0.25:
        return min(max_episode_days, 14)
    if progress <= 0.5:
        return min(max_episode_days, 20)
    if progress <= 0.75:
        return min(max_episode_days, 24)
    return max_episode_days


# ─────────────────────────────────────────────────────────────────────
# Rollout function (core ART integration)
# ─────────────────────────────────────────────────────────────────────

async def rollout(
    model: art.Model,
    scenario: GardenScenario,
    max_completion_tokens: int,
    temperature: float,
    inference_model_name: str,
    fallback_model_name: str,
    context_turns: int,
    episode_days: int,
    force_harvest: bool = True,
) -> art.Trajectory:
    """
    Run one GardenRL episode with the LLM agent.

    The LLM reads observations as user messages and responds with actions.
    ART records the full trajectory for GRPO training.

    Args:
        force_harvest: If True (default, training mode), force terminal-day
            harvest if the agent hasn't harvested. If False (eval mode), let
            the agent succeed or fail on its own.
    """
    try:
        return await _rollout_inner(
            model, scenario, max_completion_tokens, temperature,
            inference_model_name, fallback_model_name, context_turns, episode_days, force_harvest,
        )
    except Exception as exc:
        import traceback
        print(f"  [ROLLOUT ERROR] {exc}")
        traceback.print_exc()
        raise


async def _rollout_inner(
    model: art.Model,
    scenario: GardenScenario,
    max_completion_tokens: int,
    temperature: float,
    inference_model_name: str,
    fallback_model_name: str,
    context_turns: int,
    episode_days: int,
    force_harvest: bool = True,
) -> art.Trajectory:
    episode_days = max(2, min(30, int(episode_days)))
    min_harvest_day = compute_min_harvest_day(episode_days)
    system_prompt = build_system_prompt(episode_days, min_harvest_day)

    env = GardenrlEnvironment(seed=scenario.seed)
    obs = env.reset()

    trajectory = art.Trajectory(
        messages_and_choices=[
            {"role": "system", "content": system_prompt},
        ],
        reward=0,
    )
    parsed_actions = 0
    recovered_actions = 0
    forced_harvests = 0
    action_counts: dict[str, int] = {
        "adjust_ph_up": 0,
        "adjust_ph_down": 0,
        "add_nutrients": 0,
        "dilute_nutrients": 0,
        "maintain": 0,
        "harvest": 0,
    }
    cumulative_condition = 0.0
    steps_taken = 0
    inference_fallback_used = 0

    for day in range(episode_days):
        # Format observation as user message
        obs_text = format_observation(obs, episode_days)
        trajectory.messages_and_choices.append(
            {"role": "user", "content": obs_text}
        )

        # Get LLM completion (XML contract in prompt).
        client = model.openai_client()
        try:
            chat_completion = await client.chat.completions.create(
                model=inference_model_name,
                messages=trajectory.messages(),
                max_completion_tokens=max_completion_tokens,
                temperature=temperature,
            )
        except Exception as exc:
            err = str(exc)
            if day == 0:
                print(f"  [DEBUG] Inference error on day {day}: {err[:300]}")
            # Serverless can intermittently fail to resolve latest artifact aliases.
            # Fallback to base model so training can continue instead of crashing.
            if (
                'Could not find model "wandb-artifact:///' in err
                or "be sure the model exists and include the fully qualified model ID" in err
            ):
                chat_completion = await client.chat.completions.create(
                    model=fallback_model_name,
                    messages=trajectory.messages(),
                    max_completion_tokens=max_completion_tokens,
                    temperature=temperature,
                )
                inference_fallback_used += 1
            else:
                raise

        # Record the choice (this is what GRPO trains on)
        choice = chat_completion.choices[0]
        trajectory.messages_and_choices.append(choice)
        trim_trajectory_context(trajectory, context_turns)

        # Parse XML action; recover via JSON/keyword fallbacks when needed.
        action, strict_xml_ok, recovered_ok = parse_text_action(
            choice.message.content or "",
            obs.day,
            min_harvest_day,
        )
        if strict_xml_ok:
            parsed_actions += 1
        if recovered_ok:
            recovered_actions += 1

        # Safety fallback: if agent forgets to harvest late, force harvest
        # so trajectories are not all terminal-zero due missed harvest action.
        # Disabled in eval mode so we measure true agent capability.
        if force_harvest and day >= (episode_days - 1) and action.action_type != "harvest":
            action = GardenrlAction(
                action_type="harvest",
                reasoning=(action.reasoning + " | forced terminal harvest fallback").strip(" |"),
            )
            forced_harvests += 1

        action_counts[action.action_type] = action_counts.get(action.action_type, 0) + 1

        # Step the environment
        obs = env.step(action)
        steps_taken += 1

        # Dense condition signal (0-1), independent from terminal harvest reward.
        ph_score = max(0.0, 1.0 - abs(obs.ph - 6.0) / 2.0)
        ec_score = max(0.0, 1.0 - abs(obs.ec - 1.6) / 1.6)
        temp_score = max(0.0, 1.0 - abs(obs.water_temp - 20.0) / 8.0)
        condition_score = 0.45 * ph_score + 0.45 * ec_score + 0.10 * temp_score
        cumulative_condition += condition_score

        if obs.done:
            break

    # Terminal harvest reward (0-1)
    harvest_weight = obs.reward / 10.0  # obs.reward = biomass * 10
    terminal_reward = harvest_weight / 250.0  # Normalize: 0 = dead, 1 = perfect

    # Dense shaping to avoid all-zero gradients early in training.
    avg_condition = cumulative_condition / max(steps_taken, 1)
    survival_ratio = min(obs.day, episode_days) / float(episode_days)
    dense_reward = 0.5 * avg_condition + 0.5 * survival_ratio

    # Keep terminal reward dominant when harvest succeeds; provide a small
    # non-harvest gradient so policy can still improve early.
    if harvest_weight > 0:
        trajectory.reward = 0.7 * terminal_reward + 0.3 * dense_reward
    else:
        trajectory.reward = 0.15 * dense_reward

    # Track metrics for W&B
    trajectory.metrics["harvest_weight"] = harvest_weight
    trajectory.metrics["reward_raw"] = obs.reward
    trajectory.metrics["terminal_reward"] = terminal_reward
    trajectory.metrics["dense_reward"] = dense_reward
    trajectory.metrics["days_survived"] = obs.day
    trajectory.metrics["final_ph"] = obs.ph
    trajectory.metrics["final_ec"] = obs.ec
    trajectory.metrics["success"] = 1.0 if harvest_weight >= 150 else 0.0
    trajectory.metrics["died"] = 1.0 if obs.growth_stage == "dead" else 0.0
    # "parsed_action_rate" is strict XML compliance.
    trajectory.metrics["parsed_action_rate"] = parsed_actions / max(steps_taken, 1)
    trajectory.metrics["recovered_action_rate"] = recovered_actions / max(steps_taken, 1)
    trajectory.metrics["forced_harvests"] = float(forced_harvests)
    agent_harvest_actions = max(0, action_counts.get("harvest", 0) - forced_harvests)
    trajectory.metrics["agent_harvest_actions"] = float(agent_harvest_actions)
    trajectory.metrics["agent_success"] = 1.0 if (harvest_weight >= 150 and forced_harvests == 0 and agent_harvest_actions > 0) else 0.0
    trajectory.metrics["inference_fallback_used"] = float(inference_fallback_used)
    trajectory.metrics["episode_days"] = float(episode_days)
    for action_name, count in action_counts.items():
        trajectory.metrics[f"action_count_{action_name}"] = float(count)

    return trajectory


# ─────────────────────────────────────────────────────────────────────
# Training loop
# ─────────────────────────────────────────────────────────────────────

async def train(args):
    """Main ART training loop."""
    resolved_model, model_note = resolve_model_id(args.model, args.local)
    can_log_trajectories = PYARROW_AVAILABLE
    if args.max_episode_days < 2 or args.max_episode_days > 30:
        clamped = max(2, min(30, args.max_episode_days))
        print(f"Warning: --max-episode-days must be in [2, 30]. Clamping to {clamped}.")
        args.max_episode_days = clamped
    total_trajectories = args.rollouts_per_step * args.attempts

    if args.attempts < 2 and not args.allow_low_attempts:
        print("\nERROR: GRPO requires >=2 attempts per scenario to produce a learning signal.")
        print(f"Provided --attempts {args.attempts}.")
        print("Use --attempts 4 (recommended) for meaningful variance, or --allow-low-attempts for smoke tests.")
        raise SystemExit(2)
    if args.attempts < 4:
        print(
            "Warning: --attempts < 4 can produce noisy/weak GRPO updates. "
            "Use --attempts 4 when GPU memory allows."
        )
    if not args.local and resolved_model == "OpenPipe/Qwen3-14B-Instruct" and total_trajectories > 4:
        print(
            "Warning: OpenPipe/Qwen3-14B-Instruct with >4 trajectories per step "
            "often OOMs on serverless. Consider Qwen/Qwen3-30B-A3B or lower trajectory count."
        )

    model_slug = f"gardenrl-{resolved_model.split('/')[-1].lower()}"
    if args.run_name:
        model_name = args.run_name
    elif args.resume:
        model_name = model_slug
    else:
        model_name = f"{model_slug}-{datetime.now().strftime('%Y%m%d-%H%M%S')}"

    print("=" * 70)
    print("GardenRL ART Training")
    print("=" * 70)
    print(f"Run name: {model_name}")
    print(f"Model: {resolved_model}")
    print(f"Training steps: {args.steps}")
    print(f"Rollouts per step: {args.rollouts_per_step}")
    print(f"Attempts per scenario: {args.attempts}")
    print(f"Total trajectories/step: {total_trajectories}")
    print(f"Learning rate: {args.lr}")
    print(f"Max completion tokens: {args.max_completion_tokens}")
    print(f"Sampling temperature: {args.temperature}")
    print(f"Context turns: {args.context_turns}")
    print(f"Max episode days: {args.max_episode_days}")
    print(f"Curriculum: {'on' if args.curriculum else 'off'}")
    print(f"Backend: {'local' if args.local else 'serverless (W&B)'}")
    if model_note:
        print(f"Note: {model_note}")
    if not can_log_trajectories:
        print("Warning: pyarrow not installed; trajectory parquet logging disabled (metrics only).")
    print("=" * 70)

    # Create trainable model
    model = art.TrainableModel(
        name=model_name,
        project="gardenrl-training",
        base_model=resolved_model,
        # Disable ART's internal wandb logging path. We do explicit wandb logging below.
        report_metrics=[],
    )

    # Select backend
    if args.local:
        if LocalBackend is None:
            print("Local backend requires: pip install 'openpipe-art[backend]'")
            sys.exit(1)
        backend = LocalBackend()
    else:
        backend = ServerlessBackend()

    try:
        await model.register(backend)
    except Exception as exc:
        if "Unsupported base model" in str(exc):
            print("\nERROR: Unsupported serverless base model.")
            print(f"Requested: {resolved_model}")
            print(f"Backend detail: {exc}")
            print("Proven working model(s) in this environment:")
            for model_name in PROVEN_SERVERLESS_MODELS:
                print(f"  - {model_name}")
            print("Documented serverless models (may vary by backend/account rollout):")
            for model_name in DOCUMENTED_SERVERLESS_MODELS:
                print(f"  - {model_name}")
            print("\nExample:")
            print(
                "  python3 train_art.py --model OpenPipe/Qwen3-14B-Instruct "
                "--steps 1 --rollouts-per-step 1 --attempts 4 --context-turns 8 --max-completion-tokens 64"
            )
            raise SystemExit(2) from exc
        raise

    # Initialize W&B for direct metric logging (ART's model.log doesn't
    # reliably write to W&B history on serverless, so we log ourselves).
    wandb_run = None
    if WANDB_AVAILABLE and "WANDB_API_KEY" in __import__("os").environ:
        wandb_run = wandb.init(
            project="gardenrl-training",
            name=model_name,
            config={
                "base_model": resolved_model,
                "steps": args.steps,
                "rollouts_per_step": args.rollouts_per_step,
                "attempts": args.attempts,
                "learning_rate": args.lr,
                "max_completion_tokens": args.max_completion_tokens,
                "temperature": args.temperature,
                "context_turns": args.context_turns,
                "max_episode_days": args.max_episode_days,
                "curriculum": args.curriculum,
                "backend": "local" if args.local else "serverless",
            },
            resume="allow",
        )
        wandb.define_metric("training_step")
        wandb.define_metric("*", step_metric="training_step")
        print(f"W&B dashboard: {wandb_run.url}")

    # Generate scenarios with different seeds for diversity
    scenarios = [
        GardenScenario(seed=i, description=f"Episode seed {i}")
        for i in range(args.rollouts_per_step)
    ]

    # Training loop
    start_step = await model.get_step()
    for step in range(start_step, args.steps):
        print(f"\n--- Training step {step + 1}/{args.steps} ---")
        episode_days = get_episode_days_for_step(step, args.steps, args.max_episode_days, args.curriculum)

        # Get the inference model name from ART (returns wandb-artifact:/// URI
        # for serverless). Pin to explicit step when available to avoid races.
        current_policy_step = await model.get_step()
        if current_policy_step > 0:
            inference_model_name = model.get_inference_name(step=current_policy_step)
        else:
            inference_model_name = model.get_inference_name()

        # Gather trajectories: for each scenario, run multiple attempts
        # GRPO uses the variance between attempts to compute advantages
        train_groups = await art.gather_trajectory_groups(
            (
                art.TrajectoryGroup(
                    rollout(
                        model,
                        scenario,
                        args.max_completion_tokens,
                        args.temperature,
                        inference_model_name,
                        resolved_model,
                        args.context_turns,
                        episode_days,
                    )
                    for _ in range(args.attempts)
                )
                for scenario in scenarios
            ),
            pbar_desc=f"step {step + 1}",
            max_exceptions=args.max_rollout_exceptions,
        )

        # Log gathered metrics
        total_reward = sum(
            t.reward for group in train_groups for t in group.trajectories
        )
        n_trajectories = sum(len(g.trajectories) for g in train_groups)
        if n_trajectories == 0:
            print(
                "  Warning: no successful trajectories this step "
                f"(max_rollout_exceptions={args.max_rollout_exceptions}). Skipping update."
            )
            scenarios = [
                GardenScenario(
                    seed=(step + 1) * args.rollouts_per_step + i,
                    description=f"Episode seed {(step + 1) * args.rollouts_per_step + i}",
                )
                for i in range(args.rollouts_per_step)
            ]
            continue
        avg_reward = total_reward / max(n_trajectories, 1)
        avg_harvest = sum(
            t.metrics.get("harvest_weight", 0)
            for group in train_groups
            for t in group.trajectories
        ) / max(n_trajectories, 1)
        success_rate = sum(
            t.metrics.get("success", 0)
            for group in train_groups
            for t in group.trajectories
        ) / max(n_trajectories, 1)
        avg_parse_rate = sum(
            t.metrics.get("parsed_action_rate", 0)
            for group in train_groups
            for t in group.trajectories
        ) / max(n_trajectories, 1)
        avg_recovered_rate = sum(
            t.metrics.get("recovered_action_rate", 0)
            for group in train_groups
            for t in group.trajectories
        ) / max(n_trajectories, 1)
        avg_harvest_actions = sum(
            t.metrics.get("agent_harvest_actions", 0)
            for group in train_groups
            for t in group.trajectories
        ) / max(n_trajectories, 1)
        avg_agent_success = sum(
            t.metrics.get("agent_success", 0)
            for group in train_groups
            for t in group.trajectories
        ) / max(n_trajectories, 1)
        avg_maintain_actions = sum(
            t.metrics.get("action_count_maintain", 0)
            for group in train_groups
            for t in group.trajectories
        ) / max(n_trajectories, 1)
        avg_forced_harvests = sum(
            t.metrics.get("forced_harvests", 0)
            for group in train_groups
            for t in group.trajectories
        ) / max(n_trajectories, 1)
        avg_inference_fallbacks = sum(
            t.metrics.get("inference_fallback_used", 0)
            for group in train_groups
            for t in group.trajectories
        ) / max(n_trajectories, 1)

        print(f"  Avg reward: {avg_reward:.3f} | Avg harvest: {avg_harvest:.1f}g | "
              f"Success rate: {success_rate:.1%}")
        print(
            f"  XML parse rate: {avg_parse_rate:.1%} | "
            f"Recovered parse rate: {avg_recovered_rate:.1%} | "
            f"Agent harvest actions: {avg_harvest_actions:.2f} | "
            f"Agent success: {avg_agent_success:.1%} | "
            f"Avg maintain actions: {avg_maintain_actions:.2f} | "
            f"Forced harvests: {avg_forced_harvests:.2f} | "
            f"Inference fallbacks: {avg_inference_fallbacks:.2f}"
        )

        # Log metrics to W&B directly
        if wandb_run is not None:
            wandb.log({
                "training_step": step + 1,
                "reward/avg": avg_reward,
                "harvest/avg_weight_g": avg_harvest,
                "harvest/success_rate": success_rate,
                "behavior/parse_rate": avg_parse_rate,
                "behavior/recovered_parse_rate": avg_recovered_rate,
                "behavior/harvest_actions": avg_harvest_actions,
                "behavior/agent_success_rate": avg_agent_success,
                "behavior/maintain_actions": avg_maintain_actions,
                "behavior/forced_harvests": avg_forced_harvests,
                "behavior/inference_fallbacks": avg_inference_fallbacks,
                "training/episode_days": episode_days,
            })

        # Train with GRPO
        try:
            result = await backend.train(
                model, train_groups, learning_rate=args.lr,
            )
        except RuntimeError as exc:
            err = str(exc)
            if "OutOfMemoryError" in err or "CUDA out of memory" in err:
                print("\nERROR: Serverless training ran out of GPU memory.")
                print(f"Model: {resolved_model}")
                print("Use a smaller base model and/or fewer trajectories per step.")
                print("Recommended retries:")
                print(
                    "  python3 train_art.py --model Qwen/Qwen3-30B-A3B "
                    "--rollouts-per-step 1 --attempts 4 --context-turns 8 --curriculum "
                    "--max-completion-tokens 64"
                )
                print(
                    "  python3 train_art.py --model OpenPipe/Qwen3-14B-Instruct "
                    "--rollouts-per-step 1 --attempts 2 --context-turns 6 --curriculum "
                    "--max-completion-tokens 48"
                )
                raise SystemExit(3) from exc
            raise

        # Log trajectories and metrics to W&B.
        # If pyarrow is unavailable, fallback to metrics-only logging.
        if can_log_trajectories:
            try:
                await model.log(
                    train_groups, metrics=result.metrics,
                    step=result.step, split="train",
                )
            except ModuleNotFoundError as exc:
                if exc.name == "pyarrow":
                    can_log_trajectories = False
                    print(
                        "Warning: pyarrow missing during logging; "
                        "falling back to metrics-only logging for remaining steps."
                    )
                    await model.log(
                        metrics=result.metrics,
                        step=result.step,
                        split="train",
                    )
                else:
                    raise
        else:
            await model.log(
                metrics=result.metrics,
                step=result.step,
                split="train",
            )

        # Rotate scenarios with new seeds for next step
        scenarios = [
            GardenScenario(
                seed=(step + 1) * args.rollouts_per_step + i,
                description=f"Episode seed {(step + 1) * args.rollouts_per_step + i}",
            )
            for i in range(args.rollouts_per_step)
        ]

    # Finish W&B run so metrics sync
    if wandb_run is not None:
        wandb_run.finish()

    print("\n" + "=" * 70)
    print("Training complete!")
    print("=" * 70)
    print(f"Model: {model.name}")
    print(f"Steps completed: {args.steps}")
    print(f"View results: https://wandb.ai/ndmm/gardenrl-training")
    print("=" * 70)


# ─────────────────────────────────────────────────────────────────────
# Evaluation / benchmark
# ─────────────────────────────────────────────────────────────────────

def _aggregate_metrics(trajectories: list) -> dict:
    """Compute mean ± std for key metrics over a list of trajectories."""
    keys = [
        "harvest_weight", "reward_raw", "days_survived",
        "final_ph", "final_ec", "success", "died",
        "parsed_action_rate", "recovered_action_rate",
        "forced_harvests", "agent_harvest_actions", "agent_success", "episode_days",
        "action_count_adjust_ph_down", "action_count_adjust_ph_up",
        "action_count_add_nutrients", "action_count_maintain",
        "action_count_harvest",
    ]
    result: dict = {}
    for key in keys:
        values = [t.metrics.get(key, 0.0) for t in trajectories]
        if values:
            result[f"{key}/mean"] = statistics.mean(values)
            result[f"{key}/std"] = statistics.stdev(values) if len(values) > 1 else 0.0
        else:
            result[f"{key}/mean"] = 0.0
            result[f"{key}/std"] = 0.0
    result["reward/mean"] = statistics.mean([t.reward for t in trajectories])
    result["reward/std"] = statistics.stdev([t.reward for t in trajectories]) if len(trajectories) > 1 else 0.0
    result["n_episodes"] = len(trajectories)
    return result


async def evaluate(args):
    """Evaluate checkpoints on a fixed seed benchmark (no training, no forced harvest)."""
    import os

    resolved_model, model_note = resolve_model_id(args.model, args.local)
    if args.max_episode_days < 2 or args.max_episode_days > 30:
        clamped = max(2, min(30, args.max_episode_days))
        print(f"Warning: --max-episode-days must be in [2, 30]. Clamping to {clamped}.")
        args.max_episode_days = clamped

    # Parse checkpoint steps to evaluate
    checkpoint_steps = [int(s.strip()) for s in args.eval_checkpoints.split(",")]

    # Use a stable run name for eval
    model_slug = f"gardenrl-{resolved_model.split('/')[-1].lower()}"
    if args.run_name:
        model_name = args.run_name
    else:
        model_name = model_slug

    print("=" * 70)
    print("GardenRL Evaluation Benchmark")
    print("=" * 70)
    print(f"Model: {resolved_model}")
    print(f"Run name: {model_name}")
    print(f"Eval seeds: {args.eval_seeds}")
    print(f"Checkpoints: {checkpoint_steps}")
    print(f"Max completion tokens: {args.max_completion_tokens}")
    print(f"Temperature: {args.temperature}")
    print(f"Context turns: {args.context_turns}")
    print(f"Episode days: {args.max_episode_days}")
    print(f"Forced harvest: DISABLED (true agent evaluation)")
    if model_note:
        print(f"Note: {model_note}")
    print("=" * 70)

    # Fixed evaluation scenarios
    eval_scenarios = [
        GardenScenario(seed=1000 + i, description=f"Eval seed {1000 + i}")
        for i in range(args.eval_seeds)
    ]

    # Create model and register
    model = art.TrainableModel(
        name=model_name,
        project="gardenrl-training",
        base_model=resolved_model,
        report_metrics=[],
    )

    if args.local:
        if LocalBackend is None:
            print("Local backend requires: pip install 'openpipe-art[backend]'")
            sys.exit(1)
        backend = LocalBackend()
    else:
        backend = ServerlessBackend()

    await model.register(backend)

    # Evaluate each checkpoint
    all_results: list[dict] = []

    for ckpt_step in checkpoint_steps:
        print(f"\n--- Evaluating checkpoint step {ckpt_step} ---")

        # Get inference name for this checkpoint
        if ckpt_step == 0:
            inference_model_name = model.get_inference_name()
        else:
            try:
                inference_model_name = model.get_inference_name(step=ckpt_step)
            except Exception as exc:
                print(f"  Skipping step {ckpt_step}: checkpoint not found ({exc})")
                continue

        # Run all eval scenarios (no forced harvest)
        eval_groups = await art.gather_trajectory_groups(
            (
                art.TrajectoryGroup(
                    rollout(
                        model,
                        scenario,
                        args.max_completion_tokens,
                        args.temperature,
                        inference_model_name,
                        resolved_model,
                        args.context_turns,
                        args.max_episode_days,
                        force_harvest=False,
                    )
                    for _ in range(1)  # TrajectoryGroup needs an iterable
                )
                for scenario in eval_scenarios
            ),
            pbar_desc=f"eval step {ckpt_step}",
            max_exceptions=args.eval_seeds,  # allow all to fail individually
        )

        trajectories = [t for g in eval_groups for t in g.trajectories]
        if not trajectories:
            print(f"  No successful episodes for step {ckpt_step}")
            continue

        agg = _aggregate_metrics(trajectories)
        agg["checkpoint_step"] = ckpt_step

        # Print summary
        hw_mean = agg["harvest_weight/mean"]
        hw_std = agg["harvest_weight/std"]
        sr_mean = agg["success/mean"]
        rw_mean = agg["reward/mean"]
        ah_mean = agg["agent_harvest_actions/mean"]
        as_mean = agg["agent_success/mean"]
        fh_mean = agg["forced_harvests/mean"]
        xml_mean = agg["parsed_action_rate/mean"]
        rec_mean = agg["recovered_action_rate/mean"]
        print(
            f"  Harvest: {hw_mean:.1f} ± {hw_std:.1f}g | "
            f"Success: {sr_mean:.1%} | "
            f"Reward: {rw_mean:.3f}"
        )
        print(
            f"  Agent harvests: {ah_mean:.2f} | "
            f"Agent success: {as_mean:.1%} | "
            f"Forced harvests: {fh_mean:.2f} | "
            f"XML parse: {xml_mean:.1%} | "
            f"Recovered: {rec_mean:.1%}"
        )

        all_results.append(agg)

    if not all_results:
        print("\nNo checkpoint results to report.")
        return

    # Generate reports
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    os.makedirs("eval_results", exist_ok=True)

    # CSV report
    csv_path = f"eval_results/benchmark_{model_slug}_{timestamp}.csv"
    csv_columns = [
        "checkpoint_step", "n_episodes",
        "harvest_weight/mean", "harvest_weight/std",
        "success/mean", "reward/mean", "reward/std",
        "agent_harvest_actions/mean", "agent_success/mean", "forced_harvests/mean",
        "parsed_action_rate/mean", "recovered_action_rate/mean",
        "action_count_adjust_ph_down/mean", "action_count_add_nutrients/mean",
        "action_count_maintain/mean", "action_count_harvest/mean",
        "days_survived/mean", "final_ph/mean", "final_ec/mean",
    ]
    with open(csv_path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=csv_columns, extrasaction="ignore")
        writer.writeheader()
        for row in all_results:
            writer.writerow(row)

    # Markdown report
    md_path = f"eval_results/benchmark_{model_slug}_{timestamp}.md"
    md = io.StringIO()
    md.write(f"# GardenRL Benchmark Report\n\n")
    md.write(f"**Model**: {resolved_model}  \n")
    md.write(f"**Run**: {model_name}  \n")
    md.write(f"**Seeds**: {args.eval_seeds} fixed evaluation episodes (seeds 1000-{999 + args.eval_seeds})  \n")
    md.write(f"**Context turns**: {args.context_turns}  \n")
    md.write(f"**Episode days**: {args.max_episode_days}  \n")
    md.write(f"**Forced harvest**: Disabled  \n")
    md.write(f"**Date**: {datetime.now().isoformat()}  \n\n")

    md.write("## Results by Checkpoint\n\n")
    md.write("| Step | Harvest (g) | Success | Reward | Agent Harvests | Agent Success | Forced | XML Parse | Recovered |\n")
    md.write("|------|-------------|---------|--------|----------------|---------------|--------|-----------|----------|\n")
    for r in all_results:
        md.write(
            f"| {int(r['checkpoint_step'])} "
            f"| {r['harvest_weight/mean']:.1f} ± {r['harvest_weight/std']:.1f} "
            f"| {r['success/mean']:.0%} "
            f"| {r['reward/mean']:.3f} ± {r['reward/std']:.3f} "
            f"| {r['agent_harvest_actions/mean']:.2f} "
            f"| {r['agent_success/mean']:.0%} "
            f"| {r['forced_harvests/mean']:.2f} "
            f"| {r['parsed_action_rate/mean']:.0%} "
            f"| {r['recovered_action_rate/mean']:.0%} |\n"
        )

    # Learning assessment
    md.write("\n## Learning Assessment\n\n")
    if len(all_results) >= 2:
        first = all_results[0]
        last = all_results[-1]
        hw_delta = last["harvest_weight/mean"] - first["harvest_weight/mean"]
        sr_delta = last["success/mean"] - first["success/mean"]
        rw_delta = last["reward/mean"] - first["reward/mean"]
        ah_delta = last["agent_harvest_actions/mean"] - first["agent_harvest_actions/mean"]
        as_delta = last["agent_success/mean"] - first["agent_success/mean"]
        md.write(f"**Step {int(first['checkpoint_step'])} → Step {int(last['checkpoint_step'])}**:\n\n")
        md.write(f"- Harvest weight: {first['harvest_weight/mean']:.1f}g → {last['harvest_weight/mean']:.1f}g ({hw_delta:+.1f}g)\n")
        md.write(f"- Success rate: {first['success/mean']:.0%} → {last['success/mean']:.0%} ({sr_delta:+.0%})\n")
        md.write(f"- Reward: {first['reward/mean']:.3f} → {last['reward/mean']:.3f} ({rw_delta:+.3f})\n")
        md.write(f"- Agent harvests: {first['agent_harvest_actions/mean']:.2f} → {last['agent_harvest_actions/mean']:.2f} ({ah_delta:+.2f})\n")
        md.write(f"- Agent success: {first['agent_success/mean']:.0%} → {last['agent_success/mean']:.0%} ({as_delta:+.0%})\n")

        if hw_delta > 10 and sr_delta >= 0 and as_delta >= 0:
            md.write(f"\n**Conclusion**: Clear improvement — the model learned a better policy.\n")
        elif hw_delta > 0:
            md.write(f"\n**Conclusion**: Marginal improvement. More training steps may help.\n")
        else:
            md.write(f"\n**Conclusion**: No clear improvement on held-out seeds. Consider more trajectories per step for stronger GRPO signal.\n")

    best = max(all_results, key=lambda x: x.get("agent_success/mean", 0.0))
    md.write("\n## End-to-End Policy Check\n\n")
    md.write(
        "Criterion for independent full policy: "
        "agent_success >= 80%, agent_harvest_actions >= 0.8, and forced_harvests == 0.\n\n"
    )
    md.write(
        f"Best checkpoint: step {int(best['checkpoint_step'])} | "
        f"agent_success={best['agent_success/mean']:.0%}, "
        f"agent_harvest_actions={best['agent_harvest_actions/mean']:.2f}, "
        f"forced_harvests={best['forced_harvests/mean']:.2f}\n"
    )

    md.write(f"\n## Action Distribution\n\n")
    md.write("| Step | pH Down | pH Up | Nutrients | Maintain | Harvest |\n")
    md.write("|------|---------|-------|-----------|----------|--------|\n")
    for r in all_results:
        md.write(
            f"| {int(r['checkpoint_step'])} "
            f"| {r.get('action_count_adjust_ph_down/mean', 0):.1f} "
            f"| {r.get('action_count_adjust_ph_up/mean', 0):.1f} "
            f"| {r.get('action_count_add_nutrients/mean', 0):.1f} "
            f"| {r.get('action_count_maintain/mean', 0):.1f} "
            f"| {r.get('action_count_harvest/mean', 0):.1f} |\n"
        )

    with open(md_path, "w") as f:
        f.write(md.getvalue())

    print("\n" + "=" * 70)
    print("Evaluation complete!")
    print("=" * 70)
    print(f"CSV report: {csv_path}")
    print(f"Markdown report: {md_path}")
    print("=" * 70)

    # Print the markdown to stdout too
    print("\n" + md.getvalue())


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train GardenRL agent with ART")
    parser.add_argument(
        "--model", type=str, default=DEFAULT_SERVERLESS_MODEL,
        help=f"Model ID (default: {DEFAULT_SERVERLESS_MODEL} for serverless)",
    )
    parser.add_argument(
        "--steps", type=int, default=50,
        help="Number of training steps (default: 50)",
    )
    parser.add_argument(
        "--rollouts-per-step", type=int, default=1,
        help="Number of scenarios per training step (default: 1; keep total trajectories low on 14B serverless).",
    )
    parser.add_argument(
        "--attempts", type=int, default=4,
        help="Attempts per scenario for GRPO variance (default: 4; use 1 only for smoke tests).",
    )
    parser.add_argument(
        "--allow-low-attempts", action="store_true",
        help="Allow --attempts < 2 (smoke tests only; disables useful GRPO variance).",
    )
    parser.add_argument(
        "--lr", type=float, default=5e-6,
        help="Learning rate (default: 5e-6)",
    )
    parser.add_argument(
        "--max-completion-tokens", type=int, default=64,
        help="Max completion tokens per decision (default: 64; lower uses less VRAM)",
    )
    parser.add_argument(
        "--temperature", type=float, default=0.5,
        help="Sampling temperature for action generation (default: 0.5)",
    )
    parser.add_argument(
        "--context-turns", type=int, default=8,
        help="Conversation turns to keep in context for inference/training memory (default: 8).",
    )
    parser.add_argument(
        "--max-episode-days", type=int, default=30,
        help="Max environment days per episode (default: 30).",
    )
    parser.add_argument(
        "--curriculum", dest="curriculum", action="store_true", default=True,
        help="Use short-to-long episode curriculum (14->20->24->max days) during training (default: on).",
    )
    parser.add_argument(
        "--no-curriculum", dest="curriculum", action="store_false",
        help="Disable episode-length curriculum and always run full --max-episode-days.",
    )
    parser.add_argument(
        "--local", action="store_true",
        help="Use local GPU backend instead of W&B serverless",
    )
    parser.add_argument(
        "--resume", action="store_true",
        help="Resume from last checkpoint",
    )
    parser.add_argument(
        "--run-name", type=str, default=None,
        help=(
            "Optional explicit ART/W&B run name. "
            "If omitted: --resume uses stable name, otherwise a timestamped name is used."
        ),
    )
    parser.add_argument(
        "--max-rollout-exceptions", type=float, default=1,
        help=(
            "Allowed rollout exceptions per gather call before aborting "
            "(default: 1). Use <1 for ratio, e.g. 0.1."
        ),
    )

    # Evaluation mode
    parser.add_argument(
        "--eval", action="store_true",
        help="Run in evaluation mode: no training, no forced harvest. "
             "Evaluates checkpoints on fixed seeds and generates a report.",
    )
    parser.add_argument(
        "--eval-seeds", type=int, default=20,
        help="Number of fixed evaluation seeds (default: 20). Seeds start at 1000.",
    )
    parser.add_argument(
        "--eval-checkpoints", type=str, default="0,10,20,30,40,50",
        help="Comma-separated checkpoint steps to evaluate (default: '0,10,20,30,40,50').",
    )

    args = parser.parse_args()
    if args.eval:
        asyncio.run(evaluate(args))
    else:
        asyncio.run(train(args))

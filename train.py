"""
GardenRL Training Script with W&B Integration

Runs multiple training episodes and logs results to Weights & Biases.
This generates REAL data for landing page visualizations - no synthetic data allowed.

Usage:
    # Run 100 episodes with random policy
    python train.py --episodes 100 --strategy random

    # Run with rule-based policy (optimal management)
    python train.py --episodes 500 --strategy optimal

    # Run comparison (random + optimal)
    python train.py --episodes 200 --strategy comparison
"""

import argparse
import json
import sys
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any

# Import from installed package (works because we did pip install -e .)
try:
    from GardenRL.server.GardenRL_environment import GardenrlEnvironment
    from GardenRL.models import GardenrlAction
except ImportError:
    # Fallback: Add project root to path for local development
    sys.path.insert(0, str(Path(__file__).parent))
    from server.GardenRL_environment import GardenrlEnvironment
    from models import GardenrlAction

# W&B import (will install if needed)
try:
    import wandb
    WANDB_AVAILABLE = True
except ImportError:
    print("⚠️  W&B not installed. Install with: pip install wandb")
    print("   Continuing without W&B logging...")
    WANDB_AVAILABLE = False


class EpisodeLogger:
    """Logs episode data for later visualization."""

    def __init__(self, output_dir: Path = Path("training_logs")):
        self.output_dir = output_dir
        self.output_dir.mkdir(exist_ok=True)
        self.episodes: List[Dict[str, Any]] = []

    def log_episode(self, episode_num: int, strategy: str, data: Dict[str, Any]):
        """Log a single episode."""
        episode_data = {
            "episode": episode_num,
            "strategy": strategy,
            "timestamp": datetime.now().isoformat(),
            **data
        }
        self.episodes.append(episode_data)

    def save(self):
        """Save all episodes to JSON."""
        output_file = self.output_dir / f"episodes_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(output_file, 'w') as f:
            json.dump({
                "total_episodes": len(self.episodes),
                "episodes": self.episodes,
                "generated_at": datetime.now().isoformat()
            }, f, indent=2)
        print(f"\n💾 Saved {len(self.episodes)} episodes to: {output_file}")
        return output_file


def run_random_episode(env: GardenrlEnvironment, episode_num: int, seed: int = None) -> Dict[str, Any]:
    """
    Run episode with random actions.
    Expected outcome: Poor performance, frequent plant death.
    """
    if seed is not None:
        import random
        random.seed(seed)

    obs = env.reset()
    steps_data = []

    for day in range(30):
        # Random action selection
        import random
        action_types = ["maintain", "adjust_ph_down", "adjust_ph_up", "add_nutrients", "dilute_nutrients"]
        if day >= 27:
            action_types.append("harvest")

        action_type = random.choice(action_types)

        if action_type == "maintain":
            action = GardenrlAction(
                action_type="maintain",
                reasoning="Random policy: doing nothing"
            )
        elif action_type == "harvest":
            action = GardenrlAction(
                action_type="harvest",
                reasoning="Random policy: attempting harvest"
            )
        else:
            amount = random.uniform(0.1, 0.5)
            action = GardenrlAction(
                action_type=action_type,
                ph_adjustment=amount if "ph" in action_type else None,
                nutrient_adjustment=amount if "nutrient" in action_type else None,
                reasoning=f"Random policy: {action_type} by {amount:.2f}"
            )

        obs = env.step(action)

        steps_data.append({
            "day": obs.day,
            "ph": round(obs.ph, 2),
            "ec": round(obs.ec, 2),
            "water_temp": round(obs.water_temp, 1),
            "leaf_color": obs.leaf_color,
            "growth_stage": obs.growth_stage,
            "action": action.action_type,
            "reasoning": action.reasoning,
            "warnings": obs.warnings
        })

        if obs.done:
            break

    harvest_weight = obs.reward / 10.0

    return {
        "reward": obs.reward,
        "harvest_weight": harvest_weight,
        "days_survived": obs.day,
        "final_ph": round(obs.ph, 2),
        "final_ec": round(obs.ec, 2),
        "final_growth_stage": obs.growth_stage,
        "final_leaf_color": obs.leaf_color,
        "died": obs.growth_stage == "dead",
        "steps": steps_data
    }


def run_optimal_episode(env: GardenrlEnvironment, episode_num: int) -> Dict[str, Any]:
    """
    Run episode with rule-based optimal policy.
    Expected outcome: Healthy 150-250g harvest.
    """
    obs = env.reset()
    steps_data = []

    for day in range(30):
        # Rule-based policy (from example_episode.py)
        if obs.ph > 6.5:
            action = GardenrlAction(
                action_type="adjust_ph_down",
                ph_adjustment=0.3,
                reasoning=f"pH {obs.ph:.2f} too high, risk of nutrient lockout"
            )
        elif obs.ph < 5.5:
            action = GardenrlAction(
                action_type="adjust_ph_up",
                ph_adjustment=0.3,
                reasoning=f"pH {obs.ph:.2f} too low, calcium uptake impaired"
            )
        elif obs.ec < 1.2:
            action = GardenrlAction(
                action_type="add_nutrients",
                nutrient_adjustment=0.4,
                reasoning=f"EC {obs.ec:.2f} low, plants need more nutrients"
            )
        elif obs.ec > 2.0:
            action = GardenrlAction(
                action_type="dilute_nutrients",
                nutrient_adjustment=0.3,
                reasoning=f"EC {obs.ec:.2f} high, risk of nutrient burn"
            )
        elif day >= 27:
            action = GardenrlAction(
                action_type="harvest",
                reasoning="Day 27, optimal harvest time for Batavia lettuce"
            )
        else:
            action = GardenrlAction(
                action_type="maintain",
                reasoning="All parameters optimal, maintaining current conditions"
            )

        obs = env.step(action)

        steps_data.append({
            "day": obs.day,
            "ph": round(obs.ph, 2),
            "ec": round(obs.ec, 2),
            "water_temp": round(obs.water_temp, 1),
            "leaf_color": obs.leaf_color,
            "growth_stage": obs.growth_stage,
            "action": action.action_type,
            "reasoning": action.reasoning,
            "warnings": obs.warnings
        })

        if obs.done:
            break

    harvest_weight = obs.reward / 10.0

    return {
        "reward": obs.reward,
        "harvest_weight": harvest_weight,
        "days_survived": obs.day,
        "final_ph": round(obs.ph, 2),
        "final_ec": round(obs.ec, 2),
        "final_growth_stage": obs.growth_stage,
        "final_leaf_color": obs.leaf_color,
        "died": obs.growth_stage == "dead",
        "steps": steps_data
    }


def train(args):
    """Main training loop."""
    print("=" * 70)
    print("GardenRL Training Script")
    print("=" * 70)
    print(f"Episodes: {args.episodes}")
    print(f"Strategy: {args.strategy}")
    print(f"W&B Project: {args.wandb_project}")
    print(f"W&B Enabled: {WANDB_AVAILABLE and not args.no_wandb}")
    print("=" * 70)
    print()

    # Initialize W&B
    if WANDB_AVAILABLE and not args.no_wandb:
        wandb.init(
            project=args.wandb_project,
            name=f"{args.strategy}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            config={
                "strategy": args.strategy,
                "episodes": args.episodes,
                "environment": "GardenRL-v1",
                "framework": "OpenEnv"
            }
        )

    # Initialize logger
    logger = EpisodeLogger()

    # Training loop
    for episode_num in range(1, args.episodes + 1):
        # Create environment with unique seed
        env = GardenrlEnvironment(seed=args.seed + episode_num if args.seed else None)

        # Run episode based on strategy
        if args.strategy == "random":
            episode_data = run_random_episode(env, episode_num, seed=args.seed + episode_num if args.seed else None)
        elif args.strategy == "optimal":
            episode_data = run_optimal_episode(env, episode_num)
        elif args.strategy == "comparison":
            # Alternate between random and optimal
            if episode_num % 2 == 0:
                episode_data = run_optimal_episode(env, episode_num)
                strategy = "optimal"
            else:
                episode_data = run_random_episode(env, episode_num, seed=args.seed + episode_num if args.seed else None)
                strategy = "random"
        else:
            raise ValueError(f"Unknown strategy: {args.strategy}")

        strategy = args.strategy if args.strategy != "comparison" else strategy

        # Log to local storage
        logger.log_episode(episode_num, strategy, episode_data)

        # Log to W&B
        if WANDB_AVAILABLE and not args.no_wandb:
            wandb.log({
                "episode": episode_num,
                "reward": episode_data["reward"],
                "harvest_weight": episode_data["harvest_weight"],
                "days_survived": episode_data["days_survived"],
                "final_ph": episode_data["final_ph"],
                "final_ec": episode_data["final_ec"],
                "died": 1 if episode_data["died"] else 0,
                "success": 1 if episode_data["harvest_weight"] >= 150 else 0
            })

        # Print progress
        if episode_num % 10 == 0 or episode_num == 1:
            print(f"Episode {episode_num}/{args.episodes}: "
                  f"Reward={episode_data['reward']:.0f}, "
                  f"Harvest={episode_data['harvest_weight']:.1f}g, "
                  f"Days={episode_data['days_survived']}, "
                  f"Status={episode_data['final_growth_stage']}")

    # Save results
    output_file = logger.save()

    # Calculate summary statistics
    episodes = logger.episodes
    total_episodes = len(episodes)
    avg_reward = sum(e["reward"] for e in episodes) / total_episodes
    avg_harvest = sum(e["harvest_weight"] for e in episodes) / total_episodes
    success_rate = sum(1 for e in episodes if e["harvest_weight"] >= 150) / total_episodes * 100
    death_rate = sum(1 for e in episodes if e["died"]) / total_episodes * 100

    print("\n" + "=" * 70)
    print("TRAINING SUMMARY")
    print("=" * 70)
    print(f"Total Episodes: {total_episodes}")
    print(f"Average Reward: {avg_reward:.1f}")
    print(f"Average Harvest: {avg_harvest:.1f}g")
    print(f"Success Rate (150g+): {success_rate:.1f}%")
    print(f"Death Rate: {death_rate:.1f}%")
    print("=" * 70)

    # Log summary to W&B
    if WANDB_AVAILABLE and not args.no_wandb:
        wandb.summary["total_episodes"] = total_episodes
        wandb.summary["avg_reward"] = avg_reward
        wandb.summary["avg_harvest"] = avg_harvest
        wandb.summary["success_rate"] = success_rate
        wandb.summary["death_rate"] = death_rate
        wandb.finish()

    return output_file


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train GardenRL with W&B logging")
    parser.add_argument("--episodes", type=int, default=100,
                        help="Number of episodes to run (default: 100)")
    parser.add_argument("--strategy", type=str, default="optimal",
                        choices=["random", "optimal", "comparison"],
                        help="Training strategy (default: optimal)")
    parser.add_argument("--wandb-project", type=str, default="gardenrl-training",
                        help="W&B project name (default: gardenrl-training)")
    parser.add_argument("--no-wandb", action="store_true",
                        help="Disable W&B logging")
    parser.add_argument("--seed", type=int, default=42,
                        help="Random seed for reproducibility (default: 42)")

    args = parser.parse_args()

    try:
        output_file = train(args)
        print(f"\n✅ Training complete! Data saved to: {output_file}")
        print(f"\n📊 Next steps:")
        print(f"   1. Export for frontend: cp {output_file} landing-page/public/data/training-episodes.json")
        if WANDB_AVAILABLE and not args.no_wandb:
            print(f"   2. View W&B dashboard: https://wandb.ai/{args.wandb_project}")
        print(f"   3. Build D3.js visualizations using the real data")
    except KeyboardInterrupt:
        print("\n\n⚠️  Training interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Training failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

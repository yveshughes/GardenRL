'use client';

import { useState } from 'react';
import Link from 'next/link';

type Tab = 'overview' | 'how-it-works' | 'model-training' | 'compute' | 'wandb' | 'training';

export default function TechSpecs() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <header className="border-b border-emerald-900/30 bg-slate-950/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-emerald-400 hover:text-emerald-300 transition-colors text-sm">
            Back to GardenRL
          </Link>
          <h1 className="text-lg font-bold text-white">Tech Specs</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Tabs */}
        <div className="flex gap-1 mb-10 border-b border-slate-700 overflow-x-auto">
          {[
            { id: 'overview' as Tab, label: 'The Big Picture' },
            { id: 'how-it-works' as Tab, label: 'How It Works' },
            { id: 'model-training' as Tab, label: 'Model & Training' },
            { id: 'compute' as Tab, label: 'Compute' },
            { id: 'wandb' as Tab, label: 'Tracking Results' },
            { id: 'training' as Tab, label: 'Running It' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'text-emerald-400 border-b-2 border-emerald-400'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'how-it-works' && <HowItWorksTab />}
        {activeTab === 'model-training' && <ModelTrainingTab />}
        {activeTab === 'compute' && <ComputeTab />}
        {activeTab === 'wandb' && <WandBTab />}
        {activeTab === 'training' && <TrainingTab />}
      </main>
    </div>
  );
}

/* ───────────────────────────── OVERVIEW ───────────────────────────── */

function OverviewTab() {
  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">What are we building?</h2>
        <p className="text-lg text-slate-400">
          A virtual garden where AI learns to grow plants by trial and error &mdash; like a video game for machine learning.
        </p>
      </div>

      <Callout>
        We studied 390,000 real photos of plants grown in water (hydroponics) to understand how
        plants actually grow. Then we turned that knowledge into a simulation. The AI never looks
        at photos &mdash; it reads sensor data like a farmer reading gauges.
      </Callout>

      <Section title="How it works, in one sentence">
        <p className="text-lg">
          The AI gets readings (pH, nutrients, leaf color), decides what to do (add water, adjust nutrients),
          and gets scored on how much the plant grew. Over hundreds of rounds, it gets better.
        </p>
      </Section>

      <Section title="The tools we use">
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <ToolCard
            name="OpenEnv"
            role="The environment standard"
            description="Meta's framework for hosting RL environments. GardenRL is an OpenEnv environment that any agent can connect to via HTTP/WebSocket."
          />
          <ToolCard
            name="OpenPipe ART"
            role="The training framework"
            description="Agent Reinforcement Training. Orchestrates the RL loop: runs episodes, collects trajectories, and trains the model with GRPO."
          />
          <ToolCard
            name="Llama 3.1 8B Instruct"
            role="The model"
            description="An 8-billion parameter language model fine-tuned with LoRA + GRPO via W&B serverless GPUs. Fits 4 GRPO attempts per step without OOM."
          />
          <ToolCard
            name="W&B Serverless"
            role="Compute + tracking"
            description="Managed vLLM for inference, Unsloth for training, and Weights & Biases for tracking every step. All serverless."
          />
        </div>
      </Section>

      <Section title="What the AI actually sees">
        <p className="mb-3">Not images. It reads text, like a dashboard of sensors:</p>
        <div className="bg-slate-950 border border-slate-700 rounded-lg p-5 font-mono text-sm leading-relaxed">
          <Line label="pH" value="7.2" comment="slightly alkaline" />
          <Line label="leaf_color" value='"brown_tips"' comment="early nutrient issue" />
          <Line label="growth_stage" value='"vegetative"' comment="still growing leaves" />
          <Line label="warnings" value='["nutrient lockout risk"]' comment="needs attention" />
        </div>
        <p className="text-sm text-slate-500 mt-3">
          This is actually a strength &mdash; any language model can read text. No special vision model needed.
          Faster training, simpler code, same scientific accuracy.
        </p>
      </Section>
    </div>
  );
}

/* ───────────────────────────── HOW IT WORKS ───────────────────────────── */

function HowItWorksTab() {
  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">How GardenRL Works</h2>
        <p className="text-lg text-slate-400">
          The technical details: long-horizon learning, dataset grounding, and RL mechanics.
        </p>
      </div>

      <Section title="The Challenge: Long-Horizon Decisions">
        <p className="mb-4">
          Most RL environments give instant feedback: hit a target, get points. Real farming doesn't work that way.
          You adjust pH today, and the plant might die 10 days later from a cascade you didn't predict.
        </p>
        <Callout>
          GardenRL simulates <strong>30-day growth cycles</strong> where early mistakes compound over time.
          The AI must learn cause-and-effect across hundreds of timesteps, not just immediate rewards.
          This is what makes it a true long-horizon challenge.
        </Callout>
        <div className="mt-6 bg-slate-900/50 border border-slate-700 rounded-lg p-5">
          <h4 className="text-emerald-400 font-semibold mb-3">Example Timeline</h4>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="text-emerald-400 font-mono text-xs bg-emerald-950/30 px-2 py-1 rounded">Day 0</div>
              <div className="text-slate-300">Seedling planted, pH 6.0, EC 1.6 — optimal conditions</div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-yellow-400 font-mono text-xs bg-yellow-950/30 px-2 py-1 rounded">Day 5</div>
              <div className="text-slate-300">pH drifts to 7.2 — AI must detect and correct <Tooltip tooltip="Nutrient lockout: when pH is wrong, nutrients become chemically unavailable to plant roots even though they're in the water">before lockout</Tooltip></div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-orange-400 font-mono text-xs bg-orange-950/30 px-2 py-1 rounded">Day 12</div>
              <div className="text-slate-300">Leaf tips browning — delayed symptom of Day 5 pH issue</div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-red-400 font-mono text-xs bg-red-950/30 px-2 py-1 rounded">Day 20</div>
              <div className="text-slate-300">Growth stunted — AI missed the window, harvest will be poor</div>
            </div>
          </div>
        </div>
      </Section>

      <Section title="The Science: 390,000 Real Plant Images">
        <p className="mb-4">
          To make the simulation realistic, we studied the <strong>HydroGrowNet dataset</strong> — 390,000
          photos of lettuce grown in hydroponic systems, tracked daily with precise sensor readings.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
            <h4 className="text-emerald-400 font-semibold mb-2">What we learned</h4>
            <ul className="text-sm text-slate-300 space-y-2">
              <li>• pH 7.2+ causes <Tooltip tooltip="When pH is too high, calcium becomes chemically unavailable to roots">calcium lockout</Tooltip> → brown leaf tips in 7-10 days</li>
              <li>• EC below 1.0 → slow growth, pale leaves</li>
              <li>• EC above 2.5 → nutrient burn, wilting</li>
              <li>• Temp above 26°C → 4-6× water consumption</li>
            </ul>
          </div>
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
            <h4 className="text-emerald-400 font-semibold mb-2">How we use it</h4>
            <ul className="text-sm text-slate-300 space-y-2">
              <li>• Photos → growth stage models</li>
              <li>• Sensor logs → parameter drift patterns</li>
              <li>• Harvest data → reward functions</li>
              <li>• Failure modes → edge case testing</li>
            </ul>
          </div>
        </div>
        <Callout>
          The AI <strong>never sees photos</strong>. We used the dataset to build accurate simulation physics.
          At runtime, the AI reads text like "leaf_color: brown_tips" — no vision model needed.
        </Callout>
      </Section>

      <Section title="RL Mechanics: How the AI Learns">
        <div className="space-y-4">
          <div>
            <h4 className="text-lg font-semibold text-emerald-300 mb-2">1. Observation Space</h4>
            <p className="text-slate-300 mb-2">What the AI sees each day:</p>
            <CodeBlock code={`{
  "day": 15,
  "ph": 6.2,
  "ec": 1.8,
  "water_temp": 21.5,
  "leaf_color": "healthy_green",
  "growth_stage": "vegetative",
  "warnings": []
}`} />
          </div>

          <div>
            <h4 className="text-lg font-semibold text-emerald-300 mb-2">2. Action Space</h4>
            <p className="text-slate-300 mb-2">What the AI can do:</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="bg-slate-950/50 border border-slate-700 rounded p-3 text-sm">
                <div className="text-emerald-400 font-semibold mb-1">adjust_ph_down</div>
                <div className="text-slate-400">Add acid to lower pH</div>
              </div>
              <div className="bg-slate-950/50 border border-slate-700 rounded p-3 text-sm">
                <div className="text-emerald-400 font-semibold mb-1">adjust_ph_up</div>
                <div className="text-slate-400">Add base to raise pH</div>
              </div>
              <div className="bg-slate-950/50 border border-slate-700 rounded p-3 text-sm">
                <div className="text-emerald-400 font-semibold mb-1">add_nutrients</div>
                <div className="text-slate-400">Increase EC with nutrient solution</div>
              </div>
              <div className="bg-slate-950/50 border border-slate-700 rounded p-3 text-sm">
                <div className="text-emerald-400 font-semibold mb-1">dilute_nutrients</div>
                <div className="text-slate-400">Add water to decrease EC</div>
              </div>
              <div className="bg-slate-950/50 border border-slate-700 rounded p-3 text-sm">
                <div className="text-emerald-400 font-semibold mb-1">maintain</div>
                <div className="text-slate-400">No action, observe</div>
              </div>
              <div className="bg-slate-950/50 border border-slate-700 rounded p-3 text-sm">
                <div className="text-emerald-400 font-semibold mb-1">harvest</div>
                <div className="text-slate-400">End episode, get reward</div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-emerald-300 mb-2">3. Reward Function (Shaped, 0&ndash;1)</h4>
            <CodeBlock code={`# Terminal reward: harvest weight normalized to 0-1
terminal = harvest_weight / 250.0  # 250g = perfect

# Dense signal: how well conditions were maintained
ph_score  = max(0, 1 - |pH - 6.0| / 2.0)
ec_score  = max(0, 1 - |EC - 1.6| / 1.6)
tmp_score = max(0, 1 - |temp - 20| / 8.0)
condition = 0.45*ph + 0.45*ec + 0.10*tmp  # per-day
dense = 0.5 * avg_condition + 0.5 * survival_ratio

# Combined
if harvest_weight > 0:
    reward = 0.7 * terminal + 0.3 * dense
else:
    reward = 0.15 * dense   # small gradient even without harvest`} />
            <p className="text-sm text-slate-500 mt-3">
              The dense component lets GRPO learn from condition management during short curriculum episodes
              (14&ndash;24 days) where no harvest is possible. Once 30-day episodes begin, the terminal component
              dominates and drives harvest maximization.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-emerald-300 mb-2">4. Learning Process (GRPO with ART)</h4>
            <p className="text-slate-300 mb-3">
              We use <strong>OpenPipe ART</strong> to train a Llama 3.1 8B model with <strong>GRPO</strong>
              (Group Relative Policy Optimization). Each training step:
            </p>
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
              <ol className="space-y-2 text-slate-300">
                <li><strong className="text-emerald-400">1. Rollout:</strong> The model plays 1 scenario with 4 attempts (4 episodes per step)</li>
                <li><strong className="text-emerald-400">2. Compare:</strong> GRPO compares attempts within each scenario to find what worked</li>
                <li><strong className="text-emerald-400">3. Train:</strong> Unsloth updates a LoRA adapter, reinforcing successful strategies</li>
                <li><strong className="text-emerald-400">4. Repeat:</strong> vLLM loads the new weights, the model plays again &mdash; better this time</li>
              </ol>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Why This Matters for the Hackathon">
        <div className="bg-emerald-950/30 border-l-4 border-emerald-500 p-5 rounded-r-lg">
          <ul className="space-y-2 text-emerald-100">
            <li><strong>✓ Long-horizon learning:</strong> 30-day episodes with delayed consequences</li>
            <li><strong>✓ Dataset grounding:</strong> 390k real images inform simulation physics</li>
            <li><strong>✓ Verifiable results:</strong> W&B tracking shows real learning curves (20% of score)</li>
            <li><strong>✓ Real-world application:</strong> Hydroponic farming is a $9B industry</li>
          </ul>
        </div>
      </Section>
    </div>
  );
}

/* ───────────────────────── MODEL & TRAINING ───────────────────────── */

function ModelTrainingTab() {
  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Model & Training</h2>
        <p className="text-lg text-slate-400">
          What model we use, how we train it, and how all the pieces fit together.
        </p>
      </div>

      <Section title="The Model: Llama 3.1 8B Instruct">
        <p className="mb-4">
          We train <strong>Llama 3.1 8B Instruct</strong>, an 8-billion parameter language model.
          It reads sensor data as text and responds with farming decisions. We chose it because:
        </p>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
            <h4 className="text-emerald-400 font-semibold mb-2">Fits serverless GPU memory</h4>
            <p className="text-sm text-slate-400">
              8B parameters fit comfortably on W&B serverless GPUs with room for 4 GRPO
              attempts per step. Larger models (14B) OOM during training backward pass.
            </p>
          </div>
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
            <h4 className="text-emerald-400 font-semibold mb-2">Strong instruction following</h4>
            <p className="text-sm text-slate-400">
              The Instruct variant already understands structured text.
              It parses sensor readings and outputs JSON actions from day one.
            </p>
          </div>
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
            <h4 className="text-emerald-400 font-semibold mb-2">Proven GRPO results</h4>
            <p className="text-sm text-slate-400">
              50-step training showed clear improvement: reward +0.041, harvest +10.9g,
              success rate +10% on held-out seeds. Training seeds reached 186g/100%.
            </p>
          </div>
        </div>
      </Section>

      <Section title="The Framework: OpenPipe ART">
        <p className="mb-4">
          <strong>ART</strong> (Agent Reinforcement Training) from OpenPipe orchestrates the entire training loop.
          It connects three things together:
        </p>
        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-5">
          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-20 text-right font-mono text-emerald-400">vLLM</div>
              <div className="text-slate-300">
                Serves the model for <strong>inference</strong>. During each episode, vLLM generates the model's
                responses (farming decisions) at high throughput. Supports LoRA hot-swapping between training steps.
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-20 text-right font-mono text-emerald-400">Unsloth</div>
              <div className="text-slate-300">
                Handles <strong>training</strong>. After collecting episode trajectories, Unsloth fine-tunes a LoRA adapter
                using GRPO. 2-5x faster than standard PyTorch training with lower memory usage.
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-20 text-right font-mono text-emerald-400">ART</div>
              <div className="text-slate-300">
                <strong>Orchestrates</strong> the cycle: run episodes with vLLM &rarr; collect trajectories with rewards
                &rarr; train with Unsloth &rarr; load new weights &rarr; repeat. Handles W&B logging automatically.
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section title="The Algorithm: GRPO">
        <Callout>
          <strong>GRPO</strong> (Group Relative Policy Optimization) is the same algorithm used to train DeepSeek R1.
          It&apos;s simpler than PPO because it doesn&apos;t need a separate value network.
        </Callout>
        <p className="mt-4 mb-4">
          For each training step, the model plays the same scenario multiple times. GRPO compares the results
          within each group:
        </p>
        <div className="bg-slate-950 border border-slate-700 rounded-lg p-5 font-mono text-sm leading-relaxed">
          <div className="text-slate-500 mb-2"># Same scenario, 4 attempts:</div>
          <div className="text-red-400">Attempt 1: harvest 45g &rarr; negative advantage (learn to avoid this)</div>
          <div className="text-yellow-400">Attempt 2: harvest 120g &rarr; slight negative</div>
          <div className="text-emerald-400">Attempt 3: harvest 195g &rarr; positive advantage (do more of this)</div>
          <div className="text-yellow-400">Attempt 4: harvest 130g &rarr; slight negative</div>
          <div className="text-slate-500 mt-2"># The model learns from the contrast between good and bad runs</div>
        </div>
        <p className="text-sm text-slate-500 mt-3">
          This is more sample-efficient than reward-only methods because the model learns from relative
          performance, not absolute scores.
        </p>
      </Section>

      <Section title="How It Connects to OpenEnv">
        <p className="mb-4">
          <strong>OpenEnv</strong> is Meta&apos;s standard for hosting RL environments. GardenRL is an OpenEnv
          environment. ART connects to it during training. Here&apos;s how the layers stack:
        </p>
        <div className="bg-slate-900/50 border border-slate-700 rounded-lg divide-y divide-slate-800">
          <div className="px-5 py-4">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs font-mono bg-emerald-950/50 text-emerald-400 px-2 py-0.5 rounded">Layer 4</span>
              <span className="font-medium text-white">ART Training Loop</span>
            </div>
            <p className="text-sm text-slate-400 ml-16">
              Orchestrates training: collects trajectories, runs GRPO, manages checkpoints, logs to W&B
            </p>
          </div>
          <div className="px-5 py-4">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs font-mono bg-emerald-950/50 text-emerald-400 px-2 py-0.5 rounded">Layer 3</span>
              <span className="font-medium text-white">LLM Agent (Llama 3.1 8B)</span>
            </div>
            <p className="text-sm text-slate-400 ml-16">
              Reads observations as text, reasons about plant health, outputs actions in structured format
            </p>
          </div>
          <div className="px-5 py-4">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs font-mono bg-emerald-950/50 text-emerald-400 px-2 py-0.5 rounded">Layer 2</span>
              <span className="font-medium text-white">OpenEnv Client</span>
            </div>
            <p className="text-sm text-slate-400 ml-16">
              Connects to the environment via WebSocket. Sends actions, receives observations. Standard OpenEnv API.
            </p>
          </div>
          <div className="px-5 py-4">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs font-mono bg-emerald-950/50 text-emerald-400 px-2 py-0.5 rounded">Layer 1</span>
              <span className="font-medium text-white">GardenRL Environment (OpenEnv)</span>
            </div>
            <p className="text-sm text-slate-400 ml-16">
              The hydroponic simulation. Hosted as a Docker container on HuggingFace Spaces. Runs the physics.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Training Configuration">
        <div className="bg-slate-950 border border-slate-700 rounded-lg divide-y divide-slate-800">
          <ConfigRow label="Base model" value="meta-llama/Llama-3.1-8B-Instruct" />
          <ConfigRow label="Fine-tuning method" value="LoRA (rank 16)" />
          <ConfigRow label="RL algorithm" value="GRPO" />
          <ConfigRow label="Training framework" value="OpenPipe ART" />
          <ConfigRow label="Inference engine" value="vLLM" />
          <ConfigRow label="Training engine" value="Unsloth" />
          <ConfigRow label="Training steps" value="50" />
          <ConfigRow label="Trajectories per step" value="4 (1 rollout x 4 attempts for GRPO variance)" />
          <ConfigRow label="Learning rate" value="5e-6" />
          <ConfigRow label="Max completion tokens" value="64" />
          <ConfigRow label="Temperature" value="0.5" />
          <ConfigRow label="Backend" value="W&B Serverless (managed GPUs)" />
        </div>
      </Section>

      <Section title="What the model sees and does">
        <p className="mb-4">Each day of a 30-day episode is one turn in a multi-turn conversation:</p>
        <div className="space-y-3">
          <div className="bg-slate-950 border border-slate-700 rounded-lg p-4">
            <div className="text-xs text-slate-500 mb-2 font-mono">SYSTEM MESSAGE (once per episode)</div>
            <div className="text-sm text-slate-300 font-mono">
              You are an expert hydroponic farmer. Each day you receive sensor readings
              and must decide what action to take. Respond with reasoning and action...
            </div>
          </div>
          <div className="bg-slate-950 border border-blue-900/30 rounded-lg p-4">
            <div className="text-xs text-blue-400 mb-2 font-mono">USER MESSAGE (observation, each day)</div>
            <div className="text-sm text-slate-300 font-mono whitespace-pre">{`Day 5/30
pH: 6.82
EC: 1.31 mS/cm
Water temp: 20.3C
Leaf color: healthy_green
Warnings: pH drift detected - too alkaline`}</div>
          </div>
          <div className="bg-slate-950 border border-emerald-900/30 rounded-lg p-4">
            <div className="text-xs text-emerald-400 mb-2 font-mono">ASSISTANT RESPONSE (action, trained on this)</div>
            <div className="text-sm text-slate-300 font-mono whitespace-pre">{`<reasoning>pH is 6.82, above the optimal 6.5 ceiling.
If I don't correct now, nutrient lockout starts in
2-3 days. EC is also low at 1.31, but pH is the
priority - nutrients won't absorb at this pH anyway.
</reasoning>
<action>adjust_ph_down</action>
<amount>0.3</amount>`}</div>
          </div>
        </div>
        <p className="text-sm text-slate-500 mt-3">
          The reasoning tag is key for the Mercor sub-bounty &mdash; it rewards agents that
          show their thinking, not just output actions.
        </p>
      </Section>
    </div>
  );
}

/* ───────────────────────────── NORTHFLANK ───────────────────────────── */

function ComputeTab() {
  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Compute (W&B Serverless)</h2>
        <p className="text-lg text-slate-400">
          Training requires powerful GPUs. Instead of managing our own, we use W&B&apos;s serverless GPU infrastructure.
        </p>
      </div>

      <Section title="Why serverless?">
        <p>
          Traditional RL training means renting a GPU, installing drivers, setting up CUDA, configuring vLLM,
          managing checkpoints &mdash; a lot of DevOps before any training happens. W&B serverless handles all of it.
        </p>
        <Callout>
          With serverless, we run <code className="text-emerald-300">python3 train_art.py</code> from any machine (even a laptop with no GPU).
          W&B provisions the GPU, loads the model, runs training, and saves checkpoints. We pay per training step using hackathon credits.
        </Callout>
      </Section>

      <Section title="How it works under the hood">
        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-5">
          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-24 text-right font-mono text-emerald-400">Your machine</div>
              <div className="text-slate-300">
                Runs <code className="text-emerald-300">train_art.py</code>. Connects to the GardenRL environment locally,
                generates trajectories by calling the serverless inference endpoint.
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-24 text-right font-mono text-emerald-400">W&B vLLM</div>
              <div className="text-slate-300">
                Serves the model for <strong>inference</strong> during episodes. Supports LoRA hot-swapping
                so updated weights take effect immediately between training steps.
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-24 text-right font-mono text-emerald-400">W&B Unsloth</div>
              <div className="text-slate-300">
                Handles <strong>training</strong>. After trajectories are collected, Unsloth fine-tunes a LoRA
                adapter using GRPO on the serverless GPU. 2-5x faster than standard PyTorch.
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-24 text-right font-mono text-emerald-400">W&B Tracking</div>
              <div className="text-slate-300">
                Every training step is logged automatically &mdash; reward curves, harvest weights, success rates,
                and LoRA checkpoints.
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Infrastructure details">
        <div className="bg-slate-950 border border-slate-700 rounded-lg divide-y divide-slate-800">
          <ConfigRow label="Backend" value="W&B Serverless (managed GPUs)" />
          <ConfigRow label="GPU" value="NVIDIA (allocated per training step)" />
          <ConfigRow label="Inference" value="vLLM with LoRA hot-swap" />
          <ConfigRow label="Training" value="Unsloth (GRPO fine-tuning)" />
          <ConfigRow label="Cost" value="W&B hackathon credits ($500)" />
          <ConfigRow label="Local GPU required?" value="No" />
        </div>
      </Section>

      <Section title="Current status">
        <StatusList
          items={[
            { done: true, text: 'W&B serverless backend connected' },
            { done: true, text: 'ART training pipeline tested end-to-end' },
            { done: true, text: 'Metrics logging to W&B dashboard' },
            { done: true, text: 'LoRA checkpoints saving after each step' },
          ]}
        />
      </Section>
    </div>
  );
}

/* ───────────────────────── WEIGHTS & BIASES ───────────────────────── */

function WandBTab() {
  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Tracking Results (Weights & Biases)</h2>
        <p className="text-lg text-slate-400">
          If we can't prove the AI is learning, it doesn't count. W&B gives us live charts that show improvement.
        </p>
      </div>

      <Section title="What is Weights & Biases?">
        <p>
          It's a dashboard that watches your AI while it trains. Every time the AI finishes a round of
          growing a plant, W&B records the score and plots it on a chart. Over time, you can see the line
          going up &mdash; that's the AI getting smarter.
        </p>
      </Section>

      <Section title="Why does this matter?">
        <Callout>
          The reward curve (a chart showing the AI's score improving over time) is worth
          <strong> 20% of the hackathon judging score</strong>. W&B generates this automatically
          and gives us a public link we can share with judges.
        </Callout>
      </Section>

      <Section title="What we're tracking">
        <div className="grid sm:grid-cols-2 gap-4">
          <MetricCard
            name="Reward (harvest weight)"
            description="How much the virtual plant produced. Higher = the AI made better decisions."
          />
          <MetricCard
            name="Episode number"
            description="Which round of training we're on. The AI plays hundreds of these."
          />
          <MetricCard
            name="pH and EC levels"
            description="The water chemistry over time. Shows if the AI learned to keep conditions stable."
          />
          <MetricCard
            name="Days survived"
            description="How long the plant lasted. Early on, the AI kills plants fast. Later, they thrive."
          />
        </div>
      </Section>

      <Section title="How W&B integrates with ART">
        <p className="mb-4">ART handles W&B logging automatically. Metrics from every trajectory are tracked:</p>
        <CodeBlock
          code={`# ART auto-initializes W&B when the model registers
model = art.TrainableModel(
    name="gardenrl-llama-3.1-8b-instruct",
    project="gardenrl-training",
    base_model="meta-llama/Llama-3.1-8B-Instruct",
)
backend = ServerlessBackend()
await model.register(backend)

# After collecting trajectories, train with GRPO:
result = await backend.train(model, train_groups, learning_rate=5e-6)

# ART logs everything to W&B after each training step:
await model.log(train_groups, metrics=result.metrics,
                step=result.step, split="train")`}
        />
      </Section>

      <Section title='About the "vision model" question'>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5 space-y-3">
          <p>
            Some people assume we need a vision model because we used 390,000 plant images.
            We don't. Here's the difference:
          </p>
          <div className="grid sm:grid-cols-2 gap-4 mt-2">
            <div className="bg-slate-950/50 p-4 rounded-lg">
              <p className="font-medium text-slate-300 mb-2">What people assume</p>
              <p className="text-sm text-slate-500">
                AI looks at photos of plants to decide what to do. Needs a vision model to "see" leaves.
              </p>
            </div>
            <div className="bg-emerald-950/30 border border-emerald-800/50 p-4 rounded-lg">
              <p className="font-medium text-emerald-400 mb-2">What actually happens</p>
              <p className="text-sm text-slate-400">
                We used photos to build the science behind the simulation. At runtime, the AI reads
                text like "leaf_color: brown_tips" &mdash; no photos involved.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section title="W&B Dashboard">
        <div className="bg-slate-900/50 border border-emerald-500/30 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-bold text-white mb-1">Live Training Dashboard</h4>
              <p className="text-sm text-gray-400">ART automatically logs all metrics to W&B</p>
            </div>
            <a
              href="https://wandb.ai/ndmm/gardenrl-training"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              View Live Dashboard
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
          <p className="text-sm text-slate-400">
            ART logs reward curves, harvest weights, success rates, and LoRA checkpoints after each training step.
            The dashboard updates in real time during training runs.
          </p>
        </div>
      </Section>

      <Section title="Current status">
        <StatusList
          items={[
            { done: true, text: 'W&B project created and authenticated' },
            { done: true, text: 'ART training pipeline verified end-to-end' },
            { done: true, text: 'Metrics logging to W&B (reward, harvest weight, success rate)' },
            { done: true, text: 'Full 50-step training run completed (100% parse rate, avg 190g harvest)' },
          ]}
        />
      </Section>
    </div>
  );
}

/* ───────────────────────── TRAINING SETUP ───────────────────────── */

function TrainingTab() {
  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Running the Training</h2>
        <p className="text-lg text-slate-400">
          Everything is installed. Here's how it all fits together when we hit "go."
        </p>
      </div>

      <Section title="The pipeline, step by step">
        <ol className="space-y-4 mt-4">
          <Step number={1} title="Run train_art.py from any machine">
            No GPU needed locally. ART sends work to W&B-managed serverless GPUs
            automatically. Just set your WANDB_API_KEY and run the script.
          </Step>
          <Step number={2} title="ART loads the model on serverless GPUs">
            vLLM loads Llama 3.1 8B and serves it for inference. Unsloth prepares
            the LoRA adapter for training. All managed by W&B infrastructure.
          </Step>
          <Step number={3} title="Rollout: the model plays episodes">
            For each training step, the model plays 1 scenario with 4 attempts.
            Each attempt is a full episode where the LLM makes daily decisions. Curriculum learning
            starts with 14-day episodes and gradually increases to 30 days.
          </Step>
          <Step number={4} title="GRPO: learn from the contrast">
            ART compares attempts within each scenario group. Actions that led to better harvests
            get reinforced; actions that killed plants get penalized. Unsloth updates the LoRA weights.
          </Step>
          <Step number={5} title="Iterate and track">
            vLLM loads the updated weights. The model plays again, now slightly better.
            Every step is logged to W&B automatically &mdash; reward curves, harvest weights,
            success rates.
          </Step>
        </ol>
      </Section>

      <Section title="What the pipeline uses">
        <div className="bg-slate-950 border border-slate-700 rounded-lg divide-y divide-slate-800">
          <PackageRow name="openpipe-art" purpose="ART training framework (orchestrates the RL loop)" />
          <PackageRow name="vLLM" purpose="High-throughput model inference with LoRA hot-swap (serverless)" />
          <PackageRow name="Unsloth" purpose="Efficient LoRA fine-tuning with GRPO (serverless)" />
          <PackageRow name="openenv-core" purpose="OpenEnv environment runtime (runs locally)" />
          <PackageRow name="W&B" purpose="Experiment tracking (auto-integrated via ART)" />
        </div>
      </Section>

      <Section title="Commands to run training">
        <CodeBlock
          label="Step 1: Install ART client (no GPU needed locally)"
          code={`pip install -e ".[art]"`}
        />
        <CodeBlock
          label="Step 2: Set W&B API key"
          code="export WANDB_API_KEY=your-key-here"
        />
        <CodeBlock
          label="Step 3: Run training (Llama 3.1 8B, 50 steps, serverless)"
          code="python3 train_art.py --steps 50 --attempts 4 --curriculum"
        />
        <CodeBlock
          label="Smoke test (1 step, minimal resources)"
          code="python3 train_art.py --steps 1 --rollouts-per-step 1 --attempts 2"
        />
      </Section>

      <Section title="Training Architecture">
        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6 space-y-4">
          <div>
            <h4 className="text-lg font-bold text-emerald-400 mb-2">End-to-End RL Pipeline</h4>
            <p className="text-sm text-gray-400">
              ART trains a Llama 3.1 8B model with GRPO on the GardenRL OpenEnv environment.
              The model learns to manage pH, EC, and nutrients over 30-day episodes.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">Per Training Step</div>
              <div className="text-white">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Rollouts per step</span>
                  <span className="text-emerald-400 font-mono">1</span>
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Attempts per rollout</span>
                  <span className="text-emerald-400 font-mono">4</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Curriculum</span>
                  <span className="text-emerald-400 font-mono">14→20→24→30 days</span>
                </div>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Tracking</div>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>W&B dashboard (auto-logged via ART)</li>
                <li>Harvest weight, success rate, pH/EC stability</li>
                <li>LoRA checkpoints saved each step</li>
              </ul>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Overall progress">
        <StatusList
          items={[
            { done: true, text: 'GardenRL OpenEnv environment built and tested' },
            { done: true, text: 'W&B serverless backend connected' },
            { done: true, text: 'ART training script written (train_art.py)' },
            { done: true, text: 'Llama 3.1 8B selected as base model (8B fits 4 GRPO attempts)' },
            { done: true, text: 'Smoke test passed (1 step end-to-end)' },
            { done: true, text: 'Full ART training completed (50 steps, 100% success rate)' },
            { done: true, text: 'Reward curve logged to W&B dashboard' },
          ]}
        />
      </Section>
    </div>
  );
}

/* ───────────────────────── SHARED COMPONENTS ───────────────────────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xl font-semibold text-emerald-300 mb-3">{title}</h3>
      <div className="text-slate-300 leading-relaxed">{children}</div>
    </div>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-emerald-950/30 border-l-4 border-emerald-500 p-5 rounded-r-lg text-emerald-100 leading-relaxed">
      {children}
    </div>
  );
}

function ToolCard({ name, role, description }: { name: string; role: string; description: string }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">
      <h4 className="font-semibold text-white">{name}</h4>
      <p className="text-emerald-400 text-sm mb-2">{role}</p>
      <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}

function MetricCard({ name, description }: { name: string; description: string }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
      <h4 className="font-medium text-white text-sm">{name}</h4>
      <p className="text-sm text-slate-400 mt-1">{description}</p>
    </div>
  );
}

function Line({ label, value, comment }: { label: string; value: string; comment: string }) {
  return (
    <div className="flex gap-4 items-baseline">
      <span className="text-slate-500">{label}:</span>
      <span className="text-emerald-400">{value}</span>
      <span className="text-slate-600 text-xs">// {comment}</span>
    </div>
  );
}

function ConfigRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center px-5 py-3">
      <span className="text-slate-400 text-sm">{label}</span>
      <span className="font-mono text-emerald-400 text-sm">{value}</span>
    </div>
  );
}

function CodeBlock({ label, code }: { label?: string; code: string }) {
  return (
    <div className="mt-3">
      {label && <p className="text-sm text-slate-400 mb-2">{label}:</p>}
      <pre className="bg-slate-950 p-4 rounded-lg overflow-x-auto border border-slate-700">
        <code className="text-emerald-400 text-sm font-mono whitespace-pre">{code}</code>
      </pre>
    </div>
  );
}

function PackageRow({ name, purpose }: { name: string; purpose: string }) {
  return (
    <div className="flex justify-between items-center px-5 py-3 gap-4">
      <span className="font-mono text-emerald-400 text-sm whitespace-nowrap">{name}</span>
      <span className="text-slate-400 text-sm text-right">{purpose}</span>
    </div>
  );
}

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-4">
      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-900/50 border border-emerald-700 flex items-center justify-center text-emerald-400 text-sm font-bold">
        {number}
      </span>
      <div>
        <p className="font-medium text-white">{title}</p>
        <p className="text-slate-400 text-sm mt-1 leading-relaxed">{children}</p>
      </div>
    </li>
  );
}

function StatusList({ items }: { items: { done: boolean; text: string }[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-center gap-3">
          <span className={`flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center text-xs ${
            item.done
              ? 'bg-emerald-900/50 border-emerald-600 text-emerald-400'
              : 'border-slate-600 text-slate-600'
          }`}>
            {item.done ? '✓' : ''}
          </span>
          <span className={`text-sm ${item.done ? 'text-slate-400' : 'text-slate-300'}`}>
            {item.text}
          </span>
        </li>
      ))}
    </ul>
  );
}

function ProductCard({ title, status, description }: { title: string; status: string; description: string }) {
  return (
    <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-700">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-emerald-400">{title}</h4>
        <span className="text-sm">{status}</span>
      </div>
      <p className="text-sm text-slate-400">{description}</p>
    </div>
  );
}

function Tooltip({ children, tooltip }: { children: React.ReactNode; tooltip: string }) {
  return (
    <span className="group relative inline-block">
      <span className="border-b border-dotted border-emerald-400 cursor-help">{children}</span>
      <span className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 border border-emerald-500/50 text-emerald-100 text-xs rounded-lg whitespace-nowrap z-10 shadow-lg">
        {tooltip}
        <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-slate-800" />
      </span>
    </span>
  );
}

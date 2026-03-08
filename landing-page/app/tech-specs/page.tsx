'use client';

import { useState } from 'react';
import Link from 'next/link';

type Tab = 'overview' | 'northflank' | 'wandb' | 'training';

export default function TechSpecs() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-emerald-900/30 bg-slate-950/50 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-emerald-400 hover:text-emerald-300 transition-colors">
            ← Back to GardenRL
          </Link>
          <h1 className="text-2xl font-bold text-emerald-400">Technical Specifications</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-slate-700">
          {[
            { id: 'overview' as Tab, label: 'Overview' },
            { id: 'northflank' as Tab, label: 'Northflank GPU' },
            { id: 'wandb' as Tab, label: 'Weights & Biases' },
            { id: 'training' as Tab, label: 'Training Setup' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium transition-all ${
                activeTab === tab.id
                  ? 'text-emerald-400 border-b-2 border-emerald-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-slate-900/50 rounded-lg p-8 border border-slate-800">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'northflank' && <NorthflankTab />}
          {activeTab === 'wandb' && <WandBTab />}
          {activeTab === 'training' && <TrainingTab />}
        </div>
      </main>
    </div>
  );
}

function OverviewTab() {
  return (
    <div className="space-y-6 text-slate-300">
      <h2 className="text-3xl font-bold text-emerald-400">Project Overview</h2>

      <div className="space-y-4">
        <Section title="What is GardenRL?">
          <p>GardenRL is an AI training environment that teaches language models to grow virtual plants through trial and error.</p>
          <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
            <li>390,000 real plant images used to build scientifically-grounded simulation</li>
            <li>Agent reads text observations (pH, EC, leaf color) - no vision model needed</li>
            <li>Fast, deterministic Python simulation for any RL framework</li>
          </ul>
        </Section>

        <Section title="Tech Stack">
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <InfoCard
              title="Compute"
              items={['Northflank GPU (H100)', 'Meta - OpenEnv Region', '16 vCPU, 192GB RAM']}
            />
            <InfoCard
              title="Observability"
              items={['Weights & Biases Models', 'Live reward curve tracking', 'Public shareable results']}
            />
            <InfoCard
              title="Training"
              items={['Python RL environment', 'Text-based observations', 'Reward: harvest weight']}
            />
            <InfoCard
              title="Framework"
              items={['PyTorch', 'Unsloth (LLM optimization)', 'TRL (training library)']}
            />
          </div>
        </Section>

        <Section title="Why This Matters">
          <p>Traditional RL environments use simple numbers. GardenRL uses <strong>natural language observations</strong> that force models to reason like a real gardener:</p>
          <div className="bg-slate-950/50 p-4 rounded-lg mt-3 font-mono text-sm">
            <div className="text-emerald-400">Observation:</div>
            <div className="ml-4 mt-2">
              ph: 7.2<br/>
              leaf_color: "brown_tips"<br/>
              growth_stage: "vegetative"<br/>
              warnings: ["nutrient lockout risk"]
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}

function NorthflankTab() {
  return (
    <div className="space-y-6 text-slate-300">
      <h2 className="text-3xl font-bold text-emerald-400">Northflank GPU Setup</h2>

      <Section title="Why Northflank?">
        <p>Northflank provides instant access to H100 GPUs in the Meta - OpenEnv region, perfect for training large language models.</p>
      </Section>

      <Section title="Service Configuration">
        <div className="bg-slate-950/50 p-6 rounded-lg space-y-3">
          <ConfigRow label="Service Name" value="gardenrl-gpu-training" />
          <ConfigRow label="Region" value="Meta - OpenEnv (GPU region)" />
          <ConfigRow label="GPU" value="NVIDIA H100 (80GB VRAM) × 1" />
          <ConfigRow label="CPU" value="16 dedicated vCPUs" />
          <ConfigRow label="Memory" value="192 GB RAM" />
          <ConfigRow label="Storage" value="60 GB ephemeral + 64 MB shared memory" />
          <ConfigRow label="Docker Image" value="ubuntu:22.04" />
        </div>
      </Section>

      <Section title="Quick Start Commands">
        <CodeBlock
          title="Install Northflank CLI"
          code="npm install -g @northflank/cli"
        />
        <CodeBlock
          title="Login"
          code="npx @northflank/cli login"
        />
        <CodeBlock
          title="SSH into service"
          code="npx @northflank/cli ssh service --serviceId gardenrl-gpu-training"
        />
      </Section>

      <Section title="Setup Status">
        <StatusList
          items={[
            { done: true, text: 'Northflank CLI installed and authenticated' },
            { done: true, text: 'Project context set to hackathon' },
            { done: true, text: 'GPU service deployed and running' },
            { done: false, text: 'Python dependencies installed' },
            { done: false, text: 'GitHub repo cloned' },
            { done: false, text: 'Training script running' },
          ]}
        />
      </Section>
    </div>
  );
}

function WandBTab() {
  return (
    <div className="space-y-6 text-slate-300">
      <h2 className="text-3xl font-bold text-emerald-400">Weights & Biases Integration</h2>

      <Section title="Why W&B?">
        <p>Weights & Biases automatically tracks training runs and plots the reward curve - which is <strong>20% of the judging score</strong>. It makes results beautiful and shareable with one line of code.</p>
      </Section>

      <Section title="Which W&B Product?">
        <div className="space-y-3">
          <ProductCard
            title="Models"
            status="✅ Using This"
            description="Tracks RL training runs, generates reward curves, logs harvest weight improving over episodes"
          />
          <ProductCard
            title="Weave"
            status="⏳ Later if time permits"
            description="Shows step-by-step reasoning, demonstrates Mercor bounty angle"
          />
          <ProductCard
            title="Inference"
            status="❌ Not needed"
            description="For serving LLMs to users - not applicable to training-only workflow"
          />
        </div>
      </Section>

      <Section title="Integration Code">
        <CodeBlock
          title="Install W&B"
          code="pip install wandb"
        />
        <CodeBlock
          title="Login"
          code="wandb login"
        />
        <CodeBlock
          title="Add to training script"
          code={`import wandb

wandb.init(project="gardenrl", name="run-1")

# Inside training loop, after each episode:
wandb.log({
    "episode": episode_num,
    "reward": harvest_weight,
    "final_ph": obs.ph,
    "final_ec": obs.ec,
    "days_survived": obs.day
})

wandb.finish()`}
        />
      </Section>

      <Section title="What Judges Will See">
        <p>Live public URL like <code className="text-emerald-400">wandb.ai/yves/gardenrl</code> showing:</p>
        <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
          <li>Reward curve climbing over episodes</li>
          <li>pH/EC drift over time</li>
          <li>Agent improving harvest weight</li>
        </ul>
        <p className="mt-3 text-emerald-400">This URL goes in your submission and YouTube video for undeniable proof of improvement.</p>
      </Section>

      <Section title="Important Clarification">
        <div className="bg-amber-950/30 border border-amber-700/50 p-4 rounded-lg">
          <p className="font-medium text-amber-400">No Vision Model Needed</p>
          <p className="mt-2">The 390K plant images built the simulation physics - the agent never sees photos at runtime. It reads text observations like <code>leaf_color: "brown_tips"</code>, not images.</p>
          <p className="mt-2">This is a <strong>strength</strong>: faster training, simpler pipeline, any LLM can read text.</p>
        </div>
      </Section>
    </div>
  );
}

function TrainingTab() {
  return (
    <div className="space-y-6 text-slate-300">
      <h2 className="text-3xl font-bold text-emerald-400">Training Setup</h2>

      <Section title="Environment Setup (On Northflank GPU)">
        <CodeBlock
          title="Update system"
          code="apt-get update && apt-get install -y python3 python3-pip git"
        />
        <CodeBlock
          title="Install Python dependencies"
          code="pip install torch unsloth trl wandb"
        />
        <CodeBlock
          title="Clone repository"
          code="git clone https://github.com/YOUR_USERNAME/GardenRL.git
cd GardenRL"
        />
      </Section>

      <Section title="Training Script Structure">
        <CodeBlock
          code={`# 1. Initialize W&B
import wandb
wandb.init(project="gardenrl", name="h100-run-1")

# 2. Load environment
from GardenRL_environment import GardenEnv
env = GardenEnv()

# 3. Training loop
for episode in range(num_episodes):
    obs = env.reset()
    total_reward = 0

    while not done:
        action = agent.act(obs)
        obs, reward, done, info = env.step(action)
        total_reward += reward

    # 4. Log to W&B
    wandb.log({
        "episode": episode,
        "reward": total_reward,
        "harvest_weight": info["harvest_weight"]
    })

wandb.finish()`}
        />
      </Section>

      <Section title="Next Steps">
        <StatusList
          items={[
            { done: false, text: 'SSH into Northflank service' },
            { done: false, text: 'Install system packages (python3, git)' },
            { done: false, text: 'Install Python libraries (torch, unsloth, trl, wandb)' },
            { done: false, text: 'Clone GardenRL repository' },
            { done: false, text: 'Login to W&B and grab API key' },
            { done: false, text: 'Run training script' },
            { done: false, text: 'Monitor progress on W&B dashboard' },
          ]}
        />
      </Section>
    </div>
  );
}

// Helper Components
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xl font-semibold text-emerald-300 mb-3">{title}</h3>
      <div className="text-slate-300">{children}</div>
    </div>
  );
}

function InfoCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-700">
      <h4 className="font-medium text-emerald-400 mb-2">{title}</h4>
      <ul className="space-y-1 text-sm">
        {items.map((item, i) => (
          <li key={i} className="text-slate-400">• {item}</li>
        ))}
      </ul>
    </div>
  );
}

function ConfigRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
      <span className="text-slate-400">{label}</span>
      <span className="font-mono text-emerald-400">{value}</span>
    </div>
  );
}

function CodeBlock({ title, code }: { title?: string; code: string }) {
  return (
    <div className="mt-3">
      {title && <div className="text-sm text-slate-400 mb-2">{title}</div>}
      <pre className="bg-slate-950/70 p-4 rounded-lg overflow-x-auto border border-slate-700">
        <code className="text-emerald-400 text-sm font-mono">{code}</code>
      </pre>
    </div>
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

function StatusList({ items }: { items: { done: boolean; text: string }[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-center gap-3">
          <span className={`text-lg ${item.done ? 'text-emerald-400' : 'text-slate-600'}`}>
            {item.done ? '✓' : '○'}
          </span>
          <span className={item.done ? 'text-slate-400 line-through' : 'text-slate-300'}>
            {item.text}
          </span>
        </li>
      ))}
    </ul>
  );
}

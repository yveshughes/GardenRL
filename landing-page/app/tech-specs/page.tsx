'use client';

import { useState } from 'react';
import Link from 'next/link';

type Tab = 'overview' | 'northflank' | 'wandb' | 'training';

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
            { id: 'northflank' as Tab, label: 'GPU Cloud' },
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
        {activeTab === 'northflank' && <NorthflankTab />}
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
        <div className="grid sm:grid-cols-3 gap-4 mt-4">
          <ToolCard
            name="Northflank"
            role="The computer"
            description="Gives us a powerful GPU in the cloud so training runs fast instead of taking days on a laptop."
          />
          <ToolCard
            name="Weights & Biases"
            role="The scoreboard"
            description="Tracks every training run and draws charts showing the AI improving over time. Proof that it's learning."
          />
          <ToolCard
            name="PyTorch + Unsloth"
            role="The engine"
            description="The actual machine learning code that makes the AI think, learn, and get smarter each round."
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

/* ───────────────────────────── NORTHFLANK ───────────────────────────── */

function NorthflankTab() {
  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">GPU Cloud (Northflank)</h2>
        <p className="text-lg text-slate-400">
          Training AI on a laptop would take forever. We rented a powerful GPU in the cloud to speed things up.
        </p>
      </div>

      <Section title="What is Northflank?">
        <p>
          Think of it like renting a supercomputer by the hour. Northflank is a platform that lets you
          spin up a powerful machine in the cloud, run your code on it, and shut it down when you're done.
          You only pay for the time you use.
        </p>
      </Section>

      <Section title="Why do we need a GPU?">
        <p>
          A GPU (Graphics Processing Unit) was originally designed for video games, but it turns out to be
          amazing at the math that AI needs. Training on a GPU is <strong>10-100x faster</strong> than
          on a regular computer.
        </p>
        <p className="mt-3">
          We're using an <strong>NVIDIA H100</strong> &mdash; one of the most powerful GPUs available today,
          with 80GB of dedicated memory for AI workloads.
        </p>
      </Section>

      <Section title="What we set up">
        <div className="bg-slate-950 border border-slate-700 rounded-lg divide-y divide-slate-800">
          <ConfigRow label="Service name" value="gardenrl-gpu-training" />
          <ConfigRow label="Cloud region" value="Meta - OpenEnv" />
          <ConfigRow label="GPU" value="NVIDIA H100 (80 GB memory)" />
          <ConfigRow label="CPU" value="16 cores" />
          <ConfigRow label="RAM" value="192 GB" />
          <ConfigRow label="Operating system" value="Ubuntu 22.04 (Linux)" />
          <ConfigRow label="Cost" value="$2.74 / hour" />
        </div>
      </Section>

      <Section title="How to connect to it">
        <p className="mb-4">From your terminal, you can run commands on the cloud machine:</p>
        <CodeBlock
          label="Run a command on the GPU machine"
          code='npx @northflank/cli exec service --serviceId gardenrl-gpu-training --cmd "your command here"'
        />
        <CodeBlock
          label="Open an SSH tunnel for direct access"
          code="npx @northflank/cli ssh service --serviceId gardenrl-gpu-training"
        />
      </Section>

      <Section title="Current status">
        <StatusList
          items={[
            { done: true, text: 'Northflank account connected' },
            { done: true, text: 'GPU service created and running' },
            { done: true, text: 'Python, PyTorch, and ML libraries installed' },
            { done: true, text: 'GardenRL code cloned from GitHub' },
            { done: true, text: 'GPU detected and working (nvidia-smi)' },
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

      <Section title="The code is simple">
        <p className="mb-4">Just 5 lines added to the training script:</p>
        <CodeBlock
          code={`import wandb

wandb.init(project="gardenrl", name="run-1")

# After each training episode:
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

      <Section title="Current status">
        <StatusList
          items={[
            { done: true, text: 'W&B library installed on GPU machine' },
            { done: true, text: 'API key connected and authenticated' },
            { done: true, text: 'Test run logged successfully' },
            { done: false, text: 'Full training run with live tracking' },
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
          <Step number={1} title="We connect to our cloud GPU">
            From our laptop, we run a command that opens a connection to the Northflank
            machine with the H100 GPU.
          </Step>
          <Step number={2} title="The training script starts">
            Python loads our GardenRL environment (the virtual garden) and sets up the AI model
            using PyTorch and Unsloth.
          </Step>
          <Step number={3} title="The AI plays hundreds of rounds">
            Each round: the AI reads the plant's status, decides what to do (adjust pH, add
            nutrients, etc.), and gets scored on how well the plant grew.
          </Step>
          <Step number={4} title="Every round is logged to W&B">
            After each round, the score and plant data get sent to Weights & Biases, which
            updates the live dashboard in real time.
          </Step>
          <Step number={5} title="We watch the reward curve go up">
            On the W&B dashboard, we can see a chart of the AI's score over time. If it's
            going up, the AI is learning. That chart is our proof.
          </Step>
        </ol>
      </Section>

      <Section title="What's installed on the GPU machine">
        <div className="bg-slate-950 border border-slate-700 rounded-lg divide-y divide-slate-800">
          <PackageRow name="Python 3" purpose="The programming language everything runs in" />
          <PackageRow name="PyTorch" purpose="The core AI/ML framework (like the engine of a car)" />
          <PackageRow name="Unsloth" purpose="Makes LLM training 2-5x faster and use less memory" />
          <PackageRow name="TRL" purpose="Hugging Face library for training LLMs with rewards" />
          <PackageRow name="W&B" purpose="Sends training data to our live dashboard" />
          <PackageRow name="Git" purpose="Pulls our latest code from GitHub" />
        </div>
      </Section>

      <Section title="Commands to run training">
        <CodeBlock
          label="Step 1: Connect to GPU machine"
          code='npx @northflank/cli exec service --serviceId gardenrl-gpu-training --cmd "bash"'
        />
        <CodeBlock
          label="Step 2: Go to the project folder"
          code="cd GardenRL"
        />
        <CodeBlock
          label="Step 3: Pull latest code"
          code="git pull origin main"
        />
        <CodeBlock
          label="Step 4: Run training"
          code="python3 train.py"
        />
      </Section>

      <Section title="Overall progress">
        <StatusList
          items={[
            { done: true, text: 'GPU machine set up and running in the cloud' },
            { done: true, text: 'All software installed (Python, PyTorch, etc.)' },
            { done: true, text: 'GardenRL code deployed to GPU machine' },
            { done: true, text: 'W&B connected for live tracking' },
            { done: false, text: 'Write the training script' },
            { done: false, text: 'Run first training session' },
            { done: false, text: 'Review results on W&B dashboard' },
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

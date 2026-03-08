'use client';

import RewardProgressionChart from '@/components/charts/RewardProgressionChart';
import HarvestWeightChart from '@/components/charts/HarvestWeightChart';
import SuccessRateComparisonChart from '@/components/charts/SuccessRateComparisonChart';

function Tooltip({ children, tooltip }: { children: React.ReactNode; tooltip: string }) {
  return (
    <span className="group relative inline-block">
      <span className="cursor-help">{children}</span>
      <span className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-4 py-3 bg-slate-800 border border-emerald-500/50 text-emerald-100 text-sm rounded-lg whitespace-normal max-w-xs z-10 shadow-xl">
        {tooltip}
        <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-slate-800" />
      </span>
    </span>
  );
}

export default function TrainingResults() {
  return (
    <section className="snap-section bg-gradient-to-b from-slate-950 to-emerald-950/20 overflow-y-auto">
      <div className="container mx-auto px-6 py-16 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="display-medium mb-4">Growing More Food with RL</h2>
          <p className="text-xl text-gray-400 mb-6">
            If we can optimize yield, we can feed more people. 127 steps of GRPO training took harvest weight from 0g to 200g.
          </p>
          <a
            href="https://wandb.ai/ndmm/gardenrl-training/runs/p8rggsh0"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <span>View W&B Training Run</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        {/* Metrics Dashboard — Harvest weight is the hero */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <MetricCard
            label="Peak Harvest"
            value="213.7g"
            icon="&#x1F33F;"
            highlight
            tooltip="Peak mean harvest weight at step 122. A healthy Batavia lettuce yields 150-250g — our agent is growing near-optimal lettuce."
          />
          <MetricCard
            label="Yield Gain"
            value="0 &rarr; 201g"
            icon="&#x1F4C8;"
            tooltip="The model learned conditions management on short episodes (0g harvest), then immediately grew 200g+ lettuce on its first full 30-day episode."
          />
          <MetricCard
            label="Success Rate"
            value="100%"
            icon="&#x2705;"
            tooltip="Every evaluation episode at steps 113-127 produced a successful harvest above 150g — up from 0% during curriculum phases."
          />
          <MetricCard
            label="Training Steps"
            value="127"
            icon="&#x1F4CA;"
            tooltip="127 GRPO training steps with curriculum learning: 14→20→24→30 day episodes. Trained with Llama 3.1 8B on W&B serverless."
          />
        </div>

        {/* Charts — Harvest weight first */}
        <div className="space-y-8">
          <HarvestWeightChart />

          <div className="grid lg:grid-cols-2 gap-8">
            <SuccessRateComparisonChart />
            <RewardProgressionChart />
          </div>
        </div>

        {/* How curriculum learning works */}
        <div className="mt-8 p-6 bg-emerald-950/30 border border-emerald-900/30 rounded-lg">
          <h3 className="text-lg font-bold text-emerald-400 mb-2">
            Why the Dramatic Jump?
          </h3>
          <p className="text-sm text-gray-300 leading-relaxed">
            <strong>Curriculum learning.</strong> The model trains on progressively longer episodes:
            14-day &rarr; 20-day &rarr; 24-day &rarr; 30-day. Harvest requires day 25+, so short episodes
            show 0g &mdash; but the model is learning pH management, nutrient balance, and stress avoidance.
            When full 30-day episodes begin at step 113, all those skills transfer instantly: <strong>185g on the very first attempt</strong>.
            Qwen3 14B (gray) shows no learning because it could only fit 1 GRPO attempt on the serverless GPU &mdash; GRPO needs &ge;2 to compute advantages.
          </p>
        </div>

        {/* Data Verification Note */}
        <div className="mt-6 p-6 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <h3 className="text-lg font-bold text-blue-400 mb-2">
            100% Real Data
          </h3>
          <p className="text-sm text-gray-400">
            All metrics from W&B run <code className="text-emerald-400">p8rggsh0</code> (127 GRPO steps, Llama 3.1 8B, 4 attempts/step).
            No synthetic or simulated results. Logged to <a href="https://wandb.ai/ndmm/gardenrl-training/runs/p8rggsh0" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Weights &amp; Biases</a> for full transparency.
          </p>
        </div>
      </div>
    </section>
  );
}

function MetricCard({ label, value, icon, tooltip, highlight }: { label: string; value: string; icon: string; tooltip?: string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg p-4 transition-colors group ${highlight ? 'bg-emerald-950/50 border-2 border-emerald-500/50 ring-1 ring-emerald-500/20' : 'bg-slate-900/50 border border-slate-800 hover:border-emerald-500/30'}`}>
      <div className="text-2xl mb-2" dangerouslySetInnerHTML={{ __html: icon }} />
      <div className={`font-bold mb-1 ${highlight ? 'text-3xl text-emerald-400' : 'text-2xl text-white'}`}>{value}</div>
      <div className="text-sm text-gray-400 flex items-center gap-1">
        {label}
        {tooltip && (
          <Tooltip tooltip={tooltip}>
            <svg className="w-3.5 h-3.5 text-gray-500 hover:text-emerald-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </Tooltip>
        )}
      </div>
    </div>
  );
}

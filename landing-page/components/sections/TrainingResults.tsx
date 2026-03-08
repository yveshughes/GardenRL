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
          <h2 className="display-medium mb-4">Real Training Results</h2>
          <p className="text-xl text-gray-400 mb-6">
            50-step GRPO training with Llama 3.1 8B on GardenRL, evaluated on 20 held-out seeds
          </p>
          <a
            href="https://wandb.ai/ndmm/gardenrl-training/runs/xd72dxcd"
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

        {/* Metrics Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <MetricCard
            label="Training Steps"
            value="50"
            icon="&#x1F4CA;"
            tooltip="50 GRPO training steps with curriculum learning: 14-day episodes first, gradually increasing to full 30-day episodes."
          />
          <MetricCard
            label="Best Harvest"
            value="109.9g"
            icon="&#x1F3C6;"
            tooltip="Mean harvest weight at step 50 on 20 held-out evaluation seeds. Up from 99.0g at step 0."
          />
          <MetricCard
            label="Success Rate"
            value="60%"
            icon="&#x2705;"
            tooltip="Percentage of evaluation episodes with harvest weight above 150g at step 50. Up from 50% at step 0."
          />
          <MetricCard
            label="Improvement"
            value="+10.9g"
            icon="&#x1F4C8;"
            tooltip="Increase in mean harvest weight from step 0 (99.0g) to step 50 (109.9g) on held-out evaluation seeds."
          />
        </div>

        {/* Charts */}
        <div className="space-y-8">
          <RewardProgressionChart />

          <div className="grid lg:grid-cols-2 gap-8">
            <HarvestWeightChart />
            <SuccessRateComparisonChart />
          </div>
        </div>

        {/* Training context callout */}
        <div className="mt-8 p-6 bg-emerald-950/30 border border-emerald-900/30 rounded-lg">
          <h3 className="text-lg font-bold text-emerald-400 mb-2">
            Training vs Evaluation
          </h3>
          <p className="text-sm text-gray-300 leading-relaxed">
            On <strong>training seeds</strong>, the model achieved 186g average harvest and 100% success rate
            at steps 39-50 (after curriculum reached full 30-day episodes). The more modest eval results above
            reflect generalization to <strong>20 unseen seeds</strong> (1000-1019) with no forced harvest.
            The step 40 dip coincides with the curriculum transition from 24-day to 30-day episodes.
            Qwen3 14B (gray) shows no learning because the larger model could only fit 1 attempt per step
            on the serverless GPU &mdash; and GRPO needs &ge;2 attempts to compute advantages.
          </p>
        </div>

        {/* Data Verification Note */}
        <div className="mt-6 p-6 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <h3 className="text-lg font-bold text-blue-400 mb-2">
            100% Real Data
          </h3>
          <p className="text-sm text-gray-400">
            All visualizations use authentic benchmark data from a 50-step GRPO training run
            (run: <code className="text-emerald-400">gardenrl-llama-3.1-8b-instruct-20260308-081856</code>).
            No synthetic or simulated results. Evaluated on 20 fixed seeds and logged to Weights & Biases
            for full transparency.
          </p>
        </div>
      </div>
    </section>
  );
}

function MetricCard({ label, value, icon, tooltip }: { label: string; value: string; icon: string; tooltip?: string }) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 hover:border-emerald-500/30 transition-colors group">
      <div className="text-2xl mb-2" dangerouslySetInnerHTML={{ __html: icon }} />
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
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

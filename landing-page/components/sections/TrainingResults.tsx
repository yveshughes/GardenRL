'use client';

import { useEffect, useState } from 'react';
import RewardCurveChart from '@/components/charts/RewardCurveChart';
import StabilityChart from '@/components/charts/StabilityChart';
import SuccessRateChart from '@/components/charts/SuccessRateChart';

interface TrainingData {
  total_episodes: number;
  episodes: Array<{
    episode: number;
    strategy: string;
    reward: number;
    harvest_weight: number;
    days_survived: number;
    final_ph: number;
    final_ec: number;
    final_growth_stage: string;
    final_leaf_color: string;
    died: boolean;
    steps: Array<{
      day: number;
      ph: number;
      ec: number;
      water_temp: number;
      leaf_color: string;
      growth_stage: string;
      action: string;
      reasoning: string;
      warnings: string[];
    }>;
  }>;
  generated_at: string;
}

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
  const [trainingData, setTrainingData] = useState<TrainingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/data/training-episodes.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load training data');
        return res.json();
      })
      .then(data => {
        setTrainingData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="snap-section bg-gradient-to-b from-slate-950 to-emerald-950/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-400 mx-auto mb-4" />
          <p className="text-gray-400">Loading training results...</p>
        </div>
      </section>
    );
  }

  if (error || !trainingData) {
    return (
      <section className="snap-section bg-gradient-to-b from-slate-950 to-emerald-950/20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-2">⚠️ Failed to load training data</p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </section>
    );
  }

  // Calculate summary statistics
  const totalEpisodes = trainingData.episodes.length;
  const recentEpisodes = trainingData.episodes.slice(-100);
  const avgRewardRecent = recentEpisodes.reduce((sum, e) => sum + e.reward, 0) / recentEpisodes.length;
  const successRate = (trainingData.episodes.filter(e => e.harvest_weight >= 150).length / totalEpisodes) * 100;
  const bestEpisode = trainingData.episodes.reduce((best, e) => e.harvest_weight > best.harvest_weight ? e : best);

  return (
    <section className="snap-section bg-gradient-to-b from-slate-950 to-emerald-950/20 overflow-y-auto">
      <div className="container mx-auto px-6 py-16 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="display-medium mb-4">Real Training Results</h2>
          <p className="text-xl text-gray-400 mb-6">
            {totalEpisodes} episodes of authentic hydroponic management
          </p>
          <a
            href="https://wandb.ai/ndmm/gardenrl-training"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <span>View Live W&B Dashboard</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        {/* Metrics Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <MetricCard
            label="Episodes Trained"
            value={totalEpisodes.toLocaleString()}
            icon="📊"
            tooltip="Total number of 30-day growth cycles we ran. Each episode is like planting a new lettuce and managing it until harvest (or death)."
          />
          <MetricCard
            label="Avg Reward (Last 100)"
            value={avgRewardRecent.toFixed(0)}
            icon="📈"
            tooltip="Average score from the most recent 100 episodes. Higher = better harvests. The AI is scored by harvest weight × 10, so 1080 ≈ 108g average harvest."
          />
          <MetricCard
            label="Success Rate (150g+)"
            value={`${successRate.toFixed(1)}%`}
            icon="✅"
            tooltip="How often we got a good harvest (150g or more). We started near 0% when the AI was learning. Good lettuce weighs 150-250g."
          />
          <MetricCard
            label="Best Harvest"
            value={`${bestEpisode.harvest_weight.toFixed(1)}g`}
            icon="🏆"
            tooltip="The heaviest lettuce we grew across all 500 episodes. A full-size Batavia lettuce head is 200-300g. This was episode #${bestEpisode.episode}."
          />
        </div>

        {/* Charts */}
        <div className="space-y-8">
          <RewardCurveChart episodes={trainingData.episodes} />

          <div className="grid lg:grid-cols-2 gap-8">
            <StabilityChart episodes={trainingData.episodes} />
            <SuccessRateChart episodes={trainingData.episodes} />
          </div>
        </div>

        {/* Data Verification Note */}
        <div className="mt-12 p-6 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <h3 className="text-lg font-bold text-blue-400 mb-2">
            🔬 100% Real Data
          </h3>
          <p className="text-sm text-gray-400">
            All visualizations use authentic training data from {totalEpisodes} episodes run on our
            GardenRL environment. No synthetic or simulated results. Generated on{' '}
            {new Date(trainingData.generated_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })} and logged to Weights & Biases for full transparency.
          </p>
        </div>
      </div>
    </section>
  );
}

function MetricCard({ label, value, icon, tooltip }: { label: string; value: string; icon: string; tooltip?: string }) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 hover:border-emerald-500/30 transition-colors group">
      <div className="text-2xl mb-2">{icon}</div>
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

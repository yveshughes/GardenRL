'use client';

import { useState, useEffect } from 'react';
import GantryRobotDemo from '@/components/GantryRobotDemo';

interface ReplayEpisode {
  episode_id: number;
  total_reward: number;
  harvest_weight: number;
  days_survived: number;
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
}

export default function RobotDemo() {
  const [mode, setMode] = useState<'simulation' | 'live' | 'replay'>('simulation');
  const [currentDay, setCurrentDay] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeSpeed, setTimeSpeed] = useState(1); // 1x or 10x
  const [replayData, setReplayData] = useState<ReplayEpisode | null>(null);

  // Load replay data when replay mode is selected
  useEffect(() => {
    if (mode === 'replay' && !replayData) {
      fetch('/data/episode-replay.json')
        .then(res => res.json())
        .then(data => {
          setReplayData(data);
          setCurrentDay(1); // Reset to day 1
        })
        .catch(err => {
          console.error('Failed to load replay data:', err);
        });
    }
  }, [mode, replayData]);

  // Auto-advance days in LIVE or REPLAY mode
  useEffect(() => {
    if ((mode === 'live' || mode === 'replay') && isPlaying && currentDay < 30) {
      const interval = setInterval(() => {
        setCurrentDay(prev => Math.min(prev + 1, 30));
      }, 1000 / timeSpeed);
      return () => clearInterval(interval);
    }
  }, [mode, isPlaying, currentDay, timeSpeed]);

  // Generate simulated date
  const getSimulatedDate = (day: number) => {
    const startDate = new Date(2026, 2, 1); // March 1, 2026
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + day - 1);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[currentDate.getDay()]}, ${months[currentDate.getMonth()]} ${currentDate.getDate()}, 2026`;
  };

  return (
    <section className="snap-section relative bg-black">
      <div className="absolute inset-0 spotlight" />

      <div className="relative z-10 w-full px-6">
        <div className="text-center mb-12">
          <div className="text-emerald-500 font-mono text-lg mb-6">Interactive Environment Demo</div>
          <h2 className="display-large mb-6">
            See How Agents <span className="gradient-green glow-green">Reason</span>
          </h2>
          <p className="text-readable text-gray-400 max-w-4xl mx-auto mb-4">
            Adjust environmental parameters and watch how detailed reasoning leads to better outcomes
          </p>
          <p className="text-gray-500 max-w-3xl mx-auto text-lg">
            The environment provides sensor readings (pH, EC, leaf color). Agents that reason in detail
            about the plant&apos;s hidden state — <em>&quot;pH 7.2 blocks calcium uptake, causing tip burn&quot;</em> —
            learn faster than those taking random actions. That&apos;s the <strong className="text-emerald-400">Mercor sub-bounty</strong> in action.
          </p>
        </div>

        {/* Mode Toggle Bar */}
        <div className="max-w-[1600px] mx-auto mb-6">
          <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              {/* Toggle Switch */}
              <div className="flex items-center gap-4">
                <span className="text-gray-400 text-sm font-medium">Mode:</span>
                <div className="flex items-center gap-2 bg-gray-950/80 rounded-lg p-1">
                  <button
                    onClick={() => setMode('simulation')}
                    className={`px-4 py-2.5 rounded-md font-semibold text-sm transition-all ${
                      mode === 'simulation'
                        ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/50'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    SIMULATION
                  </button>
                  <button
                    onClick={() => {
                      setMode('replay');
                      setCurrentDay(1);
                      setIsPlaying(false);
                    }}
                    className={`px-4 py-2.5 rounded-md font-semibold text-sm transition-all ${
                      mode === 'replay'
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    REPLAY
                  </button>
                  <button
                    onClick={() => setMode('live')}
                    className={`px-4 py-2.5 rounded-md font-semibold text-sm transition-all ${
                      mode === 'live'
                        ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/50'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    LIVE
                  </button>
                </div>
              </div>

              {/* Mode Explanation OR Time Controls */}
              {mode === 'simulation' ? (
                <div className="flex-1 min-w-[300px]">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 animate-pulse" />
                    <div>
                      <p className="text-emerald-400 text-sm font-semibold mb-0.5">Simulation Mode</p>
                      <p className="text-gray-500 text-xs leading-relaxed">
                        Fast, client-side simulation with pre-programmed AI reasoning.
                        Instant response, no server needed. Perfect for exploring the mechanics.
                      </p>
                    </div>
                  </div>
                </div>
              ) : mode === 'replay' ? (
                <div className="flex-1 min-w-[300px]">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 animate-pulse" />
                    <div>
                      <p className="text-blue-400 text-sm font-semibold mb-0.5">
                        Replay Mode {replayData && `• Episode #${replayData.episode_id}`}
                      </p>
                      <p className="text-gray-500 text-xs leading-relaxed">
                        {replayData
                          ? `Real trained agent episode - ${replayData.harvest_weight.toFixed(1)}g harvest, reward ${replayData.total_reward}. This is authentic data from our W&B training runs.`
                          : 'Loading real episode data...'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 flex-wrap">
                  {/* Time Display */}
                  <div className="flex items-center gap-3 px-4 py-2 bg-gray-950/80 rounded-lg border border-gray-800">
                    <svg
                      className="w-4 h-4 text-emerald-400"
                      style={{ animation: isPlaying ? 'spin 2s linear infinite' : 'none' }}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                      <path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <div>
                      <div className="text-white font-mono font-bold text-sm">Day {currentDay} / 30</div>
                      <div className="text-emerald-400 text-[10px] font-mono">{getSimulatedDate(currentDay)}</div>
                    </div>
                  </div>

                  {/* Playback Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setTimeSpeed(timeSpeed === 1 ? 10 : 1)}
                      className="px-3 py-1.5 rounded-md text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500/30"
                    >
                      {timeSpeed}x
                    </button>
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                        isPlaying
                          ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                      }`}
                    >
                      {isPlaying ? '⏸ Pause' : '▶ Play'}
                    </button>
                    <button
                      onClick={() => setCurrentDay(1)}
                      className="px-3 py-1.5 rounded-md text-xs font-semibold bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600"
                    >
                      ↺ Reset
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto">
          <GantryRobotDemo
            mode={mode}
            currentDay={currentDay}
            isPlaying={isPlaying}
            replayData={mode === 'replay' ? replayData : undefined}
          />
        </div>
      </div>
    </section>
  );
}

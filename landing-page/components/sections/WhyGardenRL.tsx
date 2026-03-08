'use client';

export default function WhyGardenRL() {
  const features = [
    {
      icon: '⏳',
      title: 'Long-Horizon Planning',
      description:
        'Delayed rewards spanning 30-day episodes. A pH mistake on day 5 causes nutrient lockout on day 6, leaf damage on day 9, and harvest loss on day 30. Agents must reason about compound effects.',
      stat: '30 days',
      statLabel: 'Episode length',
    },
    {
      icon: '🔬',
      title: 'World Modeling',
      description:
        'Partial observability with hidden state. Agents see pH, EC, and leaf color, but must infer root health and nutrient lockout severity from symptoms. Professional-grade simulation.',
      stat: 'Hidden',
      statLabel: 'State variables',
    },
    {
      icon: '⚖️',
      title: 'Verifiable Rewards',
      description:
        'No LLM judge needed. Harvest weight is measured in grams — deterministic and objective. A healthy Batavia lettuce yields 150-250g. A stressed plant yields 50-100g.',
      stat: '0',
      statLabel: 'LLM judges',
    },
    {
      icon: '💭',
      title: 'Reasoning Rewards',
      description:
        'Targeting Mercor sub-bounty: rewards scale with token output. Detailed diagnosis ("pH 7.2 blocks calcium uptake") leads to better outcomes than random actions.',
      stat: 'Mercor',
      statLabel: 'Sub-bounty',
    },
  ];

  return (
    <section className="snap-section relative bg-gradient-to-b from-black to-gray-950">
      <div className="absolute inset-0 grid-bg opacity-20" />

      <div className="relative z-10 max-w-7xl mx-auto px-8">
        <div className="text-center mb-16 fade-in-up">
          <hr className="max-w-md mx-auto mb-8 border-emerald-500/30" />
          <h2 className="display-medium mb-6">
            Why <span className="gradient-green">GardenRL</span>?
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            A professional-grade RL environment addressing <strong className="text-white">Long-Horizon Planning</strong> and{' '}
            <strong className="text-white">World Modeling</strong> through realistic hydroponic farming simulation
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {features.map((feature, idx) => {
            const delayClasses = ['delay-1', 'delay-2', 'delay-3', 'delay-4'];
            return (
            <div
              key={idx}
              className={`bg-gray-900/50 border border-gray-800 p-8 rounded-2xl hover:border-emerald-500/30 transition-all fade-in-up ${delayClasses[idx] || ''}`}
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-400 mb-6">{feature.description}</p>
              <div className="flex items-end gap-3">
                <div className="text-4xl font-bold gradient-green">{feature.stat}</div>
                <div className="text-sm text-gray-500 pb-1">{feature.statLabel}</div>
              </div>
            </div>
          );
          })}
        </div>

        {/* Dataset Growth Row */}
        <div className="fade-in-up delay-5">
          <div className="text-center mb-6">
            <div className="text-emerald-500 font-mono text-xs mb-2">Training Data</div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Watch it <span className="gradient-green">Grow</span>
            </h3>
            <p className="text-gray-500 text-sm">
              Real Batavia lettuce from HydroGrowNet — daily captures across the full growth cycle
            </p>
          </div>

          <div className="flex flex-col gap-3 max-w-6xl mx-auto">
            {[
              Array.from({ length: 9 }, (_, i) => i + 1),
              Array.from({ length: 9 }, (_, i) => i + 10),
            ].map((row, ri) => (
              <div key={ri} className="grid grid-cols-9 gap-2">
                {row.map((day) => (
                  <div key={day} className="group">
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-950 border border-gray-800/60 group-hover:border-emerald-500/40 transition-colors">
                      <img
                        src={`/plants/day-${day}.png`}
                        alt={`Day ${day}`}
                        className="w-full h-full object-contain"
                        loading="lazy"
                      />
                      <div className="absolute top-1 left-1.5 text-[10px] font-mono font-bold text-white/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                        Day {day}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-6 mt-4 text-xs text-gray-500 font-mono">
            <span>Real plant images from HydroGrowNet dataset</span>
            <span className="text-gray-700">|</span>
            <span>YOLO-v8 segmented &middot; 640&times;480</span>
          </div>
        </div>
      </div>

      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
    </section>
  );
}

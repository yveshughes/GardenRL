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
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-full mb-8">
            <span className="text-emerald-400 font-mono text-sm">Problem Statement 2 & 3.1 • Mercor Sub-Bounty</span>
          </div>
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

        {/* Bottom CTA */}
        <div className="bg-gradient-to-r from-emerald-900/40 to-emerald-800/40 border border-emerald-500/30 text-white p-10 rounded-3xl backdrop-blur-sm fade-in-up delay-5">
          <div className="max-w-3xl mx-auto space-y-6">
            <h3 className="text-3xl font-bold gradient-green text-center">Built With Domain Expertise</h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <div className="text-emerald-400 font-mono text-xs mb-2">Real-World Grounding</div>
                <p className="text-gray-300">
                  Every parameter reflects <strong>10+ years</strong> managing commercial NFT hydroponic systems.
                  pH drift, nutrient lockout, temperature stress — all based on real cultivation experience.
                </p>
              </div>
              <div>
                <div className="text-emerald-400 font-mono text-xs mb-2">Dataset Foundation</div>
                <p className="text-gray-300">
                  Grounded in the <strong>HydroGrowNet of Batavia dataset</strong> — 390,000+ images from
                  controlled experiments tracking pH, EC, and temperature across 90-day growth cycles.
                </p>
              </div>
              <div>
                <div className="text-emerald-400 font-mono text-xs mb-2">Fast Simulation</div>
                <p className="text-gray-300">
                  Deterministic Python simulation (no image processing at runtime). Compatible with any RL
                  framework — Unsloth, TRL, or custom training loops.
                </p>
              </div>
              <div>
                <div className="text-emerald-400 font-mono text-xs mb-2">Real Impact</div>
                <p className="text-gray-300">
                  Hydroponics uses <strong>90% less water</strong> than traditional farming. Teaching AI to optimize
                  growing conditions could help scale sustainable food production globally.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
    </section>
  );
}

'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export default function WhyGardenRL() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const features = [
    {
      icon: '⚖️',
      title: 'Verifiable Rewards',
      description:
        'No LLM judge needed. Harvest weight is measured in grams — deterministic and objective.',
      stat: '150-250g',
      statLabel: 'Healthy yield',
    },
    {
      icon: '🌍',
      title: 'Real-World Impact',
      description:
        'Hydroponics uses 90% less water than traditional farming. AI that masters this environment could help scale sustainable food production.',
      stat: '90%',
      statLabel: 'Less water',
    },
    {
      icon: '🧬',
      title: 'Multi-Variable Causality',
      description:
        'pH affects nutrient uptake. EC affects growth rate. Temperature affects metabolism. All three interact in complex ways.',
      stat: '3+',
      statLabel: 'State variables',
    },
    {
      icon: '🎯',
      title: 'Sparse Feedback',
      description:
        'Primary reward only comes at harvest (day 30). Intermediate signals guide learning but require reasoning about hidden state.',
      stat: '30 days',
      statLabel: 'Episode length',
    },
  ];

  return (
    <section
      id="why-gardenrl"
      ref={ref}
      className="min-h-screen flex items-center justify-center px-6 py-20 bg-gradient-to-b from-white to-[#F0F9FF]"
    >
      <div className="max-w-7xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6 mb-16"
        >
          <div className="inline-block px-4 py-2 bg-[#0EA5E9]/10 rounded-full">
            <span className="text-[#0EA5E9] font-semibold text-sm">
              Environment Innovation — 40% of Judging Score
            </span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-[#0C4A6E]">
            Why GardenRL?
          </h2>
          <p className="text-xl text-zinc-600 max-w-3xl mx-auto">
            An environment designed for genuine long-horizon reasoning with real-world relevance
            and verifiable outcomes.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + idx * 0.1 }}
              className="bg-white p-8 rounded-2xl shadow-lg border-2 border-[#0EA5E9]/10 hover:border-[#0EA5E9]/30 transition-all cursor-pointer"
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-2xl font-bold text-[#0C4A6E] mb-3">{feature.title}</h3>
              <p className="text-zinc-600 mb-6">{feature.description}</p>
              <div className="flex items-end gap-3">
                <div className="text-4xl font-bold text-[#0EA5E9]">{feature.stat}</div>
                <div className="text-sm text-zinc-500 pb-1">{feature.statLabel}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 bg-[#0EA5E9] text-white p-10 rounded-3xl shadow-2xl"
        >
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h3 className="text-3xl font-bold">Built by a Real Gardener</h3>
            <p className="text-lg text-blue-50">
              Every parameter, stress response, and deficiency symptom reflects{' '}
              <strong>10+ years of hands-on experience</strong> building greenhouses and
              managing NFT hydroponic systems.
            </p>
            <p className="text-blue-100">
              This isn't a toy simulation — it's grounded in the lessons learned from growing
              hundreds of plants, diagnosing nutrient lockouts at 2am, and optimizing yield
              through trial and error.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

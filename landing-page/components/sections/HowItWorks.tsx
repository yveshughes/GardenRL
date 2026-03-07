'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export default function HowItWorks() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const steps = [
    {
      number: '1',
      title: 'Observe',
      description: 'Agent reads sensor data and plant state',
      details: [
        'pH, EC, water temperature',
        'Leaf color and count',
        'Growth stage',
        'Warning signals',
      ],
      color: '#0EA5E9',
    },
    {
      number: '2',
      title: 'Reason',
      description: 'Agent diagnoses issues and plans intervention',
      details: [
        'Identify nutrient deficiencies',
        'Predict pH drift impact',
        'Consider multi-day effects',
        'Choose optimal action',
      ],
      color: '#38BDF8',
    },
    {
      number: '3',
      title: 'Act',
      description: 'Agent adjusts hydroponic system parameters',
      details: [
        'Adjust pH up/down',
        'Add or dilute nutrients',
        'Modify water temperature',
        'Monitor or harvest',
      ],
      color: '#FB923C',
    },
    {
      number: '4',
      title: 'Learn',
      description: 'Environment updates and agent receives feedback',
      details: [
        'Plant growth simulation',
        'Daily penalties for drift',
        'Final harvest reward',
        'Episode completed',
      ],
      color: '#F97316',
    },
  ];

  return (
    <section
      ref={ref}
      className="min-h-screen flex items-center justify-center px-6 py-20 bg-gradient-to-b from-[#F0F9FF] to-white"
    >
      <div className="max-w-7xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6 mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-[#0C4A6E]">How It Works</h2>
          <p className="text-xl text-zinc-600 max-w-3xl mx-auto">
            The classic RL loop: <strong>Observe → Act → Reward → Learn → Repeat</strong>
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + idx * 0.1 }}
              className="relative"
            >
              <div
                className="bg-white p-6 rounded-2xl shadow-lg border-2 hover:shadow-2xl transition-all cursor-pointer"
                style={{ borderColor: `${step.color}40` }}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-4"
                  style={{ backgroundColor: step.color }}
                >
                  {step.number}
                </div>
                <h3 className="text-2xl font-bold text-[#0C4A6E] mb-2">{step.title}</h3>
                <p className="text-zinc-600 mb-4">{step.description}</p>
                <ul className="space-y-2">
                  {step.details.map((detail, detailIdx) => (
                    <li key={detailIdx} className="flex items-start gap-2 text-sm text-zinc-500">
                      <span style={{ color: step.color }}>•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Arrow for desktop */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-3xl text-[#0EA5E9] z-10">
                  →
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Code Example */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-[#0C4A6E] text-white p-8 rounded-2xl shadow-2xl"
        >
          <h3 className="text-2xl font-bold mb-6 text-[#38BDF8]">Simple API</h3>
          <pre className="text-sm overflow-x-auto">
            <code className="text-blue-100">{`from GardenRL import GardenEnv, GardenAction

# Connect to environment
env = GardenEnv(base_url="https://hf.space/gardenrl")

# Reset for new episode
obs = env.reset()
print(f"Day {obs.day}: pH={obs.ph:.2f}, EC={obs.ec:.2f}")

# Agent loop
for day in range(30):
    # Observe → Reason → Act
    if obs.ph > 6.5:
        action = GardenAction(
            action_type="adjust_ph_down",
            amount=0.3,
            reasoning="pH too high, risk of nutrient lockout"
        )
    else:
        action = GardenAction(action_type="maintain")

    # Step environment
    obs = env.step(action)

    # Check reward
    if obs.done:
        print(f"Harvest: {obs.reward / 10:.1f}g")
        break`}</code>
          </pre>
        </motion.div>

        {/* Key Insight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mt-12 bg-[#0EA5E9]/10 p-8 rounded-2xl border-2 border-[#0EA5E9]/30"
        >
          <p className="text-lg text-[#0C4A6E] text-center font-medium">
            <strong className="text-[#0EA5E9]">Compatible with any RL framework</strong>
            <br />
            Standard OpenEnv interface — works with TRL, Unsloth, or your custom training loop.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

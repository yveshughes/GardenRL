'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export default function TheScience() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const datasetStats = [
    { value: '390,000+', label: 'High-res images', icon: '📸' },
    { value: '3 months', label: 'Growth tracking', icon: '📅' },
    { value: 'NFT', label: 'Hydroponic system', icon: '💧' },
    { value: 'Batavia', label: 'Lettuce cultivar', icon: '🥬' },
  ];

  const variables = [
    { name: 'pH Level', range: '5.5-6.5', color: '#0EA5E9' },
    { name: 'EC (Nutrients)', range: '1.2-2.0 mS/cm', color: '#38BDF8' },
    { name: 'Water Temp', range: '18-22°C', color: '#FB923C' },
  ];

  return (
    <section
      ref={ref}
      className="min-h-screen flex items-center justify-center px-6 py-20 bg-[#0C4A6E] text-white"
    >
      <div className="max-w-6xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6 mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold">The Science Behind GardenRL</h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Our simulation is grounded in the <strong>HydroGrowNet of Batavia</strong> dataset
            from real commercial hydroponic systems.
          </p>
        </motion.div>

        {/* Dataset Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {datasetStats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white/10 backdrop-blur-sm p-6 rounded-xl text-center border border-white/20"
            >
              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold text-[#38BDF8] mb-1">{stat.value}</div>
              <div className="text-sm text-blue-100">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Variables Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20 mb-12"
        >
          <h3 className="text-2xl font-bold mb-6 text-center">
            Tracked Variables & Optimal Ranges
          </h3>
          <div className="space-y-6">
            {variables.map((variable, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{variable.name}</span>
                  <span className="text-blue-100">{variable.range}</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={inView ? { width: '60%' } : {}}
                    transition={{ duration: 1, delay: 0.6 + idx * 0.1 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: variable.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Key Insight */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="grid md:grid-cols-2 gap-8"
        >
          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20">
            <h4 className="text-xl font-bold mb-4 text-[#38BDF8]">Realistic Dynamics</h4>
            <ul className="space-y-3 text-blue-100">
              <li className="flex items-start gap-3">
                <span className="text-[#38BDF8]">✓</span>
                <span>pH naturally drifts upward over time</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#38BDF8]">✓</span>
                <span>Nutrient uptake varies with temperature</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#38BDF8]">✓</span>
                <span>Stress accumulates across multiple days</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#38BDF8]">✓</span>
                <span>Wrong pH causes nutrient lockout</span>
              </li>
            </ul>
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20">
            <h4 className="text-xl font-bold mb-4 text-[#38BDF8]">
              Fast, Deterministic Simulation
            </h4>
            <ul className="space-y-3 text-blue-100">
              <li className="flex items-start gap-3">
                <span className="text-[#38BDF8]">✓</span>
                <span>No image processing at runtime</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#38BDF8]">✓</span>
                <span>Pure Python physics simulation</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#38BDF8]">✓</span>
                <span>Reproducible results (fixed seed)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#38BDF8]">✓</span>
                <span>Compatible with any RL framework</span>
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Dataset Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mt-12 text-center"
        >
          <a
            href="https://data.mendeley.com/datasets/g6cm3v3wdp/5"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-4 bg-white text-[#0C4A6E] font-semibold rounded-full hover:bg-blue-50 transition-colors cursor-pointer"
          >
            View HydroGrowNet Dataset →
          </a>
        </motion.div>
      </div>
    </section>
  );
}

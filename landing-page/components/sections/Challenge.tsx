'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export default function Challenge() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <section
      ref={ref}
      className="min-h-screen flex items-center justify-center px-6 py-20 bg-white"
    >
      <div className="max-w-5xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6 mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-[#0C4A6E]">
            The Long-Horizon Challenge
          </h2>
          <p className="text-xl text-zinc-600 max-w-3xl mx-auto">
            Most AI environments provide immediate feedback. Real-world tasks require
            planning across days or weeks with sparse, delayed rewards.
          </p>
        </motion.div>

        {/* Causal Chain Visualization */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="space-y-8"
        >
          {/* Timeline */}
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#0EA5E9] to-[#F97316]" />

            {/* Day 5 */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="relative pl-20 pb-12"
            >
              <div className="absolute left-6 top-1 w-5 h-5 bg-[#0EA5E9] rounded-full border-4 border-white shadow" />
              <div className="bg-[#F0F9FF] p-6 rounded-xl border-2 border-[#0EA5E9]/20">
                <div className="text-sm font-semibold text-[#0EA5E9] mb-2">Day 5</div>
                <p className="text-zinc-700 font-medium">pH drifts to 7.2 (too high)</p>
                <p className="text-sm text-zinc-500 mt-2">Agent fails to adjust</p>
              </div>
            </motion.div>

            {/* Day 6-8 */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="relative pl-20 pb-12"
            >
              <div className="absolute left-6 top-1 w-5 h-5 bg-[#38BDF8] rounded-full border-4 border-white shadow" />
              <div className="bg-[#F0F9FF] p-6 rounded-xl border-2 border-[#38BDF8]/20">
                <div className="text-sm font-semibold text-[#38BDF8] mb-2">Day 6-8</div>
                <p className="text-zinc-700 font-medium">Calcium uptake blocked</p>
                <p className="text-sm text-zinc-500 mt-2">Nutrient lockout begins</p>
              </div>
            </motion.div>

            {/* Day 9 */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="relative pl-20 pb-12"
            >
              <div className="absolute left-6 top-1 w-5 h-5 bg-[#FB923C] rounded-full border-4 border-white shadow" />
              <div className="bg-orange-50 p-6 rounded-xl border-2 border-orange-200">
                <div className="text-sm font-semibold text-[#FB923C] mb-2">Day 9</div>
                <p className="text-zinc-700 font-medium">Brown leaf tips appear</p>
                <p className="text-sm text-zinc-500 mt-2">Visual symptoms emerge</p>
              </div>
            </motion.div>

            {/* Day 30 */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 1.1 }}
              className="relative pl-20"
            >
              <div className="absolute left-6 top-1 w-5 h-5 bg-[#F97316] rounded-full border-4 border-white shadow" />
              <div className="bg-orange-50 p-6 rounded-xl border-2 border-[#F97316]">
                <div className="text-sm font-semibold text-[#F97316] mb-2">Day 30</div>
                <p className="text-zinc-700 font-medium">Harvest: 80g instead of 200g</p>
                <p className="text-sm text-zinc-500 mt-2">
                  <strong className="text-[#F97316]">60% yield loss</strong> from a single
                  early mistake
                </p>
              </div>
            </motion.div>
          </div>

          {/* Key Insight */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 1.3 }}
            className="bg-[#0EA5E9]/10 p-8 rounded-2xl border-2 border-[#0EA5E9]/30"
          >
            <p className="text-lg text-[#0C4A6E] font-medium text-center">
              <strong className="text-[#0EA5E9]">This is genuine long-horizon planning.</strong>
              <br />
              Agents must reason about hidden state, delayed causality, and compound effects
              across 30 days.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

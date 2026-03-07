'use client';

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

// Dynamically import robot with no SSR to avoid Three.js hydration issues
const GantryRobotDemo = dynamic(() => import('@/components/GantryRobotDemo'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-black/5 rounded-2xl flex items-center justify-center">
      <p className="text-zinc-500">Loading 3D Environment...</p>
    </div>
  ),
});

export default function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center px-6 py-20">
      <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-12 items-center">
        {/* Left: Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <div className="inline-block px-4 py-2 bg-[#0EA5E9]/10 rounded-full">
            <span className="text-[#0EA5E9] font-semibold text-sm">
              OpenEnv Hackathon 2026
            </span>
          </div>

          <h1 className="text-5xl lg:text-6xl font-bold text-[#0C4A6E] leading-tight">
            Teaching AI to{' '}
            <span className="text-[#0EA5E9]">Grow Food</span>
          </h1>

          <p className="text-xl text-zinc-600 leading-relaxed">
            A realistic hydroponic farming environment where AI agents learn long-horizon
            planning through delayed rewards and multi-variable causality.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <motion.a
              href="#why-gardenrl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-[#F97316] text-white font-semibold rounded-full text-center hover:bg-[#ea580c] transition-colors cursor-pointer"
            >
              Learn More
            </motion.a>
            <motion.a
              href="https://github.com/yveshughes/GardenRL"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 border-2 border-[#0EA5E9] text-[#0EA5E9] font-semibold rounded-full text-center hover:bg-[#0EA5E9]/10 transition-colors cursor-pointer"
            >
              View on GitHub
            </motion.a>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-3 gap-6 pt-8">
            <div>
              <div className="text-3xl font-bold text-[#0EA5E9]">30</div>
              <div className="text-sm text-zinc-600">Day Growth Cycle</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#0EA5E9]">390K+</div>
              <div className="text-sm text-zinc-600">Dataset Images</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#0EA5E9]">0</div>
              <div className="text-sm text-zinc-600">LLM Judges</div>
            </div>
          </div>
        </motion.div>

        {/* Right: 3D Robot Demo */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div className="rounded-2xl overflow-hidden shadow-2xl bg-black">
            <GantryRobotDemo />
          </div>
          <div className="absolute -bottom-6 -right-6 bg-white px-6 py-3 rounded-xl shadow-lg">
            <p className="text-sm font-semibold text-zinc-700">
              🌱 Live AI Garden Management
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

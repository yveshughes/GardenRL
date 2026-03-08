'use client';

import GantryRobotDemo from '@/components/GantryRobotDemo';

export default function RobotDemo() {
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

        <div className="max-w-[1600px] mx-auto">
          <GantryRobotDemo />
        </div>
      </div>
    </section>
  );
}

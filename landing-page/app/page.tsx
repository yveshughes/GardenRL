'use client';

import Hero from '@/components/sections/Hero';
import Challenge from '@/components/sections/Challenge';
import WhyGardenRL from '@/components/sections/WhyGardenRL';
import TheScience from '@/components/sections/TheScience';
import HowItWorks from '@/components/sections/HowItWorks';
import TryIt from '@/components/sections/TryIt';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#F0F9FF] to-white">
      <Hero />
      <Challenge />
      <WhyGardenRL />
      <TheScience />
      <HowItWorks />
      <TryIt />
    </main>
  );
}

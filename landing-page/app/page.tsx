'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Intro from '@/components/sections/Intro';
import Hero from '@/components/sections/Hero';
import Challenge from '@/components/sections/Challenge';
import TheScience from '@/components/sections/TheScience';
import WhyGardenRL from '@/components/sections/WhyGardenRL';
import HowItWorks from '@/components/sections/HowItWorks';
import RobotDemo from '@/components/sections/RobotDemo';
import TryIt from '@/components/sections/TryIt';
import ProgressIndicator from '@/components/ProgressIndicator';

export default function Home() {
  const [currentSection, setCurrentSection] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('.snap-section');
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        const sectionTop = rect.top + window.scrollY;
        const sectionBottom = sectionTop + rect.height;

        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
          setCurrentSection(index);
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      <ProgressIndicator current={currentSection} total={8} />

      {/* Tech Specs Button */}
      <Link
        href="/tech-specs"
        className="fixed top-6 right-6 z-50 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-lg hover:shadow-emerald-500/50"
      >
        Tech Specs →
      </Link>

      <main>
        <Intro />
        <Hero />
        <Challenge />
        <TheScience />
        <WhyGardenRL />
        <HowItWorks />
        <RobotDemo />
        <TryIt />
      </main>
    </>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Intro from '@/components/sections/Intro';
import Hero from '@/components/sections/Hero';
import WhyGardenRL from '@/components/sections/WhyGardenRL';
import RobotDemo from '@/components/sections/RobotDemo';
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
      <ProgressIndicator current={currentSection} total={4} />
      <main>
        <Intro />
        <Hero />
        <WhyGardenRL />
        <RobotDemo />
      </main>
    </>
  );
}

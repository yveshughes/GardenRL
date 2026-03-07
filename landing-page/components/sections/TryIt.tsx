'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export default function TryIt() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const links = [
    {
      title: 'GitHub Repository',
      description: 'Source code, documentation, and examples',
      url: 'https://github.com/yveshughes/GardenRL',
      icon: '💻',
      cta: 'View on GitHub',
      primary: true,
    },
    {
      title: 'Hugging Face Spaces',
      description: 'Interactive demo and API playground',
      url: 'https://huggingface.co/spaces/yveshughes/GardenRL',
      icon: '🤗',
      cta: 'Try the Demo',
      primary: false,
    },
    {
      title: 'HydroGrowNet Dataset',
      description: 'Research dataset powering our simulation',
      url: 'https://data.mendeley.com/datasets/g6cm3v3wdp/5',
      icon: '📊',
      cta: 'View Dataset',
      primary: false,
    },
  ];

  const problemStatements = [
    {
      number: '2',
      title: 'Long-Horizon Planning',
      description: 'Primary fit — 30-day cycles with delayed rewards',
    },
    {
      number: '3.1',
      title: 'World Modeling',
      description: 'Secondary fit — hidden state and partial observability',
    },
  ];

  return (
    <section
      ref={ref}
      className="min-h-screen flex items-center justify-center px-6 py-20 bg-gradient-to-b from-white to-[#F0F9FF]"
    >
      <div className="max-w-6xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6 mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-[#0C4A6E]">Try GardenRL</h2>
          <p className="text-xl text-zinc-600 max-w-3xl mx-auto">
            Explore the environment, read the docs, or jump straight into training.
          </p>
        </motion.div>

        {/* Links Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {links.map((link, idx) => (
            <motion.a
              key={idx}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + idx * 0.1 }}
              className={`block p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all cursor-pointer ${
                link.primary
                  ? 'bg-[#0EA5E9] text-white border-2 border-[#0EA5E9]'
                  : 'bg-white border-2 border-[#0EA5E9]/20 hover:border-[#0EA5E9]/50'
              }`}
            >
              <div className="text-5xl mb-4">{link.icon}</div>
              <h3
                className={`text-xl font-bold mb-2 ${
                  link.primary ? 'text-white' : 'text-[#0C4A6E]'
                }`}
              >
                {link.title}
              </h3>
              <p
                className={`mb-6 ${
                  link.primary ? 'text-blue-100' : 'text-zinc-600'
                }`}
              >
                {link.description}
              </p>
              <div
                className={`inline-block px-6 py-3 rounded-full font-semibold ${
                  link.primary
                    ? 'bg-white text-[#0EA5E9]'
                    : 'bg-[#0EA5E9] text-white'
                }`}
              >
                {link.cta} →
              </div>
            </motion.a>
          ))}
        </div>

        {/* Problem Statements */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-white p-8 rounded-2xl shadow-lg border-2 border-[#0EA5E9]/20 mb-16"
        >
          <h3 className="text-2xl font-bold text-[#0C4A6E] mb-6 text-center">
            Hackathon Problem Statements
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {problemStatements.map((statement, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-[#0EA5E9] text-white rounded-full flex items-center justify-center font-bold text-xl">
                  {statement.number}
                </div>
                <div>
                  <h4 className="font-bold text-[#0C4A6E] mb-1">{statement.title}</h4>
                  <p className="text-sm text-zinc-600">{statement.description}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-gradient-to-r from-[#0EA5E9] to-[#38BDF8] text-white p-12 rounded-3xl shadow-2xl text-center"
        >
          <h3 className="text-3xl font-bold mb-4">Built for OpenEnv Hackathon 2026</h3>
          <p className="text-lg text-blue-50 mb-8 max-w-2xl mx-auto">
            Teaching AI to grow food, one lettuce at a time. 🌱
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://github.com/yveshughes/GardenRL"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-white text-[#0EA5E9] font-semibold rounded-full hover:bg-blue-50 transition-colors cursor-pointer"
            >
              Star on GitHub ⭐
            </a>
            <a
              href="https://huggingface.co/spaces/yveshughes/GardenRL"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 border-2 border-white text-white font-semibold rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              Try on HF Spaces 🚀
            </a>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mt-16 text-center text-zinc-500 text-sm"
        >
          <p>
            Built by{' '}
            <a
              href="https://github.com/yveshughes"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0EA5E9] hover:underline"
            >
              Yves Hughes
            </a>{' '}
            • Powered by{' '}
            <a
              href="https://github.com/meta-pytorch/OpenEnv"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0EA5E9] hover:underline"
            >
              OpenEnv
            </a>
          </p>
          <p className="mt-2">
            Dataset:{' '}
            <a
              href="https://data.mendeley.com/datasets/g6cm3v3wdp/5"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0EA5E9] hover:underline"
            >
              HydroGrowNet of Batavia
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}

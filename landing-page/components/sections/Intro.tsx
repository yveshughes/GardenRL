'use client';

export default function Intro() {
  return (
    <section className="snap-section relative bg-gradient-to-b from-gray-950 to-black">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_50%)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-8">
        <div className="max-w-4xl mx-auto">
          {/* Personal Story */}
          <div className="text-center mb-16 fade-in-up">
            <h1 className="text-5xl md:text-6xl font-bold mb-8 leading-tight">
              <span className="gradient-green">GardenRL</span>
              <br />
              <span className="text-gray-300 text-3xl md:text-4xl font-normal mt-4 block">
                Hydroponic RL Environment
              </span>
            </h1>
            <p className="text-2xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
              I&apos;m an avid hydroponic gardener. Over the last decade, I&apos;ve built greenhouses,
              extensive outdoor setups, and learned every lesson the hard way. Recently, I&apos;ve become
              obsessed with AI and Robotics so this was a fun experiment...
            </p>
          </div>

          {/* Photo Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-16 fade-in-up delay-1">
            <div className="group relative overflow-hidden rounded-2xl border-2 border-emerald-500/30 hover:border-emerald-500/50 transition-all">
              <img
                src="/image1.jpeg"
                alt="Indoor greenhouse hydroponic setup"
                className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4">
                <div className="text-emerald-400 font-mono text-xs mb-1">Indoor Greenhouse</div>
                <div className="text-white text-sm">Year-round growing</div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border-2 border-emerald-500/30 hover:border-emerald-500/50 transition-all">
              <img
                src="/image2.jpeg"
                alt="Outdoor hydroponic NFT system"
                className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4">
                <div className="text-emerald-400 font-mono text-xs mb-1">Outdoor NFT System</div>
                <div className="text-white text-sm">Fresh food, family passion</div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border-2 border-emerald-500/30 hover:border-emerald-500/50 transition-all">
              <img
                src="/container.JPG"
                alt="40ft shipping container for hydroponic lab"
                className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4">
                <div className="text-emerald-400 font-mono text-xs mb-1">40ft Container Lab</div>
                <div className="text-white text-sm">AI + robot arm vision</div>
              </div>
            </div>
          </div>

          {/* The Challenge */}
          <div className="text-center mb-12 fade-in-up delay-2">
            <p className="text-2xl text-gray-300 leading-relaxed max-w-3xl mx-auto mb-6">
              But here&apos;s the challenge: <span className="text-emerald-400 font-semibold">How do you teach an AI
              to optimize growing conditions across 30-day cycles with delayed feedback?</span>
            </p>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Most RL environments give immediate rewards. But in farming, a pH mistake today causes
              nutrient lockout tomorrow and harvest loss weeks later. That&apos;s <strong className="text-white">genuine long-horizon planning</strong>.
            </p>
          </div>

          {/* Transition */}
          <div className="text-center fade-in-up delay-3">
            <div className="text-gray-400 text-xl mb-4">
              That&apos;s why I built...
            </div>
            <div className="text-5xl font-bold gradient-green mb-3">
              GardenRL
            </div>
            <div className="text-emerald-400/80 font-mono text-sm">
              OpenEnv-compatible • Built for the OpenEnv Hackathon
            </div>
          </div>
        </div>

      </div>

      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
    </section>
  );
}

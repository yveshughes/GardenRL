'use client';

export default function Hero() {
  return (
    <section className="snap-section relative bg-black">
      <div className="absolute inset-0 grid-bg opacity-30" />

      <div className="relative z-10 max-w-7xl mx-auto px-8 text-center">
        <div className="mb-8">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-full mb-8">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-400 font-mono text-lg">GardenRL</span>
          </div>
        </div>

        <h1 className="display-huge mb-8 fade-in-up">
          A Hydroponic Farming
          <br />
          <span className="gradient-green glow-green">RL Environment</span>
        </h1>

        <p className="text-readable text-gray-400 max-w-4xl mx-auto mb-12 fade-in-up delay-2">
          An OpenEnv-compatible environment for long-horizon planning and world modeling,
          grounded in 390,000+ real plant images from commercial hydroponic systems
        </p>

        <div className="grid grid-cols-3 gap-8 max-w-5xl mx-auto fade-in-up delay-3">
          <div>
            <div className="text-7xl md:text-8xl font-black gradient-green leading-none tracking-tighter">30</div>
            <div className="text-gray-400 text-xl mt-4">Day Episodes</div>
          </div>
          <div>
            <div className="text-7xl md:text-8xl font-black gradient-green leading-none tracking-tighter">390K</div>
            <div className="text-gray-400 text-xl mt-4">Dataset Images</div>
          </div>
          <div>
            <div className="text-7xl md:text-8xl font-black gradient-green leading-none tracking-tighter">0</div>
            <div className="text-gray-400 text-xl mt-4">LLM Judges</div>
          </div>
        </div>

      </div>

      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
    </section>
  );
}

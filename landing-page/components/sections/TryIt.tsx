'use client';

export default function TryIt() {
  const resources = [
    {
      title: 'GitHub Repository',
      description: 'Source code, environment, and training scripts',
      url: 'https://github.com/yveshughes/GardenRL',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
        </svg>
      ),
      primary: true,
    },
    {
      title: 'Hugging Face Spaces',
      description: 'Interactive demo and API playground',
      url: 'https://huggingface.co/spaces/yveshughes/GardenRL',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
        </svg>
      ),
      primary: false,
    },
    {
      title: 'HydroGrowNet Dataset',
      description: '390K images of hydroponic lettuce growth',
      url: 'https://data.mendeley.com/datasets/g6cm3v3wdp/5',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      primary: false,
    },
  ];

  return (
    <section className="snap-section bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="container mx-auto px-6 py-20 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="display-medium mb-4">Get Started</h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Explore the environment, review the code, or dive into the research dataset.
          </p>
        </div>

        {/* Resource Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {resources.map((resource, idx) => (
            <a
              key={idx}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative overflow-hidden rounded-lg transition-all duration-300 ${
                resource.primary
                  ? 'bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600'
                  : 'bg-slate-900/50 border border-slate-800 hover:border-emerald-500/50'
              }`}
            >
              <div className="p-8">
                <div className={`mb-4 ${resource.primary ? 'text-white' : 'text-emerald-400'}`}>
                  {resource.icon}
                </div>
                <h3 className={`text-xl font-bold mb-2 ${resource.primary ? 'text-white' : 'text-white'}`}>
                  {resource.title}
                </h3>
                <p className={`text-sm mb-6 ${resource.primary ? 'text-emerald-50' : 'text-gray-400'}`}>
                  {resource.description}
                </p>
                <div className={`inline-flex items-center gap-2 text-sm font-semibold ${
                  resource.primary ? 'text-white' : 'text-emerald-400'
                }`}>
                  <span>Explore</span>
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Hackathon Info */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-8 mb-16">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            OpenEnv Hackathon 2026
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-emerald-600 text-white rounded-lg flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div>
                <h4 className="font-bold text-emerald-400 mb-1">Long-Horizon Planning</h4>
                <p className="text-sm text-gray-400">Primary fit — 30-day growth cycles with delayed rewards and compound consequences</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-emerald-600 text-white rounded-lg flex items-center justify-center font-bold text-xl">
                3.1
              </div>
              <div>
                <h4 className="font-bold text-emerald-400 mb-1">World Modeling</h4>
                <p className="text-sm text-gray-400">Secondary fit — hidden plant state inferred from observable sensor readings</p>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg p-10 text-center shadow-xl shadow-emerald-900/50">
          <div className="text-6xl mb-4">🌱</div>
          <h3 className="text-3xl font-bold text-white mb-3">Teaching AI to Grow Food</h3>
          <p className="text-lg text-emerald-50 mb-8 max-w-2xl mx-auto">
            One lettuce at a time. Built with OpenEnv for the 2026 Hackathon.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://github.com/yveshughes/GardenRL"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-white text-emerald-600 font-semibold rounded-lg hover:bg-emerald-50 transition-colors inline-flex items-center justify-center gap-2"
            >
              <span>Star on GitHub</span>
              <span>⭐</span>
            </a>
            <a
              href="https://huggingface.co/spaces/yveshughes/GardenRL"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors inline-flex items-center justify-center gap-2"
            >
              <span>Try Demo</span>
              <span>🚀</span>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-slate-800 text-center text-gray-500 text-sm space-y-2">
          <p>
            Built by{' '}
            <a
              href="https://github.com/yveshughes"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Yves Hughes
            </a>
            {' '}• Powered by{' '}
            <a
              href="https://github.com/meta-pytorch/OpenEnv"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              OpenEnv
            </a>
          </p>
          <p>
            Dataset:{' '}
            <a
              href="https://data.mendeley.com/datasets/g6cm3v3wdp/5"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              HydroGrowNet of Batavia
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

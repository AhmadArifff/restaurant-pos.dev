'use client';

import { aboutContent } from '@/data/landing/aboutContent';

export default function About() {
  return (
    <section id="about" className="py-16 md:py-24 px-6 md:px-12 bg-[var(--dark2)]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-[var(--gold)] text-sm uppercase tracking-widest font-semibold">
            Tentang Kami
          </span>
          <h2 className="font-[var(--font-display)] text-4xl md:text-5xl font-bold text-[var(--cream)] mt-4 mb-4">
            {aboutContent.title}
          </h2>
          <p className="text-[var(--cream2)] text-lg max-w-2xl mx-auto">
            {aboutContent.description}
          </p>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 mb-12 items-center">
          {/* Images */}
          <div className="grid gap-4">
            {aboutContent.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`Sultan Kebab ${idx + 1}`}
                className="w-full h-72 object-cover rounded-lg hover:shadow-2xl transition-shadow duration-300"
              />
            ))}
          </div>

          {/* Features */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-[var(--red)] px-4 py-2 rounded text-[var(--cream)]">
              <span className="text-2xl">⭐</span>
              <span className="font-semibold">{aboutContent.badge}</span>
            </div>

            {/* Features List */}
            {aboutContent.features.map((feature, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="text-4xl flex-shrink-0">{feature.icon}</div>
                <div>
                  <h3 className="text-xl font-semibold text-[var(--cream)] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-[var(--cream2)] leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

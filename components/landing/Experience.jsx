'use client';

import { experienceContent } from '@/data/landing/experienceContent';

export default function Experience() {
  return (
    <section className="py-16 md:py-24 px-6 md:px-12 bg-[var(--dark)]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-[var(--gold)] text-sm uppercase tracking-widest font-semibold">
            Keunggulan
          </span>
          <h2 className="font-[var(--font-display)] text-4xl md:text-5xl font-bold text-[var(--cream)] mt-4 mb-4">
            {experienceContent.title}
          </h2>
          <p className="text-[var(--cream2)] text-lg">
            {experienceContent.description}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {experienceContent.features.map((feature, idx) => (
            <div
              key={idx}
              className="group bg-[var(--dark2)] p-8 rounded-lg text-center hover:shadow-2xl hover:border-[var(--gold)] border border-transparent transition-all duration-300 hover:-translate-y-2"
            >
              <div className="text-5xl mb-4 group-hover:scale-125 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-[var(--cream)] mb-3 group-hover:text-[var(--gold)]">
                {feature.title}
              </h3>
              <p className="text-[var(--cream2)] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

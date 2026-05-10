'use client';

import { ctaContent } from '@/data/landing/ctaContent';

export default function CTA() {
  return (
    <section className="py-16 md:py-24 px-6 md:px-12 relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url('${ctaContent.backgroundImage}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.4)',
          zIndex: 0,
        }}
      />

      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(13,10,6,0.95) 0%, rgba(139,26,26,0.3) 100%)',
          zIndex: 1,
        }}
      />

      {/* Content */}
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="font-[var(--font-display)] text-4xl md:text-5xl font-bold text-[var(--cream)] mb-6">
          {ctaContent.title}
        </h2>

        <p className="text-lg md:text-xl text-[var(--cream2)] mb-12 max-w-2xl mx-auto">
          {ctaContent.subtitle}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <a
            href={ctaContent.cta1.href}
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 bg-[var(--gold)] text-[var(--dark)] font-semibold rounded-lg hover:bg-[var(--gold-light)] transition-all duration-300 hover:shadow-xl text-lg"
          >
            {ctaContent.cta1.label}
          </a>
          <a
            href={ctaContent.cta2.href}
            className="px-8 py-4 border-2 border-[var(--gold)] text-[var(--gold)] font-semibold rounded-lg hover:bg-[rgba(201,168,76,0.1)] transition-all duration-300 text-lg"
          >
            {ctaContent.cta2.label}
          </a>
        </div>
      </div>
    </section>
  );
}

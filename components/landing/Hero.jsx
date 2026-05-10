'use client';

import { useState, useEffect } from 'react';
import { heroContent } from '@/data/landing/heroContent';

export default function Hero() {
  const [showScroll, setShowScroll] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setShowScroll(window.scrollY < 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transform scale-110 animate-pulse"
        style={{
          backgroundImage: `url('${heroContent.backgroundImage}')`,
          filter: 'brightness(0.35)',
          animation: 'heroBgZoom 20s ease-in-out infinite alternate',
        }}
      />

      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(13,10,6,0.9) 0%, rgba(139,26,26,0.2) 50%, rgba(13,10,6,0.8) 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-6 md:px-12 max-w-4xl mx-auto">
        <h1 className="font-[var(--font-display)] text-5xl md:text-7xl font-bold mb-4 text-[var(--cream)]">
          {heroContent.title}
          <br />
          <span className="text-[var(--gold)]">{heroContent.titleHighlight}</span>
        </h1>

        <p className="text-lg md:text-xl text-[var(--cream2)] mb-8 max-w-2xl mx-auto leading-relaxed">
          {heroContent.subtitle}
        </p>

        {/* Stats */}
        <div className="flex justify-center gap-8 md:gap-16 mb-12 flex-wrap">
          {heroContent.stats.map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[var(--gold)] mb-2">
                {stat.number}
              </div>
              <div className="text-sm md:text-base text-[var(--text-muted)]">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
          <a
            href={heroContent.cta1.href}
            className="px-8 py-3 bg-[var(--gold)] text-[var(--dark)] font-semibold rounded hover:bg-[var(--gold-light)] transition-colors duration-300"
          >
            {heroContent.cta1.label}
          </a>
          <a
            href={heroContent.cta2.href}
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 border-2 border-[var(--gold)] text-[var(--gold)] font-semibold rounded hover:bg-[rgba(201,168,76,0.1)] transition-colors duration-300"
          >
            {heroContent.cta2.label}
          </a>
        </div>
      </div>

      {/* Scroll Indicator */}
      {showScroll && (
        <div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce"
          style={{
            animation: 'bounce 2s infinite',
          }}
        >
          <div className="text-[var(--gold)] text-3xl">↓</div>
        </div>
      )}

      <style jsx>{`
        @keyframes heroBgZoom {
          from {
            transform: scale(1.1);
          }
          to {
            transform: scale(1.2);
          }
        }
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </section>
  );
}

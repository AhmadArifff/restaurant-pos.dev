'use client';

import { marqueeContent } from '@/data/landing/marqueeContent';

export default function Marquee() {
  return (
    <section className="bg-[var(--gold)] py-6 overflow-hidden">
      <div className="flex animate-scroll whitespace-nowrap">
        {marqueeContent.items.map((item, idx) => (
          <div
            key={idx}
            className="text-[var(--dark)] font-[var(--font-brand)] text-2xl md:text-4xl font-bold px-8 md:px-12 flex-shrink-0"
          >
            ★ {item}
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll {
          animation: scroll 20s linear infinite;
        }

        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}

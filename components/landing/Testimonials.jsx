'use client';

import { useState } from 'react';
import { testimonialsContent } from '@/data/landing/testimonialsContent';

export default function Testimonials() {
  const [activeCard, setActiveCard] = useState(null);

  const handleCardClick = (idx) => {
    setActiveCard(activeCard === idx ? null : idx);
  };

  return (
    <section id="testimonials" className="py-16 md:py-24 px-6 md:px-12 bg-[var(--dark)]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="testi-header reveal">
          <div className="section-label" style={{ justifyContent: 'center' }}>Kata Mereka</div>
          <h2 className="section-title" style={{ textAlign: 'center' }}>
            Ribuan Pelanggan <span className="italic gold">Sudah Membuktikan</span>
          </h2>
          <p className="section-desc" style={{ margin: '0 auto', textAlign: 'center' }}>
            {testimonialsContent.description}
          </p>
        </div>

        {/* Testimonial Cards Grid */}
        <div className="testi-grid">
          {testimonialsContent.testimonials.map((testi, idx) => (
            <div
              key={idx}
              className={`testi-card reveal ${activeCard === idx ? 'tc-active' : ''}`}
              onClick={() => handleCardClick(idx)}
              onTouchEnd={(e) => {
                if (!e.target.closest('.testi-card')._touchMoved) {
                  e.preventDefault();
                  handleCardClick(idx);
                }
              }}
              onTouchStart={(e) => {
                e.currentTarget._touchMoved = false;
              }}
              onTouchMove={() => {
                const div = event.currentTarget;
                if (div) div._touchMoved = true;
              }}
              tabIndex="0"
              role="button"
              aria-label={`Review ${testi.author}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCardClick(idx);
                }
              }}
            >
              {/* Background Image */}
              <img
                src={testi.image}
                alt={testi.author}
                className="testi-bg-img"
              />

              {/* Badge */}
              {testi.badge && (
                <span className="influencer-badge">{testi.badge}</span>
              )}

              {/* Tap Hint (mobile only) */}
              <div className="testi-tap-hint">
                <div className="hint-ring">👆</div>
                <span className="hint-label">Tap untuk baca</span>
              </div>

              {/* Review Overlay */}
              <div className="testi-review-overlay">
                <span className="testi-big-quote">"</span>
                <span className="testi-stars">{'★'.repeat(testi.rating)}</span>
                <p className="testi-text">{testi.review}</p>
              </div>

              {/* Author Strip */}
              <div className="testi-author-strip">
                <img
                  src={testi.avatarImage}
                  alt={testi.author}
                  className="testi-avatar"
                />
                <div>
                  <div className="testi-name">{testi.author}</div>
                  <div className="testi-role">{testi.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

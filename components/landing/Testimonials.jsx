'use client';

import { useEffect, useState } from 'react';
import { testimonialsContent } from '@/data/landing/testimonialsContent';

export default function Testimonials() {
  const [activeCard, setActiveCard] = useState(null);

  useEffect(() => {
    const closeOnOutsideTouch = (event) => {
      if (activeCard === null) return;
      const activeNode = document.querySelector(`[data-testi-card="${activeCard}"]`);
      if (activeNode && !activeNode.contains(event.target)) {
        setActiveCard(null);
      }
    };

    document.addEventListener('touchend', closeOnOutsideTouch);
    return () => document.removeEventListener('touchend', closeOnOutsideTouch);
  }, [activeCard]);

  const toggleCard = (id) => {
    setActiveCard((prev) => (prev === id ? null : id));
  };

  return (
    <section id="testimonials">
      <div className="testi-header reveal">
        <div className="section-label">{testimonialsContent.sectionLabel}</div>
        <h2 className="section-title">
          Ribuan Pelanggan <span className="italic gold">Sudah Membuktikan</span>
        </h2>
        <p className="section-desc">{testimonialsContent.description}</p>
      </div>

      <div className="testi-grid">
        {testimonialsContent.items.map((item) => (
          <div
            key={item.id}
            data-testid-card={item.id}
            data-testi-card={item.id}
            className={`testi-card reveal ${item.revealClass || ''} ${activeCard === item.id ? 'tc-active' : ''}`}
            tabIndex={0}
            role="button"
            aria-label={item.ariaLabel}
            onClick={() => toggleCard(item.id)}
            onTouchStart={(e) => {
              e.currentTarget.dataset.touchMoved = '0';
            }}
            onTouchMove={(e) => {
              e.currentTarget.dataset.touchMoved = '1';
            }}
            onTouchEnd={(e) => {
              if (e.currentTarget.dataset.touchMoved === '1') return;
              e.preventDefault();
              toggleCard(item.id);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleCard(item.id);
              }
            }}
          >
            <img className="testi-bg-img" src={item.image} alt={item.imageAlt} />
            {item.badge ? <span className="influencer-badge">{item.badge}</span> : null}

            <div className="testi-tap-hint">
              <div className="hint-ring">👆</div>
              <span className="hint-label">Tap untuk baca</span>
            </div>

            <div className="testi-review-overlay">
              <span className="testi-big-quote">&quot;</span>
              <span className="testi-stars">★★★★★</span>
              <p className="testi-text">{item.review}</p>
            </div>

            <div className="testi-author-strip">
              <img className="testi-avatar" src={item.authorAvatar} alt={item.authorAvatarAlt} />
              <div>
                <div className="testi-name">{item.author}</div>
                <div className="testi-role">{item.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

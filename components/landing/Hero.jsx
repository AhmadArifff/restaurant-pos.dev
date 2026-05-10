'use client';

import { useEffect, useRef } from 'react';
import { heroContent } from '@/data/landing/heroContent';

function animateCounter(el, target, suffix) {
  let current = 0;
  const step = target / 50;
  const timer = window.setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      window.clearInterval(timer);
    }
    el.textContent = `${Math.floor(current)}${suffix}`;
  }, 30);
}

export default function Hero() {
  const statsRef = useRef(null);

  useEffect(() => {
    const node = statsRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const nums = entry.target.querySelectorAll('.stat-num');
          if (nums[0]) animateCounter(nums[0], heroContent.stats[0].value, heroContent.stats[0].suffix);
          if (nums[1]) animateCounter(nums[1], heroContent.stats[1].value, heroContent.stats[1].suffix);
          if (nums[2]) nums[2].textContent = heroContent.stats[2].text;
          observer.disconnect();
        });
      },
      { threshold: 0.5 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="hero">
      <div className="hero-bg" style={{ backgroundImage: `url('${heroContent.backgroundImage}')` }} />
      <div className="hero-overlay" />
      <div className="hero-content">
        <div className="hero-badge">{heroContent.badge}</div>
        <h1 className="hero-title">
          <span className="italic">{heroContent.titleTop}</span>
          <span className="accent">{heroContent.titleAccent}</span>
          {heroContent.titleBottom}
        </h1>
        <p className="hero-sub">{heroContent.subtitle}</p>
        <div className="hero-btns">
          <a href={heroContent.ctaPrimary.href} className="btn-primary">{heroContent.ctaPrimary.label}</a>
          <a href={heroContent.ctaSecondary.href} className="btn-outline">{heroContent.ctaSecondary.label}</a>
        </div>
      </div>
      <div className="hero-stats" ref={statsRef}>
        {heroContent.stats.map((stat, idx) => (
          <div className="stat-item" key={`${stat.label}-${idx}`}>
            <span className="stat-num">{stat.text ?? `${stat.value}${stat.suffix}`}</span>
            <span className="stat-label">{stat.label}</span>
          </div>
        ))}
      </div>
      <div className="scroll-indicator" onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}>
        <div className="scroll-line" />
      </div>
    </section>
  );
}

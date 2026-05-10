'use client';

import { useState, useEffect } from 'react';

export default function FloatButton() {
  const [showFloat, setShowFloat] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowFloat(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* WhatsApp Float Button */}
      <a
        href="https://wa.me/6281234567890?text=Halo,%20saya%20ingin%20memesan%20kebab!"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-40 w-14 h-14 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-2xl hover:scale-110 transition-all duration-300 animate-pulse"
        title="Chat via WhatsApp"
      >
        <span className="text-2xl">💬</span>
      </a>

      {/* Scroll to Top Button */}
      {showFloat && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-8 z-40 w-14 h-14 bg-[var(--gold)] text-[var(--dark)] rounded-full flex items-center justify-center shadow-lg hover:shadow-2xl hover:scale-110 transition-all duration-300 font-bold text-xl"
          title="Scroll to top"
        >
          ↑
        </button>
      )}
    </>
  );
}

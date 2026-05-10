'use client';

import { useState } from 'react';
import { menuContent } from '@/data/landing/menuContent';

export default function MenuTabs() {
  const [activeCategory, setActiveCategory] = useState('kebab');

  const currentCategory = menuContent.categories.find(
    (cat) => cat.id === activeCategory
  );

  return (
    <section id="menu" className="py-16 md:py-24 px-6 md:px-12 bg-[var(--dark2)]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-[var(--gold)] text-sm uppercase tracking-widest font-semibold">
            Katalog
          </span>
          <h2 className="font-[var(--font-display)] text-4xl md:text-5xl font-bold text-[var(--cream)] mt-4 mb-4">
            {menuContent.title}
          </h2>
          <p className="text-[var(--cream2)] text-lg">
            {menuContent.description}
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-12">
          {menuContent.categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 md:px-6 py-2 md:py-3 rounded font-semibold transition-all duration-300 ${
                activeCategory === category.id
                  ? 'bg-[var(--gold)] text-[var(--dark)]'
                  : 'bg-[var(--dark)] text-[var(--cream)] border border-[var(--gold)] hover:bg-[rgba(201,168,76,0.1)]'
              }`}
            >
              <span className="text-lg md:text-xl mr-2">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        {/* Menu Items Grid */}
        {currentCategory && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentCategory.items.map((item) => (
              <div
                key={item.id}
                className="bg-[var(--dark)] rounded-lg p-6 hover:shadow-2xl transition-all duration-300 hover:border-[var(--gold)] border border-transparent"
              >
                {/* Image */}
                <div className="relative h-48 mb-4 rounded overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                  {item.badge && (
                    <div className="absolute top-2 right-2 bg-[var(--red)] text-[var(--cream)] px-2 py-1 rounded text-xs font-semibold">
                      {item.badge}
                    </div>
                  )}
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-[var(--cream)] mb-2">
                  {item.name}
                </h3>

                {item.description && (
                  <p className="text-[var(--cream2)] text-sm mb-3 line-clamp-2">
                    {item.description}
                  </p>
                )}

                {/* Price and CTA */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--dark2)]">
                  <span className="text-lg font-bold text-[var(--gold)]">
                    {typeof item.price === 'string'
                      ? item.price
                      : `Rp ${item.price.toLocaleString('id-ID')}`}
                  </span>
                  <a
                    href="https://wa.me/6281234567890?text=Halo,%20saya%20ingin%20memesan!"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[var(--gold)] text-[var(--dark)] px-3 py-1 rounded text-sm font-semibold hover:bg-[var(--gold-light)] transition-colors"
                  >
                    Pesan
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

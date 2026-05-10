'use client';

import { useState } from 'react';
import { galleryContent } from '@/data/landing/galleryContent';

export default function Gallery() {
  const [expandedId, setExpandedId] = useState(null);

  return (
    <section className="py-16 md:py-24 px-6 md:px-12 bg-[var(--dark2)]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-[var(--gold)] text-sm uppercase tracking-widest font-semibold">
            Visual
          </span>
          <h2 className="font-[var(--font-display)] text-4xl md:text-5xl font-bold text-[var(--cream)] mt-4 mb-4">
            {galleryContent.title}
          </h2>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 auto-rows-72">
          {galleryContent.images.map((image, idx) => (
            <div
              key={image.id}
              className={`relative overflow-hidden rounded-lg cursor-pointer group ${
                expandedId === image.id ? 'md:col-span-2 md:row-span-2' : ''
              }`}
              onClick={() =>
                setExpandedId(expandedId === image.id ? null : image.id)
              }
            >
              <img
                src={image.image}
                alt={image.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                <span className="text-[var(--gold)] font-semibold text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {image.title}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

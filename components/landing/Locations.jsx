'use client';

import { useState } from 'react';
import { locationsContent } from '@/data/landing/locationsContent';

export default function Locations() {
  const [activeLocation, setActiveLocation] = useState('bandung');

  const currentLocation = locationsContent.branches.find(
    (loc) => loc.id === activeLocation
  );

  return (
    <section id="locations" className="py-16 md:py-24 px-6 md:px-12 bg-[var(--dark)]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-[var(--gold)] text-sm uppercase tracking-widest font-semibold">
            Lokasi
          </span>
          <h2 className="font-[var(--font-display)] text-4xl md:text-5xl font-bold text-[var(--cream)] mt-4 mb-4">
            {locationsContent.title}
          </h2>
          <p className="text-[var(--cream2)] text-lg">
            {locationsContent.description}
          </p>
        </div>

        {/* Location Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {locationsContent.branches.map((location) => (
            <button
              key={location.id}
              onClick={() => setActiveLocation(location.id)}
              className={`px-4 md:px-6 py-2 md:py-3 rounded font-semibold transition-all duration-300 ${
                activeLocation === location.id
                  ? 'bg-[var(--gold)] text-[var(--dark)]'
                  : 'bg-[var(--dark2)] text-[var(--cream)] border border-[var(--gold)] hover:bg-[rgba(201,168,76,0.1)]'
              }`}
            >
              📍 {location.name.split(' - ')[0]}
            </button>
          ))}
        </div>

        {/* Location Content */}
        {currentLocation && (
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Gallery */}
            <div className="grid grid-cols-2 gap-4">
              {currentLocation.gallery.map((image, idx) => (
                <img
                  key={idx}
                  src={image}
                  alt={`${currentLocation.name} - ${idx + 1}`}
                  className="w-full h-48 object-cover rounded-lg hover:shadow-2xl transition-shadow"
                />
              ))}
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <h3 className="font-[var(--font-display)] text-3xl font-bold text-[var(--cream)] mb-2">
                  {currentLocation.name}
                </h3>
                <div className="h-1 w-16 bg-[var(--gold)] rounded" />
              </div>

              <div className="space-y-4 text-[var(--cream2)]">
                <div>
                  <span className="text-[var(--gold)] font-semibold">📍 Alamat:</span>
                  <p className="mt-1">{currentLocation.address}</p>
                </div>

                <div>
                  <span className="text-[var(--gold)] font-semibold">📞 Telepon:</span>
                  <p className="mt-1">
                    <a
                      href={`tel:${currentLocation.phone}`}
                      className="hover:text-[var(--gold)] transition-colors"
                    >
                      {currentLocation.phone}
                    </a>
                  </p>
                </div>

                <div>
                  <span className="text-[var(--gold)] font-semibold">🕐 Jam Operasional:</span>
                  <p className="mt-1">{currentLocation.hours}</p>
                </div>

                <div>
                  <span className="text-[var(--gold)] font-semibold">✨ Fasilitas:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {currentLocation.features.map((feature, idx) => (
                      <span
                        key={idx}
                        className="bg-[var(--dark2)] px-3 py-1 rounded text-sm"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6">
                <a
                  href={currentLocation.maps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-[var(--gold)] text-[var(--dark)] px-4 py-3 rounded font-semibold text-center hover:bg-[var(--gold-light)] transition-colors"
                >
                  Buka Google Maps
                </a>
                <a
                  href={`https://wa.me/6281234567890?text=Halo,%20saya%20mau%20ke%20${currentLocation.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 border-2 border-[var(--gold)] text-[var(--gold)] px-4 py-3 rounded font-semibold text-center hover:bg-[rgba(201,168,76,0.1)] transition-colors"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

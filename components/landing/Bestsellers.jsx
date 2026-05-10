'use client';

import { bestsellersContent } from '@/data/landing/bestsellersContent';

export default function Bestsellers() {
  return (
    <section className="py-16 md:py-24 px-6 md:px-12 bg-[var(--dark)]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-[var(--gold)] text-sm uppercase tracking-widest font-semibold">
            Pilihan Kami
          </span>
          <h2 className="font-[var(--font-display)] text-4xl md:text-5xl font-bold text-[var(--cream)] mt-4 mb-4">
            {bestsellersContent.title}
          </h2>
          <p className="text-[var(--cream2)] text-lg">
            {bestsellersContent.description}
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {bestsellersContent.products.map((product) => (
            <div
              key={product.id}
              className="group bg-[var(--dark2)] rounded-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              {/* Image Container */}
              <div className="relative h-72 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {product.badge && (
                  <div className="absolute top-4 right-4 bg-[var(--red)] text-[var(--cream)] px-3 py-1 rounded text-xs font-semibold">
                    {product.badge}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-[var(--cream)] mb-2 group-hover:text-[var(--gold)] transition-colors">
                  {product.name}
                </h3>

                <p className="text-[var(--cream2)] text-sm mb-4 line-clamp-2">
                  {product.description}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[var(--gold)]">★</span>
                  <span className="text-[var(--cream)] font-semibold">{product.rating}</span>
                  <span className="text-[var(--text-muted)] text-sm">({product.reviews} ulasan)</span>
                </div>

                {/* Price and CTA */}
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-[var(--gold)]">
                    Rp {product.price.toLocaleString('id-ID')}
                  </span>
                  <button className="bg-[var(--gold)] text-[var(--dark)] px-4 py-2 rounded font-semibold hover:bg-[var(--gold-light)] transition-colors">
                    Pesan
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

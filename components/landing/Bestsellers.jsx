'use client';

import { bestsellersContent } from '@/data/landing/bestsellersContent';

function orderWA(item) {
  const msg = encodeURIComponent(
    `Halo Sultan Kebab! Saya ingin memesan ${item}. Mohon informasi ketersediaan dan cara pemesanan. Terima kasih!`,
  );
  window.open(`https://wa.me/6281234567890?text=${msg}`, '_blank');
}

export default function Bestsellers() {
  return (
    <section id="bestseller">
      <div className="bestseller-header reveal">
        <div className="section-label">{bestsellersContent.sectionLabel}</div>
        <h2 className="section-title">
          Menu <span className="italic gold">{bestsellersContent.highlight}</span>
        </h2>
        <p className="section-desc">{bestsellersContent.description}</p>
      </div>
      <div className="best-grid">
        {bestsellersContent.products.map((product, idx) => (
          <div className={`best-card reveal ${idx === 1 ? 'reveal-delay-1' : idx === 2 ? 'reveal-delay-2' : ''}`} key={product.id}>
            <div className="best-img-wrap">
              <img className="best-img" src={product.image} alt={product.name} />
            </div>
            <span className="best-badge">{product.badge}</span>
            <span className="best-num">{product.number}</span>
            <div className="best-body">
              <div className="best-name">{product.name}</div>
              <div className="best-desc">{product.description}</div>
              <div className="best-footer">
                <span className="best-price">{product.price}</span>
                <span className="best-rating">
                  <span className="stars">★★★★★</span> {product.ratingText}
                </span>
              </div>
            </div>
            <div className="best-overlay">
              <button className="best-overlay-btn" type="button" onClick={() => orderWA(product.orderName)}>
                Pesan Sekarang
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

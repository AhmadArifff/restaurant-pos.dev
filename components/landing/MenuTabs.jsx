'use client';

import { useMemo, useState } from 'react';
import { menuContent } from '@/data/landing/menuContent';

function orderWA(item) {
  const msg = encodeURIComponent(
    `Halo Sultan Kebab! Saya ingin memesan ${item}. Mohon informasi ketersediaan dan cara pemesanan. Terima kasih!`,
  );
  window.open(`https://wa.me/6281234567890?text=${msg}`, '_blank');
}

export default function MenuTabs() {
  const [activeCategory, setActiveCategory] = useState(menuContent.categories[0].id);

  const currentCategory = useMemo(
    () => menuContent.categories.find((category) => category.id === activeCategory),
    [activeCategory],
  );

  return (
    <section id="menu">
      <div className="reveal" style={{ maxWidth: '1200px', margin: '0 auto 2rem' }}>
        <div className="section-label">{menuContent.sectionLabel}</div>
        <h2 className="section-title">
          Menu <span className="italic gold">{menuContent.highlight}</span>
        </h2>
        <p className="section-desc">{menuContent.description}</p>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="menu-tabs">
          {menuContent.categories.map((category) => (
            <button
              key={category.id}
              type="button"
              className={`menu-tab ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.label}
            </button>
          ))}
        </div>

        {currentCategory && (
          <div className="menu-panel active" id={`panel-${currentCategory.id}`}>
            {currentCategory.items.map((item) => (
              <div className="menu-item" key={item.id} onClick={() => orderWA(item.orderName)}>
                <img className="menu-item-img" src={item.image} alt={item.name} />
                <div className="menu-item-info">
                  {item.tag ? (
                    <div>
                      <span className={`menu-item-tag ${item.tagClass}`}>{item.tag}</span>
                    </div>
                  ) : null}
                  <div className="menu-item-name">{item.name}</div>
                  <div className="menu-item-desc">{item.description}</div>
                  <div className="menu-item-price">{item.price}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

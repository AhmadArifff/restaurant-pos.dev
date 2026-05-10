'use client';

import { useState } from 'react';
import { locationsContent } from '@/data/landing/locationsContent';

const mapPinIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
);

export default function Locations() {
  const [activeBranchId, setActiveBranchId] = useState(locationsContent.branches[0].id);

  return (
    <section id="locations">
      <div className="loc-header reveal">
        <div className="section-label">{locationsContent.sectionLabel}</div>
        <h2 className="section-title">
          Temukan <span className="italic gold">{locationsContent.highlight}</span>
          <br />
          {locationsContent.subtitle}
        </h2>
        <p className="section-desc">{locationsContent.description}</p>
      </div>

      <div className="loc-tabs reveal">
        {locationsContent.branches.map((branch) => (
          <button
            key={branch.id}
            type="button"
            className={`loc-tab ${activeBranchId === branch.id ? 'active' : ''}`}
            onClick={() => setActiveBranchId(branch.id)}
          >
            {branch.tabLabel}
          </button>
        ))}
      </div>

      {locationsContent.branches.map((branch) => (
        <div key={branch.id} className={`loc-panel ${activeBranchId === branch.id ? 'active' : ''}`} id={`loc-${branch.id}`}>
          <div className="loc-gallery reveal">
            {branch.gallery.map((image, index) => (
              <img key={`${branch.id}-${index}`} src={image} alt={`${branch.name} ${index + 1}`} />
            ))}
          </div>

          <div className="loc-info reveal reveal-delay-1">
            <div className="section-label">{branch.sectionTag}</div>
            <h3>{branch.name}</h3>
            <div className="loc-area">{branch.area}</div>

            {branch.details.map((detail, index) => (
              <div className="loc-detail" key={`${branch.id}-detail-${index}`}>
                <span className="loc-detail-icon">{detail.icon}</span>
                <span className="loc-detail-text">
                  {detail.lines ? detail.lines.map((line, lineIndex) => <span key={`${branch.id}-${index}-${lineIndex}`}>{line}<br /></span>) : detail.text}
                </span>
              </div>
            ))}

            <iframe
              className="loc-map-embed"
              src={branch.mapEmbed}
              allowFullScreen
              loading="lazy"
              title={`Peta ${branch.name}`}
            />
            <a href={branch.mapUrl} target="_blank" rel="noreferrer" className="loc-map-btn">
              {mapPinIcon}
              Buka di Google Maps
            </a>
          </div>
        </div>
      ))}
    </section>
  );
}

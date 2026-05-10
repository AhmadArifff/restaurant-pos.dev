import { aboutContent } from '@/data/landing/aboutContent';

export default function About() {
  return (
    <section id="about">
      <div className="about-grid">
        <div className="about-img-wrap reveal">
          <img className="about-img-main" src={aboutContent.mainImage} alt="Interior Sultan Kebab" />
          <img className="about-img-accent" src={aboutContent.accentImage} alt="Kebab Premium" />
          <div className="about-badge">
            <span>{aboutContent.badgeTop}</span>
            <small>{aboutContent.badgeBottom}</small>
          </div>
        </div>
        <div className="reveal reveal-delay-1">
          <div className="section-label">{aboutContent.sectionLabel}</div>
          <h2 className="section-title">
            Warisan Rasa <span className="italic gold">{aboutContent.highlight}</span> Timur Tengah
          </h2>
          <p className="section-desc">{aboutContent.description}</p>
          <div className="about-features">
            {aboutContent.features.map((feature) => (
              <div className="about-feat" key={feature.title}>
                <span className="feat-icon">{feature.icon}</span>
                <div>
                  <div className="feat-title">{feature.title}</div>
                  <div className="feat-desc">{feature.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

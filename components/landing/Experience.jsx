import { experienceContent } from '@/data/landing/experienceContent';

export default function Experience() {
  return (
    <section id="experience">
      <div className="reveal">
        <div className="section-label" style={{ justifyContent: 'center' }}>
          {experienceContent.sectionLabel}
        </div>
        <h2 className="section-title" style={{ textAlign: 'center' }}>
          Pengalaman <span className="italic gold">{experienceContent.highlight}</span>
          <br />
          {experienceContent.subtitle}
        </h2>
      </div>
      <div className="exp-grid reveal">
        {experienceContent.features.map((feature) => (
          <div className="exp-item" key={feature.title}>
            <span className="exp-icon">{feature.icon}</span>
            <div className="exp-title">{feature.title}</div>
            <div className="exp-desc">{feature.description}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

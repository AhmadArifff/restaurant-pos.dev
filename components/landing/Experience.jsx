import { experienceContent } from '@/data/landing/experienceContent';

export default function Experience({ content = experienceContent }) {
  const data = content || experienceContent;
  return (
    <section id="experience">
      <div className="reveal">
        <div className="section-label" style={{ justifyContent: 'center' }}>
          {data.sectionLabel}
        </div>
        <h2 className="section-title" style={{ textAlign: 'center' }}>
          Pengalaman <span className="italic gold">{data.highlight}</span>
          <br />
          {data.subtitle}
        </h2>
      </div>
      <div className="exp-grid reveal">
        {(data.features || []).map((feature) => (
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

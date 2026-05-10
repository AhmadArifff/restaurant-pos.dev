import { footerContent } from '@/data/landing/footerContent';

export default function Footer() {
  return (
    <footer>
      <div className="footer-grid">
        <div className="footer-brand">
          <span className="footer-logo">{footerContent.brand}</span>
          <p className="footer-brand-desc">{footerContent.brandDescription}</p>
          <div className="social-links">
            {footerContent.socialLinks.map((social) => (
              <a key={social.label} className="social-link" href={social.href} aria-label={social.label}>
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        {footerContent.columns.map((column) => (
          <div className="footer-col" key={column.title}>
            <h4>{column.title}</h4>
            <ul>
              {column.links.map((link) => (
                <li key={link.label}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="footer-bottom">
        <p>
          © 2024 <span>Sultan Kebab</span>. All rights reserved. | Dibuat dengan ❤️ untuk pecinta kebab Indonesia
        </p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', opacity: 0.6 }}>{footerContent.note}</p>
      </div>
    </footer>
  );
}

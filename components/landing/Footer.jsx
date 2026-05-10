'use client';

import { footerContent } from '@/data/landing/footerContent';

export default function Footer() {
  return (
    <footer className="bg-[var(--dark)] border-t border-[rgba(201,168,76,0.2)] py-12 md:py-16 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Main Content */}
        <div className="grid md:grid-cols-5 gap-8 md:gap-12 mb-12">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <h3 className="font-[var(--font-brand)] text-2xl text-[var(--gold)] mb-4 tracking-widest">
              {footerContent.brand}
            </h3>
            <p className="text-[var(--cream2)] text-sm leading-relaxed mb-6">
              {footerContent.brandDescription}
            </p>

            {/* Social Links */}
            <div className="flex gap-4">
              {footerContent.socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center bg-[var(--dark2)] rounded-full text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--dark)] transition-all duration-300"
                  title={social.label}
                >
                  {social.icon === 'f' && '𝓕'}
                  {social.icon === 'ig' && '📷'}
                  {social.icon === 'tw' && '𝕏'}
                  {social.icon === 'yt' && '▶'}
                  {social.icon === 'tiktok' && '♪'}
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          {footerContent.sections.map((section) => (
            <div key={section.title}>
              <h4 className="text-[var(--cream)] font-semibold mb-4 uppercase tracking-widest text-sm">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-[var(--cream2)] hover:text-[var(--gold)] transition-colors duration-300 text-sm"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-[rgba(201,168,76,0.2)] py-8" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[var(--cream2)]">
          <p>{footerContent.copyright}</p>

          {/* Footer Links */}
          <div className="flex flex-wrap justify-center gap-6">
            {footerContent.links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="hover:text-[var(--gold)] transition-colors duration-300"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

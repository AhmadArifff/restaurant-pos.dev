import { ctaContent } from '@/data/landing/ctaContent';

export default function FloatButton() {
  return (
    <a
      href={ctaContent.whatsappUrl}
      className="float-btn"
      target="_blank"
      rel="noreferrer"
      aria-label="Pesan via WhatsApp"
    >
      💬
    </a>
  );
}

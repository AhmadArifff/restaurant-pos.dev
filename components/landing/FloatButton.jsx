import { ctaContent } from '@/data/landing/ctaContent';

export default function FloatButton({ content = { whatsappUrl: ctaContent.whatsappUrl }, previewMode = false }) {
  const data = content || { whatsappUrl: ctaContent.whatsappUrl };

  return (
    <a
      href={data.whatsappUrl}
      className="float-btn"
      target="_blank"
      rel="noreferrer"
      aria-label={data.ariaLabel || 'Pesan via WhatsApp'}
      onClick={(e) => {
        if (previewMode) e.preventDefault();
      }}
    >
      {data.icon || '💬'}
    </a>
  );
}

import { galleryContent } from '@/data/landing/galleryContent';

export default function Gallery({ content = galleryContent }) {
  const data = content || galleryContent;
  return (
    <div className="gallery-strip">
      {(data.images || []).map((image) => (
        <img key={image.id} src={image.image} alt={image.alt} />
      ))}
    </div>
  );
}

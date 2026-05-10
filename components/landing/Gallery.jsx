import { galleryContent } from '@/data/landing/galleryContent';

export default function Gallery() {
  return (
    <div className="gallery-strip">
      {galleryContent.images.map((image) => (
        <img key={image.id} src={image.image} alt={image.alt} />
      ))}
    </div>
  );
}

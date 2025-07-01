import React, { useRef, useEffect, useState } from 'react';
import PhotoSphereViewer from 'photo-sphere-viewer';
import 'photo-sphere-viewer/dist/photo-sphere-viewer.css';

const demoImages = [
  // صور بانوراما 360 حقيقية من المستودع المحلي
  '/images/palace.jpg',
  '/images/villa.jpg',
  '/images/apartment.jpg',
  '/images/clinic.jpg',
  '/images/office.jpg',
  '/images/shop.jpg',
  // صور بانوراما 360 مجانية من الإنترنت
  'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&w=1200&q=80',
  'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=1200&q=80',
  'https://images.pexels.com/photos/261146/pexels-photo-261146.jpeg?auto=compress&w=1200&q=80',
  'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80',
  'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&w=1200&q=80',
  'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80',
  'https://images.pexels.com/photos/380768/pexels-photo-380768.jpeg?auto=compress&w=1200&q=80',
  'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&w=1200&q=80',
  'https://images.pexels.com/photos/236380/pexels-photo-236380.jpeg?auto=compress&w=1200&q=80',
];

interface VR360GalleryProps {
  singleImage?: string;
}

const VR360Gallery: React.FC<VR360GalleryProps> = ({ singleImage }) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentImg, setCurrentImg] = useState<string>(singleImage || demoImages[0]);
  const [viewer, setViewer] = useState<any>(null);

  useEffect(() => {
    if (viewer) viewer.destroy();
    if (viewerRef.current && currentImg) {
      try {
        const v = new PhotoSphereViewer.Viewer({
          container: viewerRef.current,
          panorama: currentImg,
          loadingImg: '',
          defaultLong: 0,
          defaultLat: 0,
        });
        setViewer(v);
        setError(null);
      } catch (e: any) {
        setError('حدث خطأ أثناء تحميل الصورة.');
      }
    }
    return () => {
      if (viewer) viewer.destroy();
    };
    // eslint-disable-next-line
  }, [currentImg, singleImage]);

  useEffect(() => {
    if (singleImage) setCurrentImg(singleImage);
  }, [singleImage]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCurrentImg(url);
    }
  };

  return (
    <div style={{ margin: '32px 0', background: '#e0eafc', borderRadius: 16, padding: 16 }}>
      <h2>تجربة صور بانوراما 360°</h2>
      {!singleImage && (
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          {demoImages.map((img, i) => (
            <button key={i} onClick={() => setCurrentImg(img)} style={{ border: currentImg === img ? '2px solid #2196f3' : '1px solid #ccc', borderRadius: 8 }}>
              <img src={img} alt={`demo${i}`} style={{ width: 80, height: 40, objectFit: 'cover', borderRadius: 8 }} />
            </button>
          ))}
          <label style={{ cursor: 'pointer', border: '1px dashed #888', borderRadius: 8, padding: '0 12px', display: 'flex', alignItems: 'center' }}>
            + رفع صورة
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
          </label>
        </div>
      )}
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      <div ref={viewerRef} style={{ width: '100%', minHeight: 400, borderRadius: 12, background: '#222', display:'flex',alignItems:'center',justifyContent:'center' }} />
      <p style={{ marginTop: 12, color: '#555', fontSize: 14 }}>
        يمكنك تجربة صور بانوراما 360 من المعرض أو رفع صورة خاصة بك. يدعم العارض التفاعل الكامل والتجول داخل الصورة.
      </p>
    </div>
  );
};

export default VR360Gallery;

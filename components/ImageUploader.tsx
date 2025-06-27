import React, { useRef } from 'react';

interface ImageUploaderProps {
  images: string[];
  onAdd: (files: File[]) => void;
  onRemove: (idx: number) => void;
  multiple?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ images, onAdd, onRemove, multiple = true }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onAdd(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={e => e.preventDefault()}
      style={{
        border: '2px dashed #00bcd4',
        borderRadius: 10,
        padding: 16,
        minHeight: 80,
        background: '#f9f9f9',
        cursor: 'pointer',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginBottom: 8,
      }}
      title="اسحب الصور هنا أو اضغط للرفع"
    >
      {images.map((img, i) => (
        <div key={i} style={{ position: 'relative', display: 'inline-block' }}>
          <img src={img} alt="img" style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover', border: '2px solid #00bcd4' }} />
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onRemove(i); }}
            style={{ position: 'absolute', top: -8, right: -8, background: '#f44336', color: '#fff', border: 'none', borderRadius: '50%', width: 22, height: 22, fontWeight: 'bold', cursor: 'pointer', fontSize: 14 }}
            title="حذف الصورة"
          >×</button>
        </div>
      ))}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        style={{ display: 'none' }}
        onChange={e => {
          if (e.target.files) onAdd(Array.from(e.target.files));
        }}
      />
      <span style={{ color: '#888', fontSize: 15, marginRight: 8 }}>اسحب الصور هنا أو اضغط للرفع</span>
    </div>
  );
};

export default ImageUploader;


import React, { useRef, useState } from 'react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
// تأكد من تثبيت uuid: npm install uuid

interface ImageUploaderProps {
  images: string[]; // الصور المحفوظة (روابط)
  onAdd: (urls: string[]) => void;
  onRemove: (idx: number) => void;
  multiple?: boolean;
}

interface TempImage {
  file: File;
  url: string;
  progress: number;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ images, onAdd, onRemove, multiple = true }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [tempImages, setTempImages] = useState<TempImage[]>([]);
  const [uploading, setUploading] = useState(false);

  // رفع فعلي مع progress
  const realUpload = async (files: File[]) => {
    setUploading(true);
    const storage = getStorage();
    const uploadedUrls: string[] = [];
    for (const file of files) {
      const id = uuidv4();
      const storageRef = ref(storage, `uploads/${id}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      let tempImg = { file, url: URL.createObjectURL(file), progress: 0 };
      setTempImages((prev: TempImage[]) => [...prev, tempImg]);
      await new Promise<void>((resolve, reject) => {
        uploadTask.on('state_changed',
          (snapshot) => {
            const prog = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setTempImages((prev: TempImage[]) => prev.map((ti: TempImage) => ti.file === file ? { ...ti, progress: prog } : ti));
          },
          (error) => {
            setTempImages((prev: TempImage[]) => prev.filter((ti: TempImage) => ti.file !== file));
            reject(error);
          },
          async () => {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            uploadedUrls.push(url);
            setTempImages((prev: TempImage[]) => prev.filter((ti: TempImage) => ti.file !== file));
            resolve();
          }
        );
      });
    }
    setUploading(false);
    if (uploadedUrls.length > 0) onAdd(uploadedUrls);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      realUpload(Array.from(e.dataTransfer.files));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      realUpload(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const handleRemoveTemp = (idx: number) => {
    setTempImages((prev: TempImage[]) => prev.filter((_, i: number) => i !== idx));
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={e => e.preventDefault()}
      style={{
        border: '2.5px solid #00bcd4',
        borderRadius: 18,
        padding: 18,
        minHeight: 90,
        background: 'rgba(255,255,255,0.85)',
        boxShadow: '0 4px 24px 0 rgba(0,188,212,0.08)',
        cursor: 'pointer',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginBottom: 10,
        position: 'relative',
        transition: 'box-shadow 0.2s, border 0.2s',
        backdropFilter: 'blur(8px)',
      }}
      title="اسحب الصور هنا أو اختر من جهازك أو التقط صورة بالكاميرا"
      onMouseOver={e => (e.currentTarget.style.boxShadow = '0 6px 32px 0 #00bcd455')}
      onMouseOut={e => (e.currentTarget.style.boxShadow = '0 4px 24px 0 rgba(0,188,212,0.08)')}
    >
      {/* الصور المحفوظة */}
      {images.map((img, i) => (
        <div key={i} style={{ position: 'relative', display: 'inline-block' }}>
          <img src={img} alt="img" style={{ width: 62, height: 62, borderRadius: 12, objectFit: 'cover', border: '2.5px solid #00bcd4', boxShadow: '0 2px 8px #00bcd433', background:'#fff' }} />
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onRemove(i); }}
            style={{ position: 'absolute', top: -10, right: -10, background: '#f44336', color: '#fff', border: 'none', borderRadius: '50%', width: 26, height: 26, fontWeight: 'bold', cursor: 'pointer', fontSize: 16, boxShadow:'0 2px 8px #f4433622' }}
            title="حذف الصورة"
          >×</button>
        </div>
      ))}
      {/* الصور المؤقتة (قبل الحفظ) */}
      {tempImages.map((img: TempImage, i: number) => (
        <div key={i} style={{ position: 'relative', display: 'inline-block', opacity: img.progress < 100 ? 0.7 : 1 }}>
          <img src={img.url} alt="preview" style={{ width: 62, height: 62, borderRadius: 12, objectFit: 'cover', border: '2.5px dashed #00bcd4', background:'#fff' }} />
          {img.progress < 100 && (
            <div style={{ position: 'absolute', top: 0, left: 0, width: 62, height: 62, background: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, color: '#00bcd4', borderRadius: 12, fontWeight:'bold' }}>
              {Math.round(img.progress)}%
            </div>
          )}
          <button
            type="button"
            onClick={e => { e.stopPropagation(); handleRemoveTemp(i); }}
            style={{ position: 'absolute', top: -10, right: -10, background: '#f44336', color: '#fff', border: 'none', borderRadius: '50%', width: 26, height: 26, fontWeight: 'bold', cursor: 'pointer', fontSize: 16, boxShadow:'0 2px 8px #f4433622' }}
            title="حذف الصورة"
            disabled={img.progress < 100}
          >×</button>
        </div>
      ))}
      {/* زر اختيار الصور من الجهاز أو الكاميرا */}
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: uploading ? 'not-allowed' : 'pointer', marginRight: 10 }}>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          capture="environment"
          style={{ display: 'none' }}
          onChange={handleInputChange}
          disabled={uploading}
        />
        <span style={{ color: uploading ? '#aaa' : '#00bcd4', fontSize: 16, minWidth: 120, fontWeight:'bold', letterSpacing:1 }}>
          {uploading ? 'جاري رفع الصور...' : 'اختر من جهازك أو التقط صورة بالكاميرا'}
        </span>
        <button
          type="button"
          style={{
            background: '#00bcd4',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '8px 16px',
            fontWeight: 'bold',
            fontSize: 15,
            cursor: uploading ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 8px #00bcd433',
            transition: 'background 0.2s',
          }}
          onClick={e => {
            e.stopPropagation();
            if (!uploading) inputRef.current?.click();
          }}
          disabled={uploading}
        >
          اختر صورة
        </button>
      </label>
    </div>
  );
};

export default ImageUploader;

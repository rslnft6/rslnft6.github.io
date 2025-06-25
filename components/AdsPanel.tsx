import React, { useEffect, useState } from 'react';
import { db } from '../data/firebase';
import { doc as fsDoc, getDoc, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const AdsPanel: React.FC = () => {
  const [images, setImages] = useState<{url:string, link?:string, title?:string}[]>([]);
  const [loading, setLoading] = useState(false);

  // --- الشريط الكتابي المتحرك ---
  const [marquee, setMarquee] = useState({ texts: ["فرحنا بوجودك معنا!"], speed: 30, color: "#ff9800", fontSize: 20, lang: 'ar' });
  const [marqueeLoading, setMarqueeLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchSlider = async () => {
      setLoading(true);
      try {
        const ref = fsDoc(db, 'settings', 'slider');
        const snap = await getDoc(ref);
        if (snap.exists()) setImages(snap.data().images || []);
      } catch (err) { setErrorMsg('خطأ في جلب الصور'); }
      setLoading(false);
    };
    fetchSlider();
  }, []);

  useEffect(() => {
    // جلب إعدادات الشريط المتحرك
    const fetchMarquee = async () => {
      setMarqueeLoading(true);
      try {
        const ref = fsDoc(db, 'settings', 'marquee');
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const d = snap.data();
          setMarquee({
            texts: d.texts || ["فرحنا بوجودك معنا!"],
            speed: d.speed || 30,
            color: d.color || "#ff9800",
            fontSize: d.fontSize || 20,
            lang: d.lang || 'ar'
          });
        }
      } catch { setErrorMsg('خطأ في جلب الشريط الكتابي'); }
      setMarqueeLoading(false);
    };
    fetchMarquee();
  }, []);

  // إضافة صورة مع تفاصيل
  const [newImage, setNewImage] = useState<File|null>(null);
  const [newLink, setNewLink] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImage) return;
    setLoading(true);
    setErrorMsg(''); setSuccessMsg('');
    try {
      const storage = getStorage();
      const imgRef = ref(storage, `slider/${Date.now()}_${newImage.name}`);
      await uploadBytes(imgRef, newImage);
      const url = await getDownloadURL(imgRef);
      const allImages = [...images, { url, link: newLink, title: newTitle }];
      const refDoc = fsDoc(db, 'settings', 'slider');
      await setDoc(refDoc, { images: allImages });
      setImages(allImages);
      setNewImage(null);
      setNewLink('');
      setNewTitle('');
      setSuccessMsg('تمت إضافة الصورة بنجاح');
    } catch { setErrorMsg('حدث خطأ أثناء رفع الصورة'); }
    setLoading(false);
  };

  // تعديل عنوان أو رابط صورة
  const handleEditImage = async (idx: number, key: 'title'|'link', value: string) => {
    const newArr = images.slice();
    newArr[idx] = { ...newArr[idx], [key]: value };
    setImages(newArr);
    try {
      const refDoc = fsDoc(db, 'settings', 'slider');
      await setDoc(refDoc, { images: newArr });
      setSuccessMsg('تم التحديث بنجاح');
    } catch { setErrorMsg('خطأ في تحديث البيانات'); }
  };

  // حذف صورة من السلايدر والتخزين
  const handleDelete = async (idx: number) => {
    if (!window.confirm('تأكيد حذف الصورة؟')) return;
    setLoading(true);
    setErrorMsg(''); setSuccessMsg('');
    try {
      const img = images[idx];
      // حذف من التخزين إذا كان الرابط من firebase
      if (img.url && img.url.includes('firebasestorage')) {
        try {
          const storage = getStorage();
          const url = new URL(img.url);
          const path = decodeURIComponent(url.pathname.split('/o/')[1].split('?')[0]);
          await deleteObject(ref(storage, path));
        } catch {}
      }
      const newArr = images.slice();
      newArr.splice(idx, 1);
      const refDoc = fsDoc(db, 'settings', 'slider');
      await setDoc(refDoc, { images: newArr });
      setImages(newArr);
      setSuccessMsg('تم حذف الصورة بنجاح');
    } catch { setErrorMsg('حدث خطأ أثناء الحذف'); }
    setLoading(false);
  };

  const handleSaveMarquee = async (e: React.FormEvent) => {
    e.preventDefault();
    setMarqueeLoading(true);
    setErrorMsg(''); setSuccessMsg('');
    try {
      const ref = fsDoc(db, 'settings', 'marquee');
      await setDoc(ref, marquee);
      setSuccessMsg('تم حفظ الشريط الكتابي بنجاح');
    } catch { setErrorMsg('حدث خطأ أثناء الحفظ'); }
    setMarqueeLoading(false);
  };

  return (
    <div className="glass-table" style={{maxWidth:700,margin:'0 auto'}}>
      <h2 style={{color:'#00bcd4',fontWeight:'bold'}}>إدارة الإعلانات (السلايدر)</h2>
      {successMsg && <div style={{color:'#388e3c',fontWeight:'bold',marginBottom:8}}>{successMsg}</div>}
      {errorMsg && <div style={{color:'#e53935',fontWeight:'bold',marginBottom:8}}>{errorMsg}</div>}
      {/* إدارة الشريط الكتابي المتحرك */}
      <form className="glass-form" onSubmit={handleSaveMarquee} style={{marginBottom:24,background:'rgba(255,255,255,0.18)',borderRadius:16,padding:16}}>
        <h3 style={{color:'#ff9800',fontWeight:'bold'}}>الشريط الكتابي المتحرك</h3>
        <textarea required rows={2} value={marquee.texts.join('\n')} onChange={e=>setMarquee(m=>({...m,texts:e.target.value.split('\n')}))} placeholder="اكتب النصوص (كل سطر نص منفصل)" style={{width:'100%',borderRadius:8,padding:8,marginBottom:8}} />
        <div style={{display:'flex',gap:12,alignItems:'center',marginBottom:8}}>
          <label>اللون:</label>
          <input type="color" value={marquee.color} onChange={e=>setMarquee(m=>({...m,color:e.target.value}))} />
          <label>حجم الخط:</label>
          <input type="number" min={12} max={60} value={marquee.fontSize} onChange={e=>setMarquee(m=>({...m,fontSize:Number(e.target.value)}))} style={{width:60}} />
          <label>اللغة:</label>
          <select value={marquee.lang} onChange={e=>setMarquee(m=>({...m,lang:e.target.value}))}>
            <option value="ar">العربية</option>
            <option value="en">English</option>
          </select>
        </div>
        <button className="glass-btn" type="submit" disabled={marqueeLoading}>حفظ الشريط الكتابي</button>
        {marqueeLoading && <span style={{marginRight:12}}>جاري الحفظ...</span>}
      </form>
      {/* إدارة صور السلايدر مع تفاصيل وتعديل مباشر */}
      <form className="glass-form" onSubmit={handleAddImage} style={{marginBottom:24}}>
        <input type="file" accept="image/*" onChange={e=>setNewImage(e.target.files?.[0]||null)} />
        <input type="text" placeholder="رابط الإعلان أو صفحة التفاصيل (اختياري)" value={newLink} onChange={e=>setNewLink(e.target.value)} style={{margin:'8px 0'}} />
        <input type="text" placeholder="عنوان الإعلان (اختياري)" value={newTitle} onChange={e=>setNewTitle(e.target.value)} style={{margin:'8px 0'}} />
        <button className="glass-btn" type="submit" disabled={loading || !newImage}>إضافة صورة إعلان</button>
      </form>
      {loading && <div>جاري التحميل...</div>}
      <div style={{display:'flex',flexWrap:'wrap',gap:16}}>
        {images && images.length > 0 ? images.map((img,i)=>(
          <div key={i} style={{position:'relative',background:'#fff',borderRadius:12,padding:8,boxShadow:'0 2px 8px #00bcd422'}}>
            <img src={img.url} alt={img.title||'slider'} style={{width:160,height:90,objectFit:'cover',borderRadius:8,boxShadow:'0 2px 8px #00bcd422',cursor:'pointer'}} />
            <input type="text" value={img.title||''} placeholder="عنوان الإعلان" onChange={e=>handleEditImage(i,'title',e.target.value)} style={{width:'100%',margin:'4px 0',fontSize:13,borderRadius:6,padding:'2px 6px',border:'1px solid #eee'}} />
            <input type="text" value={img.link||''} placeholder="رابط الإعلان" onChange={e=>handleEditImage(i,'link',e.target.value)} style={{width:'100%',margin:'4px 0',fontSize:13,borderRadius:6,padding:'2px 6px',border:'1px solid #eee'}} />
            <button className="glass-btn" style={{position:'absolute',top:6,right:6,background:'#e53935',color:'#fff',padding:'2px 10px',fontSize:13}} onClick={()=>handleDelete(i)} type="button">حذف</button>
          </div>
        )) : <div style={{color:'#888',fontSize:15}}>لا توجد صور حالياً.</div>}
      </div>
    </div>
  );
};

export default AdsPanel;

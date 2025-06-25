import React, { useEffect, useState } from 'react';
import { db } from '../data/firebase';
import { doc as fsDoc, getDoc, setDoc } from 'firebase/firestore';

interface Partner {
  name: string;
  url: string;
  image: string;
}

const PartnersPanel: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [form, setForm] = useState<Partner>({ name: '', url: '', image: '' });
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File|null>(null);

  useEffect(() => {
    const fetchPartners = async () => {
      setLoading(true);
      try {
        const ref = fsDoc(db, 'settings', 'partners');
        const snap = await getDoc(ref);
        if (snap.exists()) setPartners(snap.data().list || []);
      } catch {}
      setLoading(false);
    };
    fetchPartners();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let imageUrl = form.image;
    try {
      if (file) {
        const { getStorage, ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
        const storage = getStorage();
        const imgRef = ref(storage, `partners/${Date.now()}_${file.name}`);
        await uploadBytes(imgRef, file);
        imageUrl = await getDownloadURL(imgRef);
      }
      const newPartner = { ...form, image: imageUrl };
      const refDoc = fsDoc(db, 'settings', 'partners');
      const snap = await getDoc(refDoc);
      let list = snap.exists() ? (snap.data().list || []) : [];
      list.push(newPartner);
      await setDoc(refDoc, { list });
      setPartners(list);
      setForm({ name: '', url: '', image: '' });
      setFile(null);
    } catch {}
    setLoading(false);
  };

  const handleDelete = async (idx: number) => {
    if (!window.confirm('تأكيد حذف الشريك؟')) return;
    setLoading(true);
    try {
      const refDoc = fsDoc(db, 'settings', 'partners');
      const snap = await getDoc(refDoc);
      let list = snap.exists() ? (snap.data().list || []) : [];
      list.splice(idx, 1);
      await setDoc(refDoc, { list });
      setPartners(list);
    } catch {}
    setLoading(false);
  };

  return (
    <div className="glass-table" style={{maxWidth:800,margin:'0 auto'}}>
      <h2 style={{color:'#00bcd4',fontWeight:'bold'}}>شركاؤنا</h2>
      <form className="glass-form" onSubmit={handleAdd} style={{marginBottom:24}}>
        <input required placeholder="اسم الشريك" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} />
        <input placeholder="رابط الموقع/الشريك" value={form.url} onChange={e=>setForm(f=>({...f,url:e.target.value}))} />
        <input type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0]||null)} />
        <button className="glass-btn" type="submit" disabled={loading}>إضافة شريك</button>
      </form>
      <div style={{display:'flex',flexWrap:'wrap',gap:18}}>
        {partners.map((p,i)=>(
          <div key={i} style={{background:'#fff',borderRadius:16,padding:16,boxShadow:'0 2px 8px #00bcd422',minWidth:180,maxWidth:220,position:'relative'}}>
            <img src={p.image} alt={p.name} style={{width:80,height:80,objectFit:'cover',borderRadius:12,marginBottom:8}} />
            <div style={{fontWeight:'bold',color:'#00bcd4',fontSize:17}}>{p.name}</div>
            <a href={p.url} target="_blank" rel="noopener noreferrer" style={{color:'#2196f3',fontSize:15,wordBreak:'break-all'}}>{p.url}</a>
            <button className="glass-btn" style={{position:'absolute',top:8,right:8,background:'#e53935',color:'#fff',padding:'2px 10px',fontSize:13}} onClick={()=>handleDelete(i)}>حذف</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PartnersPanel;

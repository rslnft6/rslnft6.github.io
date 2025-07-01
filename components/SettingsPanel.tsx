import React, { useEffect, useState } from 'react';
import { db } from '../data/firebase';
import { doc as fsDoc, getDoc, setDoc } from 'firebase/firestore';

const SettingsPanel: React.FC = () => {
  const [marquee, setMarquee] = useState({ texts: ["فرحنا بوجودك معنا!"], speed: 30, color: "#ff9800", fontSize: 20 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMarquee = async () => {
      setLoading(true);
      try {
        const ref = fsDoc(db, 'settings', 'marquee');
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const d = snap.data();
          setMarquee({
            texts: d.texts || ["فرحنا بوجودك معنا!"],
            speed: d.speed || 30,
            color: d.color || "#ff9800",
            fontSize: d.fontSize || 20
          });
        }
      } catch {}
      setLoading(false);
    };
    fetchMarquee();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const ref = fsDoc(db, 'settings', 'marquee');
      await setDoc(ref, marquee);
    } catch {}
    setLoading(false);
  };

  return (
    <div className="glass-table" style={{maxWidth:700,margin:'0 auto'}}>
      <h2 style={{color:'#00bcd4',fontWeight:'bold'}}>إعدادات الشريط الكتابي (Marquee)</h2>
      <form className="glass-form" onSubmit={handleSave}>
        <textarea rows={3} value={marquee.texts.join('\n')} onChange={e=>setMarquee(m=>({...m,texts:e.target.value.split('\n')}))} placeholder="النصوص (كل سطر نص)" style={{width:'100%',fontSize:17}} />
        <input type="number" value={marquee.speed} onChange={e=>setMarquee(m=>({...m,speed:Number(e.target.value)}))} placeholder="السرعة (ثواني)" />
        <input type="color" value={marquee.color} onChange={e=>setMarquee(m=>({...m,color:e.target.value}))} />
        <input type="number" value={marquee.fontSize} onChange={e=>setMarquee(m=>({...m,fontSize:Number(e.target.value)}))} placeholder="حجم الخط" />
        <button className="glass-btn" type="submit" disabled={loading}>حفظ</button>
      </form>
    </div>
  );
};

export default SettingsPanel;

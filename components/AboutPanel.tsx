import React, { useEffect, useState } from 'react';
import { db } from '../data/firebase';
import { doc as fsDoc, getDoc, setDoc } from 'firebase/firestore';

const AboutPanel: React.FC = () => {
  const [aboutText, setAboutText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAbout = async () => {
      setLoading(true);
      try {
        const ref = fsDoc(db, 'settings', 'about');
        const snap = await getDoc(ref);
        if (snap.exists()) setAboutText(snap.data().text || '');
      } catch {}
      setLoading(false);
    };
    fetchAbout();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const ref = fsDoc(db, 'settings', 'about');
      await setDoc(ref, { text: aboutText });
    } catch {}
    setLoading(false);
  };

  return (
    <div className="glass-table" style={{maxWidth:700,margin:'0 auto'}}>
      <h2 style={{color:'#00bcd4',fontWeight:'bold'}}>من نحن</h2>
      <form className="glass-form" onSubmit={handleSave}>
        <textarea rows={6} value={aboutText} onChange={e=>setAboutText(e.target.value)} placeholder="اكتب نبذة عن الشركة..." style={{width:'100%',fontSize:18}} />
        <button className="glass-btn" type="submit" disabled={loading}>حفظ</button>
      </form>
    </div>
  );
};

export default AboutPanel;

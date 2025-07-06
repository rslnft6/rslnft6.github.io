import React, { useEffect, useState } from 'react';
import { db } from '../data/firebase';
import { doc as fsDoc, onSnapshot } from 'firebase/firestore';

const defaultMessages = [
  'مرحبًا بك في منصتنا العقارية!'
];

const MarqueeBar: React.FC = () => {
  const [marquee, setMarquee] = useState({ texts: defaultMessages, speed: 30, color: '#00bcd4', fontSize: 20 });
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // جلب حي من settings/marquee
    const ref = fsDoc(db, 'settings', 'marquee');
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setMarquee({
          texts: d.texts && d.texts.length > 0 ? d.texts : defaultMessages,
          speed: d.speed || 30,
          color: d.color || '#00bcd4',
          fontSize: d.fontSize || 20
        });
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(i => (i + 1) % (marquee.texts.length || 1));
    }, marquee.speed * 100);
    return () => clearInterval(interval);
  }, [marquee]);

  return (
    <div style={{
      width: '100vw',
      background: 'none',
      color: marquee.color,
      fontSize: marquee.fontSize,
      textAlign: 'center',
      padding: '8px 0',
      fontWeight: 'bold',
      fontFamily: 'Cairo, Tajawal, Arial',
      position: 'static',
      top: 'unset',
      left: 0,
      zIndex: 200,
      letterSpacing: 1,
      transition: 'all 0.3s',
      boxShadow: 'none',
      marginBottom: 0
    }}>
      <span>{marquee.texts[index]}</span>
    </div>
  );
};

export default MarqueeBar;

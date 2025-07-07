import React, { useEffect, useState, useRef } from 'react';
import { db } from '../data/firebase';
import { doc as fsDoc, onSnapshot } from 'firebase/firestore';

const defaultMessages = [
  'مرحبًا بك في منصتنا العقارية!'
];

const MarqueeBar: React.FC = () => {
  const [marquee, setMarquee] = useState({ texts: defaultMessages, speed: 30, color: '#00bcd4', fontSize: 20 });
  const marqueeRef = useRef<HTMLDivElement>(null);

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

  // إعداد نص موحد للسلايدر
  const fullText = marquee.texts && marquee.texts.length > 0 ? marquee.texts.join('   •   ') : defaultMessages[0];
  // سرعة الحركة: كلما زادت القيمة كان أبطأ (px/sec)
  const speedPxPerSec = Math.max(20, Math.min(200, marquee.speed * 2));

  // حساب مدة الحركة بناءً على طول النص
  const [duration, setDuration] = useState(20);
  useEffect(() => {
    if (!marqueeRef.current) return;
    const textWidth = marqueeRef.current.scrollWidth;
    setDuration(textWidth / speedPxPerSec);
  }, [fullText, speedPxPerSec, marquee.fontSize]);

  return (
    <div style={{
      width: '100vw',
      overflow: 'hidden',
      background: 'none',
      color: marquee.color,
      fontSize: marquee.fontSize,
      textAlign: 'right',
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
      marginBottom: 0,
      direction: 'rtl',
      userSelect: 'none',
    }}>
      <div
        ref={marqueeRef}
        style={{
          display: 'inline-block',
          whiteSpace: 'nowrap',
          willChange: 'transform',
          animation: `marquee-move ${duration}s linear infinite`,
        }}
      >
        {fullText}
        <span style={{ margin: '0 32px' }}></span>
        {fullText}
      </div>
      <style>{`
        @keyframes marquee-move {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

export default MarqueeBar;

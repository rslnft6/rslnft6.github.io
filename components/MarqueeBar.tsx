import React, { useEffect, useState } from 'react';
import { db } from '../data/firebase';
import { doc as fsDoc, getDoc } from 'firebase/firestore';

const defaultMessages = [
  'Welcome!',
  'مرحبًا!',
  'Bienvenue!',
  'Willkommen!',
  '¡Bienvenido!',
  'Benvenuto!',
  'Добро пожаловать!',
  '欢迎!',
  'ようこそ!',
  '환영합니다!',
  'Bem-vindo!',
  'Välkommen!',
  'Witamy!',
  'Καλώς ήρθατε!',
  'Hoş geldiniz!',
  'ברוך הבא!',
  'स्वागत है!',
  'Selamat datang!',
  'ยินดีต้อนรับ!',
  'Chào mừng!',
  'Welkom!',
  'Tervetuloa!',
  'Dobrodošli!',
  'Bine ati venit!',
  'Velkommen!',
  'Aloha!',
  'مرحبا بكم معنا!'
];

const MarqueeBar: React.FC = () => {
  const [marquee, setMarquee] = useState({ texts: defaultMessages, speed: 30, color: '#00bcd4', fontSize: 20 });
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const fetchMarquee = async () => {
      try {
        const ref = fsDoc(db, 'settings', 'marquee');
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const d = snap.data();
          setMarquee({
            texts: d.texts && d.texts.length > 0 ? d.texts : defaultMessages,
            speed: d.speed || 30,
            color: d.color || '#00bcd4',
            fontSize: d.fontSize || 20
          });
        }
      } catch {}
    };
    fetchMarquee();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(i => (i + 1) % marquee.texts.length);
    }, marquee.speed * 100);
    return () => clearInterval(interval);
  }, [marquee]);

  return (
    <div style={{
      width: '100vw',
      background: 'linear-gradient(90deg, #e0f7fa 0%, #00bcd4 100%)',
      color: marquee.color,
      fontSize: marquee.fontSize,
      textAlign: 'center',
      padding: '10px 0',
      fontWeight: 'bold',
      fontFamily: 'Cairo, Tajawal, Arial',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 2000,
      letterSpacing: 1,
      transition: 'all 0.3s'
    }}>
      <span>{marquee.texts[index]}</span>
    </div>
  );
};

export default MarqueeBar;

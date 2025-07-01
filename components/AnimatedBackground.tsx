import React, { useEffect, useState } from 'react';
import styles from '../styles/AnimatedBackground.module.css';

import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../data/firebase';

export default function AnimatedBackground() {
  const [index, setIndex] = useState(0);
  const [backgrounds, setBackgrounds] = useState<string[]>([]);

  useEffect(() => {
    // جلب الخلفيات من فايرستور مباشرة
    const unsub = onSnapshot(collection(db, 'backgrounds'), (snap) => {
      setBackgrounds(snap.docs.map((d: any) => d.data().url as string));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (backgrounds.length === 0) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % backgrounds.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [backgrounds]);

  // إذا لم توجد خلفيات في فايرستور، استخدم صور bg2-bg5
  const bgList = backgrounds.length > 0 ? backgrounds : [
    '/images/bg2.png',
    '/images/bg3.png',
    '/images/bg4.png',
    '/images/bg5.png',
  ];
  return (
    <div className={styles.animatedBg} style={{ backgroundImage: `url(${bgList[index % bgList.length]})` }} />
  );
}

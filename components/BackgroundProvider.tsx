import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../data/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const BackgroundContext = createContext<string | null>(null);

export const useBackground = () => useContext(BackgroundContext);

export const BackgroundProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [background, setBackground] = useState<string | null>(null);

  useEffect(() => {
    // جلب أول خلفية من Firestore
    const unsub = onSnapshot(collection(db, 'backgrounds'), (snap) => {
      const urls = snap.docs.map(d => d.data().url as string).filter(Boolean);
      setBackground(urls[0] || null);
    });
    return () => unsub();
  }, []);

  return (
    <BackgroundContext.Provider value={background}>
      {children}
    </BackgroundContext.Provider>
  );
};

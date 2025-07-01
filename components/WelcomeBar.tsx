import React, { useEffect, useState } from 'react';
import styles from '../styles/WelcomeBar.module.css';

const messages = [
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

export default function WelcomeBar() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className={styles.welcomeBar}>
      <span>{messages[index]}</span>
    </div>
  );
}

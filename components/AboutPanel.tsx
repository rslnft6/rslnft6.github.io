import React, { useEffect, useState } from 'react';
import { db } from '../data/firebase';
import { doc as fsDoc, getDoc, setDoc } from 'firebase/firestore';


// محرر نصوص غني (Rich Text Editor) بسيط
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const getInitialTheme = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const stored = window.localStorage.getItem('theme');
    if (stored) return stored;
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  }
  return 'light';
};

const translations = {
  ar: {
    about: 'من نحن',
    placeholder: 'اكتب نبذة عن الشركة...',
    save: 'حفظ',
    saved: 'تم الحفظ',
    loading: 'جاري التحميل...'
  },
  en: {
    about: 'About Us',
    placeholder: 'Write about the company...',
    save: 'Save',
    saved: 'Saved',
    loading: 'Loading...'
  }
};

const AboutPanel: React.FC = () => {
  const [aboutText, setAboutText] = useState('');
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState(getInitialTheme());
  const [lang, setLang] = useState<'ar'|'en'>(typeof window !== 'undefined' && window.localStorage.getItem('lang') === 'en' ? 'en' : 'ar');
  const t = translations[lang];

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    window.localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem('lang', lang);
  }, [lang]);

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
  }, [lang]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const ref = fsDoc(db, 'settings', 'about');
      await setDoc(ref, { text: aboutText });
      alert(t.saved);
    } catch {}
    setLoading(false);
  };

  return (
    <div
      className="glass-table about-panel-responsive"
      style={{
        minHeight: '70vh',
        width: '100%',
        maxWidth: 1100,
        margin: '32px auto',
        direction: lang === 'ar' ? 'rtl' : 'ltr',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.25)',
        borderRadius: 24,
        background: theme === 'dark' ? 'rgba(35,38,58,0.95)' : 'rgba(255,255,255,0.95)',
        border: '1.5px solid #00bcd4',
        padding: '32px 24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        transition: 'all 0.3s',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          maxWidth: 900,
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <h2
          style={{
            color: '#00bcd4',
            fontWeight: 'bold',
            fontSize: 32,
            letterSpacing: 1,
            margin: 0,
            flex: 1,
            textAlign: lang === 'ar' ? 'right' : 'left',
            textShadow: '0 2px 8px rgba(0,188,212,0.08)'
          }}
        >
          {t.about}
        </h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            style={{
              padding: '6px 18px',
              borderRadius: 10,
              border: 'none',
              background: theme === 'dark' ? '#23263a' : '#e0f7fa',
              color: theme === 'dark' ? '#fff' : '#181c2a',
              fontWeight: 'bold',
              fontSize: 18,
              boxShadow: '0 2px 8px rgba(0,188,212,0.08)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            title={theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            style={{
              padding: '6px 18px',
              borderRadius: 10,
              border: 'none',
              background: theme === 'dark' ? '#23263a' : '#e0f7fa',
              color: theme === 'dark' ? '#fff' : '#181c2a',
              fontWeight: 'bold',
              fontSize: 18,
              boxShadow: '0 2px 8px rgba(0,188,212,0.08)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            title={lang === 'ar' ? 'English' : 'عربي'}
          >
            {lang === 'ar' ? 'EN' : 'عربي'}
          </button>
        </div>
      </div>
      <form
        className="glass-form"
        onSubmit={handleSave}
        style={{ width: '100%', maxWidth: 900 }}
      >
        {/* محرر نصوص غني */}
        <div style={{ marginBottom: 16 }}>
          <ReactQuill
            theme={theme === 'dark' ? 'snow' : 'snow'}
            value={aboutText}
            onChange={setAboutText}
            placeholder={t.placeholder}
            style={{
              background: theme === 'dark' ? '#23263a' : '#fff',
              color: theme === 'dark' ? '#fff' : '#181c2a',
              border: '1.5px solid #00bcd4',
              borderRadius: 12,
              minHeight: 180,
              fontSize: 18,
              boxShadow: '0 2px 8px rgba(0,188,212,0.08)',
              direction: lang === 'ar' ? 'rtl' : 'ltr',
              transition: 'all 0.2s',
            }}
            modules={{
              toolbar: [
                [{ header: [1, 2, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['link', 'image'],
                ['clean'],
              ],
            }}
          />
        </div>
        <button
          className="glass-btn"
          type="submit"
          disabled={loading}
          style={{
            marginTop: 12,
            padding: '10px 32px',
            fontSize: 20,
            borderRadius: 10,
            background: '#00bcd4',
            color: '#fff',
            fontWeight: 'bold',
            border: 'none',
            boxShadow: '0 2px 8px rgba(0,188,212,0.08)',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            letterSpacing: 1,
          }}
        >
          {loading ? t.loading : t.save}
        </button>
      </form>
      {/* اقتراح: إضافة شعار أو صورة جانبية مستقبلًا هنا */}
      <style jsx>{`
        @media (max-width: 900px) {
          .about-panel-responsive {
            padding: 16px 4vw !important;
            min-height: 60vh !important;
          }
        }
        @media (max-width: 600px) {
          .about-panel-responsive {
            padding: 8px 2vw !important;
            min-height: 40vh !important;
          }
          .about-panel-responsive h2 {
            font-size: 22px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AboutPanel;

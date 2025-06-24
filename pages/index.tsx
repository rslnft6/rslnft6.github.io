import Head from "next/head";
import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { getAllProperties, projects } from "../data/properties";
import dynamic from 'next/dynamic';
const ModelViewer = dynamic(() => import('../components/ModelViewer'), { ssr: false });
import { useTranslation } from 'react-i18next';
import VRView from '../components/VRView';
import { useState, useEffect } from 'react';
import { backgrounds } from '../data/backgrounds';
import { compounds } from '../data/compounds';
import { developers } from '../data/developers';
import VoiceSearch from '../components/VoiceSearch';
import { smartSearch } from '../services/ai';
import Reviews from '../components/Reviews';
import { useRouter } from 'next/router';
import { notifyUser } from '../services/notifications';
import VideoTour from '../components/VideoTour';
import StatsBox from '../components/StatsBox';
import AnimatedBackground from '../components/AnimatedBackground';
import ImagesSlider from '../components/ImagesSlider';
import SmartChat from '../components/SmartChat';
import { db } from '../data/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { FaUserCircle } from 'react-icons/fa';
import { defaultContacts, ContactLinks } from '../data/contacts';
import { doc as fsDoc, getDoc } from 'firebase/firestore';
import { FaWhatsapp, FaPhone, FaFacebook, FaSnapchatGhost, FaTwitter, FaInstagram, FaTelegram, FaDiscord, FaEnvelope } from 'react-icons/fa';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const MapView = dynamic(() => import('../components/MapView'), { ssr: false });
const VR360Gallery = dynamic(() => import('../components/VR360Gallery'), { ssr: false });

// تعريف نوع الكمباوند الجديد
interface Compound {
  id: number;
  name: string;
  logo?: string;
  developer?: string;
  developerId?: number;
  city?: string;
  country: string;
}

const properties = getAllProperties();

const PANORAMA_IMAGES = [
  '/panorama/pano1.jpg',
  '/panorama/pano2.jpg',
  '/panorama/pano3.jpg',
];

export default function Home() {
  const { t, i18n } = useTranslation();
  const { locale, push } = useRouter();
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState(properties);
  const [type, setType] = useState('');
  const [country, setCountry] = useState('');
  const [compound, setCompound] = useState('');
  const [developer, setDeveloper] = useState('');
  const [finance, setFinance] = useState('');
  const [purpose, setPurpose] = useState(''); // إضافة حالة الفلترة للبيع/إيجار
  const [selectedPanorama, setSelectedPanorama] = useState<string | null>(null);
  const [pendingFilters, setPendingFilters] = useState({
    search: '', type: '', country: '', compound: '', developer: '', finance: '', purpose: ''
  });
  const [chatOpen, setChatOpen] = useState(false);
  const [firebaseUnits, setFirebaseUnits] = useState<any[]>([]);
  const [showPano, setShowPano] = useState<string|null>(null);
  const [showContacts, setShowContacts] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  // --- المفضلة والمقارنة ---
  const [favorites, setFavorites] = useState<string[]>([]);
  const [compare, setCompare] = useState<string[]>([]);

  // --- اقتراحات عالمية لتحسين تجربة المستخدم مثل Zillow وRealtor ---
  // 1. عرض وحدات مشابهة عند الضغط على وحدة (اقتراحات ذكية)
  // 2. حفظ آخر وحدات تم تصفحها (recently viewed)
  // 3. شارة "جديد" أو "مميز" على الكارت
  // 4. دعم مشاركة الوحدة عبر واتساب/تويتر/رابط مباشر
  // 5. عرض تقييمات وتعليقات المستخدمين
  // 6. دعم حفظ البحث (save search) مع تنبيه عند توفر وحدات جديدة
  // 7. عرض وحدات مشابهة (Similar Units) أسفل كل كارت أو في صفحة التفاصيل
  // 8. دعم تقييم الوحدة (Rating) وعدد المشاهدات
  // 9. دعم فلترة متقدمة (سعر، غرف، حمامات، مساحة...)
  // 10. دعم عرض خريطة Heatmap للطلب أو الأسعار
  // 11. دعم تسجيل الدخول الاجتماعي (Google, Facebook)

  // البحث الذكي
  const handleSmartSearch = (q: string) => {
    setSearch(q);
    // البحث في جميع الوحدات (المحلية + فايرستور)
    const all = [...firebaseUnits, ...properties];
    setFiltered(smartSearch(q, all));
  };

  // البحث الصوتي: عند النتيجة يتم البحث الذكي مباشرة
  const handleVoiceSearch = (text: string) => {
    handleSmartSearch(text);
  };

  // تحديث الفلاتر المؤقتة
  const handleFilterChange = (key: string, value: string) => {
    setPendingFilters(f => ({ ...f, [key]: value }));
  };

  // تطبيق الفلاتر عند الضغط على زر بحث
  const applyFilters = () => {
    setSearch(pendingFilters.search);
    setType(pendingFilters.type);
    setCountry(pendingFilters.country);
    setCompound(pendingFilters.compound);
    setDeveloper(pendingFilters.developer);
    setFinance(pendingFilters.finance);
    setPurpose(pendingFilters.purpose);
  };

  // --- حفظ البحث ---
  const [savedSearches, setSavedSearches] = useState<any[]>([]);
  // حفظ البحث الحالي
  const saveCurrentSearch = () => {
    const searchObj = { ...pendingFilters, date: new Date().toISOString() };
    setSavedSearches(prev => {
      const updated = [searchObj, ...prev].slice(0, 5);
      if (typeof window !== 'undefined') localStorage.setItem('savedSearches', JSON.stringify(updated));
      return updated;
    });
  };
  // تحميل عمليات البحث المحفوظة
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSavedSearches(JSON.parse(localStorage.getItem('savedSearches') || '[]'));
    }
  }, []);

  // جلب الوحدات من Firestore
  useEffect(() => {
    async function fetchUnits() {
      const snap = await getDocs(collection(db, 'units'));
      setFirebaseUnits(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }
    fetchUnits();
  }, []);

  // دمج وحدات فايرستور مع الوحدات المحلية
  const allProperties = [...firebaseUnits, ...properties];
  const filteredProperties = allProperties.filter(p =>
    (!search || (p.title && p.title.includes(search)) || (p.location && p.location.includes(search))) &&
    (!type || p.type === type) &&
    (!country || (p.location && p.location.includes(country))) &&
    (!compound || p.compound === compound) &&
    (!developer || p.developer === developer || p.developerId === developer) &&
    (!finance || (finance === 'تمويل عقاري' ? p.finance === 'تمويل عقاري' : true)) &&
    (!purpose || p.purpose === purpose) // تحديث الفلترة لتشمل الغرض
  );

  useEffect(() => {
    if (filtered.length > 0 && search.length > 2) {
      notifyUser('نتيجة بحث جديدة', `تم العثور على ${filtered.length} وحدة تناسب بحثك!`);
    }
  }, [filtered, search]);

  useEffect(() => {
    setPendingFilters({
      search, type, country, compound, developer, finance, purpose
    });
  }, [search, type, country, compound, developer, finance, purpose]);

  // زر اللغة الموحد
  const toggleLang = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    push('/', undefined, { locale: newLang });
  };

  // روابط التواصل
  const [contacts, setContacts] = useState<ContactLinks>(defaultContacts);
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const ref = fsDoc(db, 'settings', 'contacts');
        const snap = await getDoc(ref);
        if (snap.exists()) setContacts(snap.data() as ContactLinks);
      } catch {}
    };
    fetchContacts();
  }, []);

  // جلب إعدادات الشريط المتحرك من فايرستور
  const [marquee, setMarquee] = useState({ texts: ["فرحنا بوجودك معنا!"], speed: 30, color: "#ff9800", fontSize: 20 });
  useEffect(() => {
    async function fetchMarquee() {
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
    }
    fetchMarquee();
  }, []);

  // جلب صور السلايدر من فايرستور
  const [sliderImages, setSliderImages] = useState<string[]>([]);
  useEffect(() => {
    async function fetchSlider() {
      try {
        const ref = fsDoc(db, 'settings', 'slider');
        const snap = await getDoc(ref);
        if (snap.exists()) setSliderImages(snap.data().images || []);
      } catch {}
    }
    fetchSlider();
  }, []);

  // تحميل المفضلة والمقارنة من localStorage عند أول تحميل
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setFavorites(JSON.parse(localStorage.getItem('favorites') || '[]'));
      setCompare(JSON.parse(localStorage.getItem('compare') || '[]'));
    }
  }, []);

  // حفظ المفضلة والمقارنة في localStorage عند التغيير
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('favorites', JSON.stringify(favorites));
      localStorage.setItem('compare', JSON.stringify(compare));
    }
  }, [favorites, compare]);

  // إضافة/إزالة من المفضلة
  const toggleFavorite = (id: string) => {
    setFavorites(favs => favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id]);
  };
  // إضافة/إزالة من المقارنة (حد أقصى 3)
  const toggleCompare = (id: string) => {
    setCompare(cmp => cmp.includes(id) ? cmp.filter(c => c !== id) : (cmp.length < 3 ? [...cmp, id] : cmp));
  };

  // --- حفظ آخر وحدات تم تصفحها ---
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  // عند الضغط على كارت وحدة
  const handleUnitClick = (id: string) => {
    setRecentlyViewed(prev => {
      const updated = [id, ...prev.filter(x => x !== id)].slice(0, 8);
      if (typeof window !== 'undefined') localStorage.setItem('recentlyViewed', JSON.stringify(updated));
      return updated;
    });
    window.location.href = `/property/${id}`;
  };
  // تحميل آخر وحدات تم تصفحها من localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRecentlyViewed(JSON.parse(localStorage.getItem('recentlyViewed') || '[]'));
    }
  }, []);

  return (
    <div className="container" style={{
      minHeight: '100vh',
      borderRadius: 24,
      boxShadow: '0 2px 32px rgba(0,0,0,0.08)',
      background: 'linear-gradient(135deg,rgba(255,255,255,0.92) 0%,rgba(0,188,212,0.10) 100%)',
      backdropFilter: 'blur(24px)',
      padding:0,
      margin:0,
      width:'100vw',
      overflow:'hidden',
      position:'relative'
    }}>
      <style>{`
        .glass-form, .glass-table, .glass-card {
          background: rgba(255,255,255,0.32);
          border-radius: 20px;
          box-shadow: 0 2px 16px #00bcd422;
          backdrop-filter: blur(14px);
          border: 1.5px solid rgba(0,188,212,0.10);
          padding: 28px 24px;
          margin-bottom: 32px;
          transition: box-shadow 0.2s;
        }
        .glass-form input, .glass-form select, .glass-form textarea {
          background: rgba(255,255,255,0.45);
          border: 1.5px solid rgba(0,188,212,0.13);
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 17px;
          margin-bottom: 16px;
          box-shadow: 0 1px 6px #00bcd422;
          outline: none;
          transition: border 0.2s, box-shadow 0.2s;
        }
        .glass-form input:focus, .glass-form select:focus, .glass-form textarea:focus {
          border: 1.5px solid #00bcd4;
          box-shadow: 0 2px 12px #00bcd433;
        }
        .glass-btn {
          background: linear-gradient(120deg,rgba(255,255,255,0.65) 0%,rgba(0,188,212,0.18) 100%);
          color: #00bcd4;
          border: none;
          border-radius: 14px;
          padding: 12px 28px;
          font-size: 18px;
          font-weight: bold;
          box-shadow: 0 2px 12px #00bcd422;
          cursor: pointer;
          margin: 8px 0;
          transition: background 0.2s, color 0.2s, box-shadow 0.2s;
        }
        .glass-btn:hover {
          background: linear-gradient(120deg,rgba(0,188,212,0.13) 0%,rgba(255,255,255,0.85) 100%);
          color: #fff;
          box-shadow: 0 4px 24px #00bcd433;
        }
        .glass-table table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          background: transparent;
        }
        .glass-table th, .glass-table td {
          background: rgba(255,255,255,0.22);
          border-radius: 10px;
          padding: 12px 16px;
          color: #222;
          font-size: 16px;
          border-bottom: 1.5px solid rgba(0,188,212,0.08);
        }
        .glass-table th {
          color: #00bcd4;
          font-weight: bold;
          background: rgba(0,188,212,0.08);
        }
        .glass-table tr:last-child td {
          border-bottom: none;
        }
        .glass-card {
          background: rgba(255,255,255,0.85);
          border-radius: 20px;
          box-shadow: 0 4px 18px #00bcd422;
          border: 2px solid #00bcd4;
          position: relative;
          overflow: hidden;
          margin-bottom: 12px;
          transition: box-shadow 0.2s, border 0.2s;
        }
        .glass-card:hover {
          box-shadow: 0 8px 32px #00bcd433;
          border: 2.5px solid #00bcd4;
        }
        .glass-fav-btn, .glass-compare-btn {
          position: absolute;
          top: 12px;
          z-index: 2;
          border: none;
          border-radius: 50%;
          width: 38px;
          height: 38px;
          box-shadow: 0 2px 8px #00bcd422;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: 0.2s;
          font-size: 20px;
        }
        .glass-fav-btn {
          right: 12px;
          background: #fff;
        }
        .glass-fav-btn.active {
          background: #00bcd4;
          color: #fff;
        }
        .glass-compare-btn {
          left: 12px;
          background: #00bcd4;
          color: #fff;
        }
        .glass-compare-btn.active {
          background: #fff;
          color: #00bcd4;
        }
        /* تحسين الفلاتر لتكون زجاجية */
        .search-bar {
          background: rgba(255,255,255,0.55) !important;
          box-shadow: 0 2px 12px #00bcd422 !important;
          border-radius: 18px !important;
          backdrop-filter: blur(10px) !important;
        }
        .search-bar input, .search-bar select {
          background: rgba(255,255,255,0.45) !important;
          border: 1.5px solid #00bcd4 !important;
          border-radius: 10px !important;
          box-shadow: 0 1px 6px #00bcd422 !important;
          font-size: 17px !important;
          padding: 10px 14px !important;
          margin-bottom: 0 !important;
        }
        .search-bar input:focus, .search-bar select:focus {
          border: 1.5px solid #00bcd4 !important;
          box-shadow: 0 2px 12px #00bcd433 !important;
        }
        .search-bar button {
          background: linear-gradient(120deg,rgba(255,255,255,0.65) 0%,rgba(0,188,212,0.18) 100%) !important;
          color: #00bcd4 !important;
          border: none !important;
          border-radius: 12px !important;
          font-weight: bold !important;
          font-size: 17px !important;
          box-shadow: 0 2px 12px #00bcd422 !important;
          transition: background 0.2s, color 0.2s, box-shadow 0.2s !important;
        }
        .search-bar button:hover {
          background: linear-gradient(120deg,rgba(0,188,212,0.13) 0%,rgba(255,255,255,0.85) 100%) !important;
          color: #fff !important;
          box-shadow: 0 4px 24px #00bcd433 !important;
        }
      `}</style>
      <Head>
        <title>تطبيق عقارات عالمي</title>
        <meta
          name="description"
          content="تصفح أفضل الوحدات والمشروعات العقارية في الوطن العربي"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={`${geistSans.variable} ${geistMono.variable}`}>
        {/* هيدر احترافي عالمي */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
          padding: '8px 0',
          borderBottom: '1px solid #e0e0e0',
          background: 'rgba(255,255,255,0.95)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          {/* زر اللغة الموحد */}
          <button
            onClick={toggleLang}
            title={i18n.language === 'ar' ? 'English' : 'العربية'}
            style={{
              background: '#fff',
              color: '#00bcd4',
              border: '2px solid #00bcd4',
              borderRadius: '50%',
              width: 44,
              height: 44,
              fontWeight: 'bold',
              fontSize: 18,
              cursor: 'pointer',
              boxShadow: '0 2px 8px #e0e0e0',
              transition: 'all 0.2s',
              marginRight: 8
            }}
          >
            {i18n.language === 'ar' ? 'EN' : 'AR'}
          </button>
          {/* زر تسجيل الدخول الدائري */}
          <button
            onClick={() => window.location.href = '/login'}
            title={t('login') || 'تسجيل الدخول'}
            style={{
              background: '#00bcd4',
              border: 'none',
              borderRadius: '50%',
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px #b2ebf2',
              cursor: 'pointer',
              marginLeft: 8
            }}
          >
            <FaUserCircle size={26} color="#fff" />
          </button>
        </div>
        <main style={{
          minHeight:'70vh',
          width:'100%',
          display:'flex',
          flexDirection:'column',
          alignItems:'center',
          justifyContent:'center',
          padding:'0 0 48px 0',
        }}>
          {/* شعار Realstatelive أعلى الصفحة */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',margin:'32px 0 8px 0'}}>
            <img src="/images/logo1.png" alt="Realstatelive logo" style={{width:60,marginLeft:12}} />
            <span style={{fontWeight:'bold',fontSize:36,color:'#00bcd4',letterSpacing:2,textShadow:'0 2px 8px #e0e0e0'}}>Realstatelive</span>
          </div>
          {/* شريط إعلانات متحرك ديناميكي */}
          <div style={{width:'100%',overflow:'hidden',margin:'0 auto 16px auto',direction:'rtl'}}>
            <div style={{
              display:'inline-block',
              whiteSpace:'nowrap',
              animation:`marquee ${marquee.speed}s linear infinite`,
              color:marquee.color,
              fontWeight:'bold',
              fontSize:marquee.fontSize,
              padding:'8px 0',
              minWidth:'100%'
            }}>
              {marquee.texts.map((txt,i)=>(
                <span key={i} style={{marginRight:40}}>{txt}</span>
              ))}
            </div>
          </div>
          <style>{`
            @keyframes marquee {
              0% { transform: translateX(100%); }
              100% { transform: translateX(-100%); }
            }
          `}</style>
          {/* الفلاتر */}
          <div className="search-bar" style={{background:'#fff',borderRadius:16,padding:16,boxShadow:'0 2px 12px #e0e0e0',marginBottom:24,flexWrap:'wrap',display:'flex',gap:8}}>
            <VoiceSearch onResult={handleVoiceSearch} />
            <input placeholder="بحث عن وحدة..." value={pendingFilters.search} onChange={e => handleFilterChange('search', e.target.value)} style={{fontSize:18,border:'1px solid #00bcd4',borderRadius:8,padding:8,marginLeft:8,minWidth:160,flex:'1 1 120px'}} />
            <select value={pendingFilters.type} onChange={e => handleFilterChange('type', e.target.value)} style={{color:'#00bcd4',fontWeight:'bold',marginLeft:8,minWidth:120,flex:'1 1 120px'}}>
              <option value="">الكل</option>
              <option value="palace">قصور</option>
              <option value="villa">فيلات</option>
              <option value="apartment">شقق</option>
              <option value="townhouse">تاون هاوس</option>
              <option value="twinhouse">توين هاوس</option>
              <option value="studio">استوديو</option>
              <option value="chalet">شاليه</option>
              <option value="clinic">عيادات</option>
              <option value="shop">محلات</option>
              <option value="office">مكاتب</option>
            </select>
            <select value={pendingFilters.country} onChange={e => handleFilterChange('country', e.target.value)} style={{color:'#ff9800',fontWeight:'bold',marginLeft:8,minWidth:120,flex:'1 1 120px'}}>
              <option value="">كل الدول</option>
              <option value="مصر">مصر</option>
              <option value="الإمارات">الإمارات</option>
              <option value="السعودية">السعودية</option>
              <option value="الكويت">الكويت</option>
              <option value="البحرين">البحرين</option>
              <option value="قطر">قطر</option>
              <option value="عمان">عمان</option>
              <option value="الأردن">الأردن</option>
              <option value="الجزائر">الجزائر</option>
              <option value="المغرب">المغرب</option>
            </select>
            <select value={pendingFilters.compound} onChange={e => handleFilterChange('compound', e.target.value)} style={{color:'#00e676',fontWeight:'bold',marginLeft:8,minWidth:120,flex:'1 1 120px'}}>
              <option value="">كل الكمباوندات</option>
              {compounds.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
            <select value={pendingFilters.developer} onChange={e => handleFilterChange('developer', e.target.value)} style={{color:'#2196f3',fontWeight:'bold',marginLeft:8,minWidth:120,flex:'1 1 120px'}}>
              <option value="">كل المطورين</option>
              {developers.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
            <select value={pendingFilters.finance} onChange={e => handleFilterChange('finance', e.target.value)} style={{color:'#ff1744',fontWeight:'bold',marginLeft:8,minWidth:120,flex:'1 1 120px'}}>
              <option value="">كل خيارات التمويل</option>
              <option value="تمويل عقاري">تمويل عقاري</option>
              <option value="نقدي">نقدي</option>
            </select>
            <select value={pendingFilters.purpose} onChange={e => handleFilterChange('purpose', e.target.value)} style={{color:'#ff9800',fontWeight:'bold',marginLeft:8,minWidth:120,flex:'1 1 120px'}}>
              <option value="">الكل</option>
              <option value="للبيع">للبيع</option>
              <option value="للإيجار">للإيجار</option>
            </select>
            <button onClick={applyFilters} style={{background:'#00bcd4',color:'#fff',border:'none',borderRadius:8,padding:'8px 24px',fontWeight:'bold',fontSize:16,marginLeft:8,cursor:'pointer'}}>بحث</button>
            <button onClick={saveCurrentSearch} className="glass-btn" style={{marginLeft:8}}>حفظ البحث</button>
          </div>
          {/* عرض عمليات البحث المحفوظة */}
          {savedSearches.length > 0 && (
            <div className="glass-table" style={{maxWidth:700,margin:'0 auto 24px auto',padding:'14px 20px'}}>
              <div style={{fontWeight:'bold',fontSize:17,color:'#00bcd4',marginBottom:8}}>عمليات البحث المحفوظة</div>
              <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
                {savedSearches.map((s,i) => (
                  <button key={i} className="glass-btn" style={{padding:'6px 16px',fontSize:15}} onClick={()=>{
                    setPendingFilters(s);
                    setSearch(s.search||'');
                    setType(s.type||'');
                    setCountry(s.country||'');
                    setCompound(s.compound||'');
                    setDeveloper(s.developer||'');
                    setFinance(s.finance||'');
                    setPurpose(s.purpose||'');
                  }}>
                    {Object.entries(s).filter(([k,v])=>v&&k!=='date').map(([k,v])=>v).join(' - ')||'بحث'}
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* سلايدر صور متحرك ديناميكي */}
          <div style={{width:'100%',overflow:'hidden',margin:'0 auto 24px auto',direction:'ltr'}}>
            <div style={{
              display:'flex',
              gap:24,
              animation:'slider-horizontal 24s linear infinite',
              alignItems:'center',
              minWidth:'100%'
            }}>
              {sliderImages.length === 0 ? (
                <>
                  <img src="/images/bg1.png" alt="bg1" style={{height:120,borderRadius:16,boxShadow:'0 2px 8px #e0e0e0'}} />
                  <img src="/images/bg2.png" alt="bg2" style={{height:120,borderRadius:16,boxShadow:'0 2px 8px #e0e0e0'}} />
                  <img src="/images/bg10.jpg" alt="bg10" style={{height:120,borderRadius:16,boxShadow:'0 2px 8px #e0e0e0'}} />
                </>
              ) : (
                sliderImages.concat(sliderImages).map((img,i)=>(
                  <img key={i} src={img} alt={`slider${i}`} style={{height:120,borderRadius:16,boxShadow:'0 2px 8px #e0e0e0'}} />
                ))
              )}
            </div>
          </div>
          <style>{`
            @keyframes slider-horizontal {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
          `}</style>
          {/* الوحدات الأكثر مشاهدة بناءً على الفلترة */}
          <div style={{display:'flex',alignItems:'center',gap:8,margin:'24px 0 8px 0',justifyContent:'center'}}>
            <img src="/images/logo1.png" alt="logo" style={{width:36}} />
            <span style={{color:'#ff9800',fontWeight:'bold',fontSize:22}}>الوحدات المقترحة لك</span>
            <span style={{background:'#00bcd4',color:'#fff',borderRadius:8,padding:'2px 10px',fontSize:14,marginRight:8}}>ذكاء اصطناعي</span>
          </div>
          <Swiper spaceBetween={12} slidesPerView={2} style={{marginBottom: 32}}>
            {filteredProperties.slice(0, 10).map((property) => (
              <SwiperSlide key={property.id}>
                <div className="glass-card" style={{cursor:'pointer',position:'relative'}} onClick={()=>handleUnitClick(property.id)}>
                  {/* شارة جديد أو مميز */}
                  {property.isNew && (
                    <span style={{position:'absolute',top:10,left:60,background:'#ff9800',color:'#fff',borderRadius:8,padding:'2px 10px',fontWeight:'bold',fontSize:13,zIndex:3,boxShadow:'0 1px 6px #ff980033'}}>جديد</span>
                  )}
                  {property.isFeatured && (
                    <span style={{position:'absolute',top:10,left:120,background:'#00bcd4',color:'#fff',borderRadius:8,padding:'2px 10px',fontWeight:'bold',fontSize:13,zIndex:3,boxShadow:'0 1px 6px #00bcd433'}}>مميز</span>
                  )}
                  {/* أزرار المفضلة والمقارنة */}
                  <button
                    title={favorites.includes(property.id) ? "إزالة من المفضلة" : "إضافة للمفضلة"}
                    className={`glass-fav-btn${favorites.includes(property.id) ? ' active' : ''}`}
                    onClick={e=>{e.stopPropagation();toggleFavorite(property.id);}}
                  >
                    <span role="img" aria-label="fav">{favorites.includes(property.id) ? '❤️' : '🤍'}</span>
                  </button>
                  <button
                    title={compare.includes(property.id) ? "إزالة من المقارنة" : "إضافة للمقارنة"}
                    className={`glass-compare-btn${compare.includes(property.id) ? ' active' : ''}`}
                    onClick={e=>{e.stopPropagation();toggleCompare(property.id);}}
                  >
                    <span role="img" aria-label="compare">{compare.includes(property.id) ? '✅' : '🔄'}</span>
                  </button>
                  {/* زر مشاركة الوحدة */}
                  <button
                    title="مشاركة الوحدة"
                    style={{position:'absolute',top:12,left:60,zIndex:2,background:'#fff',border:'none',borderRadius:'50%',width:38,height:38,boxShadow:'0 2px 8px #00bcd422',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',transition:'0.2s',fontSize:18}}
                    onClick={e=>{e.stopPropagation();navigator.share ? navigator.share({title:property.title,text:property.details,url:window.location.origin+`/property/${property.id}`}) : navigator.clipboard.writeText(window.location.origin+`/property/${property.id}`);}}
                  >
                    <span role="img" aria-label="share">🔗</span>
                  </button>
                  <img src={property.image} alt={property.title} style={{width: '100%', height: 140, objectFit: 'cover', borderRadius: 16}} />
                  <div className="property-details" style={{padding:16}}>
                    <h3 style={{color:'#00bcd4',fontWeight:'bold',fontSize:20,marginBottom:4}}>{property.title}</h3>
                    <span style={{color:'#ff9800',fontWeight:'bold',fontSize:15}}>{property.location}</span>
                    <span style={{color:'#00e676',fontWeight:'bold',display:'block',marginTop:6}}>{property.details}</span>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          {/* شريط المقارنة العائم */}
          {compare.length > 0 && (
            <div style={{position:'fixed',bottom:100,right:24,zIndex:9999,background:'rgba(255,255,255,0.92)',boxShadow:'0 2px 16px #00bcd422',borderRadius:18,padding:'18px 28px',display:'flex',alignItems:'center',gap:16,backdropFilter:'blur(10px)'}}>
              <span style={{fontWeight:'bold',color:'#00bcd4',fontSize:18}}>مقارنة ({compare.length}/3)</span>
              {compare.map(id => {
                const unit = allProperties.find(u => u.id === id);
                return unit ? (
                  <span key={id} style={{background:'#00bcd4',color:'#fff',borderRadius:8,padding:'4px 12px',fontWeight:'bold',fontSize:15,marginLeft:4}}>{unit.title}</span>
                ) : null;
              })}
              <button className="glass-btn" style={{margin:0,padding:'8px 18px',fontSize:16}} onClick={()=>window.location.href='/compare?ids='+compare.join(',')}>عرض المقارنة</button>
              <button className="glass-btn" style={{margin:0,padding:'8px 18px',fontSize:16,background:'#e53935',color:'#fff'}} onClick={()=>setCompare([])}>مسح</button>
            </div>
          )}
          {/* الدردشة الذكية العائمة */}
          <div style={{position:'fixed',bottom:24,right:24,zIndex:9999}}>
            {!chatOpen && (
              <button onClick={()=>setChatOpen(true)} style={{background:'#00bcd4',border:'none',borderRadius:'50%',width:56,height:56,boxShadow:'0 2px 8px #00bcd4',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
                <span style={{fontSize:32,color:'#fff'}}>💬</span>
              </button>
            )}
            {chatOpen && (
              <div style={{position:'relative'}}>
                <button onClick={()=>setChatOpen(false)} style={{position:'absolute',top:-12,right:-12,background:'#e53935',color:'#fff',border:'none',borderRadius:'50%',width:28,height:28,fontWeight:'bold',fontSize:18,cursor:'pointer',zIndex:2}}>×</button>
                <SmartChat />
              </div>
            )}
          </div>
          {/* خريطة العقارات */}
          <h1 className="section-title">خريطة العقارات</h1>
          <div className="map-section" style={{minHeight:400, height:400, width:'100%', borderRadius:16, overflow:'hidden', boxShadow:'0 2px 12px #e0e0e0', marginBottom:32, background:'#f5f7fa', position:'relative'}}>
            <MapView properties={filteredProperties} />
            <noscript>
              <div style={{color:'#ff1744',fontWeight:'bold',padding:16}}>يرجى تفعيل الجافاسكريبت لعرض الخريطة.</div>
            </noscript>
            <div id="map-fallback" style={{display:'none',color:'#ff1744',fontWeight:'bold',padding:16,position:'absolute',top:0,left:0,right:0,bottom:0,background:'#fff',zIndex:2}}>
              تعذر تحميل الخريطة. تأكد من اتصالك بالإنترنت أو أعد تحميل الصفحة.
            </div>
          </div>
          <h1 className="section-title">تجربة الواقع الافتراضي (VR)</h1>
          <div className="vr-section">
            <VRView src="" />
          </div>
          {/* <Reviews /> */}
          {/* <StatsBox /> */}
          {/* <AdminPanel /> تم إزالته من الصفحة الرئيسية */}
        </main>
      </div>
      <footer style={{background:'#f5f7fa',color:'#222',padding:'32px 0 16px 0',marginTop:40}}>
  <div style={{
    background: 'linear-gradient(90deg,#00bcd4 0%,#2196f3 100%)',
    color: '#fff',
    borderRadius: 16,
    padding: '32px 32px',
    margin: '0 auto',
    maxWidth: 800,
    boxShadow: '0 2px 16px #b2ebf2',
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
    letterSpacing: 1
  }}>
    <div style={{display:'flex',justifyContent:'center',gap:16,marginBottom:18,flexWrap:'wrap'}}>
      <button onClick={()=>window.location.href='/about'} style={{background:'rgba(255,255,255,0.55)',backdropFilter:'blur(12px)',color:'#00bcd4',border:'none',borderRadius:16,padding:'18px 44px',fontWeight:'bold',fontSize:24,cursor:'pointer',boxShadow:'0 2px 16px #00bcd422',transition:'0.2s'}}>من نحن</button>
      <button onClick={()=>setShowContacts(!showContacts)} style={{background:'rgba(255,255,255,0.55)',backdropFilter:'blur(12px)',color:'#00bcd4',border:'none',borderRadius:16,padding:'18px 44px',fontWeight:'bold',fontSize:24,cursor:'pointer',boxShadow:'0 2px 16px #00bcd422',transition:'0.2s'}}>تواصل معنا</button>
      <button onClick={()=>window.location.href='/partners'} style={{background:'rgba(255,255,255,0.55)',backdropFilter:'blur(12px)',color:'#00bcd4',border:'none',borderRadius:16,padding:'18px 44px',fontWeight:'bold',fontSize:24,cursor:'pointer',boxShadow:'0 2px 16px #00bcd422',transition:'0.2s'}}>شركاؤنا</button>
    </div>
    {/* نبذة من نحن */}
    {/* تم إلغاء عرض النبذة هنا بناءً على طلب المستخدم */}
    {/* أيقونات التواصل */}
    {showContacts && (
      <div style={{marginTop:16,display:'flex',flexWrap:'wrap',justifyContent:'center',gap:18}}>
        <a href={`https://wa.me/${contacts.whatsapp}`} target="_blank" rel="noopener noreferrer" style={{color:'#25d366',fontSize:28}} title="واتساب"><FaWhatsapp /></a>
        <a href={`tel:${contacts.phone}`} style={{color:'#fff',fontSize:28}} title="اتصال"><FaPhone /></a>
        <a href={contacts.facebook} target="_blank" rel="noopener noreferrer" style={{color:'#1877f3',fontSize:28}} title="فيسبوك"><FaFacebook /></a>
        <a href={contacts.snapchat} target="_blank" rel="noopener noreferrer" style={{color:'#fffc00',fontSize:28}} title="سناب شات"><FaSnapchatGhost /></a>
        <a href={contacts.twitter} target="_blank" rel="noopener noreferrer" style={{color:'#1da1f2',fontSize:28}} title="تويتر"><FaTwitter /></a>
        <a href={contacts.instagram} target="_blank" rel="noopener noreferrer" style={{color:'#e1306c',fontSize:28}} title="انستجرام"><FaInstagram /></a>
        <a href={contacts.telegram} target="_blank" rel="noopener noreferrer" style={{color:'#0088cc',fontSize:28}} title="تيليجرام"><FaTelegram /></a>
        <a href={contacts.discord} target="_blank" rel="noopener noreferrer" style={{color:'#5865f2',fontSize:28}} title="ديسكورد"><FaDiscord /></a>
        <a href={contacts.gmail} target="_blank" rel="noopener noreferrer" style={{color:'#fff',fontSize:28}} title="Gmail"><FaEnvelope /></a>
      </div>
    )}
    <div style={{marginTop:18,fontSize:15,color:'#fff',fontWeight:'normal'}}>
      الخط الساخن <span style={{color:'#ffeb3b',textDecoration:'underline',fontWeight:'bold'}}>19500</span>
    </div>
  </div>
  <div style={{textAlign:'center',marginTop:24,color:'#00bcd4',fontSize:16,fontWeight:'bold'}}>
    <img src="/globe.svg" alt="logo" style={{width:32,verticalAlign:'middle',marginRight:8}} />
    جميع الحقوق محفوظة Realstatelive © {new Date().getFullYear()}
  </div>
</footer>
    </div>
  );
}

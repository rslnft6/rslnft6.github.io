import Head from "next/head";
import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { getAllProperties, projects } from "../data/properties";
import dynamic from 'next/dynamic';
const ModelViewer = dynamic(() => import('../components/ModelViewer'), { ssr: false });
import { useTranslation } from 'react-i18next';
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
import { Menu, MenuItem } from '@mui/material';

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

// حذف تعريف BACKGROUND_IMAGES الثابت
// const BACKGROUND_IMAGES = [
//   '/images/bg1.png',
//   '/images/bg2.png'
// ];

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
    search: '', type: '', country: '', compound: '', developer: '', finance: '', purpose: '', maxUnits: '', maxPrice: ''
  });
  const [chatOpen, setChatOpen] = useState(false);
  const [firebaseUnits, setFirebaseUnits] = useState<any[]>([]);
  const [showPano, setShowPano] = useState<string|null>(null);
  const [showContacts, setShowContacts] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [maxUnits, setMaxUnits] = useState<number|undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number|undefined>(undefined);
  const [bgIndex, setBgIndex] = useState(0);
  // إضافة حالة صور الخلفية من فايرستور
  const [backgroundImages, setBackgroundImages] = useState<string[]>([]);

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
    setMaxUnits(Number(pendingFilters.maxUnits) || undefined);
    setMaxPrice(Number(pendingFilters.maxPrice) || undefined);
  };

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
    (!finance || (finance === 'تمويل عقاري' ? p.finance === 'تمويل عقاري' : finance === 'نقدي' ? p.finance === 'نقدي' : finance === 'أقساط' ? p.finance === 'أقساط' : finance === 'إعادة بيع' ? p.finance === 'إعادة بيع' : true)) &&
    (!purpose || p.purpose === purpose) &&
    (!maxPrice || (p.price && Number(p.price) <= maxPrice))
  ).slice(0, maxUnits || 100);

  useEffect(() => {
    if (filtered.length > 0 && search.length > 2) {
      notifyUser('نتيجة بحث جديدة', `تم العثور على ${filtered.length} وحدة تناسب بحثك!`);
    }
  }, [filtered, search]);

  useEffect(() => {
    setPendingFilters({
      search, type, country, compound, developer, finance, purpose, maxUnits: pendingFilters.maxUnits || '', maxPrice: pendingFilters.maxPrice || ''
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
  interface MarqueeSettings {
    texts: (string | { [lang: string]: string })[];
    speed: number;
    color: string;
    fontSize: number;
    fontFamily?: string;
  }
  const [marquee, setMarquee] = useState<MarqueeSettings>({ texts: ["فرحنا بوجودك معنا!"], speed: 30, color: "#ff9800", fontSize: 20 });
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
            fontSize: d.fontSize || 20,
            fontFamily: d.fontFamily || undefined
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

  // جلب صور الخلفية من فايرستور (collection: backgrounds)
  useEffect(() => {
    async function fetchBackgrounds() {
      try {
        const snap = await getDocs(collection(db, 'backgrounds'));
        const imgs = snap.docs.map(d => d.data().url).filter(Boolean);
        setBackgroundImages(imgs.length > 0 ? imgs.slice(0, 4) : [
          '/images/bg1.png',
          '/images/bg2.png',
          '/images/bg10.png',
          '/images/bg4.png',
        ]);
      } catch {
        setBackgroundImages([
          '/images/bg1.png',
          '/images/bg2.png',
          '/images/bg10.png',
          '/images/bg4.png',
        ]);
      }
    }
    fetchBackgrounds();
  }, []);

  useEffect(() => {
    if (backgroundImages.length === 0) return;
    const interval = setInterval(() => {
      setBgIndex(i => (i + 1) % backgroundImages.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [backgroundImages]);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <div className="container" style={{
      minHeight: '100vh',
      borderRadius: 24,
      boxShadow: '0 2px 32px rgba(0,0,0,0.08)',
      background: backgroundImages.length > 0 ? `linear-gradient(0deg,rgba(255,255,255,0.97),rgba(255,255,255,0.97)), url(${backgroundImages[bgIndex]})` : 'rgba(255,255,255,0.97)',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backdropFilter: 'blur(24px)',
      padding:0,
      margin:0,
      width:'100vw',
      overflow:'hidden',
      position:'relative',
      backgroundColor: 'rgba(255,255,255,0.85)',
    }}>
      <Head>
        <title>تطبيق عقارات عالمي</title>
        <meta name="description" content="تصفح أفضل الوحدات والمشروعات العقارية في الوطن العربي" />
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
          {/* قائمة علوية موحدة */}
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <button
              onClick={handleMenuClick}
              style={{background:'#fff',color:'#00bcd4',border:'2px solid #00bcd4',borderRadius:'50%',width:44,height:44,fontWeight:'bold',fontSize:18,cursor:'pointer',boxShadow:'0 2px 8px #e0e0e0',transition:'all 0.2s'}}
              title="القائمة"
            >
              ☰
            </button>
            <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
              <MenuItem onClick={()=>{window.location.href='/about'; handleMenuClose();}}>من نحن</MenuItem>
              <MenuItem onClick={()=>{window.location.href='/partners'; handleMenuClose();}}>شركاؤنا</MenuItem>
              <MenuItem onClick={()=>{window.location.href='/contact'; handleMenuClose();}}>تواصل معنا</MenuItem>
              <MenuItem onClick={()=>{handleMenuClose(); /* المفضلة */}}>{i18n.language === 'ar' ? 'المفضلة' : 'Favorites'}</MenuItem>
              <MenuItem onClick={()=>{handleMenuClose(); /* المقارنة */}}>{i18n.language === 'ar' ? 'مقارنة الوحدات' : 'Compare Units'}</MenuItem>
              <MenuItem onClick={()=>{toggleLang(); handleMenuClose();}}>{i18n.language === 'ar' ? 'English' : 'العربية'}</MenuItem>
            </Menu>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <img src="/images/logo1.png" alt="logo" style={{width:36,marginLeft:8}} />
            <button
              onClick={() => window.location.href = '/login'}
              title={t('login') || 'تسجيل الدخول'}
              style={{background:'#00bcd4',border:'none',borderRadius:'50%',width:44,height:44,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 2px 8px #b2ebf2',cursor:'pointer',marginLeft:8}}
            >
              <FaUserCircle size={26} color="#fff" />
            </button>
          </div>
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
          {/* الشريط الكتابي المتحرك فقط بدون مربع أو ظل */}
          <div style={{
            width:'100%',
            overflow:'hidden',
            margin:'0 auto 0 auto',
            direction: i18n.language === 'ar' ? 'rtl' : 'ltr',
            background: 'none',
            borderRadius: 0,
            padding: 0,
          }}>
            <div style={{
              display:'inline-block',
              whiteSpace:'nowrap',
              animation:`marquee ${marquee.speed}s linear infinite`,
              color: marquee.color,
              fontWeight:'bold',
              fontSize: marquee.fontSize,
              fontFamily: marquee.fontFamily || 'Cairo, Tahoma, Arial, sans-serif',
              letterSpacing: 1,
              padding:'8px 0',
              minWidth:'100%'
            }}>
              {marquee.texts && marquee.texts.length > 0 ?
                marquee.texts.map((txt,i)=>{
                  if (typeof txt === 'string') return <span key={i} style={{marginRight:40}}>{txt}</span>;
                  if (typeof txt === 'object' && txt !== null) return <span key={i} style={{marginRight:40}}>{txt[i18n.language] || txt['ar'] || Object.values(txt)[0]}</span>;
                  return null;
                }) :
                <span>مرحباً بك في منصتنا العقارية!</span>
              }
            </div>
          </div>
          <style>{`
            @keyframes marquee {
              0% { transform: translateX(100%); }
              100% { transform: translateX(-100%); }
            }
          `}</style>
          {/* سلايدر الإعلانات أعلى الصفحة */}
          <div style={{width:'100%',overflow:'hidden',margin:'32px 0 8px 0',direction:'ltr'}}>
            <div style={{
              display:'flex',
              gap:24,
              animation:'slider-horizontal 24s linear infinite',
              alignItems:'center',
              minWidth:'100%'
            }}>
              {(sliderImages.length === 0 ? [
                {img: '/images/bg1.png', id: 1, details: 'إعلان افتراضي 1', link: '/ads/1'},
                {img: '/images/bg2.png', id: 2, details: 'إعلان افتراضي 2', link: '/ads/2'},
                {img: '/images/bg10.jpg', id: 3, details: 'إعلان افتراضي 3', link: '/ads/3'}
              ] : sliderImages.map((imgObj: any, i: number) => ({
                img: typeof imgObj === 'string' ? imgObj : imgObj.url,
                id: i,
                details: imgObj.title || `تفاصيل الإعلان ${i+1}`,
                link: imgObj.link || `/ads/${i}`
              }))).map((ad, i) => (
                <div key={i} style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
                  <a href={ad.link} style={{display:'block'}} target="_blank" rel="noopener noreferrer">
                    <img src={ad.img} alt={`ad${i}`} style={{height:120,borderRadius:16,boxShadow:'0 2px 8px #e0e0e0',cursor:'pointer'}} />
                  </a>
                  <span style={{marginTop:8,color:'#00bcd4',fontWeight:'bold',fontSize:16}}>{ad.details}</span>
                </div>
              ))}
            </div>
          </div>
          <style>{`
            @keyframes slider-horizontal {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
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
              <option value="أقساط">أقساط</option>
              <option value="إعادة بيع">إعادة بيع</option>
            </select>
            <input type="number" min="1" placeholder="الحد الأقصى للسعر ($)" value={pendingFilters.maxPrice || ''} onChange={e => handleFilterChange('maxPrice', e.target.value)} style={{fontSize:18,border:'1px solid #00bcd4',borderRadius:8,padding:8,minWidth:140,flex:'1 1 140px',marginLeft:8}} />
            <button onClick={applyFilters} style={{background:'#00bcd4',color:'#fff',border:'none',borderRadius:8,padding:'8px 24px',fontWeight:'bold',fontSize:16,marginLeft:8,cursor:'pointer'}}>بحث</button>
          </div>
          {/* الوحدات الأكثر مشاهدة بناءً على الفلترة */}
          <div style={{display:'flex',alignItems:'center',gap:8,margin:'24px 0 8px 0',justifyContent:'center'}}>
            <span style={{color:'#ff9800',fontWeight:'bold',fontSize:22}}>الوحدات المقترحة لك</span>
          </div>
          <Swiper spaceBetween={12} slidesPerView={2} style={{marginBottom: 32}}>
            {filteredProperties.slice(0, 10).map((property) => (
              <SwiperSlide key={property.id}>
                <div className="card" style={{cursor:'pointer',border:'2px solid #00bcd4',borderRadius:16,boxShadow:'0 2px 12px #e0e0e0',position:'relative'}} onClick={()=>window.location.href=`/property/${property.id}`}> 
                  <img src={property.image} alt={property.title} style={{width: '100%', height: 140, objectFit: 'cover', borderRadius: 12}} />
                  <div className="property-details">
                    <h3 style={{color:'#00bcd4',fontWeight:'bold'}}>{property.title}</h3>
                    <span style={{color:'#ff9800',fontWeight:'bold'}}>{property.location}</span>
                    <span style={{color:'#00e676',fontWeight:'bold'}}>{property.details}</span>
                  </div>
                  {/* أزرار مقارنة/مفضلة/مشاركة */}
                  <div style={{position:'absolute',top:8,left:8,display:'flex',gap:8}}>
                    <button title="مقارنة" style={{background:'#fff',border:'1.5px solid #00bcd4',borderRadius:8,padding:4,cursor:'pointer'}}>🔄</button>
                    <button title="مفضلة" style={{background:'#fff',border:'1.5px solid #ff9800',borderRadius:8,padding:4,cursor:'pointer'}}>⭐</button>
                    <button title="مشاركة" style={{background:'#fff',border:'1.5px solid #2196f3',borderRadius:8,padding:4,cursor:'pointer'}}>🔗</button>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          {/* الدردشة الذكية العائمة */}
          <div style={{position:'fixed',bottom:24,right:24,zIndex:9999}}>
            {!chatOpen && (
              <button onClick={()=>setChatOpen(true)

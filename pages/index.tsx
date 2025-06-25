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
                {img: '/images/bg1.png', id: 1, details: 'إعلان افتراضي 1'},
                {img: '/images/bg2.png', id: 2, details: 'إعلان افتراضي 2'},
                {img: '/images/bg10.jpg', id: 3, details: 'إعلان افتراضي 3'}
              ] : sliderImages.map((img, i) => ({img, id: i, details: `تفاصيل الإعلان ${i+1}`}))).map((ad, i) => (
                <div key={i} style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
                  <a href={`/ads/${ad.id}`} style={{display:'block'}}>
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
          {/* شريط إعلانات متحرك ديناميكي من لوحة التحكم */}
          <div style={{
            width:'100%',
            overflow:'hidden',
            margin:'0 auto 16px auto',
            direction: i18n.language === 'ar' ? 'rtl' : 'ltr',
            background: 'linear-gradient(90deg,#00bcd4 0%,#2196f3 100%)',
            borderRadius: 16,
            boxShadow: '0 2px 16px #00bcd422',
            padding: '8px 0',
            marginBottom: 16
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
          </div>
          {/* الوحدات الأكثر مشاهدة بناءً على الفلترة */}
          <div style={{display:'flex',alignItems:'center',gap:8,margin:'24px 0 8px 0',justifyContent:'center'}}>
            <img src="/images/logo1.png" alt="logo" style={{width:36}} />
            <span style={{color:'#ff9800',fontWeight:'bold',fontSize:22}}>الوحدات المقترحة لك</span>
            <span style={{background:'#00bcd4',color:'#fff',borderRadius:8,padding:'2px 10px',fontSize:14,marginRight:8}}>ذكاء اصطناعي</span>
          </div>
          <Swiper spaceBetween={12} slidesPerView={2} style={{marginBottom: 32}}>
            {filteredProperties.slice(0, 10).map((property) => (
              <SwiperSlide key={property.id}>
                <div className="card" style={{cursor:'pointer',border:'2px solid #00bcd4',borderRadius:16,boxShadow:'0 2px 12px #e0e0e0'}} onClick={()=>window.location.href=`/property/${property.id}`}> 
                  <img src={property.image} alt={property.title} style={{width: '100%', height: 140, objectFit: 'cover', borderRadius: 12}} />
                  <div className="property-details">
                    <h3 style={{color:'#00bcd4',fontWeight:'bold'}}>{property.title}</h3>
                    <span style={{color:'#ff9800',fontWeight:'bold'}}>{property.location}</span>
                    <span style={{color:'#00e676',fontWeight:'bold'}}>{property.details}</span>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
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
      <footer style={{height:80}} />
      {/* شريط مهام سفلي للأيقونات */}
      <nav style={{
        position:'fixed',
        bottom:0,
        left:0,
        width:'100vw',
        background:'rgba(255,255,255,0.85)',
        boxShadow:'0 -2px 16px #00bcd422',
        display:'flex',
        justifyContent:'center',
        alignItems:'center',
        gap:32,
        padding:'12px 0',
        zIndex:1000
      }}>
        <button onClick={()=>window.location.href='/about'} title="من نحن" style={{background:'rgba(0,188,212,0.12)',border:'2px solid #00bcd4',borderRadius:'50%',width:44,height:44,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 2px 8px #e0e0e0',cursor:'pointer',transition:'all 0.2s',color:'#00bcd4',fontSize:22}}>
          <span role="img" aria-label="about">👤</span>
        </button>
        <button onClick={()=>window.location.href='/partners'} title="شركاؤنا" style={{background:'rgba(255,152,0,0.12)',border:'2px solid #ff9800',borderRadius:'50%',width:44,height:44,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 2px 8px #e0e0e0',cursor:'pointer',transition:'all 0.2s',color:'#ff9800',fontSize:22}}>
          <span role="img" aria-label="partners">🤝</span>
        </button>
        <button onClick={()=>setShowContacts(!showContacts)} title="تواصل معنا" style={{background:'rgba(76,175,80,0.12)',border:'2px solid #4caf50',borderRadius:'50%',width:44,height:44,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 2px 8px #e0e0e0',cursor:'pointer',transition:'all 0.2s',color:'#4caf50',fontSize:22}}>
          <span role="img" aria-label="contact">✉️</span>
        </button>
      </nav>
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
        {Array.isArray(contacts) && contacts.map((c, i) => {
          let Icon = null;
          switch ((c.icon||'').toLowerCase()) {
            case 'whatsapp': Icon = FaWhatsapp; break;
            case 'phone': Icon = FaPhone; break;
            case 'facebook': Icon = FaFacebook; break;
            case 'snapchat': Icon = FaSnapchatGhost; break;
            case 'twitter': Icon = FaTwitter; break;
            case 'instagram': Icon = FaInstagram; break;
            case 'telegram': Icon = FaTelegram; break;
            case 'discord': Icon = FaDiscord; break;
            case 'gmail': Icon = FaEnvelope; break;
            default: Icon = FaEnvelope;
          }
          // تحديد نوع الرابط (tel/mailto/https)
          let href = c.url;
          if (c.icon === 'whatsapp') href = `https://wa.me/${c.url}`;
          else if (c.icon === 'phone') href = `tel:${c.url}`;
          else if (c.icon === 'gmail') href = c.url.startsWith('mailto:') ? c.url : `mailto:${c.url}`;
          return (
            <a key={c.id||i} href={href} target="_blank" rel="noopener noreferrer" style={{color:'#00bcd4',fontSize:28}} title={c.platform}>
              {Icon ? <Icon /> : c.platform}
            </a>
          );
        })}
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

import React, { useEffect, useState } from 'react';
import { developers } from '../data/developers';
import { db } from '../data/firebase';
import { collection, addDoc, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { defaultContacts, ContactLinks } from '../data/contacts';
import { doc as fsDoc, getDoc, setDoc } from 'firebase/firestore';
import { compounds } from '../data/compounds';
import DashboardStats from './DashboardStats';
import CRM from './CRM';
import Reviews from './Reviews';
import DemoEmployees from './DemoEmployees';
import CompareUnits from './CompareUnits';
import NotificationBox from './NotificationBox';
import ExportCSV from './ExportCSV';
import VoiceSearch from './VoiceSearch';
import SmartChat from './SmartChat';
// import AnalyticsBox from './AnalyticsBox';
import GlassSidebarDeep from './GlassSidebarDeep';
import EmployeesPanel from './EmployeesPanel';
import UnitsPanel from './UnitsPanel';
import DevelopersPanel from './DevelopersPanel';
import MarketersPanel from './MarketersPanel';
import BottomGlassNav from './BottomGlassNav';
import CompoundsPanel from './CompoundsPanel';
import AdsPanel from './AdsPanel';
import AboutPanel from './AboutPanel';
import PartnersPanel from './PartnersPanel';
import ContactsPanel from './ContactsPanel';
import SettingsPanel from './SettingsPanel';

console.log('=== AdminPanel.tsx Mounted ===');
let debugStep = 'AdminPanel mounted';

const TABS = [
  { key: 'dashboard', label: 'لوحة البيانات' },
  { key: 'units', label: 'الوحدات' },
  { key: 'compounds', label: 'الكمباوندات' },
  { key: 'employees', label: 'الموظفون' },
  { key: 'ads', label: 'الإعلانات' },
  { key: 'about', label: 'من نحن' },
  { key: 'partners', label: 'شركاؤنا' },
  { key: 'contacts', label: 'تواصل معنا' },
  { key: 'settings', label: 'الإعدادات' },
];

function usePersistedState<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') return initial;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initial;
  });
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(state));
  }, [state, key]);
  return [state, setState] as const;
}

const AdminPanel: React.FC = () => {
  const [section, setSection] = useState('dashboard');
  // جلب المستخدم الحالي من localStorage
  const [currentUser, setCurrentUser] = useState<any>(null);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const u = localStorage.getItem('admin-current-user');
      if (u) setCurrentUser(JSON.parse(u));
    }
  }, []);

  // صلاحيات الأدوار
  const allowedTabs = ['الوحدات', 'المطورين', 'المستخدمون', 'الإعلانات', 'الإعدادات'];

  // وحدات Firestore
  const [units, setUnits] = useState<any[]>([]);
  const [unitForm, setUnitForm] = useState<{
    title: string;
    type: string;
    details: string;
    area: string;
    rooms: string;
    bathrooms: string;
    kitchens: string;
    hasGarden: boolean;
    hasPool: boolean;
    phone: string;
    whatsapp: string;
    lat: string;
    lng: string;
    images: File[];
    vrUrl: string;
    panoramaUrl: string;
    model3dUrl: string;
    developerId: string;
    compound: string;
    price: string;
    paymentType: string;
    finance: string;
  }>({
    title: '', type: '', details: '', area: '', rooms: '', bathrooms: '', kitchens: '', hasGarden: false, hasPool: false, phone: '', whatsapp: '', lat: '', lng: '', images: [], vrUrl: '', panoramaUrl: '', model3dUrl: '', developerId: '', compound: '', price: '', paymentType: '', finance: ''
  });
  // مطورين Firestore
  const [devs, setDevs] = useState<any[]>([]);
  const [devForm, setDevForm] = useState({ name: '', country: '' });
  // مستخدمين Firestore
  const [users, setUsers] = useState<any[]>([]);
  const [userForm, setUserForm] = useState({ name: '', username: '', password: '', role: 'موظف' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  // بيانات التواصل
  const [contacts, setContacts] = useState<ContactLinks>(defaultContacts);
  const [contactsLoading, setContactsLoading] = useState(false);
  // --- من نحن ---
  const [aboutText, setAboutText] = useState('');
  const [aboutLoading, setAboutLoading] = useState(false);
  // --- الشركاء ---
  const [partners, setPartners] = useState<any[]>([]);
  const [partnerForm, setPartnerForm] = useState({ name: '', url: '', image: '' });
  const [partnerImageFile, setPartnerImageFile] = useState<File|null>(null);
  const [partnersLoading, setPartnersLoading] = useState(false);
  // --- إعدادات الشريط المتحرك ---
  const [marquee, setMarquee] = useState({ texts: ["فرحنا بوجودك معنا!"], speed: 30, color: "#ff9800", fontSize: 20 });
  const [marqueeLoading, setMarqueeLoading] = useState(false);
  // --- سلايدر الصور ---
  const [sliderImages, setSliderImages] = useState<string[]>([]);
  const [sliderLoading, setSliderLoading] = useState(false);
  const [sliderFiles, setSliderFiles] = useState<File[]>([]);
  // --- صور من نحن ---
  const [aboutImages, setAboutImages] = useState<string[]>([]);
  const [aboutImageFiles, setAboutImageFiles] = useState<File[]>([]);
  const [aboutImagesLoading, setAboutImagesLoading] = useState(false);
  // الكمباوندات
  const [compoundsList, setCompoundsList] = useState<any[]>([]);
  const [compoundForm, setCompoundForm] = useState({ name: '', city: '', country: '', developer: '', logo: '' });
  const [showAddDev, setShowAddDev] = useState(false);
  const [showAddCompound, setShowAddCompound] = useState(false);

  const auth = getAuth();

  // جلب المطورين من Firestore بشكل لحظي
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'developers'), (snapshot) => {
      setDevs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);
  // جلب الوحدات من Firestore بشكل لحظي
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'units'), (snapshot) => {
      setUnits(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);
  // جلب المستخدمين من Firestore بشكل لحظي
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);
  // جلب بيانات التواصل من Firestore
  useEffect(() => {
    const fetchContacts = async () => {
      setContactsLoading(true);
      try {
        const ref = fsDoc(db, 'settings', 'contacts');
        const snap = await getDoc(ref);
        if (snap.exists()) setContacts(snap.data() as ContactLinks);
      } catch {}
      setContactsLoading(false);
    };
    fetchContacts();
  }, []);
  // جلب نص "من نحن" من Firestore
  useEffect(() => {
    const fetchAbout = async () => {
      setAboutLoading(true);
      try {
        const ref = fsDoc(db, 'settings', 'about');
        const snap = await getDoc(ref);
        if (snap.exists()) setAboutText(snap.data().text || '');
      } catch {}
      setAboutLoading(false);
    };
    fetchAbout();
  }, []);
  // جلب الشركاء من Firestore
  useEffect(() => {
    const fetchPartners = async () => {
      setPartnersLoading(true);
      try {
        const ref = fsDoc(db, 'settings', 'partners');
        const snap = await getDoc(ref);
        if (snap.exists()) setPartners(snap.data().list || []);
      } catch {}
      setPartnersLoading(false);
    };
    fetchPartners();
  }, []);
  // جلب إعدادات الشريط المتحرك من Firestore
  useEffect(() => {
    const fetchMarquee = async () => {
      setMarqueeLoading(true);
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
      setMarqueeLoading(false);
    };
    fetchMarquee();
  }, []);
  // جلب صور السلايدر من Firestore
  useEffect(() => {
    const fetchSlider = async () => {
      setSliderLoading(true);
      try {
        const ref = fsDoc(db, 'settings', 'slider');
        const snap = await getDoc(ref);
        if (snap.exists()) setSliderImages(snap.data().images || []);
      } catch {}
      setSliderLoading(false);
    };
    fetchSlider();
  }, []);
  // جلب صور من نحن من Firestore
  useEffect(() => {
    const fetchAboutImages = async () => {
      setAboutImagesLoading(true);
      try {
        const ref = fsDoc(db, 'settings', 'about');
        const snap = await getDoc(ref);
        if (snap.exists()) setAboutImages(snap.data().images || []);
      } catch {}
      setAboutImagesLoading(false);
    };
    fetchAboutImages();
  }, []);
  // جلب الكمباوندات من Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'compounds'), (snapshot) => {
      setCompoundsList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  // إضافة وحدة إلى Firestore
  const handleAddUnit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      // رفع الصور إلى Firebase Storage إذا تم اختيارها
      let imageUrls: string[] = [];
      if (unitForm.images && unitForm.images.length > 0) {
        const storageRef = (await import('firebase/storage')).ref;
        const { getStorage, uploadBytes, getDownloadURL } = await import('firebase/storage');
        const storage = getStorage();
        for (const img of unitForm.images) {
          const imgRef = storageRef(storage, `units/${Date.now()}_${img.name}`);
          await uploadBytes(imgRef, img);
          const url = await getDownloadURL(imgRef);
          imageUrls.push(url);
        }
      }
      await addDoc(collection(db, 'units'), {
        ...unitForm,
        images: imageUrls,
        price: unitForm.price,
        paymentType: unitForm.paymentType,
        finance: unitForm.finance,
        developerId: unitForm.developerId,
        compound: unitForm.compound,
        area: unitForm.area,
        rooms: unitForm.rooms,
        bathrooms: unitForm.bathrooms,
        kitchens: unitForm.kitchens,
        hasGarden: unitForm.hasGarden,
        hasPool: unitForm.hasPool,
        phone: unitForm.phone,
        whatsapp: unitForm.whatsapp,
        lat: unitForm.lat,
        lng: unitForm.lng,
        vrUrl: unitForm.vrUrl,
        panoramaUrl: unitForm.panoramaUrl,
        model3dUrl: unitForm.model3dUrl
      });
      setUnitForm({
        title: '', type: '', details: '', area: '', rooms: '', bathrooms: '', kitchens: '', hasGarden: false, hasPool: false, phone: '', whatsapp: '', lat: '', lng: '', images: [], vrUrl: '', panoramaUrl: '', model3dUrl: '', developerId: '', compound: '', price: '', paymentType: '', finance: ''
      });
      setSuccess('تمت إضافة الوحدة بنجاح!');
      setError(null);
    } catch (err: any) {
      setError('خطأ في إضافة الوحدة: ' + (err?.message || String(err)));
      setSuccess(null);
    }
    setLoading(false);
  };
  // حذف وحدة من Firestore
  const handleDeleteUnit = async (id: string) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'units', id));
      setSuccess('تم حذف الوحدة بنجاح!');
      setError(null);
    } catch (err: any) {
      setError('خطأ في الحذف: ' + (err?.message || String(err)));
      setSuccess(null);
    }
    setLoading(false);
  };
  // إضافة مطور إلى Firestore
  const handleAddDev = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'developers'), devForm);
      setDevForm({ name: '', country: '' });
      setSuccess('تمت إضافة المطور بنجاح!');
      setError(null);
    } catch (err: any) {
      setError('خطأ في إضافة المطور: ' + (err?.message || String(err)));
      setSuccess(null);
    }
    setLoading(false);
  };
  // حذف مطور من Firestore
  const handleDeleteDev = async (id: string) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'developers', id));
      setSuccess('تم حذف المطور بنجاح!');
      setError(null);
    } catch (err: any) {
      setError('خطأ في الحذف: ' + (err?.message || String(err)));
      setSuccess(null);
    }
    setLoading(false);
  };
  // إضافة مستخدم إلى Firestore + Firebase Auth
  const handleAddUser = async (e: any) => {
    e.preventDefault();
    if (!userForm.name || !userForm.username || !userForm.password) {
      setError('يرجى ملء جميع الحقول');
      return;
    }
    if (users.some(u => u.username === userForm.username)) {
      setError('اسم المستخدم مستخدم بالفعل');
      return;
    }
    setLoading(true);
    try {
      // إنشاء مستخدم في Firebase Auth (بريد إلكتروني وهمي)
      const email = userForm.username + '@app.local';
      const cred = await createUserWithEmailAndPassword(auth, email, userForm.password);
      await updateProfile(cred.user, { displayName: userForm.name });
      // إضافة المستخدم إلى Fire
      await addDoc(collection(db, 'users'), {
        name: userForm.name,
        username: userForm.username,
        role: userForm.role,
        uid: cred.user.uid
      });
      setUserForm({ name: '', username: '', password: '', role: 'موظف' });
      setSuccess('تمت إضافة المستخدم وتفعيله بنجاح!');
      setError(null);
    } catch (err: any) {
      setError('خطأ في إضافة المستخدم: ' + (err?.message || String(err)));
      setSuccess(null);
    }
    setLoading(false);
  };
  // حذف مستخدم من Firestore
  const handleDeleteUser = async (id: string) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'users', id));
      setSuccess('تم حذف المستخدم بنجاح!');
      setError(null);
    } catch (err: any) {
      setError('خطأ في الحذف: ' + (err?.message || String(err)));
      setSuccess(null);
    }
    setLoading(false);
  };
  // حفظ بيانات التواصل
  const handleSaveContacts = async (e: any) => {
    e.preventDefault();
    setContactsLoading(true);
    try {
      const ref = fsDoc(db, 'settings', 'contacts');
      await setDoc(ref, contacts);
      setSuccess('تم حفظ بيانات التواصل بنجاح!');
      setError(null);
    } catch (err: any) {
      setError('خطأ في حفظ بيانات التواصل: ' + (err?.message || String(err)));
      setSuccess(null);
    }
    setContactsLoading(false);
  };
  // حفظ نص "من نحن"
  const handleSaveAbout = async (e: any) => {
    e.preventDefault();
    setAboutLoading(true);
    try {
      const ref = fsDoc(db, 'settings', 'about');
      await setDoc(ref, { text: aboutText });
      setSuccess('تم حفظ نبذة من نحن بنجاح!');
      setError(null);
    } catch (err: any) {
      setError('خطأ في حفظ نبذة من نحن: ' + (err?.message || String(err)));
      setSuccess(null);
    }
    setAboutLoading(false);
  };
  // إضافة شريك جديد
  const handleAddPartner = async (e: any) => {
    e.preventDefault();
    setPartnersLoading(true);
    try {
      let imageUrl = partnerForm.image;
      if (partnerImageFile) {
        const { getStorage, ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
        const storage = getStorage();
        const imgRef = ref(storage, `partners/${Date.now()}_${partnerImageFile.name}`);
        await uploadBytes(imgRef, partnerImageFile);
        imageUrl = await getDownloadURL(imgRef);
      }
      const newPartner = { name: partnerForm.name, url: partnerForm.url, image: imageUrl };
      const refDoc = fsDoc(db, 'settings', 'partners');
      const snap = await getDoc(refDoc);
      let list = snap.exists() ? (snap.data().list || []) : [];
      list.push(newPartner);
      await setDoc(refDoc, { list });
      setPartners(list);
      setPartnerForm({ name: '', url: '', image: '' });
      setPartnerImageFile(null);
      setSuccess('تم إضافة الشريك بنجاح!');
      setError(null);
    } catch (err: any) {
      setError('خطأ في إضافة الشريك: ' + (err?.message || String(err)));
      setSuccess(null);
    }
    setPartnersLoading(false);
  };
  // حذف شريك
  const handleDeletePartner = async (idx: number) => {
    setPartnersLoading(true);
    try {
      const refDoc = fsDoc(db, 'settings', 'partners');
      const snap = await getDoc(refDoc);
      let list = snap.exists() ? (snap.data().list || []) : [];
      list.splice(idx, 1);
      await setDoc(refDoc, { list });
      setPartners(list);
      setSuccess('تم حذف الشريك بنجاح!');
      setError(null);
    } catch (err: any) {
      setError('خطأ في حذف الشريك: ' + (err?.message || String(err)));
      setSuccess(null);
    }
    setPartnersLoading(false);
  };
  // حفظ إعدادات الشريط المتحرك
  const handleSaveMarquee = async (e: any) => {
    e.preventDefault();
    setMarqueeLoading(true);
    try {
      const ref = fsDoc(db, 'settings', 'marquee');
      await setDoc(ref, marquee);
      setSuccess('تم حفظ إعدادات الشريط المتحرك بنجاح!');
      setError(null);
    } catch (err: any) {
      setError('خطأ في حفظ إعدادات الشريط: ' + (err?.message || String(err)));
      setSuccess(null);
    }
    setMarqueeLoading(false);
  };
  // إضافة صور للسلايدر
  const handleAddSliderImages = async (e: any) => {
    e.preventDefault();
    setSliderLoading(true);
    try {
      const { getStorage, ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
      const storage = getStorage();
      let newImages: string[] = [];
      for (const file of sliderFiles) {
        const imgRef = ref(storage, `slider/${Date.now()}_${file.name}`);
        await uploadBytes(imgRef, file);
        const url = await getDownloadURL(imgRef);
        newImages.push(url);
      }
      const allImages = [...sliderImages, ...newImages];
      const refDoc = fsDoc(db, 'settings', 'slider');
      await setDoc(refDoc, { images: allImages });
      setSliderImages(allImages);
      setSliderFiles([]);
      setSuccess('تمت إضافة الصور للسلايدر بنجاح!');
      setError(null);
    } catch (err: any) {
      setError('خطأ في رفع صور السلايدر: ' + (err?.message || String(err)));
      setSuccess(null);
    }
    setSliderLoading(false);
  };
  // حذف صورة من السلايدر
  const handleDeleteSliderImage = async (idx: number) => {
    setSliderLoading(true);
    try {
      const allImages = sliderImages.filter((_,i)=>i!==idx);
      const refDoc = fsDoc(db, 'settings', 'slider');
      await setDoc(refDoc, { images: allImages });
      setSliderImages(allImages);
      setSuccess('تم حذف الصورة من السلايدر!');
      setError(null);
    } catch (err: any) {
      setError('خطأ في حذف صورة السلايدر: ' + (err?.message || String(err)));
      setSuccess(null);
    }
    setSliderLoading(false);
  };
  // إضافة صور من نحن
  const handleAddAboutImages = async (e: any) => {
    e.preventDefault();
    setAboutImagesLoading(true);
    try {
      const { getStorage, ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
      const storage = getStorage();
      let newImages: string[] = [];
      for (const file of aboutImageFiles) {
        const imgRef = ref(storage, `about/${Date.now()}_${file.name}`);
        await uploadBytes(imgRef, file);
        const url = await getDownloadURL(imgRef);
        newImages.push(url);
      }
      const allImages = [...aboutImages, ...newImages];
      const refDoc = fsDoc(db, 'settings', 'about');
      const snap = await getDoc(refDoc);
      const text = snap.exists() ? (snap.data().text || '') : '';
      await setDoc(refDoc, { text, images: allImages });
      setAboutImages(allImages);
      setAboutImageFiles([]);
      setSuccess('تمت إضافة الصور بنجاح!');
      setError(null);
    } catch (err: any) {
      setError('خطأ في رفع صور من نحن: ' + (err?.message || String(err)));
      setSuccess(null);
    }
    setAboutImagesLoading(false);
  };
  // حذف صورة من نحن
  const handleDeleteAboutImage = async (idx: number) => {
    setAboutImagesLoading(true);
    try {
      const refDoc = fsDoc(db, 'settings', 'about');
      const snap = await getDoc(refDoc);
      const text = snap.exists() ? (snap.data().text || '') : '';
      let allImages = aboutImages.filter((_,i)=>i!==idx);
      await setDoc(refDoc, { text, images: allImages });
      setAboutImages(allImages);
      setSuccess('تم حذف الصورة!');
      setError(null);
    } catch (err: any) {
      setError('خطأ في حذف صورة من نحن: ' + (err?.message || String(err)));
      setSuccess(null);
    }
    setAboutImagesLoading(false);
  };
  // إضافة مطور افتراضي سريع
  const handleQuickAddDev = async (dev: any) => {
    setLoading(true);
    try {
      await addDoc(collection(db, 'developers'), { name: dev.name, country: dev.country, logo: dev.logo||'' });
      setSuccess('تمت إضافة المطور بنجاح!');
      setError(null);
    } catch (err: any) {
      setError('خطأ في إضافة المطور: ' + (err?.message || String(err)));
      setSuccess(null);
    }
    setLoading(false);
  };
  // إضافة كمباوند افتراضي سريع
  const handleQuickAddCompound = async (cmp: any) => {
    setLoading(true);
    try {
      await addDoc(collection(db, 'compounds'), cmp);
      setSuccess('تمت إضافة الكمباوند بنجاح!');
      setError(null);
    } catch (err: any) {
      setError('خطأ في إضافة الكمباوند: ' + (err?.message || String(err)));
      setSuccess(null);
    }
    setLoading(false);
  };
  // إضافة مطور جديد من النموذج
  const handleAddDevInline = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'developers'), devForm);
      setDevForm({ name: '', country: '' });
      setShowAddDev(false);
      setSuccess('تمت إضافة المطور بنجاح!');
      setError(null);
    } catch (err: any) {
      setError('خطأ في إضافة المطور: ' + (err?.message || String(err)));
      setSuccess(null);
    }
    setLoading(false);
  };
  // إضافة كمباوند جديد من النموذج
  const handleAddCompoundInline = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'compounds'), compoundForm);
      setCompoundForm({ name: '', city: '', country: '', developer: '', logo: '' });
      setShowAddCompound(false);
      setSuccess('تمت إضافة الكمباوند بنجاح!');
      setError(null);
    } catch (err: any) {
      setError('خطأ في إضافة الكمباوند: ' + (err?.message || String(err)));
      setSuccess(null);
    }
    setLoading(false);
  };

  const allTabs = [...TABS, { key: 'التواصل', label: 'روابط التواصل' }];

  // في return: تحسين التصميم ليكون بعرض الشاشة بالكامل
  return (
    <div style={{
      display:'flex',
      direction:'rtl',
      minHeight:'100vh',
      width:'100vw',
      background:'linear-gradient(120deg,rgba(255,255,255,0.85) 0%,rgba(0,188,212,0.08) 100%)', // خلفية زجاجية بيضاء
      backdropFilter:'blur(24px)',
      boxShadow:'0 8px 48px 0 #00bcd422',
      borderRadius: '0 0 48px 48px',
      border:'none',
      overflow:'hidden',
      margin:0,
      padding:0
    }}>
      <GlassSidebarDeep section={section} setSection={setSection} />
      <div style={{
        flex:1,
        padding:'48px 2vw 48px 2vw',
        background:'rgba(255,255,255,0.55)',
        minHeight:'100vh',
        display:'flex',
        flexDirection:'column',
        borderRadius:'32px',
        boxShadow:'0 4px 32px #00bcd422',
        border:'1.5px solid rgba(0,188,212,0.08)',
        transition:'all 0.3s cubic-bezier(.4,2,.6,1)'
      }}>
        <div style={{flex:1}}>
          {/* تبويب الوحدات */}
          {section==='units' && (
            <UnitsPanel />
          )}
          {/* تبويب الكمباوندات */}
          {section==='compounds' && (
            <CompoundsPanel />
          )}
          {/* تبويب الموظفين */}
          {section==='employees' && (
            <EmployeesPanel />
          )}
          {/* تبويب الإعلانات */}
          {section==='ads' && (
            <AdsPanel />
          )}
          {/* تبويب من نحن */}
          {section==='about' && (
            <AboutPanel />
          )}
          {/* تبويب الشركاء */}
          {section==='partners' && (
            <PartnersPanel />
          )}
          {/* تبويب تواصل معنا */}
          {section==='contacts' && (
            <ContactsPanel />
          )}
          {/* تبويب الإعدادات */}
          {section==='settings' && (
            <SettingsPanel />
          )}
          {/* لوحة البيانات */}
          {section==='dashboard' && <DashboardStats />}
        </div>
        <BottomGlassNav />
      </div>
    </div>
  );
};

export default AdminPanel;

// قسم التحليلات الواقعية وعداد الزوار
const RealAnalyticsPanel = () => {
  const [visits, setVisits] = useState<number>(0);
  const [uniqueVisitors, setUniqueVisitors] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // جلب بيانات الزيارات من Firestore (collection: 'analytics', doc: 'visits')
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const { doc: fsDoc, getDoc } = await import('firebase/firestore');
        const { db } = await import('../data/firebase');
        const ref = fsDoc(db, 'analytics', 'visits');
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setVisits(snap.data().total || 0);
          setUniqueVisitors(snap.data().unique || 0);
        }
      } catch {}
      setLoading(false);
    };
    fetchAnalytics();
  }, []);

  return (
    <div style={{marginTop:48,background:'rgba(255,255,255,0.22)',borderRadius:24,padding:24,boxShadow:'0 2px 16px #00bcd422',backdropFilter:'blur(16px)',border:'1.5px solid rgba(255,255,255,0.25)',color:'#222',fontWeight:'bold',fontSize:18}}>
      <div style={{fontSize:22,marginBottom:16}}>تحليلات واقعية وزوار المنصة</div>
      {loading ? 'جاري تحميل البيانات...' : (
        <ul style={{lineHeight:2}}>
          <li>إجمالي الزيارات: <span style={{color:'#00bcd4'}}>{visits}</span></li>
          <li>عدد الزوار الفريدين: <span style={{color:'#4caf50'}}>{uniqueVisitors}</span></li>
          <li>آخر تحديث: {new Date().toLocaleString('ar-EG')}</li>
        </ul>
      )}
      <div style={{marginTop:16,fontSize:15,color:'#607d8b',fontWeight:'normal'}}>هذه البيانات حقيقية ومحدثة من قاعدة البيانات.</div>
    </div>
  );
};

// قسم تحليلات المشاهدات والزوار والمستخدمين
const ViewsAnalyticsPanel = () => {
  const [analytics, setAnalytics] = useState({
    visits: 0,
    uniqueVisitors: 0,
    activeUsers: 0,
    shares: 0,
    coOwners: 0,
    coRenters: 0,
    topUnit: '',
    topCity: '',
    loading: true
  });

  useEffect(() => {
    // جلب بيانات التحليلات من Firestore (أو خدمة مستقبلية)
    const fetchAnalytics = async () => {
      setAnalytics(a => ({...a, loading:true}));
      try {
        const { doc: fsDoc, getDoc } = await import('firebase/firestore');
        const { db } = await import('../data/firebase');
        // زيارات وزوار
        const visitsRef = fsDoc(db, 'analytics', 'visits');
        const visitsSnap = await getDoc(visitsRef);
        // مستخدمين نشطين
        const activeRef = fsDoc(db, 'analytics', 'activeUsers');
        const activeSnap = await getDoc(activeRef);
        // المشاركات
        const sharesRef = fsDoc(db, 'analytics', 'shares');
        const sharesSnap = await getDoc(sharesRef);
        // المشاركين في الملكية/الإيجار
        const coRef = fsDoc(db, 'analytics', 'coOwnership');
        const coSnap = await getDoc(coRef);
        // أكثر وحدة مشاهدة
        const topUnit = visitsSnap.exists() ? (visitsSnap.data().topUnit || '') : '';
        // أكثر مدينة طلبًا
        const topCity = visitsSnap.exists() ? (visitsSnap.data().topCity || '') : '';
        setAnalytics({
          visits: visitsSnap.exists() ? (visitsSnap.data().total || 0) : 0,
          uniqueVisitors: visitsSnap.exists() ? (visitsSnap.data().unique || 0) : 0,
          activeUsers: activeSnap.exists() ? (activeSnap.data().count || 0) : 0,
          shares: sharesSnap.exists() ? (sharesSnap.data().count || 0) : 0,
          coOwners: coSnap.exists() ? (coSnap.data().owners || 0) : 0,
          coRenters: coSnap.exists() ? (coSnap.data().renters || 0) : 0,
          topUnit,
          topCity,
          loading: false
        });
      } catch {
        setAnalytics(a => ({...a, loading:false}));
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div style={{marginTop:48,background:'rgba(255,255,255,0.28)',borderRadius:24,padding:32,boxShadow:'0 2px 24px #00bcd422',backdropFilter:'blur(18px)',border:'1.5px solid rgba(255,255,255,0.25)',color:'#222',fontWeight:'bold',fontSize:18}}>
      <div style={{fontSize:22,marginBottom:16}}>تحليلات المشاهدات والزوار والمستخدمين</div>
      {analytics.loading ? 'جاري تحميل البيانات...' : (
        <div style={{display:'flex',gap:32,flexWrap:'wrap',justifyContent:'center'}}>
          <AnalyticsBox label="إجمالي الزيارات" value={analytics.visits} color="#00bcd4" />
          <AnalyticsBox label="الزوار الفريدون" value={analytics.uniqueVisitors} color="#4caf50" />
          <AnalyticsBox label="المستخدمون النشطون الآن" value={analytics.activeUsers} color="#ff9800" />
          <AnalyticsBox label="عدد المشاركات" value={analytics.shares} color="#3f51b5" />
          <AnalyticsBox label="مشاركون في الملكية" value={analytics.coOwners} color="#e91e63" />
          <AnalyticsBox label="مشاركون في الإيجار" value={analytics.coRenters} color="#607d8b" />
        </div>
      )}
      {!analytics.loading && (
        <div style={{marginTop:32,fontSize:16,fontWeight:'normal',color:'#333'}}>
          <div>أكثر وحدة مشاهدة: <b>{analytics.topUnit || '-'}</b></div>
          <div>أكثر مدينة طلبًا: <b>{analytics.topCity || '-'}</b></div>
          <div style={{marginTop:16,color:'#888'}}>هذه البيانات حقيقية ومحدثة من قاعدة البيانات. يدعم النظام مستقبلًا تتبع المشاركة في الملكية والإيجار عبر العقود الذكية وNFT.</div>
        </div>
      )}
    </div>
  );
};

// مكون AnalyticsBox الزجاجي
const AnalyticsBox = ({label, value, color}:{label:string,value:number,color:string}) => (
  <div style={{
    background:'rgba(255,255,255,0.35)',
    borderRadius:16,
    padding:'18px 32px',
    minWidth:200,
    boxShadow:'0 2px 12px #00bcd433',
    display:'flex',
    flexDirection:'column',
    alignItems:'center',
    border:'1.5px solid rgba(255,255,255,0.18)',
    marginBottom:8
  }}>
    <div style={{fontSize:28,fontWeight:'bold',color,marginBottom:4}}>{value}</div>
    <div style={{fontWeight:'bold',color:'#222',fontSize:15}}>{label}</div>
  </div>
);

// مكون البحث الذكي (كتابي/صوتي) مع اقتراح وحدات
const SmartUnitSearch: React.FC<{units:any[]}> = ({ units }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [listening, setListening] = useState(false);
  // البحث التلقائي عند الكتابة
  useEffect(() => {
    if (!query) { setResults([]); return; }
    const q = query.trim().toLowerCase();
    setResults(units.filter(u =>
      (u.title||'').toLowerCase().includes(q) ||
      (u.type||'').toLowerCase().includes(q) ||
      (u.area||'').toLowerCase().includes(q) ||
      (u.price||'').toLowerCase().includes(q)
    ));
  }, [query, units]);
  // البحث الصوتي
  const handleVoice = () => {
    if (!('webkitSpeechRecognition' in window)) return alert('المتصفح لا يدعم البحث الصوتي');
    const rec = new (window as any).webkitSpeechRecognition();
    rec.lang = 'ar-EG';
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onresult = (e:any) => {
      const text = e.results[0][0].transcript;
      setQuery(text);
      // تحديث النتائج مباشرة بعد انتهاء التسجيل
      const q = text.trim().toLowerCase();
      setResults(units.filter(u =>
        (u.title||'').toLowerCase().includes(q) ||
        (u.type||'').toLowerCase().includes(q) ||
        (u.area||'').toLowerCase().includes(q) ||
        (u.price||'').toLowerCase().includes(q)
      ));
    };
    rec.start();
  };
  return (
    <div style={{margin:'32px 0',background:'rgba(255,255,255,0.22)',borderRadius:20,padding:24,boxShadow:'0 2px 16px #00bcd422',backdropFilter:'blur(12px)',border:'1.5px solid rgba(255,255,255,0.18)',maxWidth:600}}>
      <div style={{display:'flex',gap:8,alignItems:'center'}}>
        <input
          value={query}
          onChange={e=>setQuery(e.target.value)}
          placeholder="ابحث عن وحدة (اسم، نوع، مساحة، سعر...)"
          style={{flex:1,padding:12,borderRadius:12,border:'none',fontSize:18,background:'rgba(255,255,255,0.35)',boxShadow:'0 1px 6px #00bcd422'}}
        />
        <button onClick={handleVoice} style={{background:listening?'#00bcd4':'#fff',color:listening?'#fff':'#00bcd4',border:'none',borderRadius:12,padding:'10px 16px',fontWeight:'bold',fontSize:18,cursor:'pointer',transition:'0.2s'}}>
          🎤
        </button>
      </div>
      {results.length > 0 && (
        <div style={{marginTop:16,background:'rgba(255,255,255,0.18)',borderRadius:16,padding:12,boxShadow:'0 1px 8px #00bcd422'}}>
          <div style={{fontWeight:'bold',color:'#00bcd4',marginBottom:8}}>الوحدات المقترحة:</div>
          <ul style={{listStyle:'none',padding:0,margin:0}}>
            {results.slice(0,8).map((u,i)=>(
              <li key={u.id||i} style={{padding:'8px 0',borderBottom:'1px solid #eee',display:'flex',gap:12,alignItems:'center'}}>
                <span style={{fontWeight:'bold',color:'#222'}}>{u.title||'وحدة'}</span>
                <span style={{color:'#607d8b',fontSize:15}}>{u.type} - {u.area}م - {u.price}ج</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

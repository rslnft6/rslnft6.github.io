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
import AnalyticsBox from './AnalyticsBox';

console.log('=== AdminPanel.tsx Mounted ===');
let debugStep = 'AdminPanel mounted';

const TABS = [
  { key: 'الوحدات', label: 'الوحدات' },
  { key: 'المطورين', label: 'المطورين' },
  { key: 'المستخدمون', label: 'المستخدمون' },
  { key: 'الإعلانات', label: 'الإعلانات' },
  { key: 'الإعدادات', label: 'الإعدادات' },
  { key: 'من نحن', label: 'من نحن' },
  { key: 'الشركاء', label: 'الشركاء' },
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
  const [tab, setTab] = useState('الوحدات');
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
      // إضافة المستخدم إلى Firestore
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

  return (
    <div>
      {/* لوحة الإحصائيات */}
      <DashboardStats />
      {/* نظام إدارة العملاء (CRM) */}
      <CRM />
      {/* نظام التقييمات والمراجعات */}
      <Reviews />
      {/* بيانات تجريبية للموظفين */}
      <DemoEmployees />
      {/* الإشعارات */}
      <NotificationBox />
      {/* مقارنة العقارات */}
      <CompareUnits />
      {/* تصدير البيانات */}
      <ExportCSV data={[]} filename="export.csv" />
      {/* البحث الصوتي */}
      <VoiceSearch onResult={(q: string) => alert('بحث صوتي: ' + q)} />
      {/* الدردشة الذكية */}
      <SmartChat />
      {/* التحليلات المتقدمة */}
      <AnalyticsBox />
      <div style={{display:'flex',gap:16,margin:'24px 0'}}>
        {TABS.map(t => (
          <button key={t.key} onClick={()=>setTab(t.key)} style={{
            background: tab===t.key?'#00bcd4':'#fff',
            color: tab===t.key?'#fff':'#00bcd4',
            border:'1px solid #00bcd4',
            borderRadius:8,padding:'8px 20px',fontWeight:'bold',fontSize:18,cursor:'pointer'
          }}>{t.label}</button>
        ))}
      </div>
      {/* الشريط الجانبي */}
      <div style={{minWidth:180,background:'#f5f7fa',borderRadius:16,padding:'24px 0',boxShadow:'0 2px 12px #e0e0e0',display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
        <div style={{fontWeight:'bold',fontSize:22,color:'#00bcd4',marginBottom:16}}>لوحة التحكم</div>
        {allTabs.filter(t => allowedTabs.includes(t.key) || t.key==='التواصل').map(t => (
          <button key={t.key} onClick={()=>setTab(t.key)} style={{
            background:tab===t.key?'#00bcd4':'#fff',
            color:tab===t.key?'#fff':'#222',
            border:'none',
            borderRadius:8,
            padding:'10px 18px',
            fontWeight:'bold',
            fontSize:17,
            cursor:'pointer',
            width:'90%',
            display:'flex',
            alignItems:'center',
            gap:10,
            boxShadow:tab===t.key?'0 2px 8px #b2ebf2':'none',
            transition:'all 0.2s'
          }}>{t.label}</button>
        ))}
        {currentUser && (
          <div style={{marginTop:24,color:'#888',fontSize:15}}>
            مرحباً، {currentUser.name} <br/>({currentUser.role})
            <button onClick={()=>{localStorage.removeItem('admin-current-user');window.location.reload();}} style={{marginTop:8,background:'#e53935',color:'#fff',border:'none',borderRadius:6,padding:'4px 14px',fontWeight:'bold',cursor:'pointer'}}>تسجيل خروج</button>
          </div>
        )}
      </div>
      {/* محتوى لوحة التحكم */}
      <div style={{background:'#fff',borderRadius:16,padding:24,boxShadow:'0 2px 16px #e0e0e0',flex:1,minWidth:320}}>
        <div style={{fontSize:22,color:'#00bcd4',fontWeight:'bold',marginBottom:16}}>{tab}</div>
        {success && <div style={{color:'#388e3c',marginBottom:12}}>{success}</div>}
        {error && <div style={{color:'red',marginBottom:12}}>{error}</div>}
        {/* الوحدات */}
        {tab==='الوحدات' && allowedTabs.includes('الوحدات') && (
          <div>
            <form onSubmit={handleAddUnit} style={{marginBottom:24,display:'flex',flexWrap:'wrap',gap:8}}>
              <input value={unitForm.title} onChange={e=>setUnitForm(f=>({...f,title:e.target.value}))} placeholder="اسم الوحدة" style={{margin:4,padding:8,borderRadius:8}} required />
              <input value={unitForm.type} onChange={e=>setUnitForm(f=>({...f,type:e.target.value}))} placeholder="نوع الوحدة" style={{margin:4,padding:8,borderRadius:8}} required />
              <input value={unitForm.details} onChange={e=>setUnitForm(f=>({...f,details:e.target.value}))} placeholder="تفاصيل" style={{margin:4,padding:8,borderRadius:8}} required />
              <input value={unitForm.area} onChange={e=>setUnitForm(f=>({...f,area:e.target.value}))} placeholder="المساحة (م²)" style={{margin:4,padding:8,borderRadius:8}} required />
              <input value={unitForm.rooms} onChange={e=>setUnitForm(f=>({...f,rooms:e.target.value}))} placeholder="عدد الغرف" style={{margin:4,padding:8,borderRadius:8}} required />
              <input value={unitForm.bathrooms} onChange={e=>setUnitForm(f=>({...f,bathrooms:e.target.value}))} placeholder="عدد الحمامات" style={{margin:4,padding:8,borderRadius:8}} required />
              <input value={unitForm.kitchens} onChange={e=>setUnitForm(f=>({...f,kitchens:e.target.value}))} placeholder="عدد المطابخ" style={{margin:4,padding:8,borderRadius:8}} />
              <label style={{margin:4}}><input type="checkbox" checked={unitForm.hasGarden} onChange={e=>setUnitForm(f=>({...f,hasGarden:e.target.checked}))}/> حديقة</label>
              <label style={{margin:4}}><input type="checkbox" checked={unitForm.hasPool} onChange={e=>setUnitForm(f=>({...f,hasPool:e.target.checked}))}/> حمام سباحة</label>
              <input value={unitForm.phone} onChange={e=>setUnitForm(f=>({...f,phone:e.target.value}))} placeholder="رقم الاتصال" style={{margin:4,padding:8,borderRadius:8}} />
              <input value={unitForm.whatsapp} onChange={e=>setUnitForm(f=>({...f,whatsapp:e.target.value}))} placeholder="رقم واتساب" style={{margin:4,padding:8,borderRadius:8}} />
              <input value={unitForm.lat} onChange={e=>setUnitForm(f=>({...f,lat:e.target.value}))} placeholder="خط العرض (lat)" style={{margin:4,padding:8,borderRadius:8}} />
              <input value={unitForm.lng} onChange={e=>setUnitForm(f=>({...f,lng:e.target.value}))} placeholder="خط الطول (lng)" style={{margin:4,padding:8,borderRadius:8}} />
              <input type="file" multiple accept="image/*" onChange={e=>setUnitForm(f=>({...f,images:Array.from(e.target.files||[])}))} style={{margin:4}} />
              <input value={unitForm.vrUrl} onChange={e=>setUnitForm(f=>({...f,vrUrl:e.target.value}))} placeholder="رابط VR أو 3D" style={{margin:4,padding:8,borderRadius:8}} />
              <input value={unitForm.panoramaUrl} onChange={e=>setUnitForm(f=>({...f,panoramaUrl:e.target.value}))} placeholder="رابط صورة بانوراما" style={{margin:4,padding:8,borderRadius:8}} />
              <input value={unitForm.model3dUrl} onChange={e=>setUnitForm(f=>({...f,model3dUrl:e.target.value}))} placeholder="رابط نموذج 3D" style={{margin:4,padding:8,borderRadius:8}} />
              {/* حقل المطور */}
              <div style={{display:'flex',alignItems:'center',gap:8,width:'100%'}}>
                <select value={unitForm.developerId} onChange={e=>{
                  if(e.target.value==='add_new_dev') setShowAddDev(true);
                  else setUnitForm(f=>({...f,developerId:e.target.value}));
                }} style={{margin:4,padding:8,borderRadius:8,flex:1}} required>
                  <option value="">اختر المطور</option>
                  {devs.length===0 && developers.map((d:any)=>(
                    <option key={d.id} value={d.id}>{d.name} (إضافة سريعة)</option>
                  ))}
                  {devs.map((d:any)=>(<option key={d.id} value={d.id}>{d.name}</option>))}
                  <option value="add_new_dev">+ إضافة مطور جديد...</option>
                </select>
                {devs.length===0 && developers.map((d:any)=>(
                  <button key={d.id} type="button" onClick={()=>handleQuickAddDev(d)} style={{fontSize:12,background:'#eee',border:'none',borderRadius:6,padding:'4px 8px',marginLeft:2}}>إضافة {d.name}</button>
                ))}
              </div>
              {showAddDev && (
                <form onSubmit={handleAddDevInline} style={{display:'flex',gap:8,margin:'8px 0'}}>
                  <input value={devForm.name} onChange={e=>setDevForm(f=>({...f,name:e.target.value}))} placeholder="اسم المطور" style={{padding:6,borderRadius:6}} required />
                  <input value={devForm.country} onChange={e=>setDevForm(f=>({...f,country:e.target.value}))} placeholder="الدولة" style={{padding:6,borderRadius:6}} required />
                  <button type="submit" style={{background:'#00bcd4',color:'#fff',border:'none',borderRadius:6,padding:'6px 16px',fontWeight:'bold'}}>حفظ المطور</button>
                  <button type="button" onClick={()=>setShowAddDev(false)} style={{background:'#eee',border:'none',borderRadius:6,padding:'6px 10px',fontWeight:'bold'}}>إلغاء</button>
                </form>
              )}
              {/* حقل الكمباوند */}
              <div style={{display:'flex',alignItems:'center',gap:8,width:'100%'}}>
                <select value={unitForm.compound} onChange={e=>{
                  if(e.target.value==='add_new_compound') setShowAddCompound(true);
                  else setUnitForm(f=>({...f,compound:e.target.value}));
                }} style={{margin:4,padding:8,borderRadius:8,flex:1}}>
                  <option value="">اختر الكمباوند (اختياري)</option>
                  {compoundsList.length===0 && compounds.map((c:any)=>(
                    <option key={c.id} value={c.name}>{c.name} (إضافة سريعة)</option>
                  ))}
                  {compoundsList.map((c:any)=>(<option key={c.id} value={c.name}>{c.name}</option>))}
                  <option value="add_new_compound">+ إضافة كمباوند جديد...</option>
                </select>
                {compoundsList.length===0 && compounds.map((c:any)=>(
                  <button key={c.id} type="button" onClick={()=>handleQuickAddCompound(c)} style={{fontSize:12,background:'#eee',border:'none',borderRadius:6,padding:'4px 8px',marginLeft:2}}>إضافة {c.name}</button>
                ))}
              </div>
              {showAddCompound && (
                <form onSubmit={handleAddCompoundInline} style={{display:'flex',gap:8,margin:'8px 0'}}>
                  <input value={compoundForm.name} onChange={e=>setCompoundForm(f=>({...f,name:e.target.value}))} placeholder="اسم الكمباوند" style={{padding:6,borderRadius:6}} required />
                  <input value={compoundForm.city} onChange={e=>setCompoundForm(f=>({...f,city:e.target.value}))} placeholder="المدينة" style={{padding:6,borderRadius:6}} required />
                  <input value={compoundForm.country} onChange={e=>setCompoundForm(f=>({...f,country:e.target.value}))} placeholder="الدولة" style={{padding:6,borderRadius:6}} required />
                  <input value={compoundForm.developer} onChange={e=>setCompoundForm(f=>({...f,developer:e.target.value}))} placeholder="المطور" style={{padding:6,borderRadius:6}} />
                  <button type="submit" style={{background:'#00bcd4',color:'#fff',border:'none',borderRadius:6,padding:'6px 16px',fontWeight:'bold'}}>حفظ الكمباوند</button>
                  <button type="button" onClick={()=>setShowAddCompound(false)} style={{background:'#eee',border:'none',borderRadius:6,padding:'6px 10px',fontWeight:'bold'}}>إلغاء</button>
                </form>
              )}
              <input value={unitForm.price} onChange={e=>setUnitForm(f=>({...f,price:e.target.value}))} placeholder="السعر بالجنيه أو العملة" style={{margin:4,padding:8,borderRadius:8}} required />
              <select value={unitForm.paymentType} onChange={e=>setUnitForm(f=>({...f,paymentType:e.target.value}))} style={{margin:4,padding:8,borderRadius:8}} required>
                <option value="">نوع الدفع</option>
                <option value="كاش">كاش</option>
                <option value="تقسيط">تقسيط</option>
              </select>
              <select value={unitForm.finance} onChange={e=>setUnitForm(f=>({...f,finance:e.target.value}))} style={{margin:4,padding:8,borderRadius:8}} required>
                <option value="">تمويل عقاري؟</option>
                <option value="تمويل عقاري">تمويل عقاري</option>
                <option value="بدون تمويل">بدون تمويل</option>
              </select>
              <button type="submit" style={{background:'#00bcd4',color:'#fff',border:'none',borderRadius:8,padding:'8px 20px',fontWeight:'bold',margin:4}} disabled={loading}>إضافة وحدة</button>
            </form>
            {/* عرض الوحدات */}
            <div style={{display:'flex',flexWrap:'wrap',gap:16}}>
              {units.map((u,i)=>(
                <div key={u.id} style={{border:'1px solid #eee',borderRadius:12,padding:12,minWidth:220,maxWidth:260,position:'relative'}}>
                  <b>{u.title}</b>
                  <div>النوع: {u.type}</div>
                  <div>المساحة: {u.area} م²</div>
                  <div>الغرف: {u.rooms}</div>
                  <div>الحمامات: {u.bathrooms}</div>
                  <div>المطابخ: {u.kitchens}</div>
                  <div>حديقة: {u.hasGarden?'نعم':'لا'} | حمام سباحة: {u.hasPool?'نعم':'لا'}</div>
                  <div>اتصال: {u.phone} | واتساب: {u.whatsapp}</div>
                  <div>الموقع: {u.lat && u.lng ? `${u.lat}, ${u.lng}` : '---'}</div>
                  <div>المطور: {devs.find(d=>d.id===u.developerId)?.name||'---'}</div>
                  <div>الكمبوند: {u.compound||'---'}</div>
                  <div>السعر: {u.price||'---'}</div>
                  <div>الدفع: {u.paymentType||'---'} | التمويل: {u.finance||'---'}</div>
                  {u.images && u.images.length>0 && <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>{u.images.map((img:string,idx:number)=>(<img key={idx} src={img} alt="img" style={{width:48,height:48,borderRadius:6,objectFit:'cover'}}/>))}</div>}
                  {u.vrUrl && <div><a href={u.vrUrl} target="_blank" rel="noopener noreferrer">VR/3D</a></div>}
                  {u.panoramaUrl && <div><a href={u.panoramaUrl} target="_blank" rel="noopener noreferrer">بانوراما</a></div>}
                  {u.model3dUrl && <div><a href={u.model3dUrl} target="_blank" rel="noopener noreferrer">نموذج 3D</a></div>}
                  <button onClick={()=>handleDeleteUnit(u.id)} style={{position:'absolute',top:8,right:8,border:'none',background:'rgba(255,255,255,0.8)',borderRadius:6,padding:'4px 8px',cursor:'pointer',fontSize:12}}>حذف</button>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* المطورين */}
        {tab==='المطورين' && allowedTabs.includes('المطورين') && (
          <div>
            <form onSubmit={handleAddDev} style={{marginBottom:24,display:'flex',gap:8}}>
              <input value={devForm.name} onChange={e=>setDevForm(f=>({...f,name:e.target.value}))} placeholder="اسم المطور" style={{padding:8,borderRadius:8}} required />
              <input value={devForm.country} onChange={e=>setDevForm(f=>({...f,country:e.target.value}))} placeholder="الدولة" style={{padding:8,borderRadius:8}} required />
              <button type="submit" style={{background:'#00bcd4',color:'#fff',border:'none',borderRadius:8,padding:'8px 20px',fontWeight:'bold'}} disabled={loading}>إضافة مطور</button>
            </form>
            {/* عرض المطورين */}
            <div style={{display:'flex',flexWrap:'wrap',gap:16}}>
              {devs.map((d)=>(
                <div key={d.id} style={{border:'1px solid #eee',borderRadius:12,padding:12,minWidth:220,maxWidth:260,position:'relative'}}>
                  <b>{d.name}</b>
                  <div>الدولة: {d.country}</div>
                  {d.logo && <img src={d.logo} alt="شعار المطور" style={{width:'100%',borderRadius:8,marginTop:8}} />}
                  <button onClick={()=>handleDeleteDev(d.id)} style={{position:'absolute',top:8,right:8,border:'none',background:'rgba(255,255,255,0.8)',borderRadius:6,padding:'4px 8px',cursor:'pointer',fontSize:12}}>حذف</button>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* المستخدمون */}
        {tab==='المستخدمون' && allowedTabs.includes('المستخدمون') && (
          <div>
            <form onSubmit={handleAddUser} style={{marginBottom:24,display:'flex',flexWrap:'wrap',gap:8}}>
              <input value={userForm.name} onChange={e=>setUserForm(f=>({...f,name:e.target.value}))} placeholder="الاسم" style={{margin:4,padding:8,borderRadius:8}} required />
              <input value={userForm.username} onChange={e=>setUserForm(f=>({...f,username:e.target.value}))} placeholder="اسم المستخدم" style={{margin:4,padding:8,borderRadius:8}} required />
              <input value={userForm.password} onChange={e=>setUserForm(f=>({...f,password:e.target.value}))} placeholder="كلمة المرور" type="password" style={{margin:4,padding:8,borderRadius:8}} required />
              <select value={userForm.role} onChange={e=>setUserForm(f=>({...f,role:e.target.value}))} style={{margin:4,padding:8,borderRadius:8}} required>
                <option value="موظف">موظف</option>
                <option value="مدير">مدير</option>
                <option value="مطور">مطور</option>
              </select>
              <button type="submit" style={{background:'#00bcd4',color:'#fff',border:'none',borderRadius:8,padding:'8px 20px',fontWeight:'bold'}} disabled={loading}>إضافة مستخدم</button>
            </form>
            {/* عرض المستخدمين */}
            <div style={{display:'flex',flexWrap:'wrap',gap:16}}>
              {users.map((u)=>(
                <div key={u.id} style={{border:'1px solid #eee',borderRadius:12,padding:12,minWidth:220,maxWidth:260,position:'relative'}}>
                  <b>{u.name}</b>
                  <div>اسم المستخدم: {u.username}</div>
                  <div>الدور: {u.role}</div>
                  <button onClick={()=>handleDeleteUser(u.id)} style={{position:'absolute',top:8,right:8,border:'none',background:'rgba(255,255,255,0.8)',borderRadius:6,padding:'4px 8px',cursor:'pointer',fontSize:12}}>حذف</button>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* الإعلانات */}
        {tab==='الإعلانات' && allowedTabs.includes('الإعلانات') && (
          <div>
            <p>قريباً...</p>
          </div>
        )}
        {/* الإعدادات */}
        {tab==='الإعدادات' && allowedTabs.includes('الإعدادات') && (
          <div>
            {/* بيانات التواصل */}
            <div style={{marginBottom:32}}>
              <div style={{fontSize:18,fontWeight:'bold',marginBottom:16}}>بيانات التواصل</div>
              <form onSubmit={handleSaveContacts} style={{display:'flex',flexDirection:'column',gap:12}}>
                <input value={contacts.phone} onChange={e=>setContacts(c=>({...c,phone:e.target.value}))} placeholder="رقم الهاتف" style={{padding:8,borderRadius:8}} />
                <input value={contacts.whatsapp} onChange={e=>setContacts(c=>({...c,whatsapp:e.target.value}))} placeholder="رقم واتساب" style={{padding:8,borderRadius:8}} />
                <button type="submit" style={{background:'#00bcd4',color:'#fff',border:'none',borderRadius:8,padding:'8px 20px',fontWeight:'bold'}} disabled={contactsLoading}>حفظ البيانات</button>
              </form>
            </div>
            {/* نص "من نحن" */}
            <div style={{marginBottom:32}}>
              <div style={{fontSize:18,fontWeight:'bold',marginBottom:16}}>نبذة عن التطبيق</div>
              <form onSubmit={handleSaveAbout} style={{display:'flex',flexDirection:'column',gap:12}}>
                <textarea value={aboutText} onChange={e=>setAboutText(e.target.value)} placeholder="اكتب نبذة عن التطبيق هنا..." style={{padding:8,borderRadius:8,minHeight:100}} />
                <button type="submit" style={{background:'#00bcd4',color:'#fff',border:'none',borderRadius:8,padding:'8px 20px',fontWeight:'bold'}} disabled={aboutLoading}>حفظ النص</button>
              </form>
            </div>
            {/* الشركاء */}
            <div style={{marginBottom:32}}>
              <div style={{fontSize:18,fontWeight:'bold',marginBottom:16}}>الشركاء</div>
              <form onSubmit={handleAddPartner} style={{display:'flex',gap:8,marginBottom:16}}>
                <input value={partnerForm.name} onChange={e=>setPartnerForm(f=>({...f,name:e.target.value}))} placeholder="اسم الشريك" style={{padding:8,borderRadius:8}} required />
                <input value={partnerForm.url} onChange={e=>setPartnerForm(f=>({...f,url:e.target.value}))} placeholder="رابط الموقع" style={{padding:8,borderRadius:8}} />
                <input type="file" onChange={e=>setPartnerImageFile(e.target.files?.[0]||null)} style={{padding:8,borderRadius:8}} />
                <button type="submit" style={{background:'#00bcd4',color:'#fff',border:'none',borderRadius:8,padding:'8px 20px',fontWeight:'bold'}} disabled={partnersLoading}>إضافة شريك</button>
              </form>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {partners.map((p,idx)=>(
                  <div key={idx} style={{display:'flex',alignItems:'center',gap:8,border:'1px solid #eee',borderRadius:12,padding:12}}>
                    <img src={p.image} alt={p.name} style={{width:40,height:40,borderRadius:20,objectFit:'cover'}} />
                    <div style={{flex:1}}>
                      <div style={{fontWeight:'bold'}}>{p.name}</div>
                      <div style={{color:'#666'}}>{p.url}</div>
                    </div>
                    <button onClick={()=>handleDeletePartner(idx)} style={{border:'none',background:'rgba(255,255,255,0.8)',borderRadius:6,padding:'6px 12px',cursor:'pointer',fontSize:12}}>حذف</button>
                  </div>
                ))}
              </div>
            </div>
            {/* إعدادات الشريط المتحرك */}
            <div style={{marginBottom:32}}>
              <div style={{fontSize:18,fontWeight:'bold',marginBottom:16}}>إعدادات الشريط المتحرك</div>
              <form onSubmit={handleSaveMarquee} style={{display:'flex',flexDirection:'column',gap:12}}>
                <textarea value={marquee.texts.join('\n')} onChange={e=>setMarquee(m=>({...m,texts:e.target.value.split('\n')}))} placeholder="نص الشريط المتحرك (سطر واحد لكل رسالة)" style={{padding:8,borderRadius:8,minHeight:100}} />
                <div style={{display:'flex',gap:8}}>
                  <input value={marquee.speed} type="number" onChange={e=>setMarquee(m=>({...m,speed:Number(e.target.value)}))} placeholder="سرعة الحركة (بالبكسل)" style={{padding:8,borderRadius:8,width:'50%'}} />
                  <input value={marquee.color} onChange={e=>setMarquee(m=>({...m,color:e.target.value}))} placeholder="لون النص" style={{padding:8,borderRadius:8,width:'50%'}} />
                </div>
                <button type="submit" style={{background:'#00bcd4',color:'#fff',border:'none',borderRadius:8,padding:'8px 20px',fontWeight:'bold'}} disabled={marqueeLoading}>حفظ الإعدادات</button>
              </form>
            </div>
            {/* سلايدر الصور */}
            <div style={{marginBottom:32}}>
              <div style={{fontSize:18,fontWeight:'bold',marginBottom:16}}>صور السلايدر</div>
              <form onSubmit={handleAddSliderImages} style={{display:'flex',gap:8,marginBottom:16}}>
                <input type="file" multiple accept="image/*" onChange={e=>setSliderFiles(Array.from(e.target.files||[]))} style={{padding:8,borderRadius:8}} />
                <button type="submit" style={{background:'#00bcd4',color:'#fff',border:'none',borderRadius:8,padding:'8px 20px',fontWeight:'bold'}} disabled={sliderLoading}>رفع الصور</button>
              </form>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {sliderImages.map((img,idx)=>(
                  <div key={idx} style={{display:'flex',alignItems:'center',gap:8,border:'1px solid #eee',borderRadius:12,padding:12}}>
                    <img src={img} alt={`سلايدر ${idx+1}`} style={{width:100,height:100,borderRadius:8,objectFit:'cover'}} />
                    <button onClick={()=>handleDeleteSliderImage(idx)} style={{border:'none',background:'rgba(255,255,255,0.8)',borderRadius:6,padding:'6px 12px',cursor:'pointer',fontSize:12}}>حذف</button>
                  </div>
                ))}
              </div>
            </div>
            {/* صور من نحن */}
            <div>
              <div style={{fontSize:18,fontWeight:'bold',marginBottom:16}}>صور من نحن</div>
              <form onSubmit={handleAddAboutImages} style={{display:'flex',gap:8,marginBottom:16}}>
                <input type="file" multiple accept="image/*" onChange={e=>setAboutImageFiles(Array.from(e.target.files||[]))} style={{padding:8,borderRadius:8}} />
                <button type="submit" style={{background:'#00bcd4',color:'#fff',border:'none',borderRadius:8,padding:'8px 20px',fontWeight:'bold'}} disabled={aboutImagesLoading}>رفع الصور</button>
              </form>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {aboutImages.map((img,idx)=>(
                  <div key={idx} style={{display:'flex',alignItems:'center',gap:8,border:'1px solid #eee',borderRadius:12,padding:12}}>
                    <img src={img} alt={`صورة من نحن ${idx+1}`} style={{width:100,height:100,borderRadius:8,objectFit:'cover'}} />
                    <button onClick={()=>handleDeleteAboutImage(idx)} style={{border:'none',background:'rgba(255,255,255,0.8)',borderRadius:6,padding:'6px 12px',cursor:'pointer',fontSize:12}}>حذف</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* من نحن */}
        {tab==='من نحن' && (
          <div>
            <div style={{fontSize:22,color:'#00bcd4',fontWeight:'bold',marginBottom:16}}>من نحن</div>
            <p style={{lineHeight:1.6}}>
              نحن شركة رائدة في مجال تطوير التطبيقات العقارية، نسعى لتقديم أفضل الحلول التكنولوجية لمستخدمينا الكرام. فريقنا مكون من محترفين ذوي خبرة عالية في مجالات البرمجة، التصميم، والتسويق العقاري.
            </p>
            <p style={{lineHeight:1.6}}>
              مهمتنا هي تسهيل عملية البحث عن العقارات وتوفير منصة موثوقة تربط بين المطورين، الوسطاء، والمشترين. نحن نؤمن بأهمية الابتكار والتطوير المستمر لتلبية احتياجات سوق العقارات المتغيرة.
            </p>
            <p style={{lineHeight:1.6}}>
              رؤيتنا هي أن نكون الخيار الأول في مجال التطبيقات العقارية في الشرق الأوسط، من خلال تقديم خدمات متميزة وتجربة مستخدم فريدة.
            </p>
          </div>
        )}
        {/* الشركاء */}
        {tab==='الشركاء' && (
          <div>
            <div style={{fontSize:22,color:'#00bcd4',fontWeight:'bold',marginBottom:16}}>شركاؤنا</div>
            <p style={{lineHeight:1.6}}>
              نحن فخورون بشراكتنا مع مجموعة من أفضل الشركات والمطورين في مجال العقارات. شراكاتنا قائمة على الثقة، الشفافية، والاحترافية.
            </p>
            <p style={{lineHeight:1.6}}>
              إذا كنت مطوراً أو شركة مهتمة بالشراكة معنا، لا تتردد في <a href="mailto:info@app.local" style={{color:'#00bcd4',fontWeight:'bold'}}>التواصل معنا عبر البريد الإلكتروني</a>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;

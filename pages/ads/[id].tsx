import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { doc as fsDoc, getDoc } from 'firebase/firestore';
import { db } from '../../data/firebase';

interface AdDetails {
  img: string;
  details: string;
  title?: string;
  link?: string;
}

export default function AdDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [ad, setAd] = useState<AdDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    async function fetchAd() {
      try {
        // جلب بيانات الإعلان من فايرستور بلوحة التحكم
        const ref = fsDoc(db, 'ads', String(id));
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setAd(snap.data() as AdDetails);
        } else {
          setAd(null);
        }
      } catch {
        setAd(null);
      }
      setLoading(false);
    }
    fetchAd();
  }, [id]);

  if (loading) return <div style={{textAlign:'center',marginTop:40}}>جاري التحميل...</div>;
  if (!ad) return <div style={{textAlign:'center',marginTop:40,color:'#e53935'}}>الإعلان غير موجود أو تم حذفه.</div>;

  return (
    <div style={{
      maxWidth: 800,
      margin: '40px auto',
      background: '#fff',
      borderRadius: 16,
      boxShadow: '0 2px 16px #e0e0e0',
      padding: 24,
      width: '95vw',
      minHeight: 400,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxSizing: 'border-box'
    }}>
      <img src={ad.img} alt={ad.title || 'إعلان'}
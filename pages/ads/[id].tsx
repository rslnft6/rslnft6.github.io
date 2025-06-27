import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { doc as fsDoc, getDoc } from 'firebase/firestore';
import { db } from '../../data/firebase';
import Head from 'next/head';

interface AdDetails {
  url: string;
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
        // جلب بيانات الإعلان من السلايدر (collection: slider)
        const ref = fsDoc(db, 'slider', String(id));
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
      maxWidth: 700,
      margin: '32px auto',
      background: '#fff',
      borderRadius: 16,
      boxShadow: '0 2px 16px #e0e0e0',
      padding: 32,
      width: '95vw',
      minHeight: 400,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxSizing: 'border-box'
    }}>
      <Head>
        <title>تفاصيل الإعلان</title>
      </Head>
      <img src={ad.url} alt={ad.title || 'إعلان'} style={{maxWidth:'100%',borderRadius:12,marginBottom:24}} />
      <h2 style={{color:'#00bcd4',fontWeight:'bold',fontSize:28,marginBottom:12}}>تفاصيل الإعلان</h2>
      <div style={{fontSize:18,marginBottom:16}}>{ad.title || 'إعلان عقاري مميز'}</div>
      {ad.link && <a href={ad.link} target="_blank" rel="noopener noreferrer" style={{color:'#2196f3',fontWeight:'bold',fontSize:18}}>رابط خارجي</a>}
      <div style={{marginTop:24}}>
        <button onClick={()=>router.back()} style={{background:'#00bcd4',color:'#fff',border:'none',borderRadius:8,padding:'10px 32px',fontWeight:'bold',fontSize:18,cursor:'pointer'}}>رجوع</button>
      </div>
    </div>
  );
}
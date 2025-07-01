import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { db } from '../data/firebase';
import { doc as fsDoc, getDoc } from 'firebase/firestore';

export default function AdDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [ad, setAd] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchAd = async () => {
      setLoading(true);
      try {
        const ref = fsDoc(db, 'settings', 'slider');
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const images = snap.data().images || [];
          const found = images[Number(id)];
          setAd(found);
        }
      } catch {}
      setLoading(false);
    };
    fetchAd();
  }, [id]);

  if (loading) return <div style={{padding:40}}>جاري التحميل...</div>;
  if (!ad) return <div style={{padding:40}}>الإعلان غير موجود</div>;

  return (
    <div style={{maxWidth:600,margin:'40px auto',background:'#fff',borderRadius:16,boxShadow:'0 2px 16px #00bcd422',padding:24}}>
      <img src={ad.url} alt={ad.title||'ad'} style={{width:'100%',borderRadius:12,marginBottom:16}} />
      <h2 style={{color:'#00bcd4',fontWeight:'bold',marginBottom:12}}>{ad.title||'إعلان'}</h2>
      {ad.link ? (
        <a href={ad.link} target="_blank" rel="noopener noreferrer" style={{color:'#2196f3',fontWeight:'bold',fontSize:18}}>رابط خارجي</a>
      ) : (
        <div style={{color:'#888',fontSize:16}}>لا يوجد رابط خارجي لهذا الإعلان.</div>
      )}
      <div style={{marginTop:16,fontSize:16,color:'#555'}}>تفاصيل الإعلان أو وصف إضافي يمكن وضعه هنا مستقبلاً.</div>
    </div>
  );
}

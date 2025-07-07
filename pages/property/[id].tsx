import { useRouter } from 'next/router';
import { getAllProperties } from '../../data/properties';
import dynamic from 'next/dynamic';
const ModelViewer = dynamic(() => import('../../components/ModelViewer'), { ssr: false });
import VR360Gallery from '../../components/VR360Gallery';
import VRView from '../../components/VRView';
import { propertyImages } from '../../data/backgrounds';
import ShareBox from '../../components/ShareBox';
import { useState, useEffect } from 'react';
import { db } from '../../data/firebase';
import { doc, getDoc } from 'firebase/firestore';

const properties = getAllProperties();

export default function PropertyDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [showVR, setShowVR] = useState(false);
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    async function fetchProperty() {
      // جرب جلب الوحدة من فايرستور أولاً
      try {
        const docRef = doc(db, 'units', String(id));
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setProperty({ id, ...snap.data() });
          setLoading(false);
          return;
        }
      } catch {}
      // إذا لم توجد في فايرستور ابحث في البيانات المحلية
      const local = properties.find((p: any) => String(p.id) === String(id));
      setProperty(local || null);
      setLoading(false);
    }
    fetchProperty();
  }, [id]);

  if (loading) return <div style={{padding:32}}>جاري التحميل...</div>;
  if (!property) return <div style={{padding:32}}>الوحدة غير موجودة</div>;
  const panoramaUrl = property.panorama360?.[0] || property.panorama?.[0];
  return (
    <div style={{maxWidth:900,margin:'32px auto',background:'#fff',borderRadius:16,padding:24,boxShadow:'0 2px 16px #eee'}}>
      <h2>{property.title}</h2>
      <img src={property.image || (property.images?.[0]) || '/images/bg1.png'} alt={property.title} style={{width:'100%',maxHeight:320,objectFit:'cover',borderRadius:12,margin:'16px 0'}} />
      <div style={{margin:'8px 0'}}>الموقع: {property.location}</div>
      <div style={{margin:'8px 0'}}>الحالة: {property.status}</div>
      <div style={{margin:'8px 0'}}>التفاصيل: {property.details}</div>
      <ShareBox title={property.title} url={typeof window !== 'undefined' ? window.location.href : ''} image={property.image || (property.images?.[0])} />
      {/* أزرار التواصل */}
      <div style={{
        display:'flex',gap:18,margin:'18px 0',justifyContent:'flex-start',
        flexWrap:'wrap'
      }}>
        {property.phone && (
          <a href={`tel:${property.phone}`}
            style={{
              background:'rgba(255,255,255,0.18)',
              color:'#4caf50',
              border:'1.5px solid #4caf50',
              borderRadius:16,
              padding:'12px 32px',
              fontWeight:'bold',
              fontSize:18,
              textDecoration:'none',
              display:'inline-block',
              boxShadow:'0 4px 24px #4caf5022',
              backdropFilter:'blur(8px)',
              transition:'background 0.2s, color 0.2s',
              position:'relative',
              overflow:'hidden',
            }}
            onMouseOver={e=>{e.currentTarget.style.background='#4caf50';e.currentTarget.style.color='#fff';}}
            onMouseOut={e=>{e.currentTarget.style.background='rgba(255,255,255,0.18)';e.currentTarget.style.color='#4caf50';}}
          >
            <svg width="22" height="22" fill="#4caf50" style={{marginLeft:8,verticalAlign:'middle'}} viewBox="0 0 24 24"><path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1C10.07 21 3 13.93 3 5a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.24 1.01l-2.2 2.2z"/></svg>
            اتصال
          </a>
        )}
        {property.whatsapp && (
          <a href={`https://wa.me/${property.whatsapp.replace(/[^0-9]/g,'')}`}
            target="_blank" rel="noopener"
            style={{
              background:'rgba(255,255,255,0.18)',
              color:'#25d366',
              border:'1.5px solid #25d366',
              borderRadius:16,
              padding:'12px 32px',
              fontWeight:'bold',
              fontSize:18,
              textDecoration:'none',
              display:'inline-block',
              boxShadow:'0 4px 24px #25d36622',
              backdropFilter:'blur(8px)',
              transition:'background 0.2s, color 0.2s',
              position:'relative',
              overflow:'hidden',
            }}
            onMouseOver={e=>{e.currentTarget.style.background='#25d366';e.currentTarget.style.color='#fff';}}
            onMouseOut={e=>{e.currentTarget.style.background='rgba(255,255,255,0.18)';e.currentTarget.style.color='#25d366';}}
          >
            <svg width="22" height="22" fill="#25d366" style={{marginLeft:8,verticalAlign:'middle'}} viewBox="0 0 24 24"><path d="M20.52 3.48A11.93 11.93 0 0012 0C5.37 0 0 5.37 0 12a11.93 11.93 0 003.48 8.52l-2.2 6.4a1 1 0 001.28 1.28l6.4-2.2A11.93 11.93 0 0012 24c6.63 0 12-5.37 12-12a11.93 11.93 0 00-3.48-8.52zM12 22a9.93 9.93 0 01-5.64-1.7l-.4-.25-4.77 1.64 1.64-4.77-.25-.4A9.93 9.93 0 012 12c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10zm5.07-7.75c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.34.42-.51.14-.17.18-.29.28-.48.09-.19.05-.36-.02-.5-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47-.16-.01-.36-.01-.56-.01-.19 0-.5.07-.76.34-.26.27-1 1-.97 2.43.03 1.43 1.03 2.81 1.18 3 .15.19 2.03 3.1 4.93 4.23.69.3 1.23.48 1.65.61.69.22 1.32.19 1.81.12.55-.08 1.65-.67 1.89-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.19-.53-.33z"/></svg>
            واتساب
          </a>
        )}
      </div>
      {panoramaUrl && (
        <div style={{margin:'16px 0'}}>
          <h4>جولة بانوراما 360°:</h4>
          <div style={{display:'flex',gap:12,alignItems:'center'}}>
            <button onClick={()=>setShowVR(false)} style={{background:!showVR?'#00bcd4':'#eee',color:!showVR?'#fff':'#222',border:'none',borderRadius:8,padding:'6px 18px',fontWeight:'bold',cursor:'pointer'}}>عرض بانوراما عادي</button>
            <button onClick={()=>setShowVR(true)} style={{background:showVR?'#00bcd4':'#eee',color:showVR?'#fff':'#222',border:'none',borderRadius:8,padding:'6px 18px',fontWeight:'bold',cursor:'pointer'}}>عرض بانوراما VR 360</button>
          </div>
          <div style={{marginTop:12}}>
            {!showVR ? (
              <VR360Gallery singleImage={panoramaUrl} />
            ) : (
              <VRView src={panoramaUrl} />
            )}
          </div>
        </div>
      )}
      {property.model3d && (
        <div style={{margin:'16px 0'}}>
          <h4>نموذج 3D تفاعلي:</h4>
          <ModelViewer src={property.model3d} style={{width:'100%',height:300,background:'#222',borderRadius:12}} />
        </div>
      )}
      {!panoramaUrl && (
        <div style={{margin:'16px 0'}}>
          <h4>عرض واقع افتراضي:</h4>
          <VRView src={property.vr || ''} />
        </div>
      )}
    </div>
  );
}

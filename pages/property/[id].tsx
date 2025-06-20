import { useRouter } from 'next/router';
import { getAllProperties } from '../../data/properties';
import dynamic from 'next/dynamic';
const ModelViewer = dynamic(() => import('../../components/ModelViewer'), { ssr: false });
import VR360Gallery from '../../components/VR360Gallery';
import VRView from '../../components/VRView';
// إضافة صور بانوراما وشعارات وأيقونات افتراضية للوحدات والمشاريع
import { propertyImages } from '../../data/backgrounds';
import ShareBox from '../../components/ShareBox';
import { useState } from 'react';

const properties = getAllProperties();

export default function PropertyDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [showVR, setShowVR] = useState(false);
  const property = properties.find((p: any) => p.id === Number(id));
  if (!property) return <div style={{padding:32}}>الوحدة غير موجودة</div>;
  const panoramaUrl = property.panorama360 && property.panorama360[0];
  return (
    <div style={{maxWidth:900,margin:'32px auto',background:'#fff',borderRadius:16,padding:24,boxShadow:'0 2px 16px #eee'}}>
      <h2>{property.title}</h2>
      <img src={property.image} alt={property.title} style={{width:'100%',maxHeight:320,objectFit:'cover',borderRadius:12,margin:'16px 0'}} />
      <div style={{margin:'8px 0'}}>الموقع: {property.location}</div>
      <div style={{margin:'8px 0'}}>الحالة: {property.status}</div>
      <div style={{margin:'8px 0'}}>التفاصيل: {property.details}</div>
      {/* مشاركة الوحدة وروابط التواصل وQR */}
      <ShareBox title={property.title} url={typeof window !== 'undefined' ? window.location.href : ''} image={property.image} />
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
      {/* VRView افتراضي فقط إذا لم تتوفر صورة بانوراما */}
      {!panoramaUrl && (
        <div style={{margin:'16px 0'}}>
          <h4>عرض واقع افتراضي:</h4>
          <VRView src={''} />
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../data/firebase';
import { FaTrash, FaMapMarkerAlt, FaEdit, FaImages, FaUser, FaCheckCircle, FaBan, FaPlus } from 'react-icons/fa';
import ImageUploader from './ImageUploader';
import { compounds } from '../data/compounds';
import { developers } from '../data/developers';

const UNIT_TYPES = [
  'قصر','فيلا','بنتهاوس','توين هاوس','شقة','استوديو','غرفة فندقية','مكتب','أرض','محل','عيادة','مستشفى','مدرسة','أخرى'
];

type UnitForm = {
  title: string;
  type: string;
  area: string;
  price: string;
  rooms: string;
  bathrooms: string;
  floors: string;
  hasGarden: boolean;
  hasPool: boolean;
  developerId: string;
  compound: string;
  employee: string;
  phone: string;
  whatsapp: string;
  lat: string;
  lng: string;
  images: string[];
  vrUrl: string;
  panoramaUrl: string;
  model3dUrl: string;
  paymentType: string;
  finance: string;
  description: string;
  enabled: boolean;
};

const UnitsPanel: React.FC<{coOwnershipMode?: boolean, auctionMode?: boolean}> = ({ coOwnershipMode, auctionMode }) => {
  const [units, setUnits] = useState<any[]>([]);
  const [form, setForm] = useState<UnitForm>({
    title: '',
    type: 'شقة',
    area: '',
    price: '',
    rooms: '',
    bathrooms: '',
    floors: '',
    hasGarden: false,
    hasPool: false,
    developerId: '',
    compound: '',
    employee: '',
    phone: '',
    whatsapp: '',
    lat: '',
    lng: '',
    images: [],
    vrUrl: '',
    panoramaUrl: '',
    model3dUrl: '',
    paymentType: '',
    finance: '',
    description: '',
    enabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string|null>(null);
  const [coOwners, setCoOwners] = useState<{name:string, share:number}[]>([]);
  const [auction, setAuction] = useState({ enabled: false, bids: [] as {user:string,amount:number}[], minBid: 0 });
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    const fetchUnits = async () => {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, 'units'));
        setUnits(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch {}
      setLoading(false);
    };
    fetchUnits();
  }, [adding]);

  const resetForm = () => {
    setForm({
      title: '', type: 'شقة', area: '', price: '', rooms: '', bathrooms: '', floors: '', hasGarden: false, hasPool: false, developerId: '', compound: '', employee: '', phone: '', whatsapp: '', lat: '', lng: '', images: [], vrUrl: '', panoramaUrl: '', model3dUrl: '', paymentType: '', finance: '', description: '', enabled: true
    });
    setCoOwners([]);
    setAuction({ enabled: false, bids: [], minBid: 0 });
    setEditingId(null);
  };

  const handleAddOrEdit = async (e: any) => {
    e.preventDefault();
    setAdding(true);
    try {
      const data = {
        ...form,
        hasGarden: !!form.hasGarden,
        hasPool: !!form.hasPool,
        coOwners: coOwnershipMode ? coOwners : undefined,
        auction: auctionMode && auction.enabled ? { enabled: true, minBid: auction.minBid, bids: [] } : undefined,
        enabled: form.enabled !== false
      };
      if (editingId) {
        await updateDoc(doc(db, 'units', editingId), data);
      } else {
        await addDoc(collection(db, 'units'), data);
      }
      resetForm();
    } catch {}
    setAdding(false);
  };

  const handleEdit = (unit: any) => {
    setForm({ ...unit, images: unit.images || [], description: unit.description || '', enabled: unit.enabled !== false });
    setCoOwners(unit.coOwners || []);
    setAuction(unit.auction || { enabled: false, bids: [], minBid: 0 });
    setEditingId(unit.id);
    setImageFiles([]);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('تأكيد حذف الوحدة؟')) return;
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'units', id));
    } catch {}
    setLoading(false);
  };

  const handleToggleEnable = async (unit: any) => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'units', unit.id), { enabled: !unit.enabled });
    } catch {}
    setLoading(false);
  };

  return (
    <div style={{background:'rgba(255,255,255,0.18)',backdropFilter:'blur(16px)',borderRadius:24,boxShadow:'0 4px 32px #00bcd422',padding:32,border:'1.5px solid rgba(255,255,255,0.25)',margin:'32px 0'}}>
      <h2 style={{color:'#00bcd4',marginBottom:16}}>إدارة الوحدات العقارية</h2>
      <form onSubmit={handleAddOrEdit} style={{display:'flex',gap:8,marginBottom:24,flexWrap:'wrap',alignItems:'flex-start'}}>
        <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))} style={{padding:8,borderRadius:8}}>
          {UNIT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <input value={form.area} onChange={e=>setForm(f=>({...f,area:e.target.value}))} placeholder="المساحة" style={{padding:8,borderRadius:8}} />
        <input value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} placeholder="السعر" style={{padding:8,borderRadius:8}} />
        <input value={form.rooms} onChange={e=>setForm(f=>({...f,rooms:e.target.value}))} placeholder="عدد الغرف" style={{padding:8,borderRadius:8}} />
        <input value={form.bathrooms} onChange={e=>setForm(f=>({...f,bathrooms:e.target.value}))} placeholder="عدد الحمامات" style={{padding:8,borderRadius:8}} />
        <input value={form.floors} onChange={e=>setForm(f=>({...f,floors:e.target.value}))} placeholder="عدد الأدوار" style={{padding:8,borderRadius:8}} />
        <label style={{display:'flex',alignItems:'center',gap:4}}><input type="checkbox" checked={form.hasGarden} onChange={e=>setForm(f=>({...f,hasGarden:e.target.checked}))} />حديقة</label>
        <label style={{display:'flex',alignItems:'center',gap:4}}><input type="checkbox" checked={form.hasPool} onChange={e=>setForm(f=>({...f,hasPool:e.target.checked}))} />مسبح</label>
        <select value={form.developerId} onChange={e=>setForm(f=>({...f,developerId:e.target.value}))} style={{padding:8,borderRadius:8}}>
          <option value="">اختر المطور</option>
          {developers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select value={form.compound} onChange={e=>setForm(f=>({...f,compound:e.target.value}))} style={{padding:8,borderRadius:8}}>
          <option value="">اختر الكمباوند</option>
          {compounds.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
        <input value={form.employee} onChange={e=>setForm(f=>({...f,employee:e.target.value}))} placeholder="اسم الموظف" style={{padding:8,borderRadius:8}} />
        <input value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder="رقم التواصل" style={{padding:8,borderRadius:8}} />
        <input value={form.whatsapp} onChange={e=>setForm(f=>({...f,whatsapp:e.target.value}))} placeholder="واتساب" style={{padding:8,borderRadius:8}} />
        <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="وصف الوحدة/مميزات إضافية" style={{padding:8,borderRadius:8,minWidth:220,minHeight:48,flex:1}} />
        <div style={{display:'flex',alignItems:'center',gap:4}}>
          <input value={form.lat} onChange={e=>setForm(f=>({...f,lat:e.target.value}))} placeholder="خط العرض (lat)" style={{padding:8,borderRadius:8}} />
          <input value={form.lng} onChange={e=>setForm(f=>({...f,lng:e.target.value}))} placeholder="خط الطول (lng)" style={{padding:8,borderRadius:8}} />
          <button type="button" onClick={()=>setShowMap(true)} style={{background:'#00bcd4',color:'#fff',border:'none',borderRadius:8,padding:'8px 12px',fontWeight:'bold'}}>اختر من الخريطة</button>
        </div>
        <input value={form.vrUrl} onChange={e=>setForm(f=>({...f,vrUrl:e.target.value}))} placeholder="رابط VR" style={{padding:8,borderRadius:8}} />
        <input value={form.panoramaUrl} onChange={e=>setForm(f=>({...f,panoramaUrl:e.target.value}))} placeholder="رابط بانوراما" style={{padding:8,borderRadius:8}} />
        <input value={form.model3dUrl} onChange={e=>setForm(f=>({...f,model3dUrl:e.target.value}))} placeholder="رابط نموذج 3D" style={{padding:8,borderRadius:8}} />
        <div style={{minWidth:120}}>
          <ImageUploader
            images={form.images}
            onAdd={urls => setForm(f => ({ ...f, images: [...f.images, ...urls] }))}
            onRemove={idx => setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }))}
            multiple={true}
          />
        </div>
        {(form.vrUrl || form.panoramaUrl || form.model3dUrl) && (
          <div style={{display:'flex',gap:12,margin:'8px 0'}}>
            {form.vrUrl && <iframe src={form.vrUrl} title="VR" style={{width:120,height:80,borderRadius:8,border:'1.5px solid #00bcd4'}} />}
            {form.panoramaUrl && <iframe src={form.panoramaUrl} title="بانوراما" style={{width:120,height:80,borderRadius:8,border:'1.5px solid #00bcd4'}} />}
            {form.model3dUrl && <iframe src={form.model3dUrl} title="3D" style={{width:120,height:80,borderRadius:8,border:'1.5px solid #00bcd4'}} />}
          </div>
        )}
        {coOwnershipMode && (
          <div style={{display:'flex',flexDirection:'column',gap:4,background:'#fff2',padding:12,borderRadius:12}}>
            <div style={{fontWeight:'bold',color:'#00bcd4'}}>مشاركة في الشراء</div>
            {coOwners.map((o,i)=>(
              <div key={i} style={{display:'flex',gap:8,alignItems:'center'}}>
                <input value={o.name} onChange={e=>setCoOwners(owners=>owners.map((oo,ii)=>ii===i?{...oo,name:e.target.value}:oo))} placeholder="اسم المالك" style={{padding:6,borderRadius:8}} />
                <input type="number" value={o.share} onChange={e=>setCoOwners(owners=>owners.map((oo,ii)=>ii===i?{...oo,share:Number(e.target.value)}:oo))} placeholder="نسبة الملكية %" style={{padding:6,borderRadius:8,width:80}} />
                <button type="button" onClick={()=>setCoOwners(owners=>owners.filter((_,ii)=>ii!==i))} style={{background:'#e91e63',color:'#fff',border:'none',borderRadius:8,padding:'4px 10px'}}>حذف</button>
              </div>
            ))}
            <button type="button" onClick={()=>setCoOwners([...coOwners,{name:'',share:0}])} style={{background:'#00bcd4',color:'#fff',border:'none',borderRadius:8,padding:'4px 10px',marginTop:4}}>إضافة مالك مشارك</button>
          </div>
        )}
        {auctionMode && (
          <div style={{display:'flex',flexDirection:'column',gap:4,background:'#fff2',padding:12,borderRadius:12,marginTop:8}}>
            <div style={{fontWeight:'bold',color:'#e91e63'}}>نظام المزاد</div>
            <label style={{display:'flex',alignItems:'center',gap:8}}>
              <input type="checkbox" checked={auction.enabled} onChange={e=>setAuction(a=>({...a,enabled:e.target.checked}))} /> تفعيل المزاد
            </label>
            {auction.enabled && (
              <input type="number" value={auction.minBid} onChange={e=>setAuction(a=>({...a,minBid:Number(e.target.value)}))} placeholder="أقل مزايدة (جنيه)" style={{padding:6,borderRadius:8,width:120}} />
            )}
          </div>
        )}
        <button type="submit" style={{background:'#00bcd4',color:'#fff',border:'none',borderRadius:8,padding:'8px 20px',fontWeight:'bold'}} disabled={adding}>{editingId ? 'تحديث' : 'إضافة وحدة'}</button>
        <button type="button" onClick={resetForm} style={{background:'#607d8b',color:'#fff',border:'none',borderRadius:8,padding:'8px 20px',fontWeight:'bold'}}><FaPlus /> تفريغ الحقول</button>
      </form>
      {loading ? <div>جاري تحميل الوحدات...</div> : (
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:16,background:'rgba(255,255,255,0.12)',borderRadius:16}}>
          <thead>
            <tr style={{background:'rgba(0,188,212,0.08)'}}>
              <th style={{padding:8}}>الرقم المرجعي</th>
              <th style={{padding:8}}>النوع</th>
              <th style={{padding:8}}>المساحة</th>
              <th style={{padding:8}}>السعر</th>
              <th style={{padding:8}}>الغرف</th>
              <th style={{padding:8}}>الوصف</th>
              <th style={{padding:8}}>الموظف</th>
              <th style={{padding:8}}>الحالة</th>
              <th style={{padding:8}}>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {units.map((u,i) => (
              <tr key={u.id} style={{borderBottom:'1px solid #eee',background:u.enabled===false?'#ffeaea':'unset'}}>
                <td style={{padding:8}}>
                  {u.images && u.images.length > 0 && <img src={u.images[0]} alt="صورة" style={{width:38,height:38,borderRadius:8,objectFit:'cover',marginLeft:6,verticalAlign:'middle',border:'1.5px solid #00bcd4'}} />}
                  {u.title||`وحدة ${i+1}`}
                </td>
                <td style={{padding:8}}>{u.type}</td>
                <td style={{padding:8}}>{u.area}</td>
                <td style={{padding:8}}>{u.price}</td>
                <td style={{padding:8}}>{u.rooms}</td>
                <td style={{padding:8,maxWidth:180,whiteSpace:'pre-line',overflow:'hidden',textOverflow:'ellipsis'}}>{u.description}</td>
                <td style={{padding:8}}>{u.employee}</td>
                <td style={{padding:8}}>{u.enabled!==false ? <span style={{color:'#4caf50',fontWeight:'bold'}}><FaCheckCircle /> نشط</span> : <span style={{color:'#e91e63',fontWeight:'bold'}}><FaBan /> معطل</span>}</td>
                <td style={{padding:8,display:'flex',gap:8}}>
                  <button title="تعديل" style={{background:'none',border:'none',cursor:'pointer'}} onClick={()=>handleEdit(u)}><FaEdit color="#00bcd4" /></button>
                  <button title="حذف" style={{background:'none',border:'none',cursor:'pointer'}} onClick={()=>handleDelete(u.id)}><FaTrash color="#e91e63" /></button>
                  <button title={u.enabled!==false?"تعطيل":"تفعيل"} style={{background:'none',border:'none',cursor:'pointer'}} onClick={()=>handleToggleEnable(u)}>{u.enabled!==false?<FaBan color="#e91e63" />:<FaCheckCircle color="#4caf50" />}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {showMap && (
        <div style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',background:'rgba(0,0,0,0.8)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'#fff',borderRadius:16,overflow:'hidden',width:'90%',maxWidth:800}}>
            <div style={{padding:16,background:'#00bcd4',color:'#fff',fontWeight:'bold',fontSize:18}}>اختر موقع الوحدة على الخريطة</div>
            <div style={{position:'relative',width:'100%',paddingTop:'56.25%'}}>
              <iframe src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${form.lat},${form.lng}`} style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',border:'none'}} allowFullScreen />
            </div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:12}}>
              <button onClick={()=>setShowMap(false)} style={{background:'#e91e63',color:'#fff',border:'none',borderRadius:8,padding:'8px 16px',fontWeight:'bold'}}>إغلاق</button>
              <button onClick={()=>{
                setForm(f=>({...f,lat:form.lat,lng:form.lng}));
                setShowMap(false);
              }} style={{background:'#00bcd4',color:'#fff',border:'none',borderRadius:8,padding:'8px 16px',fontWeight:'bold'}}>تأكيد الموقع</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnitsPanel;

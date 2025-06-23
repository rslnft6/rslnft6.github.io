import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../data/firebase';
import { FaTrash, FaMapMarkerAlt, FaEdit, FaCamera, FaImages, FaUser } from 'react-icons/fa';

const UNIT_TYPES = [
  'قصر','فيلا','بنتهاوس','توين هاوس','شقة','استوديو','غرفة فندقية','مكتب','أرض','محل','عيادة','مستشفى','مدرسة','أخرى'
];

// دعم خاصية المزاد والمشاركة في الشراء/الإيجار
const UnitsPanel: React.FC<{coOwnershipMode?: boolean, auctionMode?: boolean}> = ({ coOwnershipMode, auctionMode }) => {
  const [units, setUnits] = useState<any[]>([]);
  const [form, setForm] = useState({
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
  });
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  // إضافة حالة المشاركة في الشراء
  const [coOwners, setCoOwners] = useState<{name:string, share:number}[]>([]);
  // حالة المزاد
  const [auction, setAuction] = useState({ enabled: false, bids: [] as {user:string,amount:number}[], minBid: 0 });

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

  const handleAdd = async (e: any) => {
    e.preventDefault();
    setAdding(true);
    try {
      await addDoc(collection(db, 'units'), {
        ...form,
        title: `وحدة ${units.length + 1}`,
        hasGarden: !!form.hasGarden,
        hasPool: !!form.hasPool,
        coOwners: coOwnershipMode ? coOwners : undefined,
        auction: auctionMode && auction.enabled ? { enabled: true, minBid: auction.minBid, bids: [] } : undefined
      });
      setForm({
        title: '', type: 'شقة', area: '', price: '', rooms: '', bathrooms: '', floors: '', hasGarden: false, hasPool: false, developerId: '', compound: '', employee: '', phone: '', whatsapp: '', lat: '', lng: '', images: [], vrUrl: '', panoramaUrl: '', model3dUrl: '', paymentType: '', finance: ''
      });
      setCoOwners([]);
      setAuction({ enabled: false, bids: [], minBid: 0 });
    } catch {}
    setAdding(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('تأكيد حذف الوحدة؟')) return;
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'units', id));
    } catch {}
    setLoading(false);
  };

  return (
    <div style={{background:'rgba(255,255,255,0.18)',backdropFilter:'blur(16px)',borderRadius:24,boxShadow:'0 4px 32px #00bcd422',padding:32,border:'1.5px solid rgba(255,255,255,0.25)',margin:'32px 0'}}>
      <h2 style={{color:'#00bcd4',marginBottom:16}}>إدارة الوحدات العقارية</h2>
      <form onSubmit={handleAdd} style={{display:'flex',gap:8,marginBottom:24,flexWrap:'wrap'}}>
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
        <input value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder="رقم التواصل" style={{padding:8,borderRadius:8}} />
        <input value={form.whatsapp} onChange={e=>setForm(f=>({...f,whatsapp:e.target.value}))} placeholder="واتساب" style={{padding:8,borderRadius:8}} />
        <input value={form.lat} onChange={e=>setForm(f=>({...f,lat:e.target.value}))} placeholder="خط العرض (lat)" style={{padding:8,borderRadius:8}} />
        <input value={form.lng} onChange={e=>setForm(f=>({...f,lng:e.target.value}))} placeholder="خط الطول (lng)" style={{padding:8,borderRadius:8}} />
        <input value={form.vrUrl} onChange={e=>setForm(f=>({...f,vrUrl:e.target.value}))} placeholder="رابط VR" style={{padding:8,borderRadius:8}} />
        <input value={form.panoramaUrl} onChange={e=>setForm(f=>({...f,panoramaUrl:e.target.value}))} placeholder="رابط بانوراما" style={{padding:8,borderRadius:8}} />
        <input value={form.model3dUrl} onChange={e=>setForm(f=>({...f,model3dUrl:e.target.value}))} placeholder="رابط نموذج 3D" style={{padding:8,borderRadius:8}} />
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
        <button type="submit" style={{background:'#00bcd4',color:'#fff',border:'none',borderRadius:8,padding:'8px 20px',fontWeight:'bold'}} disabled={adding}>إضافة وحدة</button>
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
              <th style={{padding:8}}>الحمامات</th>
              <th style={{padding:8}}>الأدوار</th>
              <th style={{padding:8}}>حديقة</th>
              <th style={{padding:8}}>مسبح</th>
              <th style={{padding:8}}>الموظف</th>
              <th style={{padding:8}}>المشاركون في الشراء</th>
              <th style={{padding:8}}>المزاد</th>
              <th style={{padding:8}}>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {units.map((u,i) => (
              <tr key={u.id} style={{borderBottom:'1px solid #eee'}}>
                <td style={{padding:8}}>{u.title||`وحدة ${i+1}`}</td>
                <td style={{padding:8}}>{u.type}</td>
                <td style={{padding:8}}>{u.area}</td>
                <td style={{padding:8}}>{u.price}</td>
                <td style={{padding:8}}>{u.rooms}</td>
                <td style={{padding:8}}>{u.bathrooms}</td>
                <td style={{padding:8}}>{u.floors}</td>
                <td style={{padding:8}}>{u.hasGarden?'✅':'❌'}</td>
                <td style={{padding:8}}>{u.hasPool?'✅':'❌'}</td>
                <td style={{padding:8}}>{u.employee}</td>
                <td style={{padding:8}}>{Array.isArray(u.coOwners) && u.coOwners.length>0 ? u.coOwners.map((o:any)=>`${o.name} (${o.share}%)`).join(', ') : '-'}</td>
                <td style={{padding:8}}>{u.auction && u.auction.enabled ? `أعلى مزايدة: ${u.auction.bids && u.auction.bids.length>0 ? Math.max(...u.auction.bids.map((b:any)=>b.amount)) : 'لا يوجد'} (${u.auction.bids ? u.auction.bids.length : 0} مشارك)` : '-'}</td>
                <td style={{padding:8,display:'flex',gap:8}}>
                  <button title="تعديل" style={{background:'none',border:'none',cursor:'pointer'}}><FaEdit color="#00bcd4" /></button>
                  <button title="حذف" style={{background:'none',border:'none',cursor:'pointer'}} onClick={()=>handleDelete(u.id)}><FaTrash color="#e91e63" /></button>
                  <button title="موقع على الخريطة" style={{background:'none',border:'none',cursor:'pointer'}}><FaMapMarkerAlt color="#4caf50" /></button>
                  <button title="صور" style={{background:'none',border:'none',cursor:'pointer'}}><FaImages color="#607d8b" /></button>
                  <button title="موظف" style={{background:'none',border:'none',cursor:'pointer'}}><FaUser color="#ff9800" /></button>
                </td>
                {u.auction && u.auction.enabled && (
                  <form onSubmit={async e=>{
                    e.preventDefault();
                    const amount = Number((e.target as any).bid.value);
                    if (!amount || amount < u.auction.minBid) return alert('المبلغ أقل من الحد الأدنى');
                    const user = prompt('اسم المزايد:');
                    if (!user) return;
                    const docRef = doc(db, 'units', u.id);
                    const newBids = [...(u.auction.bids||[]), {user,amount}];
                    await addDoc(collection(db, 'units', u.id, 'bids'), {user,amount,date:Date.now()});
                    await addDoc(collection(db, 'units'), {...u, auction: {...u.auction, bids: newBids}});
                    alert('تمت إضافة المزايدة!');
                  }} style={{marginTop:8,display:'flex',gap:8,alignItems:'center'}}>
                    <input name="bid" type="number" min={u.auction.minBid} placeholder="مبلغ المزايدة" style={{padding:6,borderRadius:8,width:120}} />
                    <button type="submit" style={{background:'#e91e63',color:'#fff',border:'none',borderRadius:8,padding:'4px 10px'}}>مزايدة</button>
                  </form>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UnitsPanel;

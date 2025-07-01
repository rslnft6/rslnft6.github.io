import { useEffect, useState } from 'react';
import { db } from '../data/firebase';
import { collection, addDoc, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
console.log('=== DevPanel.tsx Mounted ===');

// الحقول الموسعة للوحدة العقارية
const initialForm = {
  title: '',
  type: '',
  details: '',
  rooms: '',
  baths: '',
  contact: '',
  location: '',
  image: '', // لاحقاً: رابط الصورة
  panorama: '', // لاحقاً: رابط بانوراما
  model3d: '', // لاحقاً: رابط 3D
};

// لوحة تحكم المطورين: إضافة وحدات ومتابعة التسكين
const DevPanel: React.FC = () => {
  const [units, setUnits] = useState<any[]>([]);
  const [form, setForm] = useState<any>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [success, setSuccess] = useState<string|null>(null);

  // جلب الوحدات بشكل لحظي
  useEffect(() => {
    setLoading(true);
    const unsub = onSnapshot(collection(db, 'units'), (snapshot) => {
      setUnits(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => {
      setError('خطأ في جلب البيانات: ' + err.message);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm((f: any) => ({ ...f, [name]: value }));
  };
  // إضافة وحدة
  const handleAdd = async () => {
    if (!form.title || !form.type || !form.details) return setError('يرجى ملء جميع الحقول الأساسية');
    setLoading(true);
    try {
      await addDoc(collection(db, 'units'), form);
      setForm(initialForm);
      setSuccess('تمت إضافة الوحدة بنجاح!');
      setError(null);
    } catch (err: any) {
      setError('خطأ في الإضافة: ' + (err?.message || String(err)));
      setSuccess(null);
    }
    setLoading(false);
  };
  // حذف وحدة
  const handleDelete = async (id: string) => {
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
  const handleExport = () => {
    if (!units.length) return alert('لا توجد بيانات للتصدير');
    const csv = [Object.keys(units[0])].concat(units).map(it => Object.values(it).join(",")).join("\n");
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-units.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div style={{background:'#fff',borderRadius:16,padding:24,boxShadow:'0 2px 16px #e0e0e0',margin:'32px 0'}}>
      <h2 style={{color:'#00bcd4'}}>لوحة تحكم المطور</h2>
      {success && <div style={{color:'#388e3c',marginBottom:12}}>{success}</div>}
      {error && <div style={{color:'red',marginBottom:12}}>{error}</div>}
      <div style={{margin:'16px 0',color:'#555'}}>مرحباً بك في لوحة تحكم المطور. يمكنك إضافة وحداتك ومتابعة التسكين.</div>
      <div style={{margin:'16px 0',display:'flex',flexWrap:'wrap',gap:8}}>
        <input name="title" placeholder="اسم الوحدة" value={form.title} onChange={handleChange} style={{margin:'4px',padding:'8px',borderRadius:8}} />
        <input name="type" placeholder="نوع الوحدة" value={form.type} onChange={handleChange} style={{margin:'4px',padding:'8px',borderRadius:8}} />
        <input name="details" placeholder="تفاصيل" value={form.details} onChange={handleChange} style={{margin:'4px',padding:'8px',borderRadius:8}} />
        <input name="rooms" placeholder="عدد الغرف" value={form.rooms} onChange={handleChange} style={{margin:'4px',padding:'8px',borderRadius:8,width:100}} />
        <input name="baths" placeholder="عدد الحمامات" value={form.baths} onChange={handleChange} style={{margin:'4px',padding:'8px',borderRadius:8,width:100}} />
        <input name="contact" placeholder="رقم التواصل" value={form.contact} onChange={handleChange} style={{margin:'4px',padding:'8px',borderRadius:8,width:140}} />
        <input name="location" placeholder="الموقع (مثال: القاهرة)" value={form.location} onChange={handleChange} style={{margin:'4px',padding:'8px',borderRadius:8,width:160}} />
        <input name="image" placeholder="رابط صورة (مؤقت)" value={form.image} onChange={handleChange} style={{margin:'4px',padding:'8px',borderRadius:8,width:180}} />
        <input name="panorama" placeholder="رابط بانوراما (مؤقت)" value={form.panorama} onChange={handleChange} style={{margin:'4px',padding:'8px',borderRadius:8,width:180}} />
        <input name="model3d" placeholder="رابط 3D/VR (مؤقت)" value={form.model3d} onChange={handleChange} style={{margin:'4px',padding:'8px',borderRadius:8,width:180}} />
        <button onClick={handleAdd} style={{background:'#00bcd4',color:'#fff',border:'none',borderRadius:8,padding:'8px 20px',fontWeight:'bold',margin:'4px'}} disabled={loading}>إضافة وحدة</button>
      </div>
      <button onClick={handleExport} style={{background:'#00bcd4',color:'#fff',border:'none',borderRadius:8,padding:'8px 20px',fontWeight:'bold',margin:'16px 0'}}>تصدير وحداتي Excel/CSV</button>
      <h4>وحداتك الحالية:</h4>
      {loading && <div style={{color:'#00bcd4'}}>جاري التحميل...</div>}
      <ul>
        {units.map(u => (
          <li key={u.id} style={{margin:'8px 0',padding:'8px',background:'#f5f7fa',borderRadius:8,position:'relative'}}>
            <b>{u.title}</b> - {u.type} <br />
            <span style={{color:'#888'}}>{u.details}</span><br/>
            {u.rooms && <span>غرف: {u.rooms} </span>}
            {u.baths && <span> | حمامات: {u.baths}</span>}<br/>
            {u.contact && <span style={{color:'#1976d2'}}>تواصل: {u.contact}</span>}<br/>
            {u.location && <span>الموقع: {u.location}</span>}<br/>
            {u.image && <img src={u.image} alt="img" style={{width:60,borderRadius:6,margin:'4px 0'}} />}
            {u.panorama && <span style={{color:'#00bcd4'}}>بانوراما: {u.panorama}</span>}<br/>
            {u.model3d && <span style={{color:'#00bcd4'}}>3D/VR: {u.model3d}</span>}<br/>
            <button onClick={()=>handleDelete(u.id)} style={{position:'absolute',top:8,left:8,background:'#e53935',color:'#fff',border:'none',borderRadius:6,padding:'2px 10px',fontWeight:'bold',cursor:'pointer'}}>حذف</button>
          </li>
        ))}
      </ul>
      {/* مكان لمتابعة التسكين الذكي لاحقاً */}
      <div style={{marginTop:24,padding:16,background:'#e0eafc',borderRadius:12}}>
        <b>متابعة التسكين الذكي (قريباً):</b>
        <p style={{margin:'8px 0 0 0',color:'#555'}}>سيتم هنا عرض حالة تسكين وحداتك واقتراحات ذكية لتحسين التسكين.</p>
      </div>
    </div>
  );
};

export default DevPanel;

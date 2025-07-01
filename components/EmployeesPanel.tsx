import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../data/firebase';
import { FaUserEdit, FaTrash, FaUserShield, FaCheckCircle, FaBan, FaPlus } from 'react-icons/fa';
import imageCompression from 'browser-image-compression';

const ROLES = ['مدير', 'مشرف', 'بروكر', 'تسويق', 'دعم', 'موظف'];

const EmployeesPanel: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'موظف', price: '', developer: '', hasPool: false, hasGarden: false, image: '', enabled: true });
  const [imageFile, setImageFile] = useState<File|null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string|null>(null);

  useEffect(() => {
    setLoading(true);
    // جلب الموظفين لحظيًا
    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      setEmployees(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const resetForm = () => {
    setForm({ name: '', email: '', phone: '', role: 'موظف', price: '', developer: '', hasPool: false, hasGarden: false, image: '', enabled: true });
    setImageFile(null);
    setEditingId(null);
  };

  // إضافة أو تعديل
  const handleAddOrEdit = async (e: any) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) return;
    setAdding(true);
    let imageUrl = form.image;
    try {
      if (imageFile) {
        // ضغط الصورة قبل الرفع
        const compressedFile = await imageCompression(imageFile, { maxSizeMB: 0.3, maxWidthOrHeight: 600, useWebWorker: true });
        const { getStorage, ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
        const storage = getStorage();
        const imgRef = ref(storage, `employees/${Date.now()}_${imageFile.name}`);
        await uploadBytes(imgRef, compressedFile);
        imageUrl = await getDownloadURL(imgRef);
      }
      const data = { ...form, image: imageUrl };
      if (editingId) {
        // تعديل
        await import('firebase/firestore').then(({ updateDoc, doc }) => updateDoc(doc(db, 'users', editingId), data));
      } else {
        // إضافة جديدة
        await addDoc(collection(db, 'users'), data);
      }
      resetForm();
    } catch {}
    setAdding(false);
  };

  const handleEdit = (emp: any) => {
    setForm({ ...emp, enabled: emp.enabled !== false });
    setEditingId(emp.id);
    setImageFile(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('تأكيد حذف الموظف؟')) return;
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'users', id));
    } catch {}
    setLoading(false);
  };

  const handleToggleEnable = async (emp: any) => {
    setLoading(true);
    try {
      await import('firebase/firestore').then(({ updateDoc, doc }) => updateDoc(doc(db, 'users', emp.id), { enabled: !emp.enabled }));
    } catch {}
    setLoading(false);
  };

  // تنسيق متجاوب
  return (
    <div style={{
      background:'rgba(255,255,255,0.18)',
      backdropFilter:'blur(16px)',
      borderRadius:24,
      boxShadow:'0 4px 32px #00bcd422',
      padding:'4vw 2vw',
      border:'1.5px solid rgba(255,255,255,0.25)',
      margin:'32px 0',
      maxWidth:1200,
      width:'100%',
      minHeight:'80vh',
      overflowX:'auto',
      marginLeft:'auto',
      marginRight:'auto',
      // Responsive
      display:'flex',
      flexDirection:'column',
      alignItems:'center',
    }}>
      <h2 style={{color:'#00bcd4',marginBottom:16,fontSize:24,textAlign:'center'}}>إدارة الموظفين</h2>
      <form onSubmit={handleAddOrEdit} style={{display:'flex',gap:8,marginBottom:24,flexWrap:'wrap',justifyContent:'center',alignItems:'flex-start'}}>
        <input required value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="اسم الموظف" style={inputStyle} />
        <input required value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="البريد الإلكتروني" style={inputStyle} />
        <input required value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder="رقم الهاتف" style={inputStyle} />
        <input value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} placeholder="الراتب أو السعر" style={inputStyle} />
        <input value={form.developer} onChange={e=>setForm(f=>({...f,developer:e.target.value}))} placeholder="اسم المطور/الشركة" style={inputStyle} />
        <label style={{display:'flex',alignItems:'center',gap:4,fontSize:14}}>
          <input type="checkbox" checked={form.hasPool} onChange={e=>setForm(f=>({...f,hasPool:e.target.checked}))} /> حمام سباحة
        </label>
        <label style={{display:'flex',alignItems:'center',gap:4,fontSize:14}}>
          <input type="checkbox" checked={form.hasGarden} onChange={e=>setForm(f=>({...f,hasGarden:e.target.checked}))} /> جاردن
        </label>
        <select value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))} style={inputStyle}>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        {/* حقل رفع صورة */}
        <input type="file" accept="image/*" onChange={e=>setImageFile(e.target.files?.[0]||null)} style={{minWidth:120}} />
        {/* معاينة الصورة */}
        {imageFile && (
          <img src={URL.createObjectURL(imageFile)} alt="معاينة" style={{width:48,height:48,borderRadius:'50%',objectFit:'cover',border:'1.5px solid #00bcd4',margin:'0 8px'}} />
        )}
        <button type="submit" style={{background:'#00bcd4',color:'#fff',border:'none',borderRadius:8,padding:'8px 20px',fontWeight:'bold',minWidth:100}} disabled={adding}>{editingId ? 'تحديث' : 'إضافة'}</button>
        <button type="button" onClick={resetForm} style={{background:'#607d8b',color:'#fff',border:'none',borderRadius:8,padding:'8px 20px',fontWeight:'bold'}}><FaPlus /> تفريغ الحقول</button>
      </form>
      {loading ? <div>جاري تحميل الموظفين...</div> : (
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:15,background:'rgba(255,255,255,0.12)',borderRadius:16,overflow:'hidden'}}>
          <thead>
            <tr style={{background:'rgba(0,188,212,0.08)'}}>
              <th style={thStyle}>الاسم</th>
              <th style={thStyle}>البريد</th>
              <th style={thStyle}>الهاتف</th>
              <th style={thStyle}>الدور</th>
              <th style={thStyle}>الراتب/السعر</th>
              <th style={thStyle}>المطور/الشركة</th>
              <th style={thStyle}>حمام سباحة</th>
              <th style={thStyle}>جاردن</th>
              <th style={thStyle}>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => (
              <tr key={emp.id} style={{borderBottom:'1px solid #eee',background:emp.enabled===false?'#ffeaea':'unset'}}>
                <td style={tdStyle}>
                  {emp.image && <img src={emp.image} alt="صورة" style={{width:36,height:36,borderRadius:'50%',objectFit:'cover',marginLeft:6,verticalAlign:'middle',border:'1.5px solid #00bcd4'}} />}
                  {emp.name}
                </td>
                <td style={tdStyle}>{emp.email}</td>
                <td style={tdStyle}>{emp.phone}</td>
                <td style={tdStyle}>{emp.role}</td>
                <td style={tdStyle}>{emp.price||'-'}</td>
                <td style={tdStyle}>{emp.developer||'-'}</td>
                <td style={tdStyle}>{emp.hasPool?'✅':'❌'}</td>
                <td style={tdStyle}>{emp.hasGarden?'✅':'❌'}</td>
                <td style={{padding:8,display:'flex',gap:8}}>
                  <button title="تعديل" style={{background:'none',border:'none',cursor:'pointer'}} onClick={()=>handleEdit(emp)}><FaUserEdit color="#00bcd4" /></button>
                  <button title="حذف" style={{background:'none',border:'none',cursor:'pointer'}} onClick={()=>handleDelete(emp.id)}><FaTrash color="#e91e63" /></button>
                  <button title={emp.enabled!==false?"تعطيل":"تفعيل"} style={{background:'none',border:'none',cursor:'pointer'}} onClick={()=>handleToggleEnable(emp)}>{emp.enabled!==false?<FaBan color="#e91e63" />:<FaCheckCircle color="#4caf50" />}</button>
                  <button title="الصلاحيات" style={{background:'none',border:'none',cursor:'pointer'}}><FaUserShield color="#4caf50" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  padding:8,
  borderRadius:8,
  minWidth:120,
  border:'1px solid #b6c6e6',
  fontSize:15,
  marginBottom:4
};
const thStyle: React.CSSProperties = {
  padding:8,
  fontWeight:'bold',
  background:'rgba(0,188,212,0.06)',
  color:'#00bcd4',
  fontSize:15
};
const tdStyle: React.CSSProperties = {
  padding:8,
  color:'#222',
  fontSize:15
};

export default EmployeesPanel;

import React, { useEffect, useState } from 'react';
import { db } from '../data/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { developers } from '../data/developers';

interface Compound {
  id?: string;
  name: string;
  logo?: string;
  developer?: string;
  city?: string;
  country?: string;
}

const initialForm: Compound = { name: '', logo: '', developer: '', city: '', country: '' };

const CompoundsPanel: React.FC = () => {
  const [compounds, setCompounds] = useState<Compound[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Compound>(initialForm);
  const [editId, setEditId] = useState<string | null>(null);

  // جلب الكمباوندات من فايرستور
  const fetchCompounds = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, 'compounds'));
    setCompounds(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Compound)));
    setLoading(false);
  };

  useEffect(() => {
    fetchCompounds();
  }, []);

  // إضافة أو تعديل كمباوند
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      const { id, ...formData } = form;
      await updateDoc(doc(db, 'compounds', editId), formData);
    } else {
      await addDoc(collection(db, 'compounds'), form);
    }
    setShowForm(false);
    setForm(initialForm);
    setEditId(null);
    fetchCompounds();
  };

  // حذف كمباوند
  const handleDelete = async (id: string) => {
    if (window.confirm('تأكيد حذف الكمباوند؟')) {
      await deleteDoc(doc(db, 'compounds', id));
      fetchCompounds();
    }
  };

  // تعبئة النموذج للتعديل
  const handleEdit = (compound: Compound) => {
    setForm(compound);
    setEditId(compound.id!);
    setShowForm(true);
  };

  return (
    <div className="glass-table" style={{maxWidth:900,margin:'0 auto'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
        <h2 style={{color:'#00bcd4',fontWeight:'bold'}}>إدارة الكمباوندات</h2>
        <button className="glass-btn" onClick={()=>{setShowForm(true);setForm(initialForm);setEditId(null);}}>إضافة كمباوند</button>
      </div>
      {loading ? <div>جاري التحميل...</div> : (
        <table>
          <thead>
            <tr>
              <th>الاسم</th>
              <th>المطور</th>
              <th>المدينة</th>
              <th>الدولة</th>
              <th>شعار</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {compounds.map(c => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.developer}</td>
                <td>{c.city}</td>
                <td>{c.country}</td>
                <td>{c.logo && <img src={c.logo} alt="logo" style={{width:40}} />}</td>
                <td>
                  <button className="glass-btn" style={{padding:'4px 12px',fontSize:15}} onClick={()=>handleEdit(c)}>تعديل</button>
                  <button className="glass-btn" style={{padding:'4px 12px',fontSize:15,background:'#e53935',color:'#fff'}} onClick={()=>handleDelete(c.id!)}>حذف</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* نموذج الإضافة/التعديل */}
      {showForm && (
        <form className="glass-form" style={{marginTop:24}} onSubmit={handleSubmit}>
          <h3 style={{color:'#00bcd4',fontWeight:'bold'}}>{editId ? 'تعديل كمباوند' : 'إضافة كمباوند'}</h3>
          <input required placeholder="اسم الكمباوند" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} />
          <select required value={form.developer} onChange={e=>setForm(f=>({...f,developer:e.target.value}))}>
            <option value="">اختر المطور</option>
            {developers.map(dev => (
              <option key={dev.id} value={dev.name}>{dev.name}</option>
            ))}
          </select>
          <input placeholder="المدينة" value={form.city} onChange={e=>setForm(f=>({...f,city:e.target.value}))} />
          <input placeholder="الدولة" value={form.country} onChange={e=>setForm(f=>({...f,country:e.target.value}))} />
          {/* رفع صورة الشعار */}
          <input type="file" accept="image/*" onChange={async e=>{
            const file = e.target.files?.[0];
            if (file) {
              const { getStorage, ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
              const storage = getStorage();
              const imgRef = ref(storage, `compounds/${Date.now()}_${file.name}`);
              await uploadBytes(imgRef, file);
              const url = await getDownloadURL(imgRef);
              setForm(f=>({...f,logo:url}));
            }
          }} />
          {form.logo && <img src={form.logo} alt="شعار" style={{width:48,height:48,borderRadius:8,margin:'8px 0'}} />}
          <div style={{display:'flex',gap:12,marginTop:12}}>
            <button className="glass-btn" type="submit">{editId ? 'حفظ التعديلات' : 'إضافة'}</button>
            <button className="glass-btn" type="button" style={{background:'#e53935',color:'#fff'}} onClick={()=>{setShowForm(false);setEditId(null);}}>إلغاء</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CompoundsPanel;

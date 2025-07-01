import React, { useEffect, useState } from 'react';
import { db } from '../data/firebase';
import { doc as fsDoc, getDoc, setDoc } from 'firebase/firestore';
import { defaultContacts, ContactLinks, ContactLink } from '../data/contacts';

const emptyLink: ContactLink = { id: '', platform: '', url: '', icon: '' };

const ContactsPanel: React.FC = () => {
  const [contacts, setContacts] = useState<ContactLinks>(defaultContacts);
  const [loading, setLoading] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [form, setForm] = useState<ContactLink>(emptyLink);

  useEffect(() => {
    const fetchContacts = async () => {
      setLoading(true);
      try {
        const ref = fsDoc(db, 'settings', 'contacts');
        const snap = await getDoc(ref);
        if (snap.exists()) setContacts(snap.data() as ContactLinks);
      } catch {}
      setLoading(false);
    };
    fetchContacts();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const ref = fsDoc(db, 'settings', 'contacts');
      await setDoc(ref, contacts);
    } catch {}
    setLoading(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.platform || !form.url) return;
    if (editIndex !== null) {
      // تعديل رابط
      const updated = [...contacts];
      updated[editIndex] = { ...form };
      setContacts(updated);
      setEditIndex(null);
    } else {
      // إضافة رابط جديد
      setContacts([...contacts, { ...form, id: form.id || Date.now().toString() }]);
    }
    setForm(emptyLink);
  };

  const handleEdit = (idx: number) => {
    setEditIndex(idx);
    setForm(contacts[idx]);
  };

  const handleDelete = (idx: number) => {
    if (!window.confirm('هل أنت متأكد من حذف الرابط؟')) return;
    const updated = contacts.filter((_, i) => i !== idx);
    setContacts(updated);
    setEditIndex(null);
    setForm(emptyLink);
  };

  return (
    <div className="glass-table" style={{maxWidth:700,margin:'0 auto'}}>
      <h2 style={{color:'#00bcd4',fontWeight:'bold'}}>تواصل معنا - روابط التواصل</h2>
      <form className="glass-form" onSubmit={handleFormSubmit} style={{marginBottom:24}}>
        <input placeholder="اسم المنصة" value={form.platform} onChange={e=>setForm(f=>({...f,platform:e.target.value}))} />
        <input placeholder="الرابط أو الرقم" value={form.url} onChange={e=>setForm(f=>({...f,url:e.target.value}))} />
        <input placeholder="اسم الأيقونة (اختياري)" value={form.icon||''} onChange={e=>setForm(f=>({...f,icon:e.target.value}))} />
        <button className="glass-btn" type="submit" disabled={loading}>{editIndex!==null?'تعديل':'إضافة'}</button>
        {editIndex!==null && <button type="button" className="glass-btn" onClick={()=>{setEditIndex(null);setForm(emptyLink);}}>إلغاء</button>}
      </form>
      <div style={{marginBottom:16}}>
        <button className="glass-btn" onClick={handleSave} disabled={loading}>حفظ جميع التغييرات</button>
      </div>
      <table style={{width:'100%',background:'rgba(255,255,255,0.05)',borderRadius:8}}>
        <thead>
          <tr style={{color:'#00bcd4'}}>
            <th>المنصة</th>
            <th>الرابط</th>
            <th>أيقونة</th>
            <th>إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((c,idx)=>(
            <tr key={c.id||idx}>
              <td>{c.platform}</td>
              <td style={{direction:'ltr'}}>{c.url}</td>
              <td>{c.icon}</td>
              <td>
                <button className="glass-btn" type="button" onClick={()=>handleEdit(idx)}>تعديل</button>
                <button className="glass-btn" type="button" style={{background:'#e53935'}} onClick={()=>handleDelete(idx)}>حذف</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ContactsPanel;

import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../data/firebase';
import { FaTrash, FaEdit } from 'react-icons/fa';

const DevelopersPanel: React.FC = () => {
  const [developers, setDevelopers] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', country: '' });
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchDevelopers = async () => {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, 'developers'));
        setDevelopers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch {}
      setLoading(false);
    };
    fetchDevelopers();
  }, [adding]);

  const handleAdd = async (e: any) => {
    e.preventDefault();
    setAdding(true);
    try {
      await addDoc(collection(db, 'developers'), form);
      setForm({ name: '', country: '' });
    } catch {}
    setAdding(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('تأكيد حذف المطور؟')) return;
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'developers', id));
    } catch {}
    setLoading(false);
  };

  return (
    <div style={{background:'rgba(255,255,255,0.18)',backdropFilter:'blur(16px)',borderRadius:24,boxShadow:'0 4px 32px #00bcd422',padding:32,border:'1.5px solid rgba(255,255,255,0.25)',margin:'32px 0'}}>
      <h2 style={{color:'#00bcd4',marginBottom:16}}>إدارة المطورين</h2>
      <form onSubmit={handleAdd} style={{display:'flex',gap:8,marginBottom:24,flexWrap:'wrap'}}>
        <input required value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="اسم المطور" style={{padding:8,borderRadius:8}} />
        <input value={form.country} onChange={e=>setForm(f=>({...f,country:e.target.value}))} placeholder="الدولة" style={{padding:8,borderRadius:8}} />
        <button type="submit" style={{background:'#00bcd4',color:'#fff',border:'none',borderRadius:8,padding:'8px 20px',fontWeight:'bold'}} disabled={adding}>إضافة مطور</button>
      </form>
      {loading ? <div>جاري تحميل المطورين...</div> : (
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:16,background:'rgba(255,255,255,0.12)',borderRadius:16}}>
          <thead>
            <tr style={{background:'rgba(0,188,212,0.08)'}}>
              <th style={{padding:8}}>الاسم</th>
              <th style={{padding:8}}>الدولة</th>
              <th style={{padding:8}}>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {developers.map(dev => (
              <tr key={dev.id} style={{borderBottom:'1px solid #eee'}}>
                <td style={{padding:8}}>{dev.name}</td>
                <td style={{padding:8}}>{dev.country}</td>
                <td style={{padding:8,display:'flex',gap:8}}>
                  <button title="تعديل" style={{background:'none',border:'none',cursor:'pointer'}}><FaEdit color="#00bcd4" /></button>
                  <button title="حذف" style={{background:'none',border:'none',cursor:'pointer'}} onClick={()=>handleDelete(dev.id)}><FaTrash color="#e91e63" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DevelopersPanel;

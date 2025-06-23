import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../data/firebase';

const STAGES = [
  'جديد',
  'تواصل أولي',
  'عرض وحدة',
  'تفاوض',
  'تم البيع',
  'مغلق'
];

const CRM: React.FC = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', phone: '', email: '', stage: 'جديد', note: '' });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, 'leads'));
        setLeads(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch {}
      setLoading(false);
    };
    fetchLeads();
  }, [adding]);

  const handleAdd = async (e: any) => {
    e.preventDefault();
    setAdding(true);
    try {
      await addDoc(collection(db, 'leads'), form);
      setForm({ name: '', phone: '', email: '', stage: 'جديد', note: '' });
    } catch {}
    setAdding(false);
  };

  const handleStageChange = async (id: string, stage: string) => {
    try {
      await updateDoc(doc(db, 'leads', id), { stage });
      setLeads(leads => leads.map(l => l.id === id ? { ...l, stage } : l));
    } catch {}
  };

  return (
    <div style={{background:'#fff',borderRadius:12,padding:24,boxShadow:'0 2px 8px #eee',margin:'32px 0'}}>
      <h2 style={{marginBottom:16}}>إدارة العملاء المحتملين (CRM)</h2>
      <form onSubmit={handleAdd} style={{display:'flex',gap:8,marginBottom:24,flexWrap:'wrap'}}>
        <input required value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="اسم العميل" style={{padding:8,borderRadius:8}} />
        <input required value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder="رقم الهاتف" style={{padding:8,borderRadius:8}} />
        <input value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="البريد الإلكتروني" style={{padding:8,borderRadius:8}} />
        <select value={form.stage} onChange={e=>setForm(f=>({...f,stage:e.target.value}))} style={{padding:8,borderRadius:8}}>
          {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <input value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))} placeholder="ملاحظة" style={{padding:8,borderRadius:8}} />
        <button type="submit" style={{background:'#00bcd4',color:'#fff',border:'none',borderRadius:8,padding:'8px 20px',fontWeight:'bold'}} disabled={adding}>إضافة</button>
      </form>
      {loading ? <div>جاري تحميل العملاء...</div> : (
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:16}}>
          <thead>
            <tr style={{background:'#f5f5f5'}}>
              <th style={{padding:8}}>الاسم</th>
              <th style={{padding:8}}>الهاتف</th>
              <th style={{padding:8}}>البريد</th>
              <th style={{padding:8}}>المرحلة</th>
              <th style={{padding:8}}>ملاحظة</th>
            </tr>
          </thead>
          <tbody>
            {leads.map(lead => (
              <tr key={lead.id}>
                <td style={{padding:8}}>{lead.name}</td>
                <td style={{padding:8}}>{lead.phone}</td>
                <td style={{padding:8}}>{lead.email}</td>
                <td style={{padding:8}}>
                  <select value={lead.stage} onChange={e=>handleStageChange(lead.id, e.target.value)} style={{padding:4,borderRadius:6}}>
                    {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td style={{padding:8}}>{lead.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CRM;

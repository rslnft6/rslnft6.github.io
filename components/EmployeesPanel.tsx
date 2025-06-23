import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../data/firebase';
import { FaUserEdit, FaTrash, FaUserShield } from 'react-icons/fa';

const ROLES = ['مدير', 'مشرف', 'بروكر', 'تسويق', 'دعم', 'موظف'];

const EmployeesPanel: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'موظف' });
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, 'users'));
        setEmployees(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch {}
      setLoading(false);
    };
    fetchEmployees();
  }, [adding]);

  const handleAdd = async (e: any) => {
    e.preventDefault();
    setAdding(true);
    try {
      await addDoc(collection(db, 'users'), form);
      setForm({ name: '', email: '', phone: '', role: 'موظف' });
    } catch {}
    setAdding(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('تأكيد حذف الموظف؟')) return;
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'users', id));
    } catch {}
    setLoading(false);
  };

  return (
    <div style={{background:'rgba(255,255,255,0.18)',backdropFilter:'blur(16px)',borderRadius:24,boxShadow:'0 4px 32px #00bcd422',padding:32,border:'1.5px solid rgba(255,255,255,0.25)',margin:'32px 0'}}>
      <h2 style={{color:'#00bcd4',marginBottom:16}}>إدارة الموظفين</h2>
      <form onSubmit={handleAdd} style={{display:'flex',gap:8,marginBottom:24,flexWrap:'wrap'}}>
        <input required value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="اسم الموظف" style={{padding:8,borderRadius:8}} />
        <input required value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="البريد الإلكتروني" style={{padding:8,borderRadius:8}} />
        <input required value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder="رقم الهاتف" style={{padding:8,borderRadius:8}} />
        <select value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))} style={{padding:8,borderRadius:8}}>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <button type="submit" style={{background:'#00bcd4',color:'#fff',border:'none',borderRadius:8,padding:'8px 20px',fontWeight:'bold'}} disabled={adding}>إضافة</button>
      </form>
      {loading ? <div>جاري تحميل الموظفين...</div> : (
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:16,background:'rgba(255,255,255,0.12)',borderRadius:16}}>
          <thead>
            <tr style={{background:'rgba(0,188,212,0.08)'}}>
              <th style={{padding:8}}>الاسم</th>
              <th style={{padding:8}}>البريد</th>
              <th style={{padding:8}}>الهاتف</th>
              <th style={{padding:8}}>الدور</th>
              <th style={{padding:8}}>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => (
              <tr key={emp.id} style={{borderBottom:'1px solid #eee'}}>
                <td style={{padding:8}}>{emp.name}</td>
                <td style={{padding:8}}>{emp.email}</td>
                <td style={{padding:8}}>{emp.phone}</td>
                <td style={{padding:8}}>{emp.role}</td>
                <td style={{padding:8,display:'flex',gap:8}}>
                  <button title="تعديل" style={{background:'none',border:'none',cursor:'pointer'}}><FaUserEdit color="#00bcd4" /></button>
                  <button title="حذف" style={{background:'none',border:'none',cursor:'pointer'}} onClick={()=>handleDelete(emp.id)}><FaTrash color="#e91e63" /></button>
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

export default EmployeesPanel;

import React, { useEffect, useState } from 'react';
import { db } from '../data/firebase';
import { collection, getDocs } from 'firebase/firestore';

const CompareUnits: React.FC = () => {
  const [units, setUnits] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const snap = await getDocs(collection(db, 'units'));
        setUnits(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch {}
    };
    fetchUnits();
  }, []);

  const toggleSelect = (id: string) => {
    setSelected(sel => sel.includes(id) ? sel.filter(s => s !== id) : [...sel, id]);
  };

  const compared = units.filter(u => selected.includes(u.id));

  return (
    <div style={{background:'#fff',borderRadius:12,padding:24,margin:'32px 0',boxShadow:'0 2px 8px #eee'}}>
      <h3 style={{color:'#00bcd4',marginBottom:12}}>مقارنة العقارات</h3>
      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:16}}>
        {units.map(u => (
          <button key={u.id} onClick={()=>toggleSelect(u.id)} style={{background:selected.includes(u.id)?'#00bcd4':'#eee',color:selected.includes(u.id)?'#fff':'#333',border:'none',borderRadius:8,padding:'8px 16px',cursor:'pointer'}}>
            {u.title || u.id}
          </button>
        ))}
      </div>
      {compared.length > 0 && (
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:16}}>
          <thead>
            <tr style={{background:'#f5f5f5'}}>
              <th style={{padding:8}}>العقار</th>
              <th style={{padding:8}}>المساحة</th>
              <th style={{padding:8}}>السعر</th>
              <th style={{padding:8}}>الغرف</th>
              <th style={{padding:8}}>الحمامات</th>
              <th style={{padding:8}}>المطور</th>
            </tr>
          </thead>
          <tbody>
            {compared.map(u => (
              <tr key={u.id}>
                <td style={{padding:8}}>{u.title}</td>
                <td style={{padding:8}}>{u.area}</td>
                <td style={{padding:8}}>{u.price}</td>
                <td style={{padding:8}}>{u.rooms}</td>
                <td style={{padding:8}}>{u.bathrooms}</td>
                <td style={{padding:8}}>{u.developerId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {compared.length === 0 && <div style={{color:'#888'}}>اختر عقارين أو أكثر للمقارنة.</div>}
    </div>
  );
};

export default CompareUnits;

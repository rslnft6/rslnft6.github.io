import React, { useState } from 'react';
import { FaChartBar, FaPlus, FaUsers, FaBullhorn, FaHome, FaSignOutAlt } from 'react-icons/fa';

const SECTIONS = [
  { key: 'dashboard', label: 'لوحة الإحصائيات', icon: <FaChartBar size={22} /> },
  { key: 'add-unit', label: 'إضافة وحدة', icon: <FaPlus size={22} /> },
  { key: 'employees', label: 'الموظفون', icon: <FaUsers size={22} /> },
  { key: 'ads', label: 'الإعلانات', icon: <FaBullhorn size={22} /> },
  { key: 'units', label: 'كل الوحدات', icon: <FaHome size={22} /> },
];

const GlassSidebar: React.FC<{ section: string, setSection: (s: string) => void }> = ({ section, setSection }) => (
  <aside style={{
    minHeight: '100vh',
    width: 90,
    background: 'rgba(255,255,255,0.18)',
    backdropFilter: 'blur(16px)',
    borderRight: '1.5px solid rgba(255,255,255,0.25)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '32px 0',
    position: 'fixed',
    top: 0,
    right: 0,
    zIndex: 1000
  }}>
    {SECTIONS.map(s => (
      <button key={s.key} onClick={()=>setSection(s.key)}
        style={{
          background: section===s.key?'rgba(0,188,212,0.18)':'transparent',
          border: 'none',
          borderRadius: 16,
          margin: '12px 0',
          padding: 12,
          cursor: 'pointer',
          boxShadow: section===s.key?'0 2px 12px #00bcd455':'none',
          transition: 'all 0.2s',
          color: section===s.key?'#00bcd4':'#333',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
        title={s.label}
      >
        {s.icon}
        <span style={{fontSize:12,marginTop:4}}>{s.label}</span>
      </button>
    ))}
    <div style={{flex:1}} />
    <button style={{background:'rgba(255,255,255,0.12)',border:'none',borderRadius:16,padding:12,margin:'12px 0',cursor:'pointer'}} title="تسجيل الخروج">
      <FaSignOutAlt size={22} color="#e91e63" />
    </button>
  </aside>
);

export default GlassSidebar;

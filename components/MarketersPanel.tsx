import React from 'react';

const MarketersPanel: React.FC = () => {
  return (
    <div style={{background:'rgba(255,255,255,0.18)',backdropFilter:'blur(16px)',borderRadius:24,boxShadow:'0 4px 32px #00bcd422',padding:32,border:'1.5px solid rgba(255,255,255,0.25)',margin:'32px 0'}}>
      <h2 style={{color:'#00bcd4',marginBottom:16}}>لوحة المسوقين</h2>
      <div>قريبًا: إدارة المسوقين، إضافة، حذف، تحليلات، ربط CRM، صلاحيات متقدمة.</div>
    </div>
  );
};

export default MarketersPanel;

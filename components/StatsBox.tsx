import React, { useEffect, useState } from 'react';

const START_STATS = {
  users: 3000000,
  properties: 4000000,
  devs: 1300,
  views: 9000000
};

const StatsBox: React.FC<{ extra?: { users?: number; properties?: number; devs?: number; views?: number } }>
 = ({ extra = {} }) => {
  const [stats, setStats] = useState({ ...START_STATS, ...extra });

  useEffect(() => {
    // عداد متزايد تلقائي
    const interval = setInterval(() => {
      setStats(s => ({
        ...s,
        users: s.users + Math.floor(Math.random() * 3) + 1,
        views: s.views + Math.floor(Math.random() * 7) + 1
      }));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{background:'#fff',borderRadius:16,padding:24,boxShadow:'0 2px 16px #e0e0e0',margin:'32px 0',display:'flex',gap:24,justifyContent:'center',flexWrap:'wrap'}}>
      <div><b style={{color:'#00bcd4',fontSize:28}}>{stats.users.toLocaleString()}</b><div style={{color:'#888'}}>مستخدم</div></div>
      <div><b style={{color:'#ff9800',fontSize:28}}>{stats.properties.toLocaleString()}</b><div style={{color:'#888'}}>وحدة عقارية</div></div>
      <div><b style={{color:'#673ab7',fontSize:28}}>{stats.devs.toLocaleString()}</b><div style={{color:'#888'}}>مطور</div></div>
      <div><b style={{color:'#00e676',fontSize:28}}>{stats.views.toLocaleString()}</b><div style={{color:'#888'}}>مشاهدة</div></div>
    </div>
  );
};

export default StatsBox;

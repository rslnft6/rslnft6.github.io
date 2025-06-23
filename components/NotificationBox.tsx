import React, { useEffect, useState } from 'react';

const NotificationBox: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    // بيانات تجريبية
    setNotifications([
      { msg: 'تم إضافة وحدة جديدة', date: '2025-06-23' },
      { msg: 'تم تحديث بيانات موظف', date: '2025-06-22' },
      { msg: 'تم تسجيل دخول جديد', date: '2025-06-21' },
    ]);
  }, []);

  return (
    <div style={{background:'#fff',borderRadius:12,padding:24,margin:'32px 0',boxShadow:'0 2px 8px #eee'}}>
      <h3 style={{color:'#00bcd4',marginBottom:12}}>الإشعارات</h3>
      <ul style={{listStyle:'none',padding:0}}>
        {notifications.map((n,i) => (
          <li key={i} style={{borderBottom:'1px solid #eee',padding:'8px 0'}}>
            <span style={{color:'#2196f3',fontWeight:'bold'}}>{n.msg}</span>
            <span style={{float:'left',color:'#aaa',fontSize:12}}>{n.date}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationBox;

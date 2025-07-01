import React, { useEffect, useState } from 'react';

const AnalyticsBox: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>({});
  useEffect(() => {
    // بيانات تجريبية
    setAnalytics({
      activeUsers: 1200,
      bounceRate: 38,
      avgSession: 4.2,
      topCities: ['القاهرة','دبي','الرياض'],
      topUnits: ['وحدة 1','وحدة 2','وحدة 3'],
    });
  }, []);
  return (
    <div style={{background:'#fff',borderRadius:12,padding:24,margin:'32px 0',boxShadow:'0 2px 8px #eee'}}>
      <h3 style={{color:'#00bcd4',marginBottom:12}}>تحليلات متقدمة</h3>
      <div>المستخدمون النشطون: <b>{analytics.activeUsers}</b></div>
      <div>معدل الارتداد: <b>{analytics.bounceRate}%</b></div>
      <div>متوسط مدة الجلسة: <b>{analytics.avgSession} دقيقة</b></div>
      <div>أكثر المدن نشاطًا: <b>{analytics.topCities?.join(', ')}</b></div>
      <div>أكثر الوحدات مشاهدة: <b>{analytics.topUnits?.join(', ')}</b></div>
    </div>
  );
};

export default AnalyticsBox;

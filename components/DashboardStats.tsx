import { Bar, Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import { FaUser, FaUsers, FaBuilding, FaIndustry, FaChartLine, FaEye } from 'react-icons/fa';
import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../data/firebase';

const DashboardStats: React.FC = () => {
  const [stats, setStats] = useState({
    users: 0,
    employees: 0,
    units: 0,
    developers: 0,
    leads: 0,
    visits: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const employees = usersSnap.docs.filter(doc => doc.data().role !== 'عميل').length;
        const clients = usersSnap.docs.filter(doc => doc.data().role === 'عميل').length;
        const unitsSnap = await getDocs(collection(db, 'units'));
        const devsSnap = await getDocs(collection(db, 'developers'));
        // leads & visits: بيانات تجريبية
        setStats({
          users: usersSnap.size,
          employees,
          units: unitsSnap.size,
          developers: devsSnap.size,
          leads: 1200,
          visits: 50000,
        });
      } catch {}
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) return <div>جاري تحميل الإحصائيات...</div>;

  const statCards = [
    { label: 'إجمالي المستخدمين', value: stats.users, color: '#00bcd4', icon: <FaUsers size={32} color="#00bcd4" /> },
    { label: 'عدد الموظفين', value: stats.employees, color: '#4caf50', icon: <FaUser size={32} color="#4caf50" /> },
    { label: 'عدد العقارات', value: stats.units, color: '#ff9800', icon: <FaBuilding size={32} color="#ff9800" /> },
    { label: 'عدد المطورين', value: stats.developers, color: '#3f51b5', icon: <FaIndustry size={32} color="#3f51b5" /> },
    { label: 'العملاء المحتملين (Leads)', value: stats.leads, color: '#e91e63', icon: <FaChartLine size={32} color="#e91e63" /> },
    { label: 'زيارات الموقع', value: stats.visits, color: '#607d8b', icon: <FaEye size={32} color="#607d8b" /> },
  ];

  return (
    <div style={{display:'flex',flexWrap:'wrap',gap:24,marginBottom:32}}>
      {statCards.map(card => (
        <div key={card.label} style={{background:'#fff',borderRadius:12,padding:24,minWidth:220,boxShadow:'0 2px 8px #eee',display:'flex',alignItems:'center',gap:16}}>
          {card.icon}
          <div>
            <div style={{fontSize:32,fontWeight:'bold',color:card.color}}>{card.value}</div>
            <div>{card.label}</div>
          </div>
        </div>
      ))}
      <div style={{flex:'1 1 100%',marginTop:32,background:'#fff',borderRadius:12,padding:24,boxShadow:'0 2px 8px #eee'}}>
        <Bar
          data={{
            labels: ['المستخدمون','الموظفون','العقارات','المطورون','Leads','الزيارات'],
            datasets: [{
              label: 'إحصائيات عامة',
              data: [stats.users,stats.employees,stats.units,stats.developers,stats.leads,stats.visits],
              backgroundColor: [
                '#00bcd4','#4caf50','#ff9800','#3f51b5','#e91e63','#607d8b'
              ]
            }]
          }}
          options={{responsive:true,plugins:{legend:{display:false}}}}
        />
      </div>
      <div style={{flex:'1 1 100%',marginTop:32,background:'#fff',borderRadius:12,padding:24,boxShadow:'0 2px 8px #eee'}}>
        <Pie
          data={{
            labels: ['المستخدمون','الموظفون','العقارات','المطورون','Leads','الزيارات'],
            datasets: [{
              label: 'نسبة التوزيع',
              data: [stats.users,stats.employees,stats.units,stats.developers,stats.leads,stats.visits],
              backgroundColor: [
                '#00bcd4','#4caf50','#ff9800','#3f51b5','#e91e63','#607d8b'
              ]
            }]
          }}
          options={{responsive:true,plugins:{legend:{position:'bottom'}}}}
        />
      </div>
    </div>
  );
};

export default DashboardStats;

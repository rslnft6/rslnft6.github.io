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
    <div style={{
      display:'flex',
      flexWrap:'wrap',
      gap:24,
      marginBottom:32,
      background:'rgba(255,255,255,0.18)',
      backdropFilter:'blur(16px)',
      borderRadius:24,
      boxShadow:'0 4px 32px #00bcd422',
      padding:'32px 16px',
      border:'1.5px solid rgba(255,255,255,0.25)'
    }}>
      {/* KPIs Section */}
      <div style={{flex:'1 1 100%',marginBottom:32,display:'flex',gap:24,justifyContent:'center',alignItems:'center',flexWrap:'wrap'}}>
        <KPIBox label="نسبة الموظفين إلى المستخدمين" value={stats.users ? ((stats.employees/stats.users)*100).toFixed(1)+"%" : "-"} color="#4caf50" />
        <KPIBox label="نسبة المطورين إلى العقارات" value={stats.units ? ((stats.developers/stats.units)*100).toFixed(1)+"%" : "-"} color="#3f51b5" />
        <KPIBox label="معدل العملاء المحتملين لكل موظف" value={stats.employees ? (stats.leads/stats.employees).toFixed(1) : "-"} color="#e91e63" />
        <KPIBox label="معدل الزيارات لكل وحدة" value={stats.units ? (stats.visits/stats.units).toFixed(0) : "-"} color="#607d8b" />
      </div>
      {/* Stat Cards */}
      {statCards.map(card => (
        <div key={card.label} style={{
          background:'rgba(255,255,255,0.35)',
          borderRadius:16,
          padding:24,
          minWidth:220,
          boxShadow:'0 2px 12px #00bcd433',
          display:'flex',
          alignItems:'center',
          gap:16,
          border:'1.5px solid rgba(255,255,255,0.18)'
        }}>
          {card.icon}
          <div>
            <div style={{fontSize:32,fontWeight:'bold',color:card.color,textShadow:'0 2px 8px #fff'}}> {card.value} </div>
            <div style={{fontWeight:'bold',color:'#222'}}>{card.label}</div>
          </div>
        </div>
      ))}
      {/* Bar Chart */}
      <div style={{flex:'1 1 100%',marginTop:32,background:'rgba(255,255,255,0.18)',borderRadius:24,padding:24,boxShadow:'0 2px 16px #00bcd422',backdropFilter:'blur(16px)',border:'1.5px solid rgba(255,255,255,0.25)'}}>
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
      {/* Pie Chart */}
      <div style={{flex:'1 1 100%',marginTop:32,background:'rgba(255,255,255,0.18)',borderRadius:24,padding:24,boxShadow:'0 2px 16px #00bcd422',backdropFilter:'blur(16px)',border:'1.5px solid rgba(255,255,255,0.25)'}}>
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
      {/* Textual Analytics */}
      <div style={{flex:'1 1 100%',marginTop:32,background:'rgba(255,255,255,0.22)',borderRadius:24,padding:24,boxShadow:'0 2px 16px #00bcd422',backdropFilter:'blur(16px)',border:'1.5px solid rgba(255,255,255,0.25)',color:'#222',fontWeight:'bold',fontSize:18}}>
        <div>تحليل ذكي للأداء:</div>
        <ul style={{marginTop:12,lineHeight:2}}>
          <li>نسبة الموظفين إلى المستخدمين {stats.users ? ((stats.employees/stats.users)*100).toFixed(1)+"%" : "-"} (كل موظف يخدم تقريبًا {stats.users && stats.employees ? Math.round(stats.users/stats.employees) : "-"} مستخدم).</li>
          <li>معدل العملاء المحتملين لكل موظف: {stats.employees ? (stats.leads/stats.employees).toFixed(1) : "-"} lead.</li>
          <li>معدل الزيارات لكل وحدة: {stats.units ? (stats.visits/stats.units).toFixed(0) : "-"} زيارة.</li>
          <li>نسبة المطورين إلى العقارات: {stats.units ? ((stats.developers/stats.units)*100).toFixed(1)+"%" : "-"}.</li>
          <li>اقتراح: زيادة عدد الموظفين أو تحسين معدل التحويل لرفع عدد العملاء المحتملين.</li>
        </ul>
      </div>
    </div>
  );
};

export default DashboardStats;

// مكون KPIBox الزجاجي
const KPIBox = ({label, value, color}:{label:string,value:string,color:string}) => (
  <div style={{
    background:'rgba(255,255,255,0.35)',
    borderRadius:16,
    padding:'18px 32px',
    minWidth:200,
    boxShadow:'0 2px 12px #00bcd433',
    display:'flex',
    flexDirection:'column',
    alignItems:'center',
    border:'1.5px solid rgba(255,255,255,0.18)',
    marginBottom:8
  }}>
    <div style={{fontSize:28,fontWeight:'bold',color,marginBottom:4}}>{value}</div>
    <div style={{fontWeight:'bold',color:'#222',fontSize:15}}>{label}</div>
  </div>
);

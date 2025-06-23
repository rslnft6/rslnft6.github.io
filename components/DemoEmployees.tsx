import React from 'react';

const employees = [
  { name: 'أحمد علي', role: 'مدير', phone: '01000000001', email: 'ahmed@company.com' },
  { name: 'سارة محمد', role: 'مشرف', phone: '01000000002', email: 'sara@company.com' },
  { name: 'محمد سمير', role: 'موظف', phone: '01000000003', email: 'mohamed@company.com' },
  { name: 'ليلى حسن', role: 'دعم فني', phone: '01000000004', email: 'laila@company.com' },
  // ... المزيد
];

const DemoEmployees: React.FC = () => (
  <div style={{background:'#fff',borderRadius:12,padding:24,margin:'32px 0',boxShadow:'0 2px 8px #eee'}}>
    <h3 style={{color:'#00bcd4',marginBottom:12}}>بيانات تجريبية للموظفين</h3>
    <table style={{width:'100%',borderCollapse:'collapse',fontSize:16}}>
      <thead>
        <tr style={{background:'#f5f5f5'}}>
          <th style={{padding:8}}>الاسم</th>
          <th style={{padding:8}}>الدور</th>
          <th style={{padding:8}}>الهاتف</th>
          <th style={{padding:8}}>البريد الإلكتروني</th>
        </tr>
      </thead>
      <tbody>
        {employees.map((emp,i) => (
          <tr key={i}>
            <td style={{padding:8}}>{emp.name}</td>
            <td style={{padding:8}}>{emp.role}</td>
            <td style={{padding:8}}>{emp.phone}</td>
            <td style={{padding:8}}>{emp.email}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default DemoEmployees;

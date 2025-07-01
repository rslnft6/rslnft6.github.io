import React from 'react';
import { useRouter } from 'next/router';

const DeveloperDetails: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  // يمكنك جلب بيانات المطور هنا بناءً على id
  return (
    <div style={{padding:32}}>
      <h1 style={{color:'#00bcd4'}}>تفاصيل المطور العقاري</h1>
      <p>معرف المطور: {id}</p>
      {/* تفاصيل المطور */}
    </div>
  );
};

export default DeveloperDetails;

import React from 'react';
import { useRouter } from 'next/router';

const CompoundDetails: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  // يمكنك جلب بيانات الكمباوند هنا بناءً على id
  return (
    <div style={{padding:32}}>
      <h1 style={{color:'#00bcd4'}}>تفاصيل الكمباوند</h1>
      <p>معرف الكمباوند: {id}</p>
      {/* تفاصيل الكمباوند */}
    </div>
  );
};

export default CompoundDetails;

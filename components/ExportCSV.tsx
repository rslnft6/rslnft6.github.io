import React from 'react';
import { getAllProperties } from '../data/properties';

function convertToCSV(arr: any[]) {
  const array = [Object.keys(arr[0])].concat(arr);
  return array.map(it => Object.values(it).join(",")).join("\n");
}

const ExportCSV: React.FC<{ data?: any[], filename?: string }> = ({ data, filename }) => {
  const handleExport = () => {
    const exportData = data && data.length ? data : getAllProperties();
    if (!exportData.length) return alert('لا توجد بيانات للتصدير');
    const csv = convertToCSV(exportData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'properties.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };
  return (
    <button onClick={handleExport} style={{background:'#00bcd4',color:'#fff',border:'none',borderRadius:8,padding:'8px 20px',fontWeight:'bold',margin:'16px 0'}}>تصدير الوحدات Excel/CSV</button>
  );
};

export default ExportCSV;

import React from 'react';
// @ts-ignore
const QRCode = require('qrcode.react');

const ShareBox: React.FC<{ title: string; url: string; image?: string }> = ({ title, url, image }) => {
  const shareText = encodeURIComponent(`${title} - اكتشف الوحدة على Realstatelive`);
  const shareUrl = encodeURIComponent(url);
  return (
    <div style={{display:'flex',gap:16,alignItems:'center',flexWrap:'wrap',margin:'16px 0'}}>
      <button onClick={()=>window.open(`https://wa.me/?text=${shareText}%20${shareUrl}`,'_blank')} style={{background:'#25d366',color:'#fff',border:'none',borderRadius:8,padding:'8px 16px',fontWeight:'bold',cursor:'pointer'}}>واتساب</button>
      <button onClick={()=>window.open(`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`,'_blank')} style={{background:'#1da1f2',color:'#fff',border:'none',borderRadius:8,padding:'8px 16px',fontWeight:'bold',cursor:'pointer'}}>تويتر</button>
      <button onClick={()=>window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,'_blank')} style={{background:'#1877f3',color:'#fff',border:'none',borderRadius:8,padding:'8px 16px',fontWeight:'bold',cursor:'pointer'}}>فيسبوك</button>
      <button onClick={()=>{navigator.clipboard.writeText(url);alert('تم نسخ الرابط!')}} style={{background:'#00bcd4',color:'#fff',border:'none',borderRadius:8,padding:'8px 16px',fontWeight:'bold',cursor:'pointer'}}>نسخ الرابط</button>
      <div style={{textAlign:'center'}}>
        <QRCode value={url} size={64} level="H" includeMargin={true} />
        <div style={{fontSize:12,color:'#888'}}>QR Code</div>
      </div>
    </div>
  );
};

export default ShareBox;

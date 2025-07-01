import React, { useState } from 'react';

const VideoTour: React.FC = () => {
  const [url, setUrl] = useState('');
  return (
    <div style={{background:'#fff',borderRadius:16,padding:24,margin:'32px 0',boxShadow:'0 2px 16px #e0e0e0'}}>
      <h3 style={{color:'#00bcd4',marginBottom:12}}>جولة فيديو مباشرة أو مسجلة</h3>
      <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="رابط فيديو YouTube أو Vimeo أو بث مباشر..." style={{width:'100%',marginBottom:12,borderRadius:8,padding:8,border:'1px solid #ccc'}} />
      {url && (
        <div style={{position:'relative',paddingBottom:'56.25%',height:0,overflow:'hidden',borderRadius:12}}>
          <iframe src={url.replace('watch?v=','embed/')} frameBorder="0" allowFullScreen style={{position:'absolute',top:0,left:0,width:'100%',height:'100%'}}></iframe>
        </div>
      )}
      <div style={{color:'#888',fontSize:13,marginTop:8}}>يمكنك لصق رابط فيديو بانوراما 360 أو بث مباشر لجولة حقيقية.</div>
    </div>
  );
};
export default VideoTour;

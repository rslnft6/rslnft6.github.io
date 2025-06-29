import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation, Pagination } from 'swiper/modules';

interface Compound {
  id?: string|number;
  name: string;
  logo?: string;
  developer?: string;
  city?: string;
  country?: string;
}

export default function CompoundsSlider({ compounds, onCompoundClick }: { compounds: Compound[], onCompoundClick?: (compound: Compound) => void }) {
  return (
    <div style={{width:'100%',maxWidth:1400,margin:'32px auto',borderRadius:24,overflow:'hidden',boxShadow:'0 4px 32px #00bcd422',background:'rgba(255,255,255,0.92)',backdropFilter:'blur(12px)',padding:'32px 0'}}>
      <h2 style={{textAlign:'center',color:'#00bcd4',fontWeight:'bold',fontSize:30,marginBottom:24,letterSpacing:1}}>أشهر الكمباوندات</h2>
      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={24}
        slidesPerView={4}
        navigation
        pagination={{ clickable: true }}
        style={{padding:'0 24px'}}>
        {compounds.map((c, i) => (
          <SwiperSlide key={c.id||i}>
            <div
              onClick={()=>onCompoundClick?.(c)}
              style={{
                cursor:'pointer',
                background:'rgba(255,255,255,0.98)',
                borderRadius:18,
                boxShadow:'0 2px 12px #00bcd422',
                padding:20,
                display:'flex',
                flexDirection:'column',
                alignItems:'center',
                border:'2px solid #00bcd4',
                transition:'0.18s',
                minHeight:260,
                position:'relative',
                overflow:'hidden',
              }}
            >
              <img src={c.logo||'/images/bg1.png'} alt={c.name} style={{width:90,height:90,objectFit:'contain',borderRadius:14,marginBottom:12,background:'#fff',border:'1.5px solid #eee',boxShadow:'0 2px 8px #00bcd433'}} />
              <div style={{fontWeight:'bold',color:'#00bcd4',fontSize:20,marginBottom:6,textAlign:'center'}}>{c.name}</div>
              <div style={{color:'#888',fontSize:15,textAlign:'center'}}>{c.developer}</div>
              <div style={{color:'#ff9800',fontSize:14,textAlign:'center'}}>{c.city}</div>
              <span style={{position:'absolute',top:12,right:12,background:'#00bcd4',color:'#fff',borderRadius:8,padding:'2px 10px',fontSize:13,fontWeight:'bold',boxShadow:'0 2px 8px #00bcd433'}}>{c.country}</span>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

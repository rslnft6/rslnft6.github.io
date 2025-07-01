import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

const imageList = [
  '/images/bg1.png', '/images/bg2.png', '/images/bg3.png', '/images/bg4.png', '/images/bg5.png',
  '/images/bg6.png', '/images/bg7.png', '/images/bg8.png', '/images/bg9.png', '/images/bg10.jpg',
  '/images/bg10.png', '/images/bg1.jpg', '/images/bg2.jpg', '/images/bg3.jpg', '/images/bg4.jpg',
];

const ImagesSlider: React.FC = () => (
  <div style={{margin:'24px 0'}}>
    <Swiper spaceBetween={12} slidesPerView={3} style={{marginBottom: 16}}>
      {imageList.map((img, i) => (
        <SwiperSlide key={i}>
          <img
            src={img}
            alt={`bg${i+1}`}
            style={{width:'100%',height:120,objectFit:'cover',borderRadius:12,boxShadow:'0 2px 8px #e0e0e0',cursor:'pointer'}}
            onClick={() => {
              window.location.href = `/ads/${i+1}`;
            }}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  </div>
);

export default ImagesSlider;

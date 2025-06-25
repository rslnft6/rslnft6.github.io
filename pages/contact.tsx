import Reviews from '../components/Reviews';
import VideoTour from '../components/VideoTour';
import StatsBox from '../components/StatsBox';
import { FaWhatsapp, FaPhone, FaFacebook, FaSnapchatGhost, FaTwitter, FaInstagram, FaTelegram, FaDiscord, FaEnvelope } from 'react-icons/fa';
import { defaultContacts as contacts } from '../data/contacts';
import { useState } from 'react';

export default function ContactPage() {
  const [showContacts, setShowContacts] = useState(false);
  return (
    <div style={{maxWidth:700,margin:'32px auto',background:'#fff',borderRadius:16,padding:24,boxShadow:'0 2px 16px #eee'}}>
      <h2 style={{color:'#00bcd4',marginBottom:16}}>تواصل معنا</h2>
      <button onClick={()=>setShowContacts(!showContacts)} style={{background:'#00bcd4',color:'#fff',border:'none',borderRadius:8,padding:'12px 32px',fontWeight:'bold',fontSize:20,cursor:'pointer',marginBottom:24}}>إظهار وسائل التواصل</button>
      {showContacts && (
        <div style={{marginTop:8,display:'flex',flexWrap:'wrap',justifyContent:'center',gap:18}}>
          {contacts.map((contact) => {
            switch(contact.id) {
              case 'whatsapp':
                return <a key={contact.id} href={`https://wa.me/${contact.url}`} target="_blank" rel="noopener noreferrer" style={{color:'#25d366',fontSize:28}} title="واتساب"><FaWhatsapp /></a>;
              case 'phone':
                return <a key={contact.id} href={`tel:${contact.url}`} style={{color:'#00bcd4',fontSize:28}} title="اتصال"><FaPhone /></a>;
              case 'facebook':
                return <a key={contact.id} href={contact.url} target="_blank" rel="noopener noreferrer" style={{color:'#1877f3',fontSize:28}} title="فيسبوك"><FaFacebook /></a>;
              case 'snapchat':
                return <a key={contact.id} href={contact.url} target="_blank" rel="noopener noreferrer" style={{color:'#fffc00',fontSize:28}} title="سناب شات"><FaSnapchatGhost /></a>;
              case 'twitter':
                return <a key={contact.id} href={contact.url} target="_blank" rel="noopener noreferrer" style={{color:'#1da1f2',fontSize:28}} title="تويتر"><FaTwitter /></a>;
              case 'instagram':
                return <a key={contact.id} href={contact.url} target="_blank" rel="noopener noreferrer" style={{color:'#e1306c',fontSize:28}} title="انستجرام"><FaInstagram /></a>;
              case 'telegram':
                return <a key={contact.id} href={contact.url} target="_blank" rel="noopener noreferrer" style={{color:'#0088cc',fontSize:28}} title="تيليجرام"><FaTelegram /></a>;
              case 'discord':
                return <a key={contact.id} href={contact.url} target="_blank" rel="noopener noreferrer" style={{color:'#5865f2',fontSize:28}} title="ديسكورد"><FaDiscord /></a>;
              case 'gmail':
                return <a key={contact.id} href={contact.url} target="_blank" rel="noopener noreferrer" style={{color:'#00bcd4',fontSize:28}} title="Gmail"><FaEnvelope /></a>;
              default:
                return null;
            }
          })}
        </div>
      )}
      <div style={{margin:'32px 0'}}>
        <StatsBox />
        <Reviews />
        <div style={{marginTop:32}}>
          <VideoTour />
        </div>
      </div>
    </div>
  );
}

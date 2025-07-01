import React, { useState } from 'react';
import { FaUsers, FaHandshake, FaInfoCircle } from 'react-icons/fa';

const aboutText = `\
منصة One World Realty هي منصة عقارية عالمية رائدة مقرها الرئيسي في كندا، سنغافورة، إنجلترا، ألمانيا، والإمارات. نقدم حلولاً رقمية متكاملة لربط المشترين والبائعين والمستثمرين حول العالم، مع دعم كامل للذكاء الاصطناعي، البحث الذكي، الدردشة الذكية، إدارة العقارات، التحليلات، المزادات، المشاركة في الشراء والإيجار، وربط مع أنظمة CRM عالمية.

نؤمن بالابتكار والتطور المستمر، ونعمل على دمج تقنيات NFT والعقود الذكية والعملات الرقمية (One World Coin) لتمكين الملكية المشتركة، المزادات الذكية، والمحافظ الرقمية، مع واجهات زجاجية عصرية وتجربة مستخدم عالمية.

هدفنا بناء مجتمع عقاري عالمي شفاف وآمن وسريع، يدعم جميع الأدوار (مدير، مشرف، بروكر، عميل) ويوفر أدوات احترافية لإدارة العقارات، التسويق، التحليل، والمشاركة الذكية.
`;

const partners = [
  { name: 'Google', url: 'https://google.com', icon: '🌐' },
  { name: 'EspoCRM', url: 'https://www.espocrm.com/', icon: '🤝' },
  { name: 'Firebase', url: 'https://firebase.google.com/', icon: '🔥' },
  { name: 'OpenAI', url: 'https://openai.com/', icon: '🤖' },
];

const contacts = [
  { label: 'واتساب', icon: '📱', url: 'https://wa.me/123456789' },
  { label: 'البريد', icon: '✉️', url: 'mailto:info@oneworldrealty.com' },
  { label: 'تويتر', icon: '🐦', url: 'https://twitter.com/oneworldrealty' },
  { label: 'لينكدإن', icon: '💼', url: 'https://linkedin.com/company/oneworldrealty' },
];

const BottomGlassNav: React.FC = () => {
  const [active, setActive] = useState<string | null>(null);
  return (
    <>
      {/* الشريط الزجاجي السفلي */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100vw',
        zIndex: 100,
        display: 'flex',
        justifyContent: 'center',
        gap: 48,
        background: 'linear-gradient(90deg,rgba(255,255,255,0.32) 0%,rgba(0,188,212,0.13) 100%)',
        backdropFilter: 'blur(18px)',
        borderTop: '1.5px solid rgba(255,255,255,0.18)',
        boxShadow: '0 -2px 24px #00bcd422',
        padding: '12px 0 8px 0',
      }}>
        <button onClick={() => setActive('contact')} style={iconBtnStyle} title="تواصل معنا">
          <FaUsers size={28} />
        </button>
        <button onClick={() => setActive('partners')} style={iconBtnStyle} title="شركاؤنا">
          <FaHandshake size={28} />
        </button>
        <button onClick={() => setActive('about')} style={iconBtnStyle} title="من نحن">
          <FaInfoCircle size={28} />
        </button>
      </div>
      {/* نافذة زجاجية للمحتوى */}
      {active && (
        <div style={{
          position: 'fixed',
          bottom: 70,
          left: '50%',
          transform: 'translateX(-50%)',
          minWidth: 320,
          maxWidth: 420,
          background: 'rgba(255,255,255,0.38)',
          borderRadius: 24,
          boxShadow: '0 2px 24px #00bcd433',
          border: '1.5px solid rgba(255,255,255,0.22)',
          padding: 28,
          zIndex: 101,
          backdropFilter: 'blur(18px)',
          color: '#222',
          textAlign: 'center',
        }}>
          <button onClick={() => setActive(null)} style={{position:'absolute',top:10,right:18,background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#00bcd4'}}>×</button>
          {active === 'about' && (
            <div>
              <h2 style={{color:'#00bcd4',marginBottom:12}}>من نحن</h2>
              <div style={{fontSize:16,whiteSpace:'pre-line',marginBottom:8}}>{aboutText}</div>
            </div>
          )}
          {active === 'partners' && (
            <div>
              <h2 style={{color:'#00bcd4',marginBottom:12}}>شركاؤنا</h2>
              <ul style={{listStyle:'none',padding:0,margin:0}}>
                {partners.map((p,i)=>(
                  <li key={i} style={{margin:'10px 0',fontSize:17}}>
                    <span style={{fontSize:22,marginLeft:8}}>{p.icon}</span>
                    <a href={p.url} target="_blank" rel="noopener noreferrer" style={{color:'#222',textDecoration:'none',fontWeight:'bold'}}>{p.name}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {active === 'contact' && (
            <div>
              <h2 style={{color:'#00bcd4',marginBottom:12}}>تواصل معنا</h2>
              <ul style={{listStyle:'none',padding:0,margin:0}}>
                {contacts.map((c,i)=>(
                  <li key={i} style={{margin:'10px 0',fontSize:17}}>
                    <a href={c.url} target="_blank" rel="noopener noreferrer" style={{color:'#222',textDecoration:'none',fontWeight:'bold'}}>
                      <span style={{fontSize:22,marginLeft:8}}>{c.icon}</span>{c.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </>
  );
};

const iconBtnStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.55)',
  border: '1.5px solid rgba(255,255,255,0.22)',
  borderRadius: '50%',
  width: 56,
  height: 56,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 2px 12px #00bcd422',
  color: '#00bcd4',
  fontSize: 24,
  cursor: 'pointer',
  transition: '0.2s',
  margin: '0 8px',
};

export default BottomGlassNav;

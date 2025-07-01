import React, { useState, useEffect } from 'react';
import { searchPropertiesInText } from '../services/smartChatSearch';
import { getAllProperties } from '../data/properties';

// نموذج دردشة ذكية تفاعلية متعدد الخطوات (قابل للتوسعة)
// يدعم جمع معلومات العميل واقتراح وحدات وخدمات بناءً على احتياجه

const SmartChat: React.FC = () => {
  // إدارة حالة الحوار
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  // حالة الأسئلة التفاعلية
  const [step, setStep] = useState(0); // 0: ترحيب, 1: موقع, 2: ميزانية, 3: نوع, 4: غرف, 5: دفع, 6: اقتراح وحدات
  const [answers, setAnswers] = useState<any>({});

  // رسالة ترحيب تلقائية عند فتح الدردشة
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        { from: 'bot', text: 'مرحبًا بك في مساعد العقارات الذكي! 👋\nلنقترح لك أفضل الوحدات، أين ترغب بالبحث؟ (اكتب اسم مدينة أو كمباوند أو اختر من الخريطة مستقبلاً)' }
      ]);
      setStep(1);
    }
  }, []);

  // عرض الوحدات كبطاقات
  function renderUnits(units: any[]) {
    return (
      <div style={{display:'flex',flexDirection:'column',gap:12,margin:'12px 0'}}>
        {units.map((u,i)=>(
          <div key={u.id||i} style={{background:'rgba(255,255,255,0.85)',borderRadius:12,padding:12,boxShadow:'0 1px 8px #00bcd422',display:'flex',alignItems:'center',gap:12}}>
            <img src={u.img||'/images/logo.png'} alt={u.title} style={{width:54,height:54,borderRadius:10,objectFit:'cover',border:'1.5px solid #eee'}} />
            <div style={{flex:1}}>
              <div style={{fontWeight:'bold',color:'#00bcd4',fontSize:16}}>{u.title}</div>
              <div style={{color:'#607d8b',fontSize:14}}>{u.location||u.city} - {u.area||''}م</div>
              <div style={{color:'#222',fontSize:15}}>{u.price? u.price+' ج.م' : ''}</div>
            </div>
            <a href={'/property/'+(u.id||'')} style={{background:'#00bcd4',color:'#fff',borderRadius:8,padding:'6px 14px',textDecoration:'none',fontWeight:'bold',fontSize:14}}>تفاصيل</a>
          </div>
        ))}
      </div>
    );
  }

  // منطق الحوار التفاعلي متعدد الخطوات
  const handleStep = async (userInput: string) => {
    let nextStep = step;
    let newAnswers = { ...answers };
    if (step === 1) {
      newAnswers.location = userInput;
      setMessages(msgs => [...msgs, { from: 'bot', text: 'ما هي ميزانيتك التقريبية؟ (مثال: 2 مليون، أو نطاق: 1-3 مليون)' }]);
      nextStep = 2;
    } else if (step === 2) {
      newAnswers.budget = userInput;
      setMessages(msgs => [...msgs, { from: 'bot', text: 'ما نوع الوحدة المطلوبة؟ (شقة، فيلا، عيادة، مكتب...)' }]);
      nextStep = 3;
    } else if (step === 3) {
      newAnswers.type = userInput;
      setMessages(msgs => [...msgs, { from: 'bot', text: 'كم عدد الغرف المطلوبة؟' }]);
      nextStep = 4;
    } else if (step === 4) {
      newAnswers.rooms = userInput;
      setMessages(msgs => [...msgs, { from: 'bot', text: 'ما هو نظام الدفع المفضل؟ (كاش، تقسيط، تمويل بنكي)' }]);
      nextStep = 5;
    } else if (step === 5) {
      newAnswers.payment = userInput;
      // بحث ذكي عن الوحدات بناءً على الإجابات
      const results = searchPropertiesInText(
        `${newAnswers.type||''} في ${newAnswers.location||''} ${newAnswers.budget||''} ${newAnswers.rooms||''} غرف ${newAnswers.payment||''}`
      );
      setMessages(msgs => [
        ...msgs,
        { from: 'bot', text: results.length ? `وجدت ${results.length} وحدة تناسب طلبك!` : 'لم أجد وحدات مطابقة تمامًا، لكن هذه بعض الاقتراحات:' },
        { from: 'bot', units: results.length ? results : searchPropertiesInText(newAnswers.location||'') },
        { from: 'bot', text: 'هل ترغب في التواصل مع مستشار عقاري أو عرض خدمات قريبة (مدارس، مستشفيات، أندية)؟' }
      ]);
      nextStep = 6;
    } else if (step === 6) {
      // دعم رسائل مستقبلية (اشتراك رمزي، تقييمات، ربط API خارجي)
      setMessages(msgs => [...msgs, { from: 'bot', text: 'شكرًا لتواصلك! قريبًا سنوفر مزايا عالمية مثل تقييمات المستخدمين، دردشة مباشرة، وخدمات متقدمة.' }]);
      nextStep = 1;
      newAnswers = {};
    }
    setAnswers(newAnswers);
    setStep(nextStep);
    setInput('');
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    setMessages([...messages, { from: 'user', text: input }]);
    setLoading(true);
    await handleStep(input);
  };

  return (
    <div style={{background:'rgba(255,255,255,0.92)',borderRadius:16,padding:16,boxShadow:'0 2px 12px #00bcd422',margin:'32px 0',maxWidth:420,marginLeft:'auto',marginRight:'auto',backdropFilter:'blur(8px)'}}>
      <div style={{minHeight:80,maxHeight:220,overflowY:'auto',marginBottom:8}}>
        {messages.map((m,i) => (
          <div key={i} style={{textAlign:m.from==='user'?'right':'left',margin:'4px 0'}}>
            <span style={{
              background:m.from==='user'? '#e0f7fa':'#f5f7fa',
              padding:'6px 12px',
              borderRadius:8,
              display:'inline-block',
              color:'#111',
              maxWidth:320,
              wordBreak:'break-word'
            }}>{m.text}</span>
            {/* عرض الوحدات المقترحة كبطاقات */}
            {m.units && renderUnits(m.units)}
          </div>
        ))}
        {loading && <div style={{color:'#888'}}>...جاري الرد</div>}
      </div>
      <div style={{display:'flex',gap:8}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendMessage()} placeholder="اكتب إجابتك هنا..." style={{flex:1,padding:8,borderRadius:8,border:'1px solid #b6c6e6'}} />
        <button onClick={sendMessage} disabled={loading} style={{background:'#00bcd4',color:'#fff',border:'none',borderRadius:8,padding:'8px 16px',fontWeight:'bold'}}>إرسال</button>
      </div>
      {/* تعليقات لتوسعة مستقبلية: دعم تقييمات، فلترة متقدمة، ربط API خارجي، خريطة تفاعلية، تسجيل اجتماعي */}
    </div>
  );
};

export default SmartChat;

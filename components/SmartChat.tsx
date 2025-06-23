import React, { useState } from 'react';
import { searchPropertiesInText } from '../services/smartChatSearch';
import { getAllProperties } from '../data/properties';

// نموذج دردشة ذكية مجاني (يعتمد على نموذج مفتوح المصدر من HuggingFace)
const HF_API = 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium';

const SmartChat: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // تحليل نية المستخدم بشكل أعمق
  function detectIntent(text: string) {
    const q = text.toLowerCase();
    if (q.includes('شقة') || q.includes('فيلا') || q.includes('قصر') || q.includes('عيادة') || q.includes('محل') || q.includes('مكتب') || q.includes('بنتهاوس') || q.includes('تاون')) return 'search';
    if (q.includes('سعر') || q.includes('كم')) return 'price';
    if (q.includes('تواصل') || q.includes('مساعدة')) return 'help';
    return 'general';
  }

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

  const sendMessage = async () => {
    if (!input.trim()) return;
    setMessages([...messages, { from: 'user', text: input }]);
    setLoading(true);
    // تحليل نية المستخدم
    const intent = detectIntent(input);
    // بحث ذكي عن الوحدات
    const results = searchPropertiesInText(input);
    if (intent==='search' && results.length > 0) {
      setMessages(msgs => [
        ...msgs,
        { from: 'bot', text: `وجدت ${results.length} وحدة تناسب طلبك!`, units: results },
        { from: 'bot', text: 'هل ترغب في فلترة النتائج أو التواصل مع مستشار عقاري؟' }
      ]);
      setInput('');
      setLoading(false);
      return;
    }
    if (intent==='price') {
      setMessages(msgs => [...msgs, { from: 'bot', text: 'يمكنك البحث عن الأسعار بكتابة نوع الوحدة أو المدينة (مثال: "سعر شقة في القاهرة").' }]);
      setInput('');
      setLoading(false);
      return;
    }
    if (intent==='help') {
      setMessages(msgs => [...msgs, { from: 'bot', text: 'يسعدنا مساعدتك! يمكنك كتابة نوع الوحدة أو المدينة أو التواصل مع الدعم مباشرة.' }]);
      setInput('');
      setLoading(false);
      return;
    }
    // اقتراح تلقائي عام
    if (results.length > 0) {
      setMessages(msgs => [
        ...msgs,
        { from: 'bot', text: `وجدت بعض الوحدات التي قد تهمك:`, units: results }
      ]);
      setInput('');
      setLoading(false);
      return;
    }
    setMessages(msgs => [...msgs, { from: 'bot', text: 'شكرًا لسؤالك! يمكنك البحث عن وحدة بكتابة نوع العقار أو المدينة (مثال: "شقة في الشيخ زايد").' }]);
    setInput('');
    setLoading(false);
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
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendMessage()} placeholder="اكتب سؤالك..." style={{flex:1,padding:8,borderRadius:8,border:'1px solid #b6c6e6'}} />
        <button onClick={sendMessage} disabled={loading} style={{background:'#00bcd4',color:'#fff',border:'none',borderRadius:8,padding:'8px 16px',fontWeight:'bold'}}>إرسال</button>
      </div>
    </div>
  );
};

export default SmartChat;

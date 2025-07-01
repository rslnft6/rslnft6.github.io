import React, { useState, useEffect } from 'react';

interface Review {
  name: string;
  rating: number;
  comment: string;
  date: string;
}

const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [form, setForm] = useState({ name: '', rating: 5, comment: '' });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('reviews');
    if (saved) setReviews(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('reviews', JSON.stringify(reviews));
  }, [reviews]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleRating = (r: number) => setForm(f => ({ ...f, rating: r }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newReview = { ...form, date: new Date().toLocaleDateString() };
    const updated = [newReview, ...reviews];
    setReviews(updated);
    setForm({ name: '', rating: 5, comment: '' });
  };

  return (
    <div style={{background:'#fff',borderRadius:16,padding:24,margin:'32px 0',boxShadow:'0 2px 16px #e0e0e0'}}>
      <h3 style={{color:'#00bcd4',marginBottom:12}}>تقييمات ومراجعات المستخدمين</h3>
      <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:8,marginBottom:16}}>
        <input name="name" placeholder="اسمك (اختياري)" value={form.name} onChange={handleChange} style={{borderRadius:8,padding:8,border:'1px solid #ccc'}} />
        <div style={{display:'flex',alignItems:'center',gap:4}}>
          <span>التقييم:</span>
          {[1,2,3,4,5].map(r => (
            <span key={r} style={{cursor:'pointer',color:form.rating>=r?'#ff9800':'#ccc',fontSize:22}} onClick={()=>handleRating(r)}>★</span>
          ))}
        </div>
        <textarea name="comment" placeholder="اكتب رأيك أو تجربتك..." value={form.comment} onChange={handleChange} style={{borderRadius:8,padding:8,border:'1px solid #ccc',minHeight:60}} required />
        <button type="submit" style={{background:'#00bcd4',color:'#fff',border:'none',borderRadius:8,padding:'8px 24px',fontWeight:'bold',marginTop:8}}>إرسال التقييم</button>
      </form>
      <div style={{maxHeight:220,overflowY:'auto'}}>
        {reviews.length === 0 && <div style={{color:'#888'}}>لا توجد تقييمات بعد.</div>}
        {reviews.map((r,i) => (
          <div key={i} style={{borderBottom:'1px solid #eee',padding:'8px 0'}}>
            <div style={{fontWeight:'bold',color:'#2196f3'}}>{r.name||'مستخدم'}</div>
            <div>{[1,2,3,4,5].map(star => <span key={star} style={{color:r.rating>=star?'#ff9800':'#ccc',fontSize:18}}>★</span>)}</div>
            <div style={{color:'#555',margin:'4px 0'}}>{r.comment}</div>
            <div style={{fontSize:12,color:'#aaa'}}>{r.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reviews;

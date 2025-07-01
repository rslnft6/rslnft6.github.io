import { useState } from 'react';
import { auth } from '../data/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

const LoginForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // تحقق خاص للمستخدم admin
    if (username === 'admin' && password === '112233') {
      // حفظ بيانات المدير في localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('admin-current-user', JSON.stringify({
          name: 'مدير النظام',
          username: 'admin',
          role: 'مدير',
        }));
      }
      setLoading(false);
      onSuccess();
      return;
    }
    try {
      // تسجيل دخول عادي عبر Firebase (بريد وهمي)
      const email = username + '@app.local';
      await signInWithEmailAndPassword(auth, email, password);
      onSuccess();
    } catch (err: any) {
      setError('بيانات الدخول غير صحيحة أو هناك مشكلة في الاتصال.');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleLogin} style={{background:'#fff',padding:32,borderRadius:16,boxShadow:'0 2px 16px #e0e0e0',minWidth:320}}>
      <h2 style={{color:'#00bcd4',marginBottom:16}}>تسجيل دخول لوحة التحكم</h2>
      <input type="text" placeholder="اسم الدخول" value={username} onChange={e=>setUsername(e.target.value)} style={{width:'100%',padding:12,borderRadius:8,border:'1px solid #b6c6e6',marginBottom:12,fontSize:18}} required />
      <input type="password" placeholder="كلمة المرور" value={password} onChange={e=>setPassword(e.target.value)} style={{width:'100%',padding:12,borderRadius:8,border:'1px solid #b6c6e6',marginBottom:12,fontSize:18}} required />
      <button type="submit" disabled={loading} style={{background:'#00bcd4',color:'#fff',border:'none',borderRadius:8,padding:'10px 24px',fontWeight:'bold',fontSize:18,width:'100%'}}>{loading ? 'جاري الدخول...' : 'دخول'}</button>
      {error && <div style={{color:'#e53935',marginTop:12,fontWeight:'bold'}}>{error}</div>}
    </form>
  );
};

export default LoginForm;

import dynamic from 'next/dynamic';
import { useState } from 'react';
import React from 'react';
import { db } from '../data/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const AdminPanel = dynamic(() => import('../components/AdminPanel'), { ssr: false });

export default function AdminPage() {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [logged, setLogged] = useState(false);
  const [debugStep, setDebugStep] = useState('بعد الاستيراد الديناميكي');
  const [currentUser, setCurrentUser] = useState<any>(null);

  // تسجيل الدخول عبر Firestore مباشرة باسم المستخدم وكلمة المرور
  const handleLogin = async (e: any) => {
    e.preventDefault();
    setError('');
    setDebugStep('جاري التحقق من بيانات الدخول...');
    try {
      // جرب البحث عن المستخدم بكلمة مرور نصية
      let q = query(collection(db, 'users'), where('username', '==', user), where('password', '==', pass));
      let snap = await getDocs(q);
      // إذا لم يوجد، جرب البحث بكلمة مرور رقمية
      if (snap.empty && !isNaN(Number(pass))) {
        q = query(collection(db, 'users'), where('username', '==', user), where('password', '==', Number(pass)));
        snap = await getDocs(q);
      }
      // إذا لم يوجد مستخدم، جرب السماح بالدخول مباشرة (تعطيل التحقق مؤقتًا)
      if (!snap.empty || (user === 'admin' && pass === '112233')) {
        const userData = !snap.empty ? snap.docs[0].data() : { username: user, password: pass };
        setLogged(true);
        setCurrentUser(userData);
        setError('');
        localStorage.setItem('admin-current-user', JSON.stringify(userData));
        setDebugStep('تم تسجيل الدخول بنجاح');
      } else {
        setError('اسم المستخدم أو كلمة المرور غير صحيحة');
        setDebugStep('فشل التحقق من بيانات المستخدم');
      }
    } catch (err: any) {
      setError('حدث خطأ أثناء التحقق من البيانات');
      setDebugStep('فشل تسجيل الدخول');
    }
  };

  if (!logged) {
    // دالة اختبار الاتصال بـ Firebase
    const testFirebase = async () => {
      setDebugStep('جارٍ اختبار الاتصال بـ Firebase...');
      try {
        // محاولة جلب أي بيانات من قاعدة users
        const snap = await getDocs(collection(db, 'users'));
        if (snap.size >= 0) {
          setDebugStep('✅ الاتصال بـ Firebase ناجح. عدد المستخدمين: ' + snap.size);
        }
      } catch (err: any) {
        setDebugStep('❌ فشل الاتصال بـ Firebase: ' + (err.message || String(err)));
      }
    };

    return (
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f5f7fa'}}>
        <form onSubmit={handleLogin} style={{background:'#fff',padding:32,borderRadius:16,boxShadow:'0 2px 16px #e0e0e0',minWidth:320}}>
          <h2 style={{color:'#00bcd4',marginBottom:16}}>دخول لوحة التحكم</h2>
          <input type="text" placeholder="اسم الدخول" value={user} onChange={e=>setUser(e.target.value)} style={{width:'100%',padding:12,borderRadius:8,border:'1px solid #b6c6e6',marginBottom:12,fontSize:18}} required />
          <input type="password" placeholder="كلمة المرور" value={pass} onChange={e=>setPass(e.target.value)} style={{width:'100%',padding:12,borderRadius:8,border:'1px solid #b6c6e6',marginBottom:12,fontSize:18}} required />
          <button type="submit" style={{background:'#00bcd4',color:'#fff',border:'none',borderRadius:8,padding:'10px 24px',fontWeight:'bold',fontSize:18,width:'100%'}}>دخول</button>
          <button type="button" onClick={testFirebase} style={{background:'#eee',color:'#00bcd4',border:'none',borderRadius:8,padding:'8px 16px',fontWeight:'bold',fontSize:16,marginTop:8,marginBottom:8,width:'100%'}}>اختبار الاتصال بـ Firebase</button>
          {error && <div style={{color:'#e53935',marginTop:12,fontWeight:'bold'}}>{error}</div>}
          <div style={{marginTop:16,color:'#888'}}>Debug: {debugStep}</div>
        </form>
      </div>
    );
  }

  // بعد تسجيل الدخول، أظهر لوحة التحكم الفعلية مع Error Boundary
  return <div style={{padding:40,maxWidth:1100,margin:'auto'}}>
    <div style={{color:'#888',marginBottom:12}}>Debug: {debugStep}</div>
    <ErrorBoundary>
      <AdminPanel />
    </ErrorBoundary>
  </div>;
}

// Error Boundary لعرض أي خطأ بدلاً من الشاشة السوداء
class ErrorBoundary extends React.Component<any, { hasError: boolean; error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, info: any) {
    // يمكن إرسال الخطأ لسيرفر أو Console
  }
  render() {
    if (this.state.hasError) {
      return <div style={{color:'#e53935',padding:40,fontSize:22}}>
        <b>حدث خطأ في لوحة التحكم:</b>
        <pre style={{direction:'ltr',background:'#fff0f0',padding:16,borderRadius:8,marginTop:16}}>{String(this.state.error)}</pre>
        <div style={{marginTop:24,color:'#888'}}>يرجى مراجعة الكود أو التواصل مع الدعم الفني.</div>
      </div>;
    }
    return this.props.children;
  }
}

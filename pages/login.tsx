import Head from 'next/head';
import Login from '../components/Login';
export default function LoginPage() {
  return (
    <div style={{padding:40,maxWidth:400,margin:'auto'}}>
      <Head>
        <title>تسجيل الدخول | baitk vr</title>
      </Head>
      <h1 style={{color:'#00bcd4',fontWeight:'bold',fontSize:28}}>تسجيل الدخول</h1>
      {/* عند تسجيل الدخول: إذا الدولة الإمارات أظهر خيار ربط محفظة بلوك تشين (Web3)، باقي الدول تسجيل عادي فقط */}
      {/* الكود جاهز للتوسعة مستقبلاً ولا يظهر أي شيء متعلق بالبلوك تشين إلا إذا كانت الدولة الإمارات */}
      <Login />
    </div>
  );
}

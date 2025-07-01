import Head from 'next/head';
import { developers } from '../data/developers';
import { compounds } from '../data/compounds';
export default function Partners() {
  return (
    <div style={{padding:40,maxWidth:1100,margin:'auto',color:'#222'}}>
      <Head>
        <title>شركاؤنا | baitk vr</title>
      </Head>
      <h1 style={{color:'#00bcd4',fontWeight:'bold'}}>شركاؤنا في النجاح</h1>
      <h2 style={{color:'#00e676',marginTop:32}}>المطورون العقاريون</h2>
      <div style={{display:'flex',flexWrap:'wrap',gap:24,margin:'24px 0'}}>
        {developers.map(d=>(<div key={d.id} style={{textAlign:'center',minWidth:120}}>
          <img src={d.logo||'/file.svg'} alt={d.name} style={{width:60,height:60,borderRadius:'50%',background:'#fff',padding:6,boxShadow:'0 2px 8px #eee'}} />
          <div style={{marginTop:8,fontWeight:'bold',color:'#00bcd4'}}>{d.name}</div>
        </div>))}
      </div>
      <h2 style={{color:'#ff9800',marginTop:32}}>الكمباوندات</h2>
      <div style={{display:'flex',flexWrap:'wrap',gap:24,margin:'24px 0'}}>
        {compounds.map(c=>(<div key={c.id} style={{textAlign:'center',minWidth:120}}>
          <img src={c.logo||'/globe.svg'} alt={c.name} style={{width:60,height:60,borderRadius:'50%',background:'#fff',padding:6,boxShadow:'0 2px 8px #eee'}} />
          <div style={{marginTop:8,fontWeight:'bold',color:'#ff9800'}}>{c.name}</div>
        </div>))}
      </div>
      <h2 style={{color:'#2196f3',marginTop:32}}>شركات وبنوك التمويل العقاري</h2>
      <ul style={{fontWeight:'bold',fontSize:18,color:'#2196f3'}}>
        <li>بنك مصر</li>
        <li>البنك الأهلي المصري</li>
        <li>بنك القاهرة</li>
        <li>شركة التعمير للتمويل العقاري</li>
        <li>بنك QNB الأهلي</li>
        <li>بنك CIB</li>
        <li>بنك الإسكان والتعمير</li>
        <li>بنك فيصل الإسلامي</li>
        <li>شركة الأهلي للتمويل العقاري</li>
      </ul>
    </div>
  );
}

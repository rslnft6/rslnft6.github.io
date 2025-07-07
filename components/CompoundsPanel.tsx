import React, { useEffect, useState } from 'react';
import { db } from '../data/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { developers } from '../data/developers';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

interface Compound {
  id?: string;
  name: string;
  logo?: string;
  developer?: string;
  city?: string;
  country?: string;
  description?: string;
  images?: string[];
  facilities?: string;
  lat?: number;
  lng?: number;
}

const initialForm: Compound = { name: '', logo: '', developer: '', city: '', country: '', description: '', images: [], facilities: '', lat: undefined, lng: undefined };

const CompoundsPanel: React.FC = () => {
  const [compounds, setCompounds] = useState<Compound[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Compound>(initialForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imagesSaved, setImagesSaved] = useState(true);

  // جلب الكمباوندات من فايرستور
  const fetchCompounds = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, 'compounds'));
    setCompounds(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Compound)));
    setLoading(false);
  };

  useEffect(() => {
    fetchCompounds();
  }, []);

  // إضافة أو تعديل كمباوند
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let imagesUrls: string[] = form.images || [];
    if (imageFiles.length > 0) {
      const { getStorage, ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
      const storage = getStorage();
      imagesUrls = [];
      for (const file of imageFiles) {
        const imgRef = ref(storage, `compounds/${Date.now()}_${file.name}`);
        await uploadBytes(imgRef, file);
        const url = await getDownloadURL(imgRef);
        imagesUrls.push(url);
      }
    }
    const data = { ...form, images: imagesUrls };
    if (editId) {
      const { id, ...formData } = data;
      await updateDoc(doc(db, 'compounds', editId), formData);
    } else {
      await addDoc(collection(db, 'compounds'), data);
    }
    setShowForm(false);
    setForm(initialForm);
    setEditId(null);
    setImageFiles([]);
    setImagePreviews([]);
    fetchCompounds();
  };

  // حذف كمباوند
  const handleDelete = async (id: string) => {
    if (window.confirm('تأكيد حذف الكمباوند؟')) {
      await deleteDoc(doc(db, 'compounds', id));
      fetchCompounds();
    }
  };

  // تعبئة النموذج للتعديل
  const handleEdit = (compound: Compound) => {
    setForm(compound);
    setEditId(compound.id!);
    setShowForm(true);
    setImageFiles([]);
    setImagePreviews(compound.images || []);
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditId(null);
    setShowForm(false);
    setImageFiles([]);
    setImagePreviews([]);
  };

  return (
    <div className="glass-table" style={{maxWidth:900,margin:'0 auto'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
        <h2 style={{color:'#00bcd4',fontWeight:'bold'}}>إدارة الكمباوندات</h2>
        <button className="glass-btn" onClick={()=>{setShowForm(true);resetForm();}}><FaPlus /> إضافة كمباوند</button>
      </div>
      {loading ? <div>جاري التحميل...</div> : (
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:16,background:'rgba(255,255,255,0.12)',borderRadius:16}}>
          <thead>
            <tr>
              <th style={{color:'#00bcd4'}}>الاسم</th>
              <th style={{color:'#00bcd4'}}>المطور</th>
              <th>المدينة</th>
              <th style={{color:'#00bcd4'}}>الدولة</th>
              <th>الوصف</th>
              <th style={{color:'#00bcd4'}}>المرافق</th>
              <th style={{color:'#00bcd4'}}>الموقع</th>
              <th>الصور</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {compounds.map(c => (
              <tr key={c.id}>
                <td style={{color:'#00bcd4',fontWeight:'bold'}}>{c.name}</td>
                <td style={{color:'#00bcd4'}}>{c.developer}</td>
                <td>{c.city}</td>
                <td style={{color:'#00bcd4'}}>{c.country}</td>
                <td style={{maxWidth:180,whiteSpace:'pre-line'}}>{c.description}</td>
                <td style={{maxWidth:120,whiteSpace:'pre-line',color:'#607d8b'}}>{c.facilities}</td>
                <td>{c.lat && c.lng ? <a href={`https://www.google.com/maps/search/?api=1&query=${c.lat},${c.lng}`} target="_blank" rel="noopener noreferrer" style={{color:'#00bcd4',fontWeight:'bold'}}>عرض</a> : '-'}</td>
                <td>{c.images && c.images.length>0 && c.images.map((img:string,i:number)=>(<img key={i} src={img} alt="صورة" style={{width:38,height:38,borderRadius:8,objectFit:'cover',marginLeft:4,border:'1.5px solid #00bcd4'}} />))}</td>
                <td>
                  <button className="glass-btn" style={{padding:'4px 12px',fontSize:15}} onClick={()=>handleEdit(c)}><FaEdit /> تعديل</button>
                  <button className="glass-btn" style={{padding:'4px 12px',fontSize:15,background:'#e53935',color:'#fff'}} onClick={()=>handleDelete(c.id!)}><FaTrash /> حذف</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* نموذج الإضافة/التعديل */}
      {showForm && (
        <form className="glass-form" style={{marginTop:24}} onSubmit={handleSubmit}>
          <h3 style={{color:'#00bcd4',fontWeight:'bold'}}>{editId ? 'تعديل كمباوند' : 'إضافة كمباوند'}</h3>
          <input required placeholder="اسم الكمباوند" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} />
          <select required value={form.developer} onChange={e=>setForm(f=>({...f,developer:e.target.value}))}>
            <option value="">اختر المطور</option>
            {developers.map(dev => (
              <option key={dev.id} value={dev.name}>{dev.name}</option>
            ))}
          </select>
          <input placeholder="المدينة" value={form.city} onChange={e=>setForm(f=>({...f,city:e.target.value}))} />
          <input placeholder="الدولة" value={form.country} onChange={e=>setForm(f=>({...f,country:e.target.value}))} />
          <textarea placeholder="وصف الكمباوند / المميزات" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} style={{padding:8,borderRadius:8,minWidth:220,minHeight:48,flex:1}} />
          <textarea placeholder="المرافق (اكتب كل مرفق في سطر)" value={form.facilities||''} onChange={e=>setForm(f=>({...f,facilities:e.target.value}))} style={{padding:8,borderRadius:8,minWidth:220,minHeight:40,flex:1}} />
          <div style={{margin:'8px 0'}}>
            <label style={{fontWeight:'bold',color:'#00bcd4'}}>الموقع على الخريطة</label>
            <button type="button" style={{marginRight:8,background:'#00bcd4',color:'#fff',border:'none',borderRadius:8,padding:'6px 14px',fontWeight:'bold'}} onClick={()=>setShowMap(true)}>تحديد الموقع</button>
            {form.lat && form.lng && (
              <span style={{color:'#00bcd4',fontWeight:'bold',marginRight:8}}>الموقع: {form.lat}, {form.lng}</span>
            )}
          </div>
          {showMap && (
            <div style={{width:'100%',height:340,margin:'12px 0'}}>
              <MapPicker
                lat={form.lat || 30.0444}
                lng={form.lng || 31.2357}
                onChange={(lat:number,lng:number)=>setForm(f=>({...f,lat,lng}))}
                height={320}
              />
              <button type="button" style={{background:'#e91e63',color:'#fff',border:'none',borderRadius:8,padding:'8px 16px',fontWeight:'bold',marginTop:8}} onClick={()=>setShowMap(false)}>إغلاق الخريطة</button>
            </div>
          )}
          {/* رفع صور */}
          <input type="file" accept="image/*" multiple onChange={e=>{
            const files = Array.from(e.target.files||[]);
            setImageFiles(files);
            setImagePreviews(files.map(f=>URL.createObjectURL(f)));
            setImagesSaved(false);
          }} disabled={!imagesSaved && imageFiles.length === 0} />
          {imagePreviews.length > 0 && !imagesSaved && (
            <>
              <div style={{display:'flex',gap:8,alignItems:'center',margin:'8px 0'}}>
                {imagePreviews.map((src,i)=>(
                  <img key={i} src={src} alt="معاينة" style={{width:48,height:48,borderRadius:8,objectFit:'cover',border:'1.5px solid #00bcd4'}} />
                ))}
              </div>
              <button type="button" style={{background:'#00bcd4',color:'#fff',border:'none',borderRadius:8,padding:'8px 20px',fontWeight:'bold',marginBottom:8}} onClick={async()=>{
                try {
                  const { getStorage, ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
                  const storage = getStorage();
                  let imagesUrls: string[] = [];
                  for (const file of imageFiles) {
                    const imgRef = ref(storage, `compounds/${Date.now()}_${file.name}`);
                    await uploadBytes(imgRef, file);
                    const url = await getDownloadURL(imgRef);
                    imagesUrls.push(url);
                  }
                  setForm(f => ({ ...f, images: imagesUrls }));
                  setImagesSaved(true);
                  setImageFiles([]);
                  setImagePreviews([]);
                } catch {}
              }}>حفظ الصور</button>
            </>
          )}
          <div style={{display:'flex',gap:12,marginTop:12}}>
            <button className="glass-btn" type="submit">{editId ? 'حفظ التعديلات' : 'إضافة'}</button>
            <button className="glass-btn" type="button" style={{background:'#e53935',color:'#fff'}} onClick={resetForm}>إلغاء</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CompoundsPanel;

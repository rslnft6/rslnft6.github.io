import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../data/firebase';
import { FaTrash, FaEdit, FaPlus } from 'react-icons/fa';

const DevelopersPanel: React.FC = () => {
  const [developers, setDevelopers] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: '',
    country: '',
    bio: '',
    achievements: '',
    mainImages: [] as File[],
    mainImagesUrls: [] as string[],
    projects: '', // نص أو قائمة المشاريع
    projectImages: [] as File[],
    projectImagesUrls: [] as string[]
  });
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string|null>(null);
  const [mainImagePreviews, setMainImagePreviews] = useState<string[]>([]);
  const [projectImagePreviews, setProjectImagePreviews] = useState<string[]>([]);
  const [imagesSaved, setImagesSaved] = useState(true);

  useEffect(() => {
    const fetchDevelopers = async () => {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, 'developers'));
        setDevelopers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch {}
      setLoading(false);
    };
    fetchDevelopers();
  }, [adding]);

  const resetForm = () => {
    setForm({
      name: '', country: '', bio: '', achievements: '', mainImages: [], mainImagesUrls: [], projects: '', projectImages: [], projectImagesUrls: []
    });
    setMainImagePreviews([]);
    setProjectImagePreviews([]);
    setEditingId(null);
  };

  const handleAddOrEdit = async (e: any) => {
    e.preventDefault();
    setAdding(true);
    try {
      let mainImageUrls: string[] = form.mainImagesUrls || [];
      let projectImageUrls: string[] = form.projectImagesUrls || [];
      if (form.mainImages.length > 0) {
        const { getStorage, ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
        const storage = getStorage();
        mainImageUrls = [];
        for (const file of form.mainImages) {
          const imgRef = ref(storage, `developers/${Date.now()}_${file.name}`);
          await uploadBytes(imgRef, file);
          const url = await getDownloadURL(imgRef);
          mainImageUrls.push(url);
        }
      }
      if (form.projectImages.length > 0) {
        const { getStorage, ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
        const storage = getStorage();
        projectImageUrls = [];
        for (const file of form.projectImages) {
          const imgRef = ref(storage, `developers/projects/${Date.now()}_${file.name}`);
          await uploadBytes(imgRef, file);
          const url = await getDownloadURL(imgRef);
          projectImageUrls.push(url);
        }
      }
      const data = {
        name: form.name,
        country: form.country,
        bio: form.bio,
        achievements: form.achievements,
        mainImages: mainImageUrls,
        projects: form.projects,
        projectImages: projectImageUrls
      };
      if (editingId) {
        await updateDoc(doc(db, 'developers', editingId), data);
      } else {
        await addDoc(collection(db, 'developers'), data);
      }
      resetForm();
    } catch {}
    setAdding(false);
  };

  const handleEdit = (dev: any) => {
    setForm({
      name: dev.name || '',
      country: dev.country || '',
      bio: dev.bio || '',
      achievements: dev.achievements || '',
      mainImages: [],
      mainImagesUrls: dev.mainImages || [],
      projects: dev.projects || '',
      projectImages: [],
      projectImagesUrls: dev.projectImages || []
    });
    setMainImagePreviews(dev.mainImages || []);
    setProjectImagePreviews(dev.projectImages || []);
    setEditingId(dev.id);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('تأكيد حذف المطور؟')) return;
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'developers', id));
    } catch {}
    setLoading(false);
  };

  return (
    <div style={{background:'rgba(255,255,255,0.18)',backdropFilter:'blur(16px)',borderRadius:24,boxShadow:'0 4px 32px #00bcd422',padding:32,border:'1.5px solid rgba(255,255,255,0.25)',margin:'32px 0'}}>
      <h2 style={{color:'#00bcd4',marginBottom:16}}>إدارة المطورين</h2>
      <form onSubmit={handleAddOrEdit} style={{display:'flex',gap:8,marginBottom:24,flexWrap:'wrap',alignItems:'flex-start'}}>
        <input required value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="اسم المطور" style={{padding:8,borderRadius:8}} />
        <input value={form.country} onChange={e=>setForm(f=>({...f,country:e.target.value}))} placeholder="الدولة" style={{padding:8,borderRadius:8}} />
        <textarea value={form.bio} onChange={e=>setForm(f=>({...f,bio:e.target.value}))} placeholder="نبذة عن المطور" style={{padding:8,borderRadius:8,minWidth:220,minHeight:48,flex:1}} />
        <textarea value={form.achievements} onChange={e=>setForm(f=>({...f,achievements:e.target.value}))} placeholder="أهم الإنجازات (يمكنك كتابة قائمة أو نص)" style={{padding:8,borderRadius:8,minWidth:220,minHeight:48,flex:1}} />
        <textarea value={form.projects} onChange={e=>setForm(f=>({...f,projects:e.target.value}))} placeholder="أهم المشاريع (يمكنك كتابة قائمة أو نص)" style={{padding:8,borderRadius:8,minWidth:220,minHeight:48,flex:1}} />
        <div style={{display:'flex',flexDirection:'column',gap:4}}>
          <label style={{fontWeight:'bold',color:'#00bcd4'}}>صور المطور</label>
          <input type="file" accept="image/*" multiple onChange={e=>{
            const files = Array.from(e.target.files||[]);
            setForm(f=>({...f,mainImages:files}));
            setMainImagePreviews(files.map(f=>URL.createObjectURL(f)));
            setImagesSaved(false);
          }} style={{minWidth:120}} disabled={!imagesSaved && form.mainImages.length === 0} />
          {mainImagePreviews.length > 0 && !imagesSaved && (
            <>
              <div style={{display:'flex',gap:8,alignItems:'center',margin:'8px 0'}}>
                {mainImagePreviews.map((src,i)=>(
                  <img key={i} src={src} alt="معاينة" style={{width:48,height:48,borderRadius:8,objectFit:'cover',border:'1.5px solid #00bcd4'}} />
                ))}
              </div>
            </>
          )}
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:4}}>
          <label style={{fontWeight:'bold',color:'#00bcd4'}}>صور المشاريع</label>
          <input type="file" accept="image/*" multiple onChange={e=>{
            const files = Array.from(e.target.files||[]);
            setForm(f=>({...f,projectImages:files}));
            setProjectImagePreviews(files.map(f=>URL.createObjectURL(f)));
            setImagesSaved(false);
          }} style={{minWidth:120}} disabled={!imagesSaved && form.projectImages.length === 0} />
          {projectImagePreviews.length > 0 && !imagesSaved && (
            <>
              <div style={{display:'flex',gap:8,alignItems:'center',margin:'8px 0'}}>
                {projectImagePreviews.map((src,i)=>(
                  <img key={i} src={src} alt="معاينة" style={{width:48,height:48,borderRadius:8,objectFit:'cover',border:'1.5px solid #00bcd4'}} />
                ))}
              </div>
            </>
          )}
        </div>
        <button type="submit" style={{background:'#00bcd4',color:'#fff',border:'none',borderRadius:8,padding:'8px 20px',fontWeight:'bold'}} disabled={adding}>{editingId ? 'تحديث' : 'إضافة مطور'}</button>
        <button type="button" onClick={resetForm} style={{background:'#607d8b',color:'#fff',border:'none',borderRadius:8,padding:'8px 20px',fontWeight:'bold'}}><FaPlus /> تفريغ الحقول</button>
      </form>
      {loading ? <div>جاري تحميل المطورين...</div> : (
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:16,background:'rgba(255,255,255,0.12)',borderRadius:16}}>
          <thead>
            <tr style={{background:'rgba(0,188,212,0.08)'}}>
              <th style={{padding:8,color:'#00bcd4'}}>الاسم</th>
              <th style={{padding:8,color:'#00bcd4'}}>الدولة</th>
              <th style={{padding:8}}>النبذة</th>
              <th style={{padding:8}}>الإنجازات</th>
              <th style={{padding:8}}>أهم المشاريع</th>
              <th style={{padding:8}}>صور المطور</th>
              <th style={{padding:8}}>صور المشاريع</th>
              <th style={{padding:8}}>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {developers.map(dev => (
              <tr key={dev.id} style={{borderBottom:'1px solid #eee'}}>
                <td style={{padding:8,color:'#00bcd4',fontWeight:'bold'}}>{dev.name}</td>
                <td style={{padding:8,color:'#00bcd4'}}>{dev.country}</td>
                <td style={{padding:8,maxWidth:180,whiteSpace:'pre-line'}}>{dev.bio}</td>
                <td style={{padding:8,maxWidth:180,whiteSpace:'pre-line'}}>{dev.achievements}</td>
                <td style={{padding:8,maxWidth:180,whiteSpace:'pre-line'}}>{dev.projects}</td>
                <td style={{padding:8}}>
                  {dev.mainImages && dev.mainImages.length > 0 && dev.mainImages.map((img: string, i: number) => (
                    <img key={i} src={img} alt="صورة" style={{width:38,height:38,borderRadius:8,objectFit:'cover',marginLeft:4,border:'1.5px solid #00bcd4'}} />
                  ))}
                </td>
                <td style={{padding:8}}>
                  {dev.projectImages && dev.projectImages.length > 0 && dev.projectImages.map((img: string, i: number) => (
                    <img key={i} src={img} alt="مشروع" style={{width:38,height:38,borderRadius:8,objectFit:'cover',marginLeft:4,border:'1.5px solid #607d8b'}} />
                  ))}
                </td>
                <td style={{padding:8,display:'flex',gap:8}}>
                  <button title="تعديل" style={{background:'none',border:'none',cursor:'pointer'}} onClick={()=>handleEdit(dev)}><FaEdit color="#00bcd4" /></button>
                  <button title="حذف" style={{background:'none',border:'none',cursor:'pointer'}} onClick={()=>handleDelete(dev.id)}><FaTrash color="#e91e63" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DevelopersPanel;

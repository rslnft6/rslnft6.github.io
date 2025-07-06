import React, { useState, useEffect } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import { db } from '../data/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Tabs, Tab, Box, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Typography, Select, MenuItem, InputLabel, FormControl, Grid, Card, CardMedia, CardContent, CardActions, Snackbar, Alert, Chip, CircularProgress } from '@mui/material';
import { Add, Edit, Delete, CloudUpload } from '@mui/icons-material';
import DemoEmployees from './DemoEmployees';
import AdsPanel from './AdsPanel';
import ContactLinksPanel from './ContactLinksPanel';
import PagesEditor from './PagesEditor';
import MapPicker from './MapPicker';
import ImageUploader from './ImageUploader';

// تعريف أنواع البيانات للوحدات والمطورين والكمباوندات والخلفيات
export type Unit = {
  id?: string;
  title: string;
  country: string;
  compound: string;
  developer: string;
  area: string;
  minPrice: string;
  maxPrice: string;
  rooms: string;
  baths: string;
  kitchen: string;
  floors: string;
  pool: boolean;
  garden: boolean;
  guardRoom: boolean;
  location: string;
  lat?: number;
  lng?: number;
  images: string[];
  panorama: string[];
  model3d: string;
  vr: string;
};

export type Developer = {
  id?: string;
  name: string;
  country: string;
  achievements: string;
  about: string;
  facilities?: string[]; // مرافق
  nearBy?: string[]; // مرافق قريبة
  icons?: string[]; // روابط أيقونات
  images: string[];
};

export type Compound = {
  id?: string;
  name: string;
  country: string;
  developer: string;
  location: string;
  lat?: number;
  lng?: number;
  about?: string; // نبذة
  achievements?: string; // إنجازات
  facilities?: string[]; // مرافق
  nearBy?: string[]; // مرافق قريبة
  icons?: string[]; // روابط أيقونات
  images: string[];
};

export type Marquee = {
  texts: string[];
  speed: number;
  color: string;
  fontSize: number;
};

const storage = getStorage();

function uploadImage(file: File, path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, path + '/' + file.name);
    uploadBytes(storageRef, file)
      .then(() => getDownloadURL(storageRef))
      .then(resolve)
      .catch(reject);
  });
}

// مكون البحث الذكي (Autocomplete) للوحدات والكمباوندات والمطورين
function SmartSearch({ units, compounds, developers }: { units: any[], compounds: any[], developers: any[] }) {
  const [input, setInput] = useState('');
  const [options, setOptions] = useState<any[]>([]);
  useEffect(() => {
    if (!input) { setOptions([]); return; }
    const q = input.toLowerCase();
    const unitOpts = units.filter(u => u.title?.toLowerCase().includes(q)).map(u => ({ type: 'unit', label: u.title, id: u.id }));
    const compOpts = compounds.filter(c => c.name?.toLowerCase().includes(q)).map(c => ({ type: 'compound', label: c.name, id: c.id }));
    const devOpts = developers.filter(d => d.name?.toLowerCase().includes(q)).map(d => ({ type: 'developer', label: d.name, id: d.id }));
    setOptions([...unitOpts, ...compOpts, ...devOpts].slice(0, 8));
  }, [input, units, compounds, developers]);
  return (
    <Autocomplete
      freeSolo
      options={options}
      getOptionLabel={o => o.label || ''}
      onInputChange={(_, v) => setInput(v)}
      onChange={(_, v) => {
        if (!v) return;
        if (v.type === 'unit') window.open(`/property/${v.id}`, '_blank');
        if (v.type === 'compound') window.open(`/compounds/${v.id}`, '_blank');
        if (v.type === 'developer') window.open(`/developers/${v.id}`, '_blank');
      }}
      renderInput={(params: any) => (
        <TextField {...params} label="بحث سريع (عنوان، مطور، كمباوند)" variant="outlined" sx={{ bgcolor:'#fff', borderRadius:2, minWidth:260 }} />
      )
      }
      sx={{ minWidth: 260, maxWidth: 400, mx: 'auto', mb: 2 }}
    />
  );
}

// مكون مقارنة الوحدات
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';

function UnitsCompareDialog({ open, onClose, units }: { open: boolean, onClose: () => void, units: any[] }) {
  if (!open || units.length < 2) return null;
  const fields = [
    { key: 'title', label: 'العنوان' },
    { key: 'country', label: 'الدولة' },
    { key: 'compound', label: 'الكمباوند' },
    { key: 'developer', label: 'المطور' },
    { key: 'area', label: 'المساحة (م²)' },
    { key: 'minPrice', label: 'السعر الأدنى' },
    { key: 'maxPrice', label: 'السعر الأقصى' },
    { key: 'rooms', label: 'الغرف' },
    { key: 'baths', label: 'الحمامات' },
    { key: 'kitchen', label: 'المطابخ' },
    { key: 'floors', label: 'الأدوار' },
    { key: 'pool', label: 'حمام سباحة' },
    { key: 'garden', label: 'جاردن' },
    { key: 'guardRoom', label: 'غرفة حرس' },
  ];
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle sx={{fontWeight:'bold', color:'#00bcd4'}}>مقارنة الوحدات العقارية</DialogTitle>
      <DialogContent sx={{overflowX:'auto'}}>
        <Box sx={{display:'flex',gap:2,mb:2}}>
          {units.map((u: any,i: number)=>(
            <Box key={i} sx={{textAlign:'center'}}>
              <img src={u.images?.[0]||'/images/bg1.png'} alt="img" style={{width:120,height:90,borderRadius:8,objectFit:'cover',border:'2px solid #00bcd4'}} />
              <Typography sx={{fontWeight:'bold',color:'#00bcd4',mt:1}}>{u.title}</Typography>
            </Box>
          ))}
        </Box>
        <Box component="table" sx={{width:'100%',borderCollapse:'collapse',bgcolor:'#23263a',borderRadius:3,overflow:'hidden'}}>
          <thead>
            <tr>
              <th style={{color:'#00bcd4',fontWeight:'bold',padding:8,textAlign:'right'}}>الميزة</th>
              {units.map((u: any,i: number)=>(<th key={i} style={{color:'#fff',fontWeight:'bold',padding:8}}>{u.title}</th>))}
            </tr>
          </thead>
          <tbody>
            {fields.map(f=>(
              <tr key={f.key} style={{borderBottom:'1px solid #333'}}>
                <td style={{color:'#00bcd4',fontWeight:'bold',padding:8}}>{f.label}</td>
                {units.map((u: any,i: number)=>(<td key={i} style={{color:'#fff',padding:8}}>{typeof u[f.key]==='boolean' ? (u[f.key]?'✔️':'❌') : u[f.key]}</td>))}
              </tr>
            ))}
          </tbody>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>إغلاق</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function AdminPanel() {
  // إشعارات
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity?: 'success'|'error'|'info'|'warning'}>({open: false, message: ''});
  // تأكيد الحذف
  const [confirmDialog, setConfirmDialog] = useState<{open: boolean, onConfirm: ()=>void, message: string}>({open: false, onConfirm: ()=>{}, message: ''});
  // تحميل الصور
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState<number>(0);
  // وحدات
  const [units, setUnits] = useState<Unit[]>([]);
  const [unitDialog, setUnitDialog] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [unitForm, setUnitForm] = useState<Unit>({
    title: '', country: '', compound: '', developer: '', area: '', minPrice: '', maxPrice: '', rooms: '', baths: '', kitchen: '', floors: '', pool: false, garden: false, guardRoom: false, location: '', lat: 30.0444, lng: 31.2357, images: [], panorama: [], model3d: '', vr: ''
  });
  // مقارنة الوحدات
  const [compareUnits, setCompareUnits] = useState<Unit[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  // مطورين
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [devDialog, setDevDialog] = useState(false);
  const [editingDev, setEditingDev] = useState<Developer | null>(null);
  const [devForm, setDevForm] = useState<Developer>({ name: '', country: '', achievements: '', about: '', facilities: [], nearBy: [], icons: [], images: [] });
  // كمباوندات
  const [compounds, setCompounds] = useState<Compound[]>([]);
  const [compoundDialog, setCompoundDialog] = useState(false);
  const [editingCompound, setEditingCompound] = useState<Compound | null>(null);
  const [compoundForm, setCompoundForm] = useState<Compound>({ name: '', country: '', developer: '', location: '', about: '', achievements: '', facilities: [], nearBy: [], icons: [], images: [] });
  // الخلفيات
  const [backgrounds, setBackgrounds] = useState<string[]>([]);
  const [bgDialog, setBgDialog] = useState(false);
  // متغير مؤقت لحفظ ملف الخلفية قبل الرفع
  const [selectedBgFile, setSelectedBgFile] = useState<File | null>(null);
  // السلايدر
  const [slider, setSlider] = useState<string[]>([]);
  const [sliderDialog, setSliderDialog] = useState(false);
  // الشريط الكتابي
  const [marquee, setMarquee] = useState<Marquee>({ texts: [], speed: 30, color: '#ff9800', fontSize: 20 });
  const [marqueeDialog, setMarqueeDialog] = useState(false);
  // موظفين
  const [employees, setEmployees] = useState<any[]>([]);
  const [employeeDialog, setEmployeeDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any | null>(null);
  const [employeeForm, setEmployeeForm] = useState<any>({ username: '', password: '', role: 'موظف' });

  // جلب البيانات من فايرستور
  useEffect(() => {
    const unsubUnits = onSnapshot(collection(db, 'units'), (snap: any) => setUnits(snap.docs.map((d: any) => ({ id: d.id, ...d.data() }) as Unit)));
    const unsubDevs = onSnapshot(collection(db, 'developers'), (snap: any) => setDevelopers(snap.docs.map((d: any) => ({ id: d.id, ...d.data() }) as Developer)));
    const unsubCompounds = onSnapshot(collection(db, 'compounds'), (snap: any) => setCompounds(snap.docs.map((d: any) => ({ id: d.id, ...d.data() }) as Compound)));
    const unsubBackgrounds = onSnapshot(collection(db, 'backgrounds'), (snap: any) => setBackgrounds(snap.docs.map((d: any) => d.data().url as string)));
    const unsubSlider = onSnapshot(collection(db, 'slider'), (snap: any) => setSlider(snap.docs.map((d: any) => d.data().url as string)));
    const unsubMarquee = onSnapshot(collection(db, 'marquee'), (snap: any) => {
      if (snap.docs.length > 0) setMarquee(snap.docs[0].data() as Marquee);
    });
    const unsubEmployees = onSnapshot(collection(db, 'employees'), (snap: any) => setEmployees(snap.docs.map((d: any) => ({ id: d.id, ...d.data() }))));
    return () => {
      unsubUnits();
      unsubDevs();
      unsubCompounds();
      unsubBackgrounds();
      unsubSlider();
      unsubMarquee();
      unsubEmployees();
    };
  }, []);

  return (
    <Box sx={{
      width: '100vw',
      minHeight: '100vh',
      p: { xs: 1, md: 4 },
      bgcolor: '#181c2a',
      backdropFilter: 'blur(18px)',
      borderRadius: { xs: 0, md: 8 },
      boxShadow: 12,
      maxWidth: '100vw',
      margin: '0 auto',
      position: 'relative',
      color: '#fff',
      fontFamily: 'Cairo, Tahoma, Arial',
      overflowX: 'hidden',
    }}>
      {/* ترويسة عصرية + البحث الذكي */}
      <Box sx={{display:'flex',alignItems:'center',justifyContent:'center',gap:2,mb:3,flexWrap:'wrap'}}>
        <img src="/images/logo1.png" alt="logo" style={{width:64,height:64,borderRadius:16,boxShadow:'0 2px 16px #00bcd4'}} />
        <Typography variant="h3" sx={{color:'#00bcd4',fontWeight:'bold',letterSpacing:2, textShadow:'0 2px 8px #000'}}>لوحة التحكم</Typography>
        <Box sx={{flex:1, minWidth:260, maxWidth:400}}>
          <SmartSearch units={units} compounds={compounds} developers={developers} />
        </Box>
      </Box>
      <Typography variant="subtitle1" sx={{color:'#bbb',mb:2,textAlign:'center',fontSize:22}}>كل التعديلات تظهر فوراً في التطبيق</Typography>
      {/* تبويبات عصرية مع Scroll أفقي على الشاشات الصغيرة */}
      {(() => {
        const tabLabels = [
          'الوحدات',
          'الموظفين',
          'المطورين',
          'الكمباوندات',
          'الإعلانات',
          'الخلفيات',
          'تواصل معنا',
          'إدارة الصفحات',
          'الشريط الكتابي',
        ];
        if (tab < 0 || tab >= tabLabels.length) setTab(0);
        return (
          <Box sx={{ width: '100%', overflowX: 'auto', mb: 4 }}>
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                minHeight: 64,
                '.MuiTabs-flexContainer': { gap: { xs: 1, md: 2 } },
                '.MuiTab-root': {
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: { xs: 16, sm: 18, md: 22 },
                  borderRadius: 3,
                  px: { xs: 2, md: 4 },
                  py: 1.5,
                  transition: '0.2s',
                  textTransform: 'none',
                  letterSpacing: 1,
                  minHeight: 48,
                },
                '.Mui-selected': {
                  color: '#181c2a !important',
                  background: '#00bcd4',
                  boxShadow: '0 2px 16px #00bcd455',
                },
              }}
            >
              {tabLabels.map((label, idx) => <Tab key={idx} label={label} />)}
            </Tabs>
          </Box>
        );
      })()}
      {/* تبويب إدارة الصفحات */}
      {tab === 7 && (
        <Box mt={2}>
          <Typography variant="h5" sx={{mb:2, color:'#00bcd4', fontWeight:'bold'}}>إدارة الصفحات الرئيسية</Typography>
          {/* استيراد PagesEditor بشكل صحيح */}
          <PagesEditor setSnackbar={setSnackbar} />
        </Box>
      )}
      {/* تبويب الشريط الكتابي */}
      {tab === 8 && (
        <Box mt={2}>
          <Typography variant="h5" sx={{mb:2, color:'#00bcd4', fontWeight:'bold'}}>إعدادات الشريط الكتابي</Typography>
          <Box sx={{display:'flex',flexDirection:'column',gap:2,maxWidth:500,mx:'auto',bgcolor:'#23263a',p:3,borderRadius:4,boxShadow:8}}>
            <TextField
              label="نص الشريط الكتابي (يمكنك وضع أكثر من نص بفاصل الفاصلة ,)"
              value={marquee.texts.join(',')}
              onChange={e => setMarquee(m => ({...m, texts: e.target.value.split(',')}))}
              InputLabelProps={{ style: { color: '#00bcd4', fontWeight: 'bold' } }}
              sx={{input:{color:'#fff',fontWeight:'bold',fontSize:18},label:{color:'#00bcd4'}}}
              fullWidth
            />
            <Box sx={{display:'flex',gap:2}}>
              <TextField
                label="حجم الخط (px)"
                type="number"
                value={marquee.fontSize}
                onChange={e => setMarquee(m => ({...m, fontSize: Number(e.target.value)}))}
                InputLabelProps={{ style: { color: '#00bcd4', fontWeight: 'bold' } }}
                sx={{input:{color:'#fff'},label:{color:'#00bcd4'}}}
                fullWidth
              />
              <TextField
                label="سرعة الحركة (ثانية)"
                type="number"
                value={marquee.speed}
                onChange={e => setMarquee(m => ({...m, speed: Number(e.target.value)}))}
                InputLabelProps={{ style: { color: '#00bcd4', fontWeight: 'bold' } }}
                sx={{input:{color:'#fff'},label:{color:'#00bcd4'}}}
                fullWidth
              />
            </Box>
            <TextField
              label="لون الخط (hex)"
              value={marquee.color}
              onChange={e => setMarquee(m => ({...m, color: e.target.value}))}
              InputLabelProps={{ style: { color: '#00bcd4', fontWeight: 'bold' } }}
              sx={{input:{color:'#fff'},label:{color:'#00bcd4'}}}
              fullWidth
            />
            <Button variant="contained" sx={{bgcolor:'#00bcd4',color:'#181c2a',fontWeight:'bold',mt:2}} onClick={async()=>{
              // حفظ التغييرات في قاعدة البيانات
              await updateDoc(doc(db, 'marquee', 'main'), marquee);
              setSnackbar({open:true, message:'تم حفظ إعدادات الشريط الكتابي بنجاح', severity:'success'});
            }}>حفظ التغييرات</Button>
            <Box mt={2}>
              <Typography sx={{color:'#bbb',mb:1}}>معاينة الشريط الكتابي:</Typography>
              <div style={{
                width:'100%',overflow:'hidden',background:'none',borderRadius:0,padding:0
              }}>
                <div style={{
                  display:'inline-block',whiteSpace:'nowrap',animation:`marquee ${marquee.speed}s linear infinite`,
                  color: marquee.color,fontWeight:'bold',fontSize: marquee.fontSize,fontFamily:'Cairo, Tahoma, Arial',letterSpacing:1,padding:'8px 0',minWidth:'100%'
                }}>
                  {marquee.texts && marquee.texts.length > 0 ?
                    marquee.texts.map((txt,i)=>(<span key={i} style={{marginRight:40}}>{txt}</span>)) :
                    <span>مرحباً بك في منصتنا العقارية!</span>
                  }
                </div>
              </div>
            </Box>
          </Box>
        </Box>
      )}
      {/* تبويب الوحدات */}
      {tab === 0 && (
        <Box mt={2}>
          <Box sx={{display:'flex',alignItems:'center',gap:2,mb:1}}>
            <Typography variant="h5" sx={{ color:'#00bcd4', fontWeight:'bold', fontSize: { xs: 22, md: 28 }}}>إدارة الوحدات العقارية</Typography>
            {compareUnits.length > 1 && (
              <Button startIcon={<CompareArrowsIcon />} variant="contained" sx={{bgcolor:'#00bcd4',color:'#181c2a',fontWeight:'bold'}} onClick={()=>setCompareOpen(true)}>
                مقارنة ({compareUnits.length})
              </Button>
            )}
          </Box>
          <Button variant="contained" startIcon={<Add />} sx={{fontSize:18, py:1.5, px:4, mb:2, bgcolor:'#00bcd4', color:'#181c2a', fontWeight:'bold', boxShadow: 4}} onClick={() => { setEditingUnit(null); setUnitForm({ title: '', country: '', compound: '', developer: '', area: '', minPrice: '', maxPrice: '', rooms: '', baths: '', kitchen: '', floors: '', pool: false, garden: false, guardRoom: false, location: '', images: [], panorama: [], model3d: '', vr: '' }); setUnitDialog(true); }}>إضافة وحدة</Button>
          <Grid container spacing={{ xs: 2, md: 3 }} mt={1}>
            {units.map((unit: Unit) => {
              const selected = compareUnits.some((u: Unit) => u.id === unit.id);
              return (
                <Box key={unit.id} sx={{ width: { xs: '100%', sm: '50%', md: '33.33%' }, display: 'flex' }}>
                  <Card
                    sx={{ width: '100%', bgcolor:'#23263a', color:'#fff', borderRadius:4, boxShadow:8, transition:'0.2s', cursor:'pointer', '&:hover':{boxShadow:16, transform:'scale(1.025)'} }}
                    onClick={() => {
                      if (unit.id) window.open(`/property/${unit.id}`, '_blank');
                    }}
                  >
                    <CardMedia image={unit.images && unit.images.length > 0 ? unit.images[0] : ''} title={unit.title} sx={{ height: { xs: 120, md: 180 }, borderRadius:4, bgcolor:!unit.images||unit.images.length===0?'#eee':'unset', display:'flex', alignItems:'center', justifyContent:'center' }} >
                      {(!unit.images || unit.images.length === 0) && (
                        <Typography sx={{color:'#bbb',fontWeight:'bold',fontSize:16,textAlign:'center',width:'100%'}}>لا توجد صورة</Typography>
                      )}
                    </CardMedia>
                    <CardContent>
                      <Typography variant="h6" sx={{color:'#00bcd4', fontWeight:'bold', fontSize: { xs: 18, md: 22 }}}>{unit.title}</Typography>
                      <Typography variant="body2" sx={{color:'#fff', fontSize: { xs: 14, md: 16 }}}>{unit.country} - {unit.compound}</Typography>
                      <Typography variant="body2" sx={{color:'#fff', fontSize: { xs: 14, md: 16 }}}>المساحة: {unit.area}م - السعر: {unit.minPrice} - {unit.maxPrice}</Typography>
                    </CardContent>
                    <CardActions onClick={e => e.stopPropagation()}>
                      <IconButton onClick={() => { setEditingUnit(unit); setUnitForm(unit); setUnitDialog(true); }}><Edit sx={{color:'#00bcd4'}} /></IconButton>
                      <IconButton color="error" onClick={() => setConfirmDialog({open: true, message: `هل أنت متأكد من حذف الوحدة؟`, onConfirm: async () => {
                        await deleteDoc(doc(db, 'units', unit.id!));
                        setUnits(units.filter((u: Unit) => u.id !== unit.id));
                        setSnackbar({open: true, message: 'تم حذف الوحدة بنجاح', severity: 'success'});
                      }})}><Delete /></IconButton>
                      <Button size="small" variant={selected ? "contained" : "outlined"} sx={{ml:1,bgcolor:selected?'#00bcd4':'#23263a',color:selected?'#181c2a':'#00bcd4',fontWeight:'bold'}} onClick={event => {
                        event.stopPropagation();
                        if(selected) {
                          setCompareUnits(compareUnits.filter((u: Unit) => u.id !== unit.id));
                        } else {
                          setCompareUnits((prev: Unit[]) => prev.length >= 4 ? [...prev.slice(1), unit] : [...prev, unit]);
                        }
                      }}>{selected ? 'إزالة من المقارنة' : 'إضافة للمقارنة'}</Button>
                    </CardActions>
                  </Card>
                </Box>
              );
            })}
          </Grid>
          <UnitsCompareDialog open={compareOpen} onClose={()=>setCompareOpen(false)} units={compareUnits} />
          {/* حوار إضافة/تعديل وحدة */}
          <Dialog open={unitDialog} onClose={() => setUnitDialog(false)} maxWidth="md" fullWidth>
            <DialogTitle sx={{ color: '#00bcd4', fontWeight: 'bold', fontSize: 28, textAlign: 'center', letterSpacing: 1, mb: 1 }}>{editingUnit ? 'تعديل وحدة' : 'إضافة وحدة'}</DialogTitle>
            <DialogContent sx={{ bgcolor: '#23263a', borderRadius: 3, color:'#fff' }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ width: { xs: '100%', md: '50%' } }}>
                  <TextField label="العنوان (مثال: شقة فاخرة)" fullWidth value={unitForm.title} onChange={e => setUnitForm(f => ({ ...f, title: e.target.value }))} InputLabelProps={{ style: { color: '#00bcd4', fontWeight: 'bold', fontSize: 20 } }} sx={{input:{color:'#fff', fontWeight:'bold', fontSize: 20}, label:{color:'#00bcd4', fontWeight:'bold', fontSize: 20}}} />
                </Box>
                <Box sx={{ width: { xs: '100%', md: '50%' } }}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: '#00bcd4', fontWeight: 'bold' }}>الدولة</InputLabel>
                    <Select value={unitForm.country} onChange={e => setUnitForm(f => ({ ...f, country: e.target.value }))} label="الدولة" sx={{color:'#fff'}}>
                      <MenuItem value="">اختر الدولة</MenuItem>
                      <MenuItem value="مصر">مصر</MenuItem>
                      <MenuItem value="السعودية">السعودية</MenuItem>
                      <MenuItem value="الإمارات">الإمارات</MenuItem>
                      <MenuItem value="قطر">قطر</MenuItem>
                      <MenuItem value="الكويت">الكويت</MenuItem>
                      <MenuItem value="أخرى">أخرى</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                {/* اختيار المطور والكمباوند من قائمة */}
                <Box sx={{ width: { xs: '100%', md: '50%' } }}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: '#00bcd4', fontWeight: 'bold' }}>المطور</InputLabel>
                    <Select value={unitForm.developer} onChange={e => setUnitForm(f => ({ ...f, developer: e.target.value }))} label="المطور" sx={{color:'#fff'}}>
                      <MenuItem value="">اختر المطور</MenuItem>
                      {developers.map(dev => <MenuItem key={dev.id} value={dev.name}>{dev.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ width: { xs: '100%', md: '50%' } }}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: '#00bcd4', fontWeight: 'bold' }}>الكمباوند</InputLabel>
                    <Select value={unitForm.compound} onChange={e => setUnitForm(f => ({ ...f, compound: e.target.value }))} label="الكمباوند" sx={{color:'#fff'}}>
                      <MenuItem value="">اختر الكمباوند</MenuItem>
                      {compounds.map(comp => <MenuItem key={comp.id} value={comp.name}>{comp.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ width: { xs: '100%', md: '50%' } }}>
                  <TextField label="المساحة (م²)" fullWidth value={unitForm.area} onChange={e => setUnitForm(f => ({ ...f, area: e.target.value }))} InputLabelProps={{ style: { color: '#00bcd4', fontWeight: 'bold' } }} sx={{input:{color:'#fff'}, label:{color:'#00bcd4'}}} />
                </Box>
                <Box sx={{ width: { xs: '100%', md: '33.33%' } }}>
                  <TextField label="السعر الأدنى (جنيه)" fullWidth value={unitForm.minPrice} onChange={e => setUnitForm(f => ({ ...f, minPrice: e.target.value }))} InputLabelProps={{ style: { color: '#00bcd4', fontWeight: 'bold' } }} sx={{input:{color:'#fff'}, label:{color:'#00bcd4'}}} />
                </Box>
                <Box sx={{ width: { xs: '100%', md: '33.33%' } }}>
                  <TextField label="السعر الأقصى (جنيه)" fullWidth value={unitForm.maxPrice} onChange={e => setUnitForm(f => ({ ...f, maxPrice: e.target.value }))} InputLabelProps={{ style: { color: '#00bcd4', fontWeight: 'bold' } }} sx={{input:{color:'#fff'}, label:{color:'#00bcd4'}}} />
                </Box>
                <Box sx={{ width: { xs: '100%', md: '33.33%' } }}>
                  <TextField label="عدد الغرف" fullWidth value={unitForm.rooms} onChange={e => setUnitForm(f => ({ ...f, rooms: e.target.value }))} InputLabelProps={{ style: { color: '#00bcd4', fontWeight: 'bold' } }} sx={{input:{color:'#fff'}, label:{color:'#00bcd4'}}} />
                </Box>
                <Box sx={{ width: { xs: '100%', md: '33.33%' } }}>
                  <TextField label="عدد الحمامات" fullWidth value={unitForm.baths} onChange={e => setUnitForm(f => ({ ...f, baths: e.target.value }))} InputLabelProps={{ style: { color: '#00bcd4', fontWeight: 'bold' } }} sx={{input:{color:'#fff'}, label:{color:'#00bcd4'}}} />
                </Box>
                <Box sx={{ width: { xs: '100%', md: '33.33%' } }}>
                  <TextField label="عدد المطابخ" fullWidth value={unitForm.kitchen} onChange={e => setUnitForm(f => ({ ...f, kitchen: e.target.value }))} InputLabelProps={{ style: { color: '#00bcd4', fontWeight: 'bold' } }} sx={{input:{color:'#fff'}, label:{color:'#00bcd4'}}} />
                </Box>
                <Box sx={{ width: { xs: '100%', md: '33.33%' } }}>
                  <TextField label="عدد الأدوار" fullWidth value={unitForm.floors} onChange={e => setUnitForm(f => ({ ...f, floors: e.target.value }))} InputLabelProps={{ style: { color: '#00bcd4', fontWeight: 'bold' } }} sx={{input:{color:'#fff'}, label:{color:'#00bcd4'}}} />
                </Box>
                <Box sx={{ width: { xs: '100%', md: '33.33%' } }}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: '#00bcd4', fontWeight: 'bold' }}>حمام سباحة</InputLabel>
                    <Select value={unitForm.pool ? "true" : "false"} onChange={e => setUnitForm(f => ({ ...f, pool: e.target.value === "true" }))} label="حمام سباحة" sx={{color:'#fff'}}>
                      <MenuItem value="true">نعم</MenuItem>
                      <MenuItem value="false">لا</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ width: { xs: '100%', md: '33.33%' } }}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: '#00bcd4', fontWeight: 'bold' }}>جاردن</InputLabel>
                    <Select value={unitForm.garden ? "true" : "false"} onChange={e => setUnitForm(f => ({ ...f, garden: e.target.value === "true" }))} label="جاردن" sx={{color:'#fff'}}>
                      <MenuItem value="true">نعم</MenuItem>
                      <MenuItem value="false">لا</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ width: { xs: '100%', md: '33.33%' } }}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: '#00bcd4', fontWeight: 'bold' }}>غرفة حرس</InputLabel>
                    <Select value={unitForm.guardRoom ? "true" : "false"} onChange={e => setUnitForm(f => ({ ...f, guardRoom: e.target.value === "true" }))} label="غرفة حرس" sx={{color:'#fff'}}>
                      <MenuItem value="true">نعم</MenuItem>
                      <MenuItem value="false">لا</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ width: { xs: '100%', md: '66.66%' } }}>
                  <TextField label="العنوان أو وصف الموقع (اختياري)" fullWidth value={unitForm.location} onChange={e => setUnitForm(f => ({ ...f, location: e.target.value }))} InputLabelProps={{ style: { color: '#00bcd4', fontWeight: 'bold' } }} sx={{input:{color:'#fff'}, label:{color:'#00bcd4'}}} />
                  <MapPicker lat={unitForm.lat || 30.0444} lng={unitForm.lng || 31.2357} onChange={(lat, lng) => setUnitForm(f => ({ ...f, lat, lng }))} />
                </Box>
                {/* صور الوحدة */}
                <Box sx={{ width: { xs: '100%', md: '33.33%' } }}>
                  <Typography sx={{ color: '#00bcd4', fontWeight: 'bold', mb: 1, fontSize: 18 }}>صور الوحدة</Typography>
                  <ImageUploader
                    images={unitForm.images || []}
                    onAdd={async (urls: string[]) => {
                      setUnitForm((f: Unit) => ({ ...f, images: [...(f.images || []), ...urls] }));
                      if (editingUnit) {
                        await updateDoc(doc(db, 'units', editingUnit.id!), { ...unitForm, images: [...(unitForm.images || []), ...urls] });
                        setUnits(units.map(u => u.id === editingUnit.id ? { ...u, images: [...(unitForm.images || []), ...urls] } : u));
                      }
                    }}
                    onRemove={async (idx: number) => {
                      const newImages = (unitForm.images || []).filter((_: string, i: number) => i !== idx);
                      setUnitForm((f: Unit) => ({ ...f, images: newImages }));
                      if (editingUnit) {
                        await updateDoc(doc(db, 'units', editingUnit.id!), { ...unitForm, images: newImages });
                        setUnits(units.map(u => u.id === editingUnit.id ? { ...u, images: newImages } : u));
                      }
                    }}
                  />
                </Box>
                {/* صور بانوراما */}
                <Box sx={{ width: { xs: '100%', md: '33.33%' } }}>
                  <Button component="label" startIcon={<CloudUpload />} fullWidth sx={{bgcolor:'#00bcd4', color:'#181c2a', fontWeight:'bold'}} disabled={uploading}>
                    {uploading ? <CircularProgress size={22} color="inherit" /> : 'رفع صور بانوراما'}
                    <input type="file" hidden multiple accept="image/*" onChange={async (e: React.ChangeEvent<HTMLInputElement>) => {
                      if (!e.target.files) return;
                      setUploading(true);
                      const files = Array.from(e.target.files) as File[];
                      let urls: string[] = [];
                      try {
                        for (const file of files) {
                          // تحقق من النوع والحجم
                          if (!['image/jpeg','image/png','image/webp'].includes(file.type)) {
                            setSnackbar({open:true, message:'الرجاء اختيار صور بصيغة jpg أو png أو webp فقط', severity:'error'});
                            continue;
                          }
                          if (file.size > 5*1024*1024) {
                            setSnackbar({open:true, message:'حجم الصورة كبير جداً (الحد الأقصى 5MB)', severity:'error'});
                            continue;
                          }
                          const url = await uploadImage(file, 'units/panorama');
                          urls.push(url);
                        }
                        if (urls.length > 0) {
                          setUnitForm((f: Unit) => ({ ...f, panorama: [...(f.panorama || []), ...urls] }));
                          setSnackbar({open:true, message:`تم رفع ${urls.length} صورة بانوراما`, severity:'success'});
                        }
                      } catch (err) {
                        setSnackbar({open:true, message:'فشل رفع صور البانوراما!', severity:'error'});
                      }
                      setUploading(false);
                    }} />
                  </Button>
                  <Box sx={{display:'flex',flexWrap:'wrap',gap:1,mt:1}}>
                    {unitForm.panorama?.map((img: string, i: number)=>(<img key={i} src={img} alt="pano" style={{width:48,height:48,borderRadius:6,objectFit:'cover',border:'2px solid #00bcd4'}} />))}
                  </Box>
                </Box>
                {/* نموذج 3D */}
                <Box sx={{ width: { xs: '100%', md: '33.33%' } }}>
                  <Button component="label" startIcon={<CloudUpload />} fullWidth sx={{bgcolor:'#00bcd4', color:'#181c2a', fontWeight:'bold'}} disabled={uploading}>
                    {uploading ? <CircularProgress size={22} color="inherit" /> : 'رفع نموذج 3D'}
                    <input type="file" hidden accept=".glb,.gltf" onChange={async e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setUploading(true);
                        const url = await uploadImage(file, 'units/model3d');
                        setUnitForm(f => ({ ...f, model3d: url }));
                        setUploading(false);
                        setSnackbar({open:true, message:'تم رفع نموذج 3D', severity:'success'});
                      }
                    }} />
                  </Button>
                  {unitForm.model3d && <Chip label="تم رفع نموذج 3D" color="success" sx={{mt:1}} />}
                </Box>
                {/* نموذج VR */}
                <Box sx={{ width: { xs: '100%', md: '33.33%' } }}>
                  <Button component="label" startIcon={<CloudUpload />} fullWidth sx={{bgcolor:'#00bcd4', color:'#181c2a', fontWeight:'bold'}} disabled={uploading}>
                    {uploading ? <CircularProgress size={22} color="inherit" /> : 'رفع نموذج VR'}
                    <input type="file" hidden accept=".vr,.zip" onChange={async e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setUploading(true);
                        const url = await uploadImage(file, 'units/vr');
                        setUnitForm(f => ({ ...f, vr: url }));
                        setUploading(false);
                        setSnackbar({open:true, message:'تم رفع نموذج VR', severity:'success'});
                      }
                    }} />
                  </Button>
                  {unitForm.vr && <Chip label="تم رفع نموذج VR" color="success" sx={{mt:1}} />}
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setUnitDialog(false)} sx={{fontWeight:'bold'}}>إلغاء</Button>
              <Button variant="contained" sx={{bgcolor:'#00bcd4', color:'#181c2a', fontWeight:'bold'}}
                disabled={uploading}
                onClick={async () => {
                  if (uploading) {
                    setSnackbar({open:true, message:'يرجى الانتظار حتى انتهاء رفع الصور!', severity:'warning'});
                    return;
                  }
                  if (editingUnit) {
                    await updateDoc(doc(db, 'units', editingUnit.id!), unitForm);
                    setUnits(units.map(u => u.id === editingUnit.id ? { ...u, ...unitForm } : u));
                    setSnackbar({open: true, message: 'تم تحديث الوحدة بنجاح', severity: 'success'});
                  } else {
                    const docRef = await addDoc(collection(db, 'units'), unitForm);
                    setUnits([...units, { id: docRef.id, ...unitForm }]);
                    setSnackbar({open: true, message: 'تم إضافة وحدة جديدة بنجاح', severity: 'success'});
                  }
                  setUnitDialog(false);
                }}
              >
                {editingUnit ? 'تحديث' : 'إضافة'}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
      {/* باقي التبويبات ... */}
    </Box>
  );
}

import React, { useState, useEffect } from 'react';
import { db } from '../data/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Tabs, Tab, Box, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Typography, Select, MenuItem, InputLabel, FormControl, Grid, Card, CardMedia, CardContent, CardActions, Snackbar, Alert, Chip, CircularProgress } from '@mui/material';
import { Add, Edit, Delete, CloudUpload } from '@mui/icons-material';
import DemoEmployees from './DemoEmployees';
import AdsPanel from './AdsPanel';
import ContactLinksPanel from './ContactLinksPanel';
import PagesEditor from './PagesEditor';

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
  images: string[];
};

export type Compound = {
  id?: string;
  name: string;
  country: string;
  developer: string;
  location: string;
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
    title: '', country: '', compound: '', developer: '', area: '', minPrice: '', maxPrice: '', rooms: '', baths: '', kitchen: '', floors: '', pool: false, garden: false, guardRoom: false, location: '', images: [], panorama: [], model3d: '', vr: ''
  });
  // مطورين
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [devDialog, setDevDialog] = useState(false);
  const [editingDev, setEditingDev] = useState<Developer | null>(null);
  const [devForm, setDevForm] = useState<Developer>({ name: '', country: '', achievements: '', about: '', images: [] });
  // كمباوندات
  const [compounds, setCompounds] = useState<Compound[]>([]);
  const [compoundDialog, setCompoundDialog] = useState(false);
  const [editingCompound, setEditingCompound] = useState<Compound | null>(null);
  const [compoundForm, setCompoundForm] = useState<Compound>({ name: '', country: '', developer: '', location: '', images: [] });
  // الخلفيات
  const [backgrounds, setBackgrounds] = useState<string[]>([]);
  const [bgDialog, setBgDialog] = useState(false);
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
    getDocs(collection(db, 'units')).then(snap => setUnits(snap.docs.map(d => ({ id: d.id, ...d.data() }) as Unit)));
    getDocs(collection(db, 'developers')).then(snap => setDevelopers(snap.docs.map(d => ({ id: d.id, ...d.data() }) as Developer)));
    getDocs(collection(db, 'compounds')).then(snap => setCompounds(snap.docs.map(d => ({ id: d.id, ...d.data() }) as Compound)));
    getDocs(collection(db, 'backgrounds')).then(snap => setBackgrounds(snap.docs.map(d => d.data().url as string)));
    getDocs(collection(db, 'slider')).then(snap => setSlider(snap.docs.map(d => d.data().url as string)));
    getDocs(collection(db, 'marquee')).then(snap => {
      if (snap.docs.length > 0) setMarquee(snap.docs[0].data() as Marquee);
    });
    getDocs(collection(db, 'employees')).then(snap => setEmployees(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, []);

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', p: { xs: 2, md: 6 }, bgcolor: '#181c2a', backdropFilter: 'blur(18px)', borderRadius: 8, boxShadow: 12, maxWidth: 1500, margin: '32px auto', position: 'relative', color: '#fff', fontFamily: 'Cairo, Tahoma, Arial' }}>
      {/* ترويسة عصرية */}
      <Box sx={{display:'flex',alignItems:'center',justifyContent:'center',gap:2,mb:3}}>
        <img src="/images/logo1.png" alt="logo" style={{width:64,height:64,borderRadius:16,boxShadow:'0 2px 16px #00bcd4'}} />
        <Typography variant="h3" sx={{color:'#00bcd4',fontWeight:'bold',letterSpacing:2, textShadow:'0 2px 8px #000'}}>لوحة التحكم</Typography>
      </Box>
      <Typography variant="subtitle1" sx={{color:'#bbb',mb:2,textAlign:'center',fontSize:22}}>كل التعديلات تظهر فوراً في التطبيق</Typography>
      {/* تبويبات عصرية */}
      {/* تعريف عدد التبويبات بشكل ديناميكي */}
      {(() => {
        const tabLabels = [
          'الوحدات',
          'الموظفين',
          'المطورين',
          'الكمباوندات',
          'الإعلانات',
          'الخلفيات',
          'الشريط الكتابي',
          'تواصل معنا',
          'إدارة الصفحات',
        ];
        // إذا كانت قيمة tab خارج النطاق، أعدها للصفر
        if (tab < 0 || tab >= tabLabels.length) setTab(0);
        return (
          <Tabs value={tab} onChange={(_, v) => setTab(v)} centered sx={{ mb: 4, '.MuiTab-root': { color: '#fff', fontWeight: 'bold', fontSize: 22, borderRadius: 3, px:4, transition:'0.2s', textTransform:'none', letterSpacing:1 }, '.Mui-selected': { color: '#181c2a !important', background:'#00bcd4', boxShadow:'0 2px 16px #00bcd455' } }}>
            {tabLabels.map((label, idx) => <Tab key={idx} label={label} />)}
          </Tabs>
        );
      })()}
      {/* تبويب إدارة الصفحات */}
      {tab === 8 && (
        <Box mt={2}>
          <Typography variant="h5" sx={{mb:2, color:'#00bcd4', fontWeight:'bold'}}>إدارة الصفحات الرئيسية</Typography>
          {/* استيراد PagesEditor بشكل صحيح */}
          <PagesEditor setSnackbar={setSnackbar} />
        </Box>
      )}
      {/* باقي التبويبات كما هي (كل قسم داخل Card أو Box مع ظل وPadding) */}
      {/* تبويب الوحدات */}
      {tab === 0 && (
        <Box mt={2}><Typography variant="h5" sx={{mb:2, color:'#00bcd4', fontWeight:'bold'}}>إدارة الوحدات العقارية</Typography>
          <Button variant="contained" startIcon={<Add />} sx={{fontSize:18, py:1.5, px:4, mb:2, bgcolor:'#00bcd4', color:'#181c2a', fontWeight:'bold'}} onClick={() => { setEditingUnit(null); setUnitForm({ title: '', country: '', compound: '', developer: '', area: '', minPrice: '', maxPrice: '', rooms: '', baths: '', kitchen: '', floors: '', pool: false, garden: false, guardRoom: false, location: '', images: [], panorama: [], model3d: '', vr: '' }); setUnitDialog(true); }}>إضافة وحدة</Button>
          <Grid container spacing={3} mt={1}>
            {units.map(unit => (
              <Box key={unit.id} sx={{ width: { xs: '100%', md: '50%', lg: '33.33%' }, display: 'flex' }}>
                <Card sx={{ width: '100%', bgcolor:'#23263a', color:'#fff', borderRadius:4, boxShadow:8 }}>
                  <CardMedia image={unit.images?.[0] || '/images/bg1.png'} title={unit.title} sx={{ height: 180, borderRadius:4 }} />
                  <CardContent>
                    <Typography variant="h6" sx={{color:'#00bcd4', fontWeight:'bold'}}>{unit.title}</Typography>
                    <Typography variant="body2" sx={{color:'#fff'}}>{unit.country} - {unit.compound}</Typography>
                    <Typography variant="body2" sx={{color:'#fff'}}>المساحة: {unit.area}م - السعر: {unit.minPrice} - {unit.maxPrice}</Typography>
                  </CardContent>
                  <CardActions>
                    <IconButton onClick={() => { setEditingUnit(unit); setUnitForm(unit); setUnitDialog(true); }}><Edit sx={{color:'#00bcd4'}} /></IconButton>
                    <IconButton color="error" onClick={() => setConfirmDialog({open: true, message: `هل أنت متأكد من حذف الوحدة؟`, onConfirm: async () => {
                      await deleteDoc(doc(db, 'units', unit.id!));
                      setUnits(units.filter(u => u.id !== unit.id));
                      setSnackbar({open: true, message: 'تم حذف الوحدة بنجاح', severity: 'success'});
                    }})}><Delete /></IconButton>
                  </CardActions>
                </Card>
              </Box>
            ))}
          </Grid>
          {/* حوار إضافة/تعديل وحدة */}
          <Dialog open={unitDialog} onClose={() => setUnitDialog(false)} maxWidth="md" fullWidth>
            <DialogTitle sx={{ color: '#00bcd4', fontWeight: 'bold', fontSize: 26, textAlign: 'center', letterSpacing: 1 }}>{editingUnit ? 'تعديل وحدة' : 'إضافة وحدة'}</DialogTitle>
            <DialogContent sx={{ bgcolor: '#23263a', borderRadius: 3, color:'#fff' }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ width: { xs: '100%', md: '50%' } }}>
                  <TextField label="العنوان (مثال: شقة فاخرة)" fullWidth value={unitForm.title} onChange={e => setUnitForm(f => ({ ...f, title: e.target.value }))} InputLabelProps={{ style: { color: '#00bcd4', fontWeight: 'bold' } }} sx={{input:{color:'#fff'}, label:{color:'#00bcd4'}}} />
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
                  <TextField label="الموقع على الخريطة (رابط)" fullWidth value={unitForm.location} onChange={e => setUnitForm(f => ({ ...f, location: e.target.value }))} InputLabelProps={{ style: { color: '#00bcd4', fontWeight: 'bold' } }} sx={{input:{color:'#fff'}, label:{color:'#00bcd4'}}} />
                </Box>
                {/* صور الوحدة */}
                <Box sx={{ width: { xs: '100%', md: '33.33%' } }}>
                  <Button component="label" startIcon={<CloudUpload />} fullWidth sx={{bgcolor:'#00bcd4', color:'#181c2a', fontWeight:'bold'}} disabled={uploading}>
                    {uploading ? <CircularProgress size={22} color="inherit" /> : 'رفع صور'}
                    <input type="file" hidden multiple accept="image/*" onChange={async e => {
                      if (!e.target.files) return;
                      setUploading(true);
                      const files = Array.from(e.target.files);
                      const urls = await Promise.all(files.map(file => uploadImage(file, 'units')));
                      setUnitForm(f => ({ ...f, images: [...(f.images || []), ...urls] }));
                      setUploading(false);
                      setSnackbar({open:true, message:'تم رفع الصور بنجاح', severity:'success'});
                    }} />
                  </Button>
                  <Box sx={{display:'flex',flexWrap:'wrap',gap:1,mt:1}}>
                    {unitForm.images?.map((img,i)=>(<img key={i} src={img} alt="img" style={{width:48,height:48,borderRadius:6,objectFit:'cover',border:'2px solid #00bcd4'}} />))}
                  </Box>
                </Box>
                {/* صور بانوراما */}
                <Box sx={{ width: { xs: '100%', md: '33.33%' } }}>
                  <Button component="label" startIcon={<CloudUpload />} fullWidth sx={{bgcolor:'#00bcd4', color:'#181c2a', fontWeight:'bold'}} disabled={uploading}>
                    {uploading ? <CircularProgress size={22} color="inherit" /> : 'رفع صور بانوراما'}
                    <input type="file" hidden multiple accept="image/*" onChange={async e => {
                      if (!e.target.files) return;
                      setUploading(true);
                      const files = Array.from(e.target.files);
                      const urls = await Promise.all(files.map(file => uploadImage(file, 'units/panorama')));
                      setUnitForm(f => ({ ...f, panorama: [...(f.panorama || []), ...urls] }));
                      setUploading(false);
                      setSnackbar({open:true, message:'تم رفع صور البانوراما', severity:'success'});
                    }} />
                  </Button>
                  <Box sx={{display:'flex',flexWrap:'wrap',gap:1,mt:1}}>
                    {unitForm.panorama?.map((img,i)=>(<img key={i} src={img} alt="pano" style={{width:48,height:48,borderRadius:6,objectFit:'cover',border:'2px solid #00bcd4'}} />))}
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
              <Button variant="contained" sx={{bgcolor:'#00bcd4', color:'#181c2a', fontWeight:'bold'}} onClick={async () => {
                if (editingUnit) {
                  await updateDoc(doc(db, 'units', editingUnit.id!), unitForm);
                  setUnits(units.map(u => u.id === editingUnit.id ? { ...u, ...unitForm } : u));
                  setSnackbar({open: true, message: 'تم تحديث الوحدة بنجاح', severity: 'success'});
                } else {
                  const docRef = await addDoc(collection(db, 'units'), unitForm);
                  setUnits([...units, { ...unitForm, id: docRef.id }]);
                  setSnackbar({open: true, message: 'تم إضافة الوحدة بنجاح', severity: 'success'});
                }
                setUnitDialog(false);
              }}>{editingUnit ? 'تحديث' : 'إضافة'}</Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
      {/* تبويب الموظفين */}
      {tab === 1 && (
        <Box mt={2}><Typography variant="h6" sx={{mb:2}}>إدارة الموظفين</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => { setEditingEmployee(null); setEmployeeForm({ username: '', password: '', role: 'موظف' }); setEmployeeDialog(true); }}>إضافة موظف</Button>
          <Grid container spacing={2} mt={1}>
            {employees.map(emp => (
              <Box key={emp.id} sx={{ width: { xs: '100%', md: '50%', lg: '33.33%' }, display: 'flex' }}>
                <Card sx={{ width: '100%' }}>
                  <CardContent>
                    <Typography variant="h6">{emp.username}</Typography>
                    <Typography variant="body2">الدور: {emp.role}</Typography>
                  </CardContent>
                  <CardActions>
                    <IconButton onClick={() => { setEditingEmployee(emp); setEmployeeForm(emp); setEmployeeDialog(true); }}><Edit /></IconButton>
                    <IconButton color="error" onClick={() => setConfirmDialog({open: true, message: `هل أنت متأكد من حذف الموظف؟`, onConfirm: async () => {
                      await deleteDoc(doc(db, 'employees', emp.id!));
                      setEmployees(employees.filter(e => e.id !== emp.id));
                      setSnackbar({open: true, message: 'تم حذف الموظف بنجاح', severity: 'success'});
                    }})}><Delete /></IconButton>
                  </CardActions>
                </Card>
              </Box>
            ))}
          </Grid>
          {/* حوار إضافة/تعديل موظف */}
          <Dialog open={employeeDialog} onClose={() => setEmployeeDialog(false)} maxWidth="sm" fullWidth>
            <DialogTitle>{editingEmployee ? 'تعديل موظف' : 'إضافة موظف'}</DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField label="اسم المستخدم" fullWidth value={employeeForm.username} onChange={e => setEmployeeForm((f: typeof employeeForm) => ({ ...f, username: e.target.value }))} />
                <TextField label="كلمة السر" type="password" fullWidth value={employeeForm.password} onChange={e => setEmployeeForm((f: typeof employeeForm) => ({ ...f, password: e.target.value }))} />
                <FormControl fullWidth>
                  <InputLabel>الدور</InputLabel>
                  <Select value={employeeForm.role} onChange={e => setEmployeeForm((f: typeof employeeForm) => ({ ...f, role: e.target.value }))} label="الدور">
                    <MenuItem value="مدير">مدير</MenuItem>
                    <MenuItem value="مشرف">مشرف</MenuItem>
                    <MenuItem value="بروكر">بروكر</MenuItem>
                    <MenuItem value="تسويق">تسويق</MenuItem>
                    <MenuItem value="موظف">موظف</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEmployeeDialog(false)}>إلغاء</Button>
              <Button variant="contained" onClick={async () => {
                if (editingEmployee) {
                  await updateDoc(doc(db, 'employees', editingEmployee.id!), employeeForm);
                  setEmployees(employees.map(e => e.id === editingEmployee.id ? { ...e, ...employeeForm } : e));
                  setSnackbar({open: true, message: 'تم تحديث الموظف بنجاح', severity: 'success'});
                } else {
                  const docRef = await addDoc(collection(db, 'employees'), employeeForm);
                  setEmployees([...employees, { ...employeeForm, id: docRef.id }]);
                  setSnackbar({open: true, message: 'تم إضافة الموظف بنجاح', severity: 'success'});
                }
                setEmployeeDialog(false);
              }}>{editingEmployee ? 'تحديث' : 'إضافة'}</Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
      {/* تبويب المطورين */}
      {tab === 2 && (
        <Box mt={2}><Typography variant="h6" sx={{mb:2}}>إدارة المطورين العقاريين</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => { setEditingDev(null); setDevForm({ name: '', country: '', achievements: '', about: '', images: [] }); setDevDialog(true); }}>إضافة مطور</Button>
          <Grid container spacing={2} mt={1}>
            {developers.map(dev => (
              <Box key={dev.id} sx={{ width: { xs: '100%', md: '50%', lg: '33.33%' }, display: 'flex' }}>
                <Card sx={{ width: '100%' }}>
                  <CardMedia image={dev.images?.[0] || '/images/bg1.png'} title={dev.name} sx={{ height: 140 }} />
                  <CardContent>
                    <Typography variant="h6">{dev.name}</Typography>
                    <Typography variant="body2">{dev.country}</Typography>
                    <Typography variant="body2">{dev.achievements}</Typography>
                  </CardContent>
                  <CardActions>
                    <IconButton onClick={() => { setEditingDev(dev); setDevForm(dev); setDevDialog(true); }}><Edit /></IconButton>
                    <IconButton color="error" onClick={() => setConfirmDialog({open: true, message: `هل أنت متأكد من حذف المطور؟`, onConfirm: async () => {
                      await deleteDoc(doc(db, 'developers', dev.id!));
                      setDevelopers(developers.filter(d => d.id !== dev.id));
                      setSnackbar({open: true, message: 'تم حذف المطور بنجاح', severity: 'success'});
                    }})}><Delete /></IconButton>
                  </CardActions>
                </Card>
              </Box>
            ))}
          </Grid>
          {/* حوار إضافة/تعديل مطور */}
          <Dialog open={devDialog} onClose={() => setDevDialog(false)} maxWidth="md" fullWidth>
            <DialogTitle>{editingDev ? 'تعديل مطور' : 'إضافة مطور'}</DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ width: { xs: '100%', md: '50%' } }}>
                  <TextField label="اسم المطور" fullWidth value={devForm.name} onChange={e => setDevForm(f => ({ ...f, name: e.target.value }))} />
                </Box>
                <Box sx={{ width: { xs: '100%', md: '50%' } }}>
                  <TextField label="الدولة" fullWidth value={devForm.country} onChange={e => setDevForm(f => ({ ...f, country: e.target.value }))} />
                </Box>
                <Box sx={{ width: '100%' }}>
                  <TextField label="أهم الإنجازات" fullWidth value={devForm.achievements} onChange={e => setDevForm(f => ({ ...f, achievements: e.target.value }))} />
                </Box>
                <Box sx={{ width: '100%' }}>
                  <TextField label="نبذة عن المطور" fullWidth multiline rows={3} value={devForm.about} onChange={e => setDevForm(f => ({ ...f, about: e.target.value }))} />
                </Box>
                <Box sx={{ width: '100%' }}>
                  <Button component="label" startIcon={<CloudUpload />} fullWidth>
                    رفع صور مشاريع المطور
                    <input type="file" hidden multiple accept="image/*" onChange={async e => {
                      if (!e.target.files) return;
                      const files = Array.from(e.target.files);
                      const urls = await Promise.all(files.map(file => uploadImage(file, 'developers')));
                      setDevForm(f => ({ ...f, images: [...(f.images || []), ...urls] }));
                    }} />
                  </Button>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDevDialog(false)}>إلغاء</Button>
              <Button variant="contained" onClick={async () => {
                if (editingDev) {
                  await updateDoc(doc(db, 'developers', editingDev.id!), devForm);
                  setDevelopers(developers.map(d => d.id === editingDev.id ? { ...d, ...devForm } : d));
                  setSnackbar({open: true, message: 'تم تحديث المطور بنجاح', severity: 'success'});
                } else {
                  const docRef = await addDoc(collection(db, 'developers'), devForm);
                  setDevelopers([...developers, { ...devForm, id: docRef.id }]);
                  setSnackbar({open: true, message: 'تم إضافة المطور بنجاح', severity: 'success'});
                }
                setDevDialog(false);
              }}>{editingDev ? 'تحديث' : 'إضافة'}</Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
      {/* تبويب الكمباوندات */}
      {tab === 3 && (
        <Box mt={2}><Typography variant="h6" sx={{mb:2}}>إدارة الكمباوندات</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => { setEditingCompound(null); setCompoundForm({ name: '', country: '', developer: '', location: '', images: [] }); setCompoundDialog(true); }}>إضافة كمباوند</Button>
          <Grid container spacing={2} mt={1}>
            {compounds.map(comp => (
              <Box key={comp.id} sx={{ width: { xs: '100%', md: '50%', lg: '33.33%' }, display: 'flex' }}>
                <Card sx={{ width: '100%' }}>
                  <CardMedia image={comp.images?.[0] || '/images/bg1.png'} title={comp.name} sx={{ height: 140 }} />
                  <CardContent>
                    <Typography variant="h6">{comp.name}</Typography>
                    <Typography variant="body2">{comp.country} - {comp.developer}</Typography>
                  </CardContent>
                  <CardActions>
                    <IconButton onClick={() => { setEditingCompound(comp); setCompoundForm(comp); setCompoundDialog(true); }}><Edit /></IconButton>
                    <IconButton color="error" onClick={() => setConfirmDialog({open: true, message: `هل أنت متأكد من حذف الكمباوند؟`, onConfirm: async () => {
                      await deleteDoc(doc(db, 'compounds', comp.id!));
                      setCompounds(compounds.filter(c => c.id !== comp.id));
                      setSnackbar({open: true, message: 'تم حذف الكمباوند بنجاح', severity: 'success'});
                    }})}><Delete /></IconButton>
                  </CardActions>
                </Card>
              </Box>
            ))}
          </Grid>
          {/* حوار إضافة/تعديل كمباوند */}
          <Dialog open={compoundDialog} onClose={() => setCompoundDialog(false)} maxWidth="md" fullWidth>
            <DialogTitle>{editingCompound ? 'تعديل كمباوند' : 'إضافة كمباوند'}</DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ width: { xs: '100%', md: '50%' } }}>
                  <TextField label="اسم الكمباوند" fullWidth value={compoundForm.name} onChange={e => setCompoundForm(f => ({ ...f, name: e.target.value }))} />
                </Box>
                <Box sx={{ width: { xs: '100%', md: '50%' } }}>
                  <TextField label="الدولة" fullWidth value={compoundForm.country} onChange={e => setCompoundForm(f => ({ ...f, country: e.target.value }))} />
                </Box>
                <Box sx={{ width: { xs: '100%', md: '50%' } }}>
                  <TextField label="المطور" fullWidth value={compoundForm.developer} onChange={e => setCompoundForm(f => ({ ...f, developer: e.target.value }))} />
                </Box>
                <Box sx={{ width: { xs: '100%', md: '50%' } }}>
                  <TextField label="الموقع على الخريطة (رابط)" fullWidth value={compoundForm.location} onChange={e => setCompoundForm(f => ({ ...f, location: e.target.value }))} />
                </Box>
                <Box sx={{ width: '100%' }}>
                  <Button component="label" startIcon={<CloudUpload />} fullWidth>
                    رفع صور الكمباوند
                    <input type="file" hidden multiple accept="image/*" onChange={async e => {
                      if (!e.target.files) return;
                      const files = Array.from(e.target.files);
                      const urls = await Promise.all(files.map(file => uploadImage(file, 'compounds')));
                      setCompoundForm(f => ({ ...f, images: [...(f.images || []), ...urls] }));
                    }} />
                  </Button>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setCompoundDialog(false)}>إلغاء</Button>
              <Button variant="contained" onClick={async () => {
                if (editingCompound) {
                  await updateDoc(doc(db, 'compounds', editingCompound.id!), compoundForm);
                  setCompounds(compounds.map(c => c.id === editingCompound.id ? { ...c, ...compoundForm } : c));
                  setSnackbar({open: true, message: 'تم تحديث الكمباوند بنجاح', severity: 'success'});
                } else {
                  const docRef = await addDoc(collection(db, 'compounds'), compoundForm);
                  setCompounds([...compounds, { ...compoundForm, id: docRef.id }]);
                  setSnackbar({open: true, message: 'تم إضافة الكمباوند بنجاح', severity: 'success'});
                }
                setCompoundDialog(false);
              }}>{editingCompound ? 'تحديث' : 'إضافة'}</Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
      {/* تبويب الإعلانات (السلايدر) */}
      {tab === 4 && (
        <Box mt={2}><Typography variant="h5" sx={{mb:2, color:'#00bcd4', fontWeight:'bold'}}>إدارة الإعلانات (السلايدر)</Typography>
          <Button variant="contained" startIcon={<CloudUpload />} onClick={() => setSliderDialog(true)} sx={{mb:2, bgcolor:'#00bcd4', color:'#181c2a', fontWeight:'bold'}}>إضافة إعلان</Button>
          <Grid container spacing={3} mt={1}>
            {slider.map((img, i) => (
              <Box key={i} sx={{ width: { xs: '100%', md: '50%', lg: '33.33%' }, display: 'flex' }}>
                <Card sx={{ width: '100%', bgcolor:'#23263a', color:'#fff', borderRadius:4, boxShadow:8 }}>
                  <CardMedia image={img} sx={{ height: 160, borderRadius:4 }} />
                  <CardActions>
                    <IconButton color="error" onClick={() => setConfirmDialog({open: true, message: `هل أنت متأكد من حذف الإعلان؟`, onConfirm: async () => {
                      const newSlider = slider.filter((_, idx) => idx !== i);
                      setSlider(newSlider);
                      setSnackbar({open: true, message: 'تم حذف الإعلان بنجاح', severity: 'success'});
                    }})}><Delete /></IconButton>
                    <Button component="label" startIcon={<CloudUpload />} size="small" sx={{bgcolor:'#00bcd4', color:'#181c2a', fontWeight:'bold'}}>
                      استبدال
                      <input type="file" hidden accept="image/*" onChange={async e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await uploadImage(file, 'slider');
                          setSlider(slider.map((s, idx) => idx === i ? url : s));
                          setSnackbar({open:true, message:'تم استبدال صورة الإعلان', severity:'success'});
                        }
                      }} />
                    </Button>
                  </CardActions>
                </Card>
              </Box>
            ))}
          </Grid>
          <Dialog open={sliderDialog} onClose={() => setSliderDialog(false)}>
            <DialogTitle sx={{color:'#00bcd4', fontWeight:'bold'}}>إضافة صورة إعلان للسلايدر</DialogTitle>
            <DialogContent>
              <Button component="label" startIcon={<CloudUpload />} fullWidth sx={{bgcolor:'#00bcd4', color:'#181c2a', fontWeight:'bold'}}>
                رفع صورة إعلان
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={async e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = await uploadImage(file, 'slider');
                      setSlider(prev => [...prev, url].slice(0, 10));
                      setSnackbar({open:true, message:'تم رفع صورة الإعلان', severity:'success'});
                      setSliderDialog(false);
                    }
                  }}
                />
              </Button>
            </DialogContent>
          </Dialog>
          <Box mt={2}>
            <Button variant="contained" sx={{bgcolor:'#00bcd4', color:'#181c2a', fontWeight:'bold'}} onClick={async () => {
              // حفظ السلايدر في فايرستور
              const snap = await getDocs(collection(db, 'slider'));
              await Promise.all(snap.docs.map(d => deleteDoc(doc(db, 'slider', d.id))));
              await Promise.all(slider.slice(0, 10).map(url => addDoc(collection(db, 'slider'), { url })));
              // تحديث السلايدر من فايرستور بعد الحفظ
              const newSnap = await getDocs(collection(db, 'slider'));
              setSlider(newSnap.docs.map(d => d.data().url as string));
              setSnackbar({open: true, message: 'تم حفظ السلايدر بنجاح', severity: 'success'});
            }}>حفظ السلايدر</Button>
          </Box>
        </Box>
      )}
      {/* تبويب الخلفيات */}
      {tab === 5 && (
        <Box mt={2}><Typography variant="h5" sx={{mb:2, color:'#00bcd4', fontWeight:'bold'}}>إدارة الخلفيات الرئيسية</Typography>
          <Button variant="contained" startIcon={<CloudUpload />} onClick={() => setBgDialog(true)} sx={{mb:2, bgcolor:'#00bcd4', color:'#181c2a', fontWeight:'bold'}}>إضافة خلفية</Button>
          <Grid container spacing={3} mt={1}>
            {backgrounds.slice(0, 4).map((bg, i) => (
              <Box key={i} sx={{ width: { xs: '50%', md: '25%' }, display: 'flex' }}>
                <Card sx={{ width: '100%', bgcolor:'rgba(255,255,255,0.7)', color:'#181c2a', borderRadius:6, boxShadow:8, backdropFilter:'blur(8px)', border:'2px solid #fff' }}>
                  <CardMedia image={bg} sx={{ height: 140, borderRadius:6 }} />
                  <CardActions>
                    <IconButton color="error" onClick={() => setConfirmDialog({open: true, message: `هل أنت متأكد من حذف الخلفية؟`, onConfirm: async () => {
                      const snap = await getDocs(collection(db, 'backgrounds'));
                      const docId = snap.docs[i]?.id;
                      if (docId) {
                        await deleteDoc(doc(db, 'backgrounds', docId));
                        setBackgrounds(backgrounds.filter((_, idx) => idx !== i));
                        setSnackbar({open: true, message: 'تم حذف الخلفية بنجاح', severity: 'success'});
                      }
                    }})}><Delete /></IconButton>
                    <Button component="label" startIcon={<CloudUpload />} size="small" sx={{bgcolor:'#00bcd4', color:'#181c2a', fontWeight:'bold'}}>
                      استبدال
                      <input type="file" hidden accept="image/*" onChange={async e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await uploadImage(file, 'backgrounds');
                          const snap = await getDocs(collection(db, 'backgrounds'));
                          const docId = snap.docs[i]?.id;
                          if (docId) {
                            await updateDoc(doc(db, 'backgrounds', docId), { url });
                            setBackgrounds(backgrounds.map((b, idx) => idx === i ? url : b));
                            setSnackbar({open:true, message:'تم استبدال الخلفية', severity:'success'});
                          }
                        }
                      }} />
                    </Button>
                  </CardActions>
                </Card>
              </Box>
            ))}
          </Grid>
          <Dialog open={bgDialog} onClose={() => setBgDialog(false)}>
            <DialogTitle sx={{color:'#00bcd4', fontWeight:'bold'}}>إضافة خلفية</DialogTitle>
            <DialogContent>
              <Button component="label" startIcon={<CloudUpload />} fullWidth sx={{bgcolor:'#00bcd4', color:'#181c2a', fontWeight:'bold'}}>
                رفع صورة خلفية
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={async e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = await uploadImage(file, 'backgrounds');
                      setBackgrounds(prev => [...prev, url].slice(0, 4));
                      setSnackbar({open:true, message:'تم رفع الخلفية', severity:'success'});
                      setBgDialog(false); // إغلاق الحوار مباشرة بعد اختيار الصورة
                    }
                  }}
                />
              </Button>
            </DialogContent>
          </Dialog>
          <Box mt={2}>
            <Button variant="contained" sx={{bgcolor:'#00bcd4', color:'#181c2a', fontWeight:'bold'}} onClick={async () => {
              // حفظ الترتيب الحالي للصور (يتم حذف كل الصور ثم إعادة رفع الحالية)
              const snap = await getDocs(collection(db, 'backgrounds'));
              // حذف كل الصور القديمة
              await Promise.all(snap.docs.map(d => deleteDoc(doc(db, 'backgrounds', d.id))));
              // إضافة الصور الحالية
              await Promise.all(backgrounds.slice(0, 4).map(url => addDoc(collection(db, 'backgrounds'), { url })));
              // تحديث الخلفيات من فايرستور بعد الحفظ
              const newSnap = await getDocs(collection(db, 'backgrounds'));
              setBackgrounds(newSnap.docs.map(d => d.data().url as string));
              setSnackbar({open: true, message: 'تم حفظ الخلفيات بنجاح', severity: 'success'});
            }}>حفظ الخلفيات</Button>
          </Box>
        </Box>
      )}
      {/* تبويب الشريط الكتابي */}
      {tab === 6 && (
        <Box mt={2}><Typography variant="h6" sx={{mb:2}}>إدارة الشريط الكتابي المتحرك</Typography>
          <Button variant="contained" startIcon={<Edit />} onClick={() => setMarqueeDialog(true)}>تعديل الشريط الكتابي</Button>
          <Box mt={2}>
            <Typography>النصوص الحالية:</Typography>
            <ul>
              {marquee.texts.map((t, i) => <li key={i}>{typeof t === 'string' ? t : JSON.stringify(t)}</li>)}
            </ul>
            <Typography>السرعة: {marquee.speed} - اللون: {marquee.color} - الحجم: {marquee.fontSize}</Typography>
          </Box>
          <Dialog open={marqueeDialog} onClose={() => setMarqueeDialog(false)}>
            <DialogTitle>تعديل الشريط الكتابي</DialogTitle>
            <DialogContent>
              <TextField label="النصوص (افصل بينها بفاصلة)" fullWidth value={marquee.texts.join(',')} onChange={e => setMarquee(m => ({ ...m, texts: e.target.value.split(',') }))} />
              <TextField label="السرعة" fullWidth value={marquee.speed} onChange={e => setMarquee(m => ({ ...m, speed: Number(e.target.value) }))} />
              <TextField label="اللون" fullWidth value={marquee.color} onChange={e => setMarquee(m => ({ ...m, color: e.target.value }))} />
              <TextField label="الحجم" fullWidth value={marquee.fontSize} onChange={e => setMarquee(m => ({ ...m, fontSize: Number(e.target.value) }))} />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setMarqueeDialog(false)}>إلغاء</Button>
              <Button variant="contained" onClick={async () => {
                // تحديث الشريط الكتابي في فايرستور
                const snap = await getDocs(collection(db, 'marquee'));
                if (snap.docs.length > 0) {
                  await updateDoc(doc(db, 'marquee', snap.docs[0].id), marquee);
                  setSnackbar({open: true, message: 'تم تحديث الشريط الكتابي بنجاح', severity: 'success'});
                } else {
                  await addDoc(collection(db, 'marquee'), marquee);
                  setSnackbar({open: true, message: 'تم إضافة الشريط الكتابي بنجاح', severity: 'success'});
                }
                setMarqueeDialog(false);
              }}>تحديث</Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
      {/* تبويب تواصل معنا */}
      {tab === 7 && (
        <Box mt={2}><Typography variant="h6" sx={{mb:2}}>إدارة روابط التواصل معنا</Typography>
          <ContactLinksPanel />
        </Box>
      )}
    {/* حوار تأكيد الحذف */}
    <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({...confirmDialog, open: false})}>
      <DialogTitle>تأكيد الحذف</DialogTitle>
      <DialogContent>
        <Typography>{confirmDialog.message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setConfirmDialog({...confirmDialog, open: false})}>إلغاء</Button>
        <Button color="error" variant="contained" onClick={async () => {
          await confirmDialog.onConfirm();
          setConfirmDialog({...confirmDialog, open: false});
        }}>حذف</Button>
      </DialogActions>
    </Dialog>
    {/* Snackbar */}
    <Snackbar open={snackbar.open} autoHideDuration={3500} onClose={() => setSnackbar({...snackbar, open: false})} anchorOrigin={{vertical:'bottom',horizontal:'center'}}>
      <Alert onClose={() => setSnackbar({...snackbar, open: false})} severity={snackbar.severity || 'success'} variant="filled" sx={{fontWeight:'bold',fontSize:16}}>
        {snackbar.message}
      </Alert>
    </Snackbar>
    </Box>
  );
}
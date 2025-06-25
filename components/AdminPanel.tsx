import React, { useState, useEffect } from 'react';
import { db } from '../data/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Tabs, Tab, Box, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Typography, Select, MenuItem, InputLabel, FormControl, Grid, Card, CardMedia, CardContent, CardActions } from '@mui/material';
import { Add, Edit, Delete, CloudUpload } from '@mui/icons-material';

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
  }, []);

  return (
    <Box sx={{ width: '100%', typography: 'body1', p: 2 }}>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} centered>
        <Tab label="الوحدات" />
        <Tab label="المطورين" />
        <Tab label="الكمباوندات" />
        <Tab label="الخلفيات" />
        <Tab label="السلايدر" />
        <Tab label="الشريط الكتابي" />
      </Tabs>
      {/* تبويب الوحدات */}
      {tab === 0 && (
        <Box mt={2}>
          <Button variant="contained" startIcon={<Add />} onClick={() => { setEditingUnit(null); setUnitForm({ title: '', country: '', compound: '', developer: '', area: '', minPrice: '', maxPrice: '', rooms: '', baths: '', kitchen: '', floors: '', pool: false, garden: false, guardRoom: false, location: '', images: [], panorama: [], model3d: '', vr: '' }); setUnitDialog(true); }}>إضافة وحدة</Button>
          <Grid container spacing={2} mt={1}>
            {units.map(unit => (
              <Grid item xs={12} md={6} lg={4} key={unit.id}>
                <Card>
                  <CardMedia image={unit.images?.[0] || '/images/bg1.png'} title={unit.title} sx={{ height: 140 }} />
                  <CardContent>
                    <Typography variant="h6">{unit.title}</Typography>
                    <Typography variant="body2">{unit.country} - {unit.compound}</Typography>
                    <Typography variant="body2">المساحة: {unit.area}م - السعر: {unit.minPrice} - {unit.maxPrice}</Typography>
                  </CardContent>
                  <CardActions>
                    <IconButton onClick={() => { setEditingUnit(unit); setUnitForm(unit); setUnitDialog(true); }}><Edit /></IconButton>
                    <IconButton color="error" onClick={async () => { await deleteDoc(doc(db, 'units', unit.id!)); setUnits(units.filter(u => u.id !== unit.id)); }}><Delete /></IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
          {/* حوار إضافة/تعديل وحدة */}
          <Dialog open={unitDialog} onClose={() => setUnitDialog(false)} maxWidth="md" fullWidth>
            <DialogTitle>{editingUnit ? 'تعديل وحدة' : 'إضافة وحدة'}</DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField label="العنوان" fullWidth value={unitForm.title} onChange={e => setUnitForm(f => ({ ...f, title: e.target.value }))} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField label="الدولة" fullWidth value={unitForm.country} onChange={e => setUnitForm(f => ({ ...f, country: e.target.value }))} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField label="الكمباوند" fullWidth value={unitForm.compound} onChange={e => setUnitForm(f => ({ ...f, compound: e.target.value }))} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField label="المطور" fullWidth value={unitForm.developer} onChange={e => setUnitForm(f => ({ ...f, developer: e.target.value }))} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField label="المساحة" fullWidth value={unitForm.area} onChange={e => setUnitForm(f => ({ ...f, area: e.target.value }))} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField label="السعر الأدنى" fullWidth value={unitForm.minPrice} onChange={e => setUnitForm(f => ({ ...f, minPrice: e.target.value }))} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField label="السعر الأقصى" fullWidth value={unitForm.maxPrice} onChange={e => setUnitForm(f => ({ ...f, maxPrice: e.target.value }))} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField label="عدد الغرف" fullWidth value={unitForm.rooms} onChange={e => setUnitForm(f => ({ ...f, rooms: e.target.value }))} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField label="عدد الحمامات" fullWidth value={unitForm.baths} onChange={e => setUnitForm(f => ({ ...f, baths: e.target.value }))} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField label="عدد المطابخ" fullWidth value={unitForm.kitchen} onChange={e => setUnitForm(f => ({ ...f, kitchen: e.target.value }))} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField label="عدد الأدوار" fullWidth value={unitForm.floors} onChange={e => setUnitForm(f => ({ ...f, floors: e.target.value }))} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>حمام سباحة</InputLabel>
                    <Select value={unitForm.pool ? "true" : "false"} onChange={e => setUnitForm(f => ({ ...f, pool: e.target.value === "true" }))} label="حمام سباحة">
                      <MenuItem value="true">نعم</MenuItem>
                      <MenuItem value="false">لا</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>جاردن</InputLabel>
                    <Select value={unitForm.garden ? "true" : "false"} onChange={e => setUnitForm(f => ({ ...f, garden: e.target.value === "true" }))} label="جاردن">
                      <MenuItem value="true">نعم</MenuItem>
                      <MenuItem value="false">لا</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>غرفة حرس</InputLabel>
                    <Select value={unitForm.guardRoom ? "true" : "false"} onChange={e => setUnitForm(f => ({ ...f, guardRoom: e.target.value === "true" }))} label="غرفة حرس">
                      <MenuItem value="true">نعم</MenuItem>
                      <MenuItem value="false">لا</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={8}>
                  <TextField label="الموقع على الخريطة (رابط)" fullWidth value={unitForm.location} onChange={e => setUnitForm(f => ({ ...f, location: e.target.value }))} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Button component="label" startIcon={<CloudUpload />} fullWidth>
                    رفع صور
                    <input type="file" hidden multiple accept="image/*" onChange={async e => {
                      if (!e.target.files) return;
                      const files = Array.from(e.target.files);
                      const urls = await Promise.all(files.map(file => uploadImage(file, 'units')));
                      setUnitForm(f => ({ ...f, images: [...(f.images || []), ...urls] }));
                    }} />
                  </Button>
                </Grid>
                {/* صور بانوراما، نموذج 3D، VR */}
                <Grid item xs={12} md={4}>
                  <Button component="label" startIcon={<CloudUpload />} fullWidth>
                    رفع صور بانوراما
                    <input type="file" hidden multiple accept="image/*" onChange={async e => {
                      if (!e.target.files) return;
                      const files = Array.from(e.target.files);
                      const urls = await Promise.all(files.map(file => uploadImage(file, 'units/panorama')));
                      setUnitForm(f => ({ ...f, panorama: [...(f.panorama || []), ...urls] }));
                    }} />
                  </Button>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Button component="label" startIcon={<CloudUpload />} fullWidth>
                    رفع نموذج 3D
                    <input type="file" hidden accept=".glb,.gltf" onChange={async e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = await uploadImage(file, 'units/model3d');
                        setUnitForm(f => ({ ...f, model3d: url }));
                      }
                    }} />
                  </Button>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Button component="label" startIcon={<CloudUpload />} fullWidth>
                    رفع نموذج VR
                    <input type="file" hidden accept=".vr,.zip" onChange={async e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = await uploadImage(file, 'units/vr');
                        setUnitForm(f => ({ ...f, vr: url }));
                      }
                    }} />
                  </Button>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setUnitDialog(false)}>إلغاء</Button>
              <Button variant="contained" onClick={async () => {
                if (editingUnit) {
                  await updateDoc(doc(db, 'units', editingUnit.id!), unitForm);
                  setUnits(units.map(u => u.id === editingUnit.id ? { ...u, ...unitForm } : u));
                } else {
                  const docRef = await addDoc(collection(db, 'units'), unitForm);
                  setUnits([...units, { ...unitForm, id: docRef.id }]);
                }
                setUnitDialog(false);
              }}>{editingUnit ? 'تحديث' : 'إضافة'}</Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
      {/* تبويب المطورين */}
      {tab === 1 && (
        <Box mt={2}>
          <Button variant="contained" startIcon={<Add />} onClick={() => { setEditingDev(null); setDevForm({ name: '', country: '', achievements: '', about: '', images: [] }); setDevDialog(true); }}>إضافة مطور</Button>
          <Grid container spacing={2} mt={1}>
            {developers.map(dev => (
              <Grid item xs={12} md={6} lg={4} key={dev.id}>
                <Card>
                  <CardMedia image={dev.images?.[0] || '/images/bg1.png'} title={dev.name} sx={{ height: 140 }} />
                  <CardContent>
                    <Typography variant="h6">{dev.name}</Typography>
                    <Typography variant="body2">{dev.country}</Typography>
                    <Typography variant="body2">{dev.achievements}</Typography>
                  </CardContent>
                  <CardActions>
                    <IconButton onClick={() => { setEditingDev(dev); setDevForm(dev); setDevDialog(true); }}><Edit /></IconButton>
                    <IconButton color="error" onClick={async () => { await deleteDoc(doc(db, 'developers', dev.id!)); setDevelopers(developers.filter(d => d.id !== dev.id)); }}><Delete /></IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
          {/* حوار إضافة/تعديل مطور */}
          <Dialog open={devDialog} onClose={() => setDevDialog(false)} maxWidth="md" fullWidth>
            <DialogTitle>{editingDev ? 'تعديل مطور' : 'إضافة مطور'}</DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField label="اسم المطور" fullWidth value={devForm.name} onChange={e => setDevForm(f => ({ ...f, name: e.target.value }))} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField label="الدولة" fullWidth value={devForm.country} onChange={e => setDevForm(f => ({ ...f, country: e.target.value }))} />
                </Grid>
                <Grid item xs={12}>
                  <TextField label="أهم الإنجازات" fullWidth value={devForm.achievements} onChange={e => setDevForm(f => ({ ...f, achievements: e.target.value }))} />
                </Grid>
                <Grid item xs={12}>
                  <TextField label="نبذة عن المطور" fullWidth multiline rows={3} value={devForm.about} onChange={e => setDevForm(f => ({ ...f, about: e.target.value }))} />
                </Grid>
                <Grid item xs={12}>
                  <Button component="label" startIcon={<CloudUpload />} fullWidth>
                    رفع صور مشاريع المطور
                    <input type="file" hidden multiple accept="image/*" onChange={async e => {
                      if (!e.target.files) return;
                      const files = Array.from(e.target.files);
                      const urls = await Promise.all(files.map(file => uploadImage(file, 'developers')));
                      setDevForm(f => ({ ...f, images: [...(f.images || []), ...urls] }));
                    }} />
                  </Button>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDevDialog(false)}>إلغاء</Button>
              <Button variant="contained" onClick={async () => {
                if (editingDev) {
                  await updateDoc(doc(db, 'developers', editingDev.id!), devForm);
                  setDevelopers(developers.map(d => d.id === editingDev.id ? { ...d, ...devForm } : d));
                } else {
                  const docRef = await addDoc(collection(db, 'developers'), devForm);
                  setDevelopers([...developers, { ...devForm, id: docRef.id }]);
                }
                setDevDialog(false);
              }}>{editingDev ? 'تحديث' : 'إضافة'}</Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
      {/* تبويب الكمباوندات */}
      {tab === 2 && (
        <Box mt={2}>
          <Button variant="contained" startIcon={<Add />} onClick={() => { setEditingCompound(null); setCompoundForm({ name: '', country: '', developer: '', location: '', images: [] }); setCompoundDialog(true); }}>إضافة كمباوند</Button>
          <Grid container spacing={2} mt={1}>
            {compounds.map(comp => (
              <Grid item xs={12} md={6} lg={4} key={comp.id}>
                <Card>
                  <CardMedia image={comp.images?.[0] || '/images/bg1.png'} title={comp.name} sx={{ height: 140 }} />
                  <CardContent>
                    <Typography variant="h6">{comp.name}</Typography>
                    <Typography variant="body2">{comp.country} - {comp.developer}</Typography>
                  </CardContent>
                  <CardActions>
                    <IconButton onClick={() => { setEditingCompound(comp); setCompoundForm(comp); setCompoundDialog(true); }}><Edit /></IconButton>
                    <IconButton color="error" onClick={async () => { await deleteDoc(doc(db, 'compounds', comp.id!)); setCompounds(compounds.filter(c => c.id !== comp.id)); }}><Delete /></IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
          {/* حوار إضافة/تعديل كمباوند */}
          <Dialog open={compoundDialog} onClose={() => setCompoundDialog(false)} maxWidth="md" fullWidth>
            <DialogTitle>{editingCompound ? 'تعديل كمباوند' : 'إضافة كمباوند'}</DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField label="اسم الكمباوند" fullWidth value={compoundForm.name} onChange={e => setCompoundForm(f => ({ ...f, name: e.target.value }))} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField label="الدولة" fullWidth value={compoundForm.country} onChange={e => setCompoundForm(f => ({ ...f, country: e.target.value }))} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField label="المطور" fullWidth value={compoundForm.developer} onChange={e => setCompoundForm(f => ({ ...f, developer: e.target.value }))} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField label="الموقع على الخريطة (رابط)" fullWidth value={compoundForm.location} onChange={e => setCompoundForm(f => ({ ...f, location: e.target.value }))} />
                </Grid>
                <Grid item xs={12}>
                  <Button component="label" startIcon={<CloudUpload />} fullWidth>
                    رفع صور الكمباوند
                    <input type="file" hidden multiple accept="image/*" onChange={async e => {
                      if (!e.target.files) return;
                      const files = Array.from(e.target.files);
                      const urls = await Promise.all(files.map(file => uploadImage(file, 'compounds')));
                      setCompoundForm(f => ({ ...f, images: [...(f.images || []), ...urls] }));
                    }} />
                  </Button>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setCompoundDialog(false)}>إلغاء</Button>
              <Button variant="contained" onClick={async () => {
                if (editingCompound) {
                  await updateDoc(doc(db, 'compounds', editingCompound.id!), compoundForm);
                  setCompounds(compounds.map(c => c.id === editingCompound.id ? { ...c, ...compoundForm } : c));
                } else {
                  const docRef = await addDoc(collection(db, 'compounds'), compoundForm);
                  setCompounds([...compounds, { ...compoundForm, id: docRef.id }]);
                }
                setCompoundDialog(false);
              }}>{editingCompound ? 'تحديث' : 'إضافة'}</Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
      {/* تبويب الخلفيات */}
      {tab === 3 && (
        <Box mt={2}>
          <Button variant="contained" startIcon={<CloudUpload />} onClick={() => setBgDialog(true)}>إضافة خلفية</Button>
          <Grid container spacing={2} mt={1}>
            {backgrounds.map((bg, i) => (
              <Grid item xs={6} md={3} key={i}>
                <Card>
                  <CardMedia image={bg} sx={{ height: 120 }} />
                  <CardActions>
                    <IconButton color="error" onClick={async () => {
                      // حذف الخلفية من فايرستور وستوريج
                      // ...
                    }}><Delete /></IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Dialog open={bgDialog} onClose={() => setBgDialog(false)}>
            <DialogTitle>إضافة خلفية</DialogTitle>
            <DialogContent>
              <Button component="label" startIcon={<CloudUpload />} fullWidth>
                رفع صورة خلفية
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={async e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = await uploadImage(file, 'backgrounds');
                      await addDoc(collection(db, 'backgrounds'), { url });
                      setBackgrounds([...backgrounds, url]);
                      setBgDialog(false);
                    }
                  }}
                />
              </Button>
            </DialogContent>
          </Dialog>
        </Box>
      )}
      {/* تبويب السلايدر */}
      {tab === 4 && (
        <Box mt={2}>
          <Button variant="contained" startIcon={<CloudUpload />} onClick={() => setSliderDialog(true)}>إضافة صورة للسلايدر</Button>
          <Grid container spacing={2} mt={1}>
            {slider.map((img, i) => (
              <Grid item xs={6} md={3} key={i}>
                <Card>
                  <CardMedia image={img} sx={{ height: 120 }} />
                  <CardActions>
                    <IconButton color="error" onClick={async () => {
                      // حذف صورة السلايدر من فايرستور وستوريج
                      // ...
                    }}><Delete /></IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Dialog open={sliderDialog} onClose={() => setSliderDialog(false)}>
            <DialogTitle>إضافة صورة للسلايدر</DialogTitle>
            <DialogContent>
              <Button component="label" startIcon={<CloudUpload />} fullWidth>
                رفع صورة
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={async e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = await uploadImage(file, 'slider');
                      await addDoc(collection(db, 'slider'), { url });
                      setSlider([...slider, url]);
                      setSliderDialog(false);
                    }
                  }}
                />
              </Button>
            </DialogContent>
          </Dialog>
        </Box>
      )}
      {/* تبويب الشريط الكتابي */}
      {tab === 5 && (
        <Box mt={2}>
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
                } else {
                  await addDoc(collection(db, 'marquee'), marquee);
                }
                setMarqueeDialog(false);
              }}>تحديث</Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
    </Box>
  );
}
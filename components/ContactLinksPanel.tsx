import React, { useEffect, useState } from 'react';
import { db } from '../data/firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { Box, Typography, TextField, Button, Grid } from '@mui/material';

interface ContactLink {
  id?: string;
  platform: string;
  url: string;
  icon: string;
}

const defaultLinks: ContactLink[] = [
  { platform: 'واتساب', url: '', icon: 'whatsapp' },
  { platform: 'هاتف', url: '', icon: 'phone' },
  { platform: 'فيسبوك', url: '', icon: 'facebook' },
  { platform: 'انستجرام', url: '', icon: 'instagram' },
  { platform: 'تويتر', url: '', icon: 'twitter' },
  { platform: 'تلجرام', url: '', icon: 'telegram' },
  { platform: 'بريد إلكتروني', url: '', icon: 'gmail' },
];

export default function ContactLinksPanel() {
  const [links, setLinks] = useState<ContactLink[]>(defaultLinks);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchLinks() {
      const ref = doc(db, 'settings', 'contacts');
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setLinks(snap.data().links || defaultLinks);
      }
    }
    fetchLinks();
  }, []);

  const handleChange = (idx: number, key: keyof ContactLink, value: string) => {
    setLinks(links => links.map((l, i) => i === idx ? { ...l, [key]: value } : l));
  };

  const handleSave = async () => {
    setLoading(true);
    const ref = doc(db, 'settings', 'contacts');
    await setDoc(ref, { links });
    setLoading(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  return (
    <Box>
      <Typography sx={{mb:2}}>يمكنك تعديل روابط التواصل وسيتم حفظها فوراً.</Typography>
      <Grid container spacing={2}>
        {links.map((link, i) => (
          <React.Fragment key={i}>
            <Grid item xs={12} md={3}>
              <TextField label="المنصة" value={link.platform} onChange={e => handleChange(i, 'platform', e.target.value)} fullWidth />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="الرابط/رقم الهاتف" value={link.url} onChange={e => handleChange(i, 'url', e.target.value)} fullWidth />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField label="الأيقونة" value={link.icon} onChange={e => handleChange(i, 'icon', e.target.value)} fullWidth />
            </Grid>
          </React.Fragment>
        ))}
      </Grid>
      <Button variant="contained" color="primary" sx={{mt:3}} onClick={handleSave} disabled={loading}>{loading ? 'جاري الحفظ...' : 'حفظ الروابط'}</Button>
      {success && <Typography color="success.main" sx={{mt:2}}>تم الحفظ بنجاح!</Typography>}
    </Box>
  );
}

import React, { useEffect, useState } from 'react';
import { db } from '../data/firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { Box, Typography, TextField, Button, Stack } from '@mui/material';

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
      <Typography sx={{mb:2}}>يمكنك تعديل روابط التواصل وسيتم حفظها فوراً. جميع الروابط فعالة وتظهر مباشرة في التطبيق.</Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} useFlexGap flexWrap="wrap">
        {links.map((link, i) => (
          <React.Fragment key={i}>
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 25%' }, minWidth: 180, mb: 2 }}>
              <TextField label="المنصة" value={link.platform} onChange={e => handleChange(i, 'platform', e.target.value)} fullWidth />
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' }, minWidth: 220, mb: 2 }}>
              <TextField label="الرابط/رقم الهاتف" value={link.url} onChange={e => handleChange(i, 'url', e.target.value)} fullWidth />
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 25%' }, minWidth: 180, mb: 2 }}>
              <TextField label="الأيقونة" value={link.icon} onChange={e => handleChange(i, 'icon', e.target.value)} fullWidth />
            </Box>
          </React.Fragment>
        ))}
      </Stack>
      <Button variant="contained" color="primary" sx={{mt:3}} onClick={handleSave} disabled={loading}>{loading ? 'جاري الحفظ...' : 'حفظ الروابط'}</Button>
      {success && <Typography color="success.main" sx={{mt:2}}>تم الحفظ بنجاح!</Typography>}

      {/* عرض الروابط الفعالة */}
      <Box sx={{mt:4}}>
        <Typography sx={{fontWeight:'bold', color:'#00bcd4', mb:1}}>روابط التواصل الفعالة:</Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          {links.filter(l => l.url).map((link, i) => {
            let href = link.url;
            if (link.icon === 'whatsapp' && !href.startsWith('https://')) href = `https://wa.me/${href.replace(/[^\d]/g, '')}`;
            if (link.icon === 'facebook' && !href.startsWith('https://')) href = `https://facebook.com/${href}`;
            if (link.icon === 'instagram' && !href.startsWith('https://')) href = `https://instagram.com/${href}`;
            if (link.icon === 'twitter' && !href.startsWith('https://')) href = `https://twitter.com/${href}`;
            if (link.icon === 'telegram' && !href.startsWith('https://')) href = `https://t.me/${href}`;
            if (link.icon === 'gmail' && !href.startsWith('mailto:')) href = `mailto:${href}`;
            if (link.icon === 'phone' && !href.startsWith('tel:')) href = `tel:${href}`;
            return (
              <Button key={i} variant="outlined" color="primary" sx={{fontWeight:'bold'}} href={href} target="_blank" rel="noopener noreferrer">
                {link.platform}
              </Button>
            );
          })}
        </Stack>
      </Box>
    </Box>
  );
}

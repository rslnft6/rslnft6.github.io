import React, { useEffect, useState } from 'react';
import { db } from '../data/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Box, Button, Typography, Tabs, Tab, TextField, CircularProgress, Snackbar, Alert } from '@mui/material';

const PAGE_KEYS = [
  { key: 'about', label: 'من نحن' },
  { key: 'partners', label: 'شركاؤنا' },
  { key: 'contact', label: 'تواصل معنا' },
];

export default function PagesEditor({ setSnackbar }: { setSnackbar: Function }) {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState<{ [key: string]: string }>({});
  const [values, setValues] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    (async () => {
      setLoading(true);
      const newPages: any = {};
      for (const { key } of PAGE_KEYS) {
        const snap = await getDoc(doc(db, 'pages', key));
        newPages[key] = snap.exists() ? snap.data().content || '' : '';
      }
      setPages(newPages);
      setValues(newPages);
      setLoading(false);
    })();
  }, []);

  const handleSave = async (key: string) => {
    setLoading(true);
    await setDoc(doc(db, 'pages', key), { content: values[key] });
    setPages((p) => ({ ...p, [key]: values[key] }));
    setLoading(false);
    setSnackbar({ open: true, message: 'تم حفظ الصفحة بنجاح', severity: 'success' });
  };

  return (
    <Box>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        {PAGE_KEYS.map((p, i) => <Tab key={p.key} label={p.label} />)}
      </Tabs>
      {loading ? <CircularProgress /> : (
        <Box>
          <Typography variant="h6" sx={{mb:1}}>{PAGE_KEYS[tab].label}</Typography>
          <TextField
            multiline
            minRows={8}
            maxRows={20}
            fullWidth
            value={values[PAGE_KEYS[tab].key] || ''}
            onChange={e => setValues(v => ({ ...v, [PAGE_KEYS[tab].key]: e.target.value }))}
            placeholder={`اكتب محتوى صفحة ${PAGE_KEYS[tab].label} هنا...`}
            sx={{bgcolor:'#fff', color:'#181c2a', borderRadius:3, mb:2}}
          />
          <Button variant="contained" sx={{bgcolor:'#00bcd4', color:'#181c2a', fontWeight:'bold'}} onClick={() => handleSave(PAGE_KEYS[tab].key)}>
            حفظ الصفحة
          </Button>
        </Box>
      )}
    </Box>
  );
}

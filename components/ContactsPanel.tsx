import React, { useEffect, useState } from 'react';
import { db } from '../data/firebase';
import { doc as fsDoc, getDoc, setDoc } from 'firebase/firestore';
import { defaultContacts, ContactLinks } from '../data/contacts';

const ContactsPanel: React.FC = () => {
  const [contacts, setContacts] = useState<ContactLinks>(defaultContacts);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchContacts = async () => {
      setLoading(true);
      try {
        const ref = fsDoc(db, 'settings', 'contacts');
        const snap = await getDoc(ref);
        if (snap.exists()) setContacts(snap.data() as ContactLinks);
      } catch {}
      setLoading(false);
    };
    fetchContacts();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const ref = fsDoc(db, 'settings', 'contacts');
      await setDoc(ref, contacts);
    } catch {}
    setLoading(false);
  };

  return (
    <div className="glass-table" style={{maxWidth:700,margin:'0 auto'}}>
      <h2 style={{color:'#00bcd4',fontWeight:'bold'}}>تواصل معنا - روابط التواصل</h2>
      <form className="glass-form" onSubmit={handleSave}>
        <input placeholder="واتساب" value={contacts.whatsapp} onChange={e=>setContacts(c=>({...c,whatsapp:e.target.value}))} />
        <input placeholder="هاتف" value={contacts.phone} onChange={e=>setContacts(c=>({...c,phone:e.target.value}))} />
        <input placeholder="فيسبوك" value={contacts.facebook} onChange={e=>setContacts(c=>({...c,facebook:e.target.value}))} />
        <input placeholder="سناب شات" value={contacts.snapchat} onChange={e=>setContacts(c=>({...c,snapchat:e.target.value}))} />
        <input placeholder="تويتر" value={contacts.twitter} onChange={e=>setContacts(c=>({...c,twitter:e.target.value}))} />
        <input placeholder="انستجرام" value={contacts.instagram} onChange={e=>setContacts(c=>({...c,instagram:e.target.value}))} />
        <input placeholder="تيليجرام" value={contacts.telegram} onChange={e=>setContacts(c=>({...c,telegram:e.target.value}))} />
        <input placeholder="ديسكورد" value={contacts.discord} onChange={e=>setContacts(c=>({...c,discord:e.target.value}))} />
        <input placeholder="Gmail" value={contacts.gmail} onChange={e=>setContacts(c=>({...c,gmail:e.target.value}))} />
        <button className="glass-btn" type="submit" disabled={loading}>حفظ</button>
      </form>
    </div>
  );
};

export default ContactsPanel;

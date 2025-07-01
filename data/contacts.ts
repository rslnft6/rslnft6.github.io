// بيانات وروابط التواصل الاجتماعي للموقع (تعدل من لوحة التحكم)
export interface ContactLink {
  id: string; // معرف فريد للرابط
  platform: string; // اسم المنصة (مثلاً: واتساب)
  url: string; // الرابط أو رقم الهاتف
  icon?: string; // اسم الأيقونة (اختياري)
}

export type ContactLinks = ContactLink[];

export const defaultContacts: ContactLinks = [
  { id: 'whatsapp', platform: 'واتساب', url: '201234567890', icon: 'whatsapp' },
  { id: 'phone', platform: 'هاتف', url: '201234567890', icon: 'phone' },
  { id: 'facebook', platform: 'فيسبوك', url: 'https://facebook.com/', icon: 'facebook' },
  { id: 'snapchat', platform: 'سناب شات', url: 'https://snapchat.com/', icon: 'snapchat' },
  { id: 'twitter', platform: 'تويتر', url: 'https://twitter.com/', icon: 'twitter' },
  { id: 'instagram', platform: 'انستجرام', url: 'https://instagram.com/', icon: 'instagram' },
  { id: 'telegram', platform: 'تيليجرام', url: 'https://t.me/', icon: 'telegram' },
  { id: 'discord', platform: 'ديسكورد', url: 'https://discord.com/', icon: 'discord' },
  { id: 'gmail', platform: 'Gmail', url: 'mailto:info@realstatelive.com', icon: 'gmail' },
];

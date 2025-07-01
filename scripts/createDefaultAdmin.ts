import { db } from '../data/firebase';
import { collection, setDoc, doc } from 'firebase/firestore';

async function createDefaultAdmin() {
  try {
    // إضافة مستخدم admin بكلمة مرور 112233 مباشرة في Firestore
    const userRef = doc(collection(db, 'users'));
    await setDoc(userRef, {
      username: 'admin',
      password: '112233',
      role: 'admin',
      createdAt: new Date(),
    });
    console.log('تم إضافة المستخدم admin بنجاح');
  } catch (err: any) {
    console.error('خطأ في إضافة المستخدم:', err.message || err);
  }
}

createDefaultAdmin();

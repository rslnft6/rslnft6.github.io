import { collection, addDoc, getFirestore, serverTimestamp } from 'firebase/firestore';
import { auth } from '../data/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { getDocs, query, where } from 'firebase/firestore';

console.log('=== firestoreActions.ts Loaded ===');

// إضافة موظف جديد
export async function addEmployee({ name, email, role }: { name: string, email: string, role: string }) {
  const db = getFirestore();
  return await addDoc(collection(db, 'users'), {
    name,
    email,
    role,
    createdAt: serverTimestamp(),
    createdBy: auth.currentUser?.uid || null
  });
}

// إضافة وحدة جديدة
export async function addUnit({ title, type, details }: { title: string, type: string, details: string }) {
  const db = getFirestore();
  return await addDoc(collection(db, 'units'), {
    title,
    type,
    details,
    createdAt: serverTimestamp(),
    createdBy: auth.currentUser?.uid || null
  });
}

// إضافة موظف جديد مع تفعيل في Authentication
export async function addEmployeeWithAuth({ name, email, password, role }: { name: string, email: string, password: string, role: string }) {
  // 1. إضافة في Authentication
  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  // 2. إضافة في Firestore
  const db = getFirestore();
  await addDoc(collection(db, 'users'), {
    name,
    email,
    role,
    uid: userCred.user.uid,
    createdAt: serverTimestamp(),
    createdBy: auth.currentUser?.uid || null
  });
  return userCred;
}

// إضافة مستخدم جديد مع تفعيل في Authentication وصلاحيات مخصصة
export async function addUserWithAuth({ name, email, password, role, permissions = [] }: { name: string, email: string, password: string, role: string, permissions?: string[] }) {
  // 1. إضافة في Authentication
  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  // 2. إضافة في Firestore مع الدور والصلاحيات
  const db = getFirestore();
  await addDoc(collection(db, 'users'), {
    name,
    email,
    role,
    permissions,
    uid: userCred.user.uid,
    createdAt: serverTimestamp(),
    createdBy: auth.currentUser?.uid || null
  });
  return userCred;
}

// إضافة سوبر أدمن تلقائيًا إذا لم يكن موجودًا
export async function ensureSuperAdminExists() {
  const db = getFirestore();
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_MASTER_PASSWORD || '112233';
  // تحقق إذا كان السوبر أدمن موجود مسبقًا
  const q = query(collection(db, 'users'), where('role', '==', 'superadmin'));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) return false; // موجود مسبقًا
  // إذا لم يوجد، أضفه
  await addUserWithAuth({
    name: 'Super Admin',
    email: adminEmail,
    password: adminPassword,
    role: 'superadmin',
    permissions: ['all']
  });
  return true;
}

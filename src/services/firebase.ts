import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Substitua pelos valores do seu projeto no console.firebase.google.com
const firebaseConfig = {
  apiKey: "AIzaSyA-1xe6fmyBMqmKAki0BUHHOnj41Ak2TPs",
  authDomain: "jantaja-94dd6.firebaseapp.com",
  projectId: "jantaja-94dd6",
  storageBucket: "jantaja-94dd6.firebasestorage.app",
  messagingSenderId: "553741564966",
  appId: "1:553741564966:web:81a53e1c255b29e1e6fae7",
  measurementId: "G-XDZVCM4EGQ",
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyDbz3t2treM6daM09N3L4Hew95afv4RHXY',
  authDomain: 'habitrack-b16ae.firebaseapp.com',
  projectId: 'habitrack-b16ae',
  storageBucket: 'habitrack-b16ae.firebasestorage.app',
  messagingSenderId: '89523096206',
  appId: '1:89523096206:web:28986f25e0dc6f13d917df'
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
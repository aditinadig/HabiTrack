// userService.js
import { db } from './firebase';
import { collection, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

// Add user to Firestore after authentication
export const addUser = async (user) => {
  const userRef = doc(db, 'Users', user.uid);
  await setDoc(userRef, { name: user.displayName, email: user.email, preferences: {} });
};

// Fetch user details by UID
export const getUser = async (uid) => {
  const userRef = doc(db, 'Users', uid);
  const docSnap = await getDoc(userRef);
  return docSnap.exists() ? docSnap.data() : null;
};

// Update user preferences
export const updateUserPreferences = async (uid, preferences) => {
  const userRef = doc(db, 'Users', uid);
  await updateDoc(userRef, { preferences });
};
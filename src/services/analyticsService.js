// analyticsService.js
import { db } from './firebase';
import { collection, doc, getDoc, updateDoc, addDoc, getDocs, where, query } from 'firebase/firestore';

// Fetch analytics for a specific habit
export const getHabitAnalytics = async (habitId) => {
  const analyticsRef = doc(db, 'Analytics', habitId);
  const docSnap = await getDoc(analyticsRef);
  return docSnap.exists() ? docSnap.data() : null;
};

// Update analytics like streaks
export const updateHabitAnalytics = async (habitId, analyticsData) => {
  const analyticsRef = doc(db, 'Analytics', habitId);
  await updateDoc(analyticsRef, analyticsData);
};

// Add new analytics record
export const addHabitAnalytics = async (analyticsData) => {
  const analyticsRef = collection(db, 'Analytics');
  await addDoc(analyticsRef, analyticsData);
};

// Fetch all analytics records for a user
export const getUserAnalytics = async (userId) => {
  const analytics = [];
  const q = query(collection(db, 'Analytics'), where('user_id', '==', userId));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => analytics.push({ id: doc.id, ...doc.data() }));
  return analytics;
};
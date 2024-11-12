// habitEntriesService.js
import { db } from './firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

// Add a habit entry for tracking
export const addHabitEntry = async (habitId, entryData) => {
  const entryRef = collection(db, 'HabitEntries');
  await addDoc(entryRef, { habit_id: habitId, ...entryData });
};

// Get habit entries for a specific habit
export const getEntriesByHabit = async (habitId) => {
  const entries = [];
  const q = query(collection(db, 'HabitEntries'), where('habit_id', '==', habitId));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => entries.push({ id: doc.id, ...doc.data() }));
  return entries;
};
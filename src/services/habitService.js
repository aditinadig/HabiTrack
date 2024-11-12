// habitService.js
import { db } from './firebase';
import { collection, doc, addDoc, getDocs, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

// Add a new habit
export const addHabit = async (habitData) => {
  const habitRef = collection(db, 'Habits');
  return await addDoc(habitRef, habitData);
};

// Get all habits for a specific user
export const getHabitsByUser = async (userId) => {
  const habits = [];
  const querySnapshot = await getDocs(collection(db, 'Habits'));
  querySnapshot.forEach((doc) => {
    if (doc.data().user_id === userId) habits.push({ id: doc.id, ...doc.data() });
  });
  return habits;
};

// Update an existing habit
export const updateHabit = async (habitId, habitData) => {
  const habitRef = doc(db, 'Habits', habitId);
  await updateDoc(habitRef, habitData);
};

// Delete a habit
export const deleteHabit = async (habitId) => {
  const habitRef = doc(db, 'Habits', habitId);
  await deleteDoc(habitRef);
};
// reminderService.js
import { db } from './firebase';
import { collection, doc, addDoc, getDocs, query, where, updateDoc, deleteDoc } from 'firebase/firestore';

// Add a new reminder
export const addReminder = async (reminderData) => {
  try {
    const reminderRef = collection(db, 'Reminders');
    await addDoc(reminderRef, reminderData);
  } catch (error) {
    console.error("Error adding reminder:", error);
    throw error;
  }
};

// Fetch reminders for a specific user
export const getRemindersByUser = async (userId) => {
  try {
    const reminders = [];
    const q = query(collection(db, 'Reminders'), where('user_id', '==', userId));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      reminders.push({ id: doc.id, ...doc.data() });
    });
    return reminders;
  } catch (error) {
    console.error("Error fetching reminders:", error);
    throw error;
  }
};

// Update a reminder
export const updateReminder = async (reminderId, reminderData) => {
  try {
    const reminderRef = doc(db, 'Reminders', reminderId);
    await updateDoc(reminderRef, reminderData);
  } catch (error) {
    console.error("Error updating reminder:", error);
    throw error;
  }
};

// Delete a reminder
export const deleteReminder = async (reminderId) => {
  try {
    const reminderRef = doc(db, 'Reminders', reminderId);
    await deleteDoc(reminderRef);
  } catch (error) {
    console.error("Error deleting reminder:", error);
    throw error;
  }
};

export const getRemindersByHabit = async (habitId) => {
  try {
    const reminders = [];
    const q = query(collection(db, 'Reminders'), where('habitId', '==', habitId));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      reminders.push({ id: doc.id, ...doc.data() });
    });
    return reminders;
  } catch (error) {
    console.error("Error fetching reminders:", error);
    throw error;
  }
}
// reminderService.js
import { db } from './firebase';
import { collection, doc, addDoc, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';

// Add a new reminder
export const addReminder = async (reminderData) => {
  const reminderRef = collection(db, 'Reminders');
  await addDoc(reminderRef, reminderData);
};

// Fetch reminders for a user
export const getRemindersByUser = async (userId) => {
  const reminders = [];
  const querySnapshot = await getDocs(collection(db, 'Reminders'));
  querySnapshot.forEach((doc) => {
    if (doc.data().user_id === userId) reminders.push({ id: doc.id, ...doc.data() });
  });
  return reminders;
};

// Update a reminder
export const updateReminder = async (reminderId, reminderData) => {
  const reminderRef = doc(db, 'Reminders', reminderId);
  await updateDoc(reminderRef, reminderData);
};

// Delete a reminder
export const deleteReminder = async (reminderId) => {
  const reminderRef = doc(db, 'Reminders', reminderId);
  await deleteDoc(reminderRef);
};
// habitService.js
import { db } from './firebase';
import { collection, doc, addDoc, getDocs, getDoc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';


// Modified addHabit function to accept a custom ID
export const addHabit = async (habitData, customId) => {
  const habitRef = customId ? doc(db, 'Habits', customId) : doc(collection(db, 'Habits'));
  await setDoc(habitRef, habitData);
  return habitRef;
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

// Get a habit by id
export const getHabitById = async (habitId) => {
  const habitRef = doc(db, 'Habits', habitId);
  const habitSnap = await getDoc(habitRef);
  if (habitSnap.exists()) {
    return { id: habitSnap.id, ...habitSnap.data() };
  } else {
    console.error("No such document!");
    return null;
  }
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

export async function getAllHabitIds() {
  const habits = await getHabitsByUser(); // Adjust this to match your service's structure
  return habits.map((habit) => habit.id);
}

// Delete a habit and its related HabitEntries and Reminders
// export const deleteHabit = async (habitId) => {
//   try {
//     // Reference to the habit document
//     const habitRef = doc(db, 'Habits', habitId);

//     // Delete associated HabitEntries
//     const habitEntriesRef = collection(db, 'HabitEntries');
//     const habitEntriesQuery = query(habitEntriesRef, where("habit_id", "==", habitId));
//     const habitEntriesSnapshot = await getDocs(habitEntriesQuery);

//     // Loop through and delete each HabitEntry
//     const habitEntryDeletions = habitEntriesSnapshot.docs.map((doc) => deleteDoc(doc.ref));
//     await Promise.all(habitEntryDeletions);

//     // Delete associated Reminders
//     const remindersRef = collection(db, 'Reminders');
//     const remindersQuery = query(remindersRef, where("habit_id", "==", habitId));
//     const remindersSnapshot = await getDocs(remindersQuery);

//     // Loop through and delete each Reminder
//     const reminderDeletions = remindersSnapshot.docs.map((doc) => deleteDoc(doc.ref));
//     await Promise.all(reminderDeletions);

//     // Finally, delete the habit itself
//     await deleteDoc(habitRef);

//     console.log("Habit, HabitEntries, and Reminders deleted successfully.");
//   } catch (error) {
//     console.error("Error deleting habit and related data:", error);
//   }
// };
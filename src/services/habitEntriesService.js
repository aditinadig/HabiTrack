// habitEntriesService.js
import { db } from "./firebase";
import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";

// Add or update a habit entry for tracking
export const updateHabitEntries = async (habitId, entry) => {
  const entryRef = doc(db, "HabitEntries", habitId);

  // Check if the document exists
  const entryDoc = await getDoc(entryRef);
  if (entryDoc.exists()) {
    // Update existing document by adding or modifying the entry
    const existingEntries = entryDoc.data().entries || [];
    const updatedEntries = existingEntries.filter((e) => e.date !== entry.date);
    updatedEntries.push(entry); // add new or updated entry

    await updateDoc(entryRef, { entries: updatedEntries });
  } else {
    // Create a new document with the first entry
    await setDoc(entryRef, { entries: [entry] });
  }
};

// Get habit entries for a specific habit
export const getEntriesByHabit = async (habitId) => {
  const entryRef = doc(db, "HabitEntries", habitId);
  const entryDoc = await getDoc(entryRef);
  if (entryDoc.exists()) {
    return entryDoc.data().entries || [];
  }
  return [];
};
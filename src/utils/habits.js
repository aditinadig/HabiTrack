// src/utils/habits.js
import { getFirestore, collection, getDocs } from "firebase/firestore";

export async function fetchHabitsFromFirebase() {
  const db = getFirestore();
  const habitCollection = collection(db, "habits");
  const habitSnapshot = await getDocs(habitCollection);
  return habitSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
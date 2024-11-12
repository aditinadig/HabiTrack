// authService.js
import { auth, db } from './firebase'; // Import Firestore instance
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore'; // Import Firestore functions

// Helper function to set a cookie
const setCookie = (name, value, days) => {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/`;
};

// Helper function to delete a cookie
const deleteCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

// Helper function to get a cookie
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
};

// Sign up new user and store in Firestore
export const signUp = async (email, password, name) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Add user to Firestore Users collection
    await setDoc(doc(db, "Users", user.uid), {
      name: name,
      email: email,
      UID: user.uid,
    });

    // Set cookies to store user ID and email
    setCookie("user_id", user.uid, 7); // Cookie expires in 7 days
    setCookie("user_email", email, 7);

    return user;
  } catch (error) {
    console.error('Error signing up:', error.message);
    throw error;
  }
};

// Log in existing user
export const logIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Set cookies to store user ID and email
    setCookie("user_id", user.uid, 7); // Cookie expires in 7 days
    setCookie("user_email", email, 7);

    return user;
  } catch (error) {
    console.error('Error logging in:', error.message);
    throw error;
  }
};

// Log out user
export const logOut = async () => {
  try {
    await signOut(auth);
    // Delete the user_id and user_email cookies on logout
    deleteCookie("user_id");
    deleteCookie("user_email");
  } catch (error) {
    console.error('Error logging out:', error.message);
    throw error;
  }
};

// Export the getCookie function to use it in other files
export { getCookie };
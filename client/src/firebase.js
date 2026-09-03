// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-estate-a22c5.firebaseapp.com",
  projectId: "mern-estate-a22c5",
  storageBucket: "mern-estate-a22c5.firebasestorage.app",
  messagingSenderId: "742107119868",
  appId: "1:742107119868:web:d4326bc0012243f2afd779",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);

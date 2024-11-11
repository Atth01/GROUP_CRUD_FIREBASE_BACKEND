// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";  // Pastikan impor ini ada
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC2D2rLxfykVEYB9EmE-mp9UmBR8OUDDpA",
  authDomain: "wst-uts.firebaseapp.com",
  projectId: "wst-uts",
  storageBucket: "wst-uts.firebasestorage.app",
  messagingSenderId: "513740664868",
  appId: "1:513740664868:web:1f999a15c3dc2299a2a8b1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default db;
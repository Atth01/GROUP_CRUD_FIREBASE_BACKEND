// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";  // Ganti dengan Realtime Database

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC2D2rLxfykVEYB9EmE-mp9UmBR8OUDDpA",
  authDomain: "wst-uts.firebaseapp.com",
  databaseURL: "https://wst-uts-default-rtdb.firebaseio.com",  // Tambahkan ini untuk Realtime Database
  projectId: "wst-uts",
  storageBucket: "wst-uts.appspot.com",
  messagingSenderId: "513740664868",
  appId: "1:513740664868:web:1f999a15c3dc2299a2a8b1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);  // Gunakan getDatabase untuk Realtime Database

export default database;

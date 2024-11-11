// services/auth.js
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { initializeApp, getApps } from "firebase/app";
import firebaseConfig from './config/config.js'; // Mengimpor konfigurasi Firebase

// Inisialisasi Firebase hanya jika aplikasi belum ada
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

// Fungsi untuk registrasi pengguna
export const registerUser = async (email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return userCredential.user; // Kembalikan informasi pengguna
    } catch (error) {
        throw new Error(error.message); // Lempar error untuk ditangani di tempat lain
    }
};

// Fungsi untuk login pengguna
export const loginUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user; // Kembalikan informasi pengguna
    } catch (error) {
        throw new Error(error.message); // Lempar error untuk ditangani di tempat lain
    }
};
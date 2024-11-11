import express from 'express';
import { register, login } from './authController.js'; // Pastikan jalur ini benar
import jwt from 'jsonwebtoken';
import { getAuth } from 'firebase-admin/auth';

const router = express.Router();
const auth = getAuth();
const JWT_SECRET = "your_jwt_secret"; // Gantilah dengan secret yang aman

// Rute untuk registrasi
router.post('/register', register);

// Rute untuk login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Verifikasi pengguna dengan Firebase Auth
        const user = await auth.getUserByEmail(email);

        // Jika login berhasil, buat token JWT
        const token = jwt.sign({ uid: user.uid, email: user.email }, JWT_SECRET, {
            expiresIn: '1h', // Token berlaku selama 1 jam
        });

        // Simpan token JWT di session
        req.session.token = token;

        res.status(200).json({ message: 'User logged in successfully', token });
    } catch (error) {
        res.status(400).json({ message: 'Error logging in user', error: error.message });
    }
});

export default router;

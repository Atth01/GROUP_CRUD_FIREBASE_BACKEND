import jwt from 'jsonwebtoken';
import { registerUser, loginUser } from './auth.js'; // Pastikan ini mengembalikan user yang valid

const JWT_SECRET = 'your_jwt_secret'; // Ganti dengan secret yang lebih aman untuk produksi

// Fungsi untuk registrasi pengguna
export const register = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Registrasi pengguna menggunakan fungsi dari services/auth.js
        const user = await registerUser(email, password);

        // Jika registrasi berhasil, kirimkan respons sukses
        res.status(201).json({ message: 'User registered successfully', user });
    } catch (error) {
        // Tangani kesalahan jika registrasi gagal
        res.status(400).json({ message: 'Error registering user', error: error.message });
    }
};

// Fungsi untuk login pengguna
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Login pengguna menggunakan fungsi dari services/auth.js
        const user = await loginUser(email, password);

        // Cek apakah pengguna ditemukan
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Pembuatan JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },  // Payload yang akan disertakan dalam token
            JWT_SECRET,  // Secret key untuk menandatangani token
            { expiresIn: '1h' }  // Token akan kedaluwarsa dalam 1 jam
        );

        // Menyimpan JWT dalam session
        req.session.token = token;

        // Mengirimkan token sebagai respons login sukses
        res.status(200).json({
            message: 'User logged in successfully',
            user: {
                id: user.id,
                email: user.email,
            },
            token,  // Token JWT dikirim sebagai bagian dari respons
        });
    } catch (error) {
        // Tangani kesalahan jika login gagal
        res.status(400).json({ message: 'Error logging in user', error: error.message });
    }
};

// Middleware untuk memverifikasi JWT dari session
export const verifyToken = (req, res, next) => {
    const token = req.session.token || req.headers['authorization']?.split(' ')[1];

    // Jika tidak ada token, kembalikan error
    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    // Verifikasi token
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }

        // Menyimpan informasi user dari token ke dalam request
        req.user = decoded;
        next();  // Melanjutkan ke rute berikutnya jika token valid
    });
};

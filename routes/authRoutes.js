import express from "express";
import db from "../config/config.js";
import { ref, set, get, update, child } from "firebase/database";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import auth from "../middleware/auth.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Register
router.post("/register", async (req, res) => {
    try {
        const { email, password, ...otherData } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email dan password harus diisi" });
        }

        const userRef = ref(db, "users");
        const snapshot = await get(child(userRef, email.replace(".", ",")));

        if (snapshot.exists()) {
            return res.status(400).json({ message: "Email sudah terdaftar" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = {
            ...otherData,
            email,
            password: hashedPassword,
            deleted: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await set(child(userRef, email.replace(".", ",")), user);

        const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "1d" });

        // Hapus password dari response
        const userResponse = {
            email,
            ...otherData,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        res.status(201).json({
            message: "Registrasi berhasil",
            token,
            user: userResponse
        });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Terjadi kesalahan saat registrasi" });
    }
});

// Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email dan password harus diisi" });
        }

        const userRef = ref(db, `users/${email.replace(".", ",")}`);
        const snapshot = await get(userRef);

        if (!snapshot.exists()) {
            return res.status(401).json({ message: "Email atau password salah" });
        }

        const user = snapshot.val();

        if (user.deleted) {
            return res.status(401).json({ message: "Akun tidak ditemukan" });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: "Email atau password salah" });
        }

        const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: "1d" });

        // Hapus password dari response
        const userResponse = {
            email: user.email,
            name: user.name,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        res.status(200).json({
            message: "Login berhasil",
            token,
            user: userResponse
        });
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json({ message: "Terjadi kesalahan saat login" });
    }
});

// Change Password
router.post("/change-password", auth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: "Password lama dan password baru harus diisi"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                message: "Password baru harus minimal 6 karakter"
            });
        }

        const userRef = ref(db, `users/${req.user.email.replace(".", ",")}`);
        const snapshot = await get(userRef);

        if (!snapshot.exists()) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }

        const user = snapshot.val();

        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ message: "Password lama tidak valid" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await update(userRef, { password: hashedPassword });

        res.status(200).json({ message: "Password berhasil diubah" });
    } catch (error) {
        console.error("Error changing password:", error);
        res.status(500).json({ message: "Terjadi kesalahan saat mengubah password" });
    }
});

export default router;

import express from "express";
import userRoutes from "./routes/userRoutes.js";
import studentRoutes from "./routes/mahasiswaRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import cors from "cors";

const app = express();
const PORT = 3003;

// Middleware untuk parsing JSON
app.use(express.json());

// Pengaturan CORS
app.use(cors({
    // origin: 'http://localhost:3003',  // Menyediakan akses hanya untuk domain ini
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'PATCH'],  // Metode yang diizinkan
    allowedHeaders: ['Content-Type', 'Authorization'],  // Header yang diizinkan, pastikan 'Authorization' diizinkan
    credentials: true,  // Untuk memungkinkan pengiriman cookies dan headers authorization
}));

// Menyambungkan route ke endpoint yang sesuai
app.use("/api/auth", authRoutes);        // Route untuk autentikasi
app.use("/api/users", userRoutes);       // Route untuk pengguna
app.use("/api/students", studentRoutes); // Route untuk siswa

// Middleware untuk menangani route yang tidak ditemukan
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Route tidak ditemukan'
    });
});

// Menjalankan server di port 3003
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

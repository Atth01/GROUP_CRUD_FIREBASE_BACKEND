import express from "express";
import db from "../config/config.js";
import { ref, set, get, update, remove, child } from "firebase/database"; // Firebase Realtime Database functions
import cors from "cors";

const router = express.Router();

// Menggunakan CORS middleware untuk mengizinkan permintaan dari domain tertentu
router.use(cors());

// Create Mahasiswa
router.post("/", async (req, res) => {
    try {
        const { npm, name, major } = req.body;

        if (!npm || !name || !major) {
            return res.status(400).json({ message: "Field npm, name, dan major harus diisi" });
        }

        const mahasiswaRef = ref(db, `mahasiswa/${npm}`); // Menggunakan npm sebagai ID

        // Menambahkan mahasiswa ke Realtime Database
        await set(mahasiswaRef, {
            npm,
            name,
            major,
            deleted: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        res.status(201).json({
            message: "Mahasiswa berhasil ditambahkan",
            mahasiswa: {
                npm,
                name,
                major
            }
        });
    } catch (error) {
        console.error("Error menambahkan mahasiswa:", error);
        res.status(500).json({ message: "Terjadi kesalahan saat menambahkan mahasiswa" });
    }
});

// Read Mahasiswa (Tanpa autentikasi)
router.get("/", async (req, res) => {
    try {
        const mahasiswaRef = ref(db, "mahasiswa");
        const snapshot = await get(mahasiswaRef);

        if (snapshot.exists()) {
            const mahasiswaList = [];
            snapshot.forEach((childSnapshot) => {
                const data = childSnapshot.val();
                if (!data.deleted) {
                    mahasiswaList.push({
                        npm: data.npm,
                        name: data.name,
                        major: data.major
                    });
                }
            });

            if (mahasiswaList.length > 0) {
                res.status(200).json({
                    message: "Data mahasiswa berhasil diambil",
                    mahasiswa: mahasiswaList
                });
            } else {
                res.status(404).json({ message: "Tidak ada data mahasiswa ditemukan" });
            }
        } else {
            res.status(404).json({ message: "Tidak ada data mahasiswa ditemukan" });
        }
    } catch (error) {
        console.error("Error mengambil data mahasiswa:", error);
        res.status(500).json({ message: "Terjadi kesalahan saat mengambil data mahasiswa" });
    }
});

// Update Mahasiswa (Tanpa autentikasi)
router.put("/:npm", async (req, res) => {
    try {
        const { npm } = req.params;
        const { name, major } = req.body;

        if (!name || !major) {
            return res.status(400).json({ message: "Field name dan major wajib diisi" });
        }

        const mahasiswaRef = ref(db, `mahasiswa/${npm}`);
        const snapshot = await get(mahasiswaRef);

        if (!snapshot.exists()) {
            return res.status(404).json({ message: "Mahasiswa tidak ditemukan" });
        }

        await update(mahasiswaRef, {
            name,
            major,
            updatedAt: new Date().toISOString()
        });

        res.status(200).json({
            message: "Data mahasiswa berhasil diperbarui",
            mahasiswa: { npm, name, major }
        });
    } catch (error) {
        console.error("Error memperbarui data mahasiswa:", error);
        res.status(500).json({ message: "Terjadi kesalahan saat memperbarui data mahasiswa" });
    }
});

// Delete Mahasiswa (Tanpa autentikasi)
router.delete("/:npm", async (req, res) => {
    try {
        const { npm } = req.params;

        const mahasiswaRef = ref(db, `mahasiswa/${npm}`);
        const snapshot = await get(mahasiswaRef);

        if (!snapshot.exists()) {
            return res.status(404).json({ message: "Mahasiswa tidak ditemukan" });
        }

        await update(mahasiswaRef, {
            deleted: true,
            updatedAt: new Date().toISOString()
        });

        res.status(200).json({ message: "Mahasiswa berhasil dihapus" });
    } catch (error) {
        console.error("Error menghapus data mahasiswa:", error);
        res.status(500).json({ message: "Terjadi kesalahan saat menghapus data mahasiswa" });
    }
});

export default router;

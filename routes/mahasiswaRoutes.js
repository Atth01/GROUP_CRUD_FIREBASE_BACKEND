import express from "express";
import db from "../config/config.js";
import { collection, setDoc, getDocs, doc, updateDoc, query, where, getDoc } from "firebase/firestore";  // Tambahkan setDoc dan getDoc
import cors from "cors";  // Mengimpor CORS middleware

const router = express.Router();

// Menggunakan CORS middleware untuk mengizinkan permintaan dari domain tertentu
router.use(cors());  // Menambahkan CORS ke seluruh route

// Create Mahasiswa
router.post("/", async (req, res) => {
    try {
        const { npm, name, major } = req.body;
        const mahasiswa = {
            npm,            // Menggunakan npm sebagai ID
            name,           // Nama mahasiswa
            major,          // Jurusan mahasiswa
            deleted: false, // Status tidak terhapus
            createdAt: new Date().toISOString(), // Tanggal pembuatan
            updatedAt: new Date().toISOString()  // Tanggal pembaruan
        };

        // Menambahkan mahasiswa ke Firestore dengan npm sebagai ID
        await setDoc(doc(db, "mahasiswa", npm), mahasiswa);

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
        const q = query(collection(db, "mahasiswa"), where("deleted", "==", false));
        const snapshot = await getDocs(q);

        // Menyusun data mahasiswa dan hanya mengirimkan field npm, name, dan major
        const mahasiswaList = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                npm: data.npm,    // npm mahasiswa
                name: data.name,  // nama mahasiswa
                major: data.major // jurusan mahasiswa
            };
        });

        if (Array.isArray(mahasiswaList) && mahasiswaList.length > 0) {
            res.status(200).json({
                message: "Data mahasiswa berhasil diambil",
                mahasiswa: mahasiswaList
            });
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

        // Memastikan field name dan major diisi
        if (!name || !major) {
            return res.status(400).json({ message: "Field name dan major wajib diisi" });
        }

        // Menyusun data mahasiswa yang akan diperbarui
        const updateData = {
            name,
            major,
            updatedAt: new Date().toISOString()
        };

        const mahasiswaRef = doc(db, "mahasiswa", npm);
        const mahasiswaDoc = await getDoc(mahasiswaRef);

        // Memastikan mahasiswa dengan npm yang diberikan ada
        if (!mahasiswaDoc.exists()) {
            return res.status(404).json({ message: "Mahasiswa tidak ditemukan" });
        }

        // Memperbarui data mahasiswa
        await updateDoc(mahasiswaRef, updateData);

        res.status(200).json({
            message: "Data mahasiswa berhasil diperbarui",
            mahasiswa: { id: npm, ...updateData }
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

        const mahasiswaRef = doc(db, "mahasiswa", npm);
        const mahasiswaDoc = await getDoc(mahasiswaRef);

        // Memastikan mahasiswa dengan npm yang diberikan ada
        if (!mahasiswaDoc.exists()) {
            return res.status(404).json({ message: "Mahasiswa tidak ditemukan" });
        }

        // Menghapus mahasiswa dengan cara menandainya sebagai deleted (soft delete)
        await updateDoc(mahasiswaRef, {
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

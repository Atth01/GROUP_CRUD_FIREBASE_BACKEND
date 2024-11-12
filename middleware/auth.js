'use strict';

import jwt from "jsonwebtoken";
import { ref, get } from "firebase/database"; // Menggunakan Realtime Database
import db from "../config/config.js";
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in the environment variables.");
}

const extractToken = (authHeader) => {
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Format token salah, harus menggunakan Bearer");
  }
  const token = authHeader.split(" ")[1];
  if (!token?.trim()) {
    throw new Error("Token kosong atau tidak valid");
  }
  return token;
};

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    const token = extractToken(authHeader);

    const decoded = jwt.verify(token, JWT_SECRET);

    // Cek user di Realtime Database
    const userRef = ref(db, `users/${decoded.id}`); // Referensi ke data user berdasarkan id
    const userSnapshot = await get(userRef); // Mengambil data user

    if (!userSnapshot.exists() || userSnapshot.val().deleted) {
      return res.status(404).json({ message: "User tidak ditemukan atau telah dihapus" });
    }

    const userData = userSnapshot.val();
    delete userData.password; // Hapus password dari data user

    req.user = { id: decoded.id, ...userData };
    req.token = token;

    next();
  } catch (error) {
    console.error('Auth error:', error.message);

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Token telah kadaluarsa" });
    } else if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Token tidak valid" });
    } else if (error.message.includes("Format token salah")) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: "Terjadi kesalahan pada proses autentikasi" });
  }
};

export default auth;

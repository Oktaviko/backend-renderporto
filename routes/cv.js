// routes/cv.js
const express = require("express");
const multer = require("multer");
const { uploadFile, deleteFile } = require("../utils/supabaseStorage");
const pool = require("../db");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Upload / Replace CV
router.post("/", upload.single("cv"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // 1. Cari CV lama
    const oldCvResult = await pool.query("SELECT * FROM cv LIMIT 1");
    if (oldCvResult.rows.length > 0) {
      const oldCv = oldCvResult.rows[0];

      // hapus file lama dari storage
      if (oldCv.filename) {
        try {
          await deleteFile(oldCv.filename, "uploads");
        } catch (delErr) {
          console.warn("Gagal hapus file lama:", delErr.message);
        }
      }

      // hapus record lama dari DB
      await pool.query("DELETE FROM cv WHERE id = $1", [oldCv.id]);
    }

    // 2. Upload file baru ke storage
    const { fileName, publicUrl } = await uploadFile(
      req.file,
      "uploads",
      "cv/"
    );

    // 3. Simpan metadata baru ke DB
    const result = await pool.query(
      `INSERT INTO cv (filename, file_url) VALUES ($1, $2) RETURNING *`,
      [fileName, publicUrl]
    );

    res.json({ success: true, cv: result.rows[0] });
  } catch (error) {
    console.error("Error uploading CV:", error.message);
    res.status(500).json({ error: "Failed to upload CV" });
  }
});

// Get CV
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM cv LIMIT 1");
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No CV found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching CV:", error.message);
    res.status(500).json({ error: "Failed to fetch CV" });
  }
});

module.exports = router;

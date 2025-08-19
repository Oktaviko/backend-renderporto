// routes/projects.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const pool = require("../db");
const { uploadFile, deleteFile } = require("../utils/supabaseStorage");

// Setup multer untuk memory storage (bukan disk)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// POST - Tambah project dengan upload ke Supabase Storage
router.post("/", upload.single("image"), async (req, res) => {
  const { title, description, technologies, github, demo } = req.body;

  try {
    let image_url = null;
    
    if (req.file) {
      const uploadResult = await uploadFile(req.file, 'uploads', 'projects/');
      image_url = uploadResult.publicUrl;
    }

    const newProject = await pool.query(
      `INSERT INTO projects (title, description, image_url, technologies, github, demo)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        title,
        description,
        image_url,
        technologies ? JSON.parse(technologies) : null,
        github || null,
        demo || null,
      ]
    );
    
    res.json(newProject.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// GET - Ambil semua project
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM projects ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// GET - Ambil satu project
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM projects WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Project tidak ditemukan" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// PUT - Update project
router.put("/:id", upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const { title, description, technologies, github, demo } = req.body;

  try {
    const oldData = await pool.query("SELECT * FROM projects WHERE id = $1", [id]);
    if (oldData.rows.length === 0) {
      return res.status(404).json({ message: "Project tidak ditemukan" });
    }

    let image_url = oldData.rows[0].image_url;

    if (req.file) {
      // Delete old file jika ada
      if (oldData.rows[0].image_url) {
        const oldFileName = oldData.rows[0].image_url.split('/').pop();
        try {
          await deleteFile(`projects/${oldFileName}`);
        } catch (err) {
          console.log("Failed to delete old file:", err.message);
        }
      }
      
      // Upload new file
      const uploadResult = await uploadFile(req.file, 'uploads', 'projects/');
      image_url = uploadResult.publicUrl;
    }

    const updated = await pool.query(
      `UPDATE projects
       SET title = $1, description = $2, image_url = $3, technologies = $4, github = $5, demo = $6
       WHERE id = $7 RETURNING *`,
      [title, description, image_url, technologies ? JSON.parse(technologies) : null, github || null, demo || null, id]
    );

    res.json(updated.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// DELETE - Hapus project
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const oldData = await pool.query("SELECT * FROM projects WHERE id = $1", [id]);
    if (oldData.rows.length === 0) {
      return res.status(404).json({ message: "Project tidak ditemukan" });
    }

    await pool.query("DELETE FROM projects WHERE id = $1", [id]);

    // Delete file dari Supabase Storage
    if (oldData.rows[0].image_url) {
      const fileName = oldData.rows[0].image_url.split('/').pop();
      try {
        await deleteFile(`projects/${fileName}`);
      } catch (err) {
        console.log("Failed to delete file:", err.message);
      }
    }

    res.json({ message: "Project berhasil dihapus" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
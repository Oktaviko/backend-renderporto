const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET semua komentar
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const offset = (page - 1) * limit;

    // Ambil total komentar
    const totalResult = await pool.query("SELECT COUNT(*) FROM comments");
    const total = parseInt(totalResult.rows[0].count);

    // Ambil komentar sesuai pagination
    const result = await pool.query(
      "SELECT * FROM comments ORDER BY created_at DESC LIMIT $1 OFFSET $2",
      [limit, offset]
    );

    res.json({
      comments: result.rows,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Gagal mengambil komentar:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST komentar baru
router.post("/", async (req, res) => {
  const { name, comment, rating } = req.body;

  if (!name || !comment) {
    return res.status(400).json({ error: "Nama dan komentar wajib diisi." });
  }

  try {
    const result = await pool.query(
      "INSERT INTO comments (name, comment, rating) VALUES ($1, $2, $3) RETURNING *",
      [name, comment, rating]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Gagal menyimpan komentar:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

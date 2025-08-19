// routes/skills.js
const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET semua skill
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM skills ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST tambah skill
router.post("/", async (req, res) => {
  try {
    const { skill_name, level } = req.body;
    const result = await pool.query(
      "INSERT INTO skills (skill_name, level) VALUES ($1, $2) RETURNING *",
      [skill_name, level]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT edit skill
router.put("/:id", async (req, res) => {
  try {
    const { skill_name, level } = req.body;
    const { id } = req.params;
    const result = await pool.query(
      "UPDATE skills SET skill_name=$1, level=$2 WHERE id=$3 RETURNING *",
      [skill_name, level, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE hapus skill
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM skills WHERE id=$1", [id]);
    res.json({ message: "Skill deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

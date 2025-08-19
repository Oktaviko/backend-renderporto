// server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware CORS - Update untuk production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.vercel.app', 'https://your-frontend-domain.com']
    : ["http://localhost:5173", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Remove static file serving karena sekarang pakai Supabase Storage
// app.use("/uploads", express.static(uploadsDir)); // HAPUS INI

// Routes
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/projects", require("./routes/projects"));
app.use("/api/cv", require("./routes/cv"));
app.use("/api/comments", require("./routes/comments"));
app.use("/api/skills", require("./routes/skills"));

// Health check endpoint
app.get("/healthz", (req, res) => {
  res.status(200).send("OK");
});

// Test koneksi database
const pool = require("./db");
app.get("/api/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ 
      success: true, 
      time: result.rows[0].now,
      environment: process.env.NODE_ENV 
    });
  } catch (err) {
    console.error("Database connection error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ 
    message: "Portfolio API is running", 
    status: "healthy",
    timestamp: new Date().toISOString()
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
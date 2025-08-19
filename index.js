// index.js
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// contoh route
app.get("/", (req, res) => {
  res.send("Backend berjalan di Render 🚀");
});

// port dari environment (Render kasih otomatis)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

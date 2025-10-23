// frontend/server.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

// Middleware for static files (serve React build)
app.use(express.static(path.join(__dirname, "build")));

// Multer config for uploads (temporary storage, then move to final path)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "public/images/destinations/temp")); // Temp dir
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

// Ensure temp dir exists
const tempDir = path.join(__dirname, "public/images/destinations/temp");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// POST /save-image endpoint
app.post("/save-image", upload.single("file"), (req, res) => {
  try {
    const slug = req.body.slug;
    if (!slug) {
      return res.status(400).json({ error: "Slug required" });
    }

    const folderPath = path.join(__dirname, "public/images/destinations", slug);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const tempFilePath = req.file.path;
    const finalFilePath = path.join(folderPath, req.file.originalname);
    fs.renameSync(tempFilePath, finalFilePath);

    res.json({ message: "File saved successfully", path: finalFilePath });
  } catch (error) {
    console.error("Save error:", error);
    res.status(500).json({ error: "Failed to save file" });
  }
});

// Serve React index.html for all other routes (SPA fallback)
app.get("/*catchAll", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
  console.log(`Frontend server with file upload on port ${PORT}`);
});

const multer = require("multer");

// Vercel-safe (NO file system write)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB (optional)
  },
});

module.exports = upload;

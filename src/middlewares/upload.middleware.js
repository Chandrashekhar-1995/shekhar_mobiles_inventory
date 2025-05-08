import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, "../uploads");
        
        // Create directory if it doesn't exist
        fs.mkdir(uploadPath, { recursive: true }, (err) => {
            if (err) return cb(err);
            cb(null, uploadPath);
        });
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

// Filter for Excel and CSV files
const fileFilter = (req, file, cb) => {
    const allowedExtensions = [".xlsx", ".xls", ".csv"];
    const allowedMimeTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "text/csv",
        "application/csv",
        "text/x-csv"
    ];

    const extName = path.extname(file.originalname).toLowerCase();
    const mimeType = file.mimetype;

    if (allowedExtensions.includes(extName) && allowedMimeTypes.includes(mimeType)) {
        cb(null, true);
    } else {
        cb(new Error("Only Excel (.xlsx, .xls) and CSV files are allowed."), false);
    }
};

// Multer upload instance
const upload = multer({
    storage,
    fileFilter,
    limits: { 
        fileSize: 5 * 1024 * 1024, // 5 MB limit (increased from 2MB)
        files: 1 // Allow only single file upload
    },
});

export default upload;
const multer = require("multer");

// Set up Multer for data file uploads
const uploadData = multer({
    destination: "./public/uploads",
    fileFilter: (req, file, cb) => {
        const fileExt = path.extname(file.originalname);
        if (fileExt === ".csv" || fileExt === ".xlsx") {
            cb(null, true);
        } else {
            cb(new ApiError(400, "Only CSV or Excel files are allowed."));
        }
    },
});


module.exports = {uploadData};
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './upload');
    },
    filename: function(req, file, cb) {
        const ext = file.originalname.split('.').pop();
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '.' + ext);
    }
});
const upload = multer({ storage });

module.exports = upload;
// import  in  routinh  const upload = require('../Middlewere/Multler')
// also add this upload.single (file name)
// like  upload.single('uploaded_file')
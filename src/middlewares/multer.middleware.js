
import express from 'express';
import multer from 'multer';

const app = express();

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/temp'); // save in 'uploads' folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // unique file name
    },
});

export const upload = multer({ storage });

app.use(express.json());
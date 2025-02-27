import multer from "multer";
import { nanoid } from "nanoid";
import fs from "fs";
import path from "path";



export const multerLocal = (customValidation = [], customPath = "generals") => {
  const fullPath = path.resolve("src/uploads/", customPath);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, fullPath);
    },
    filename: (req, file, cb) => {
      // const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, nanoid(4) + file.originalname);
    },
  });
  function fileFilter(req, file, cb) {
    if (customValidation.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("invalid file format", false));
    }
  }
  const upload = multer({ fileFilter, storage });
  return upload;
};



export const multerHost = (customValidation = []) => {
  const storage = multer.diskStorage({});
  function fileFilter(req, file, cb) {
    if (customValidation.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("invalid file format", false));
    }
  }
  const upload = multer({ fileFilter, storage });
  return upload;
};

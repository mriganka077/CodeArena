import multer from "multer";
import multerS3 from "multer-s3";
import { s3 } from "../config/s3.js";
import path from "path";

const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_S3_BUCKET,

    contentType: multerS3.AUTO_CONTENT_TYPE,

    key: (req, file, cb) => {
      cb(
        null,
        `${Date.now()}${path.extname(file.originalname)}`
      );
    },
  }),
});

export default upload;
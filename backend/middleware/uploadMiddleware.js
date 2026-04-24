const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const { s3Client } = require('../utils/s3Utils');

const fileFilter = (req, file, cb) => {
  const allowedImages = /jpeg|jpg|png|gif|webp/;
  const allowedDocs = /pdf/;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const mime = file.mimetype;

  const isImage = allowedImages.test(ext) && allowedImages.test(mime);
  const isPdf = allowedDocs.test(ext) && mime === 'application/pdf';

  if (isImage || isPdf) {
    cb(null, true);
  } else {
    cb(new Error('Only image files or PDF reports are allowed'));
  }
};

const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.AWS_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      let folder;
      if (file.fieldname === 'verificationReport') {
        folder = 'reports';
      } else if (file.fieldname === 'avatar') {
        folder = 'avatars';
      } else if (file.fieldname === 'photos') {
        folder = 'inspections';
      } else {
        folder = req.body.folder || 'listings';
      }
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const fileName = `${folder}/${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`;
      cb(null, fileName);
    }
  }),
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 8,
  },
});

module.exports = upload;

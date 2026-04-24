const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const deleteFileFromS3 = async (fileUrl) => {
  if (!fileUrl) return;
  
  try {
    // Extract key from S3 URL
    // URL format: https://<bucket-name>.s3.<region>.amazonaws.com/<key>
    const urlParts = fileUrl.split('/');
    // The key might contain folders, so we need to get everything after the domain
    const bucketDomain = urlParts[2];
    if (bucketDomain && bucketDomain.includes('amazonaws.com')) {
      const key = urlParts.slice(3).join('/');
      
      const command = new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: decodeURIComponent(key),
      });

      await s3Client.send(command);
      console.log(`Successfully deleted ${key} from S3`);
    }
  } catch (error) {
    console.error(`Failed to delete file from S3: ${error.message}`);
  }
};

module.exports = {
  s3Client,
  deleteFileFromS3,
};

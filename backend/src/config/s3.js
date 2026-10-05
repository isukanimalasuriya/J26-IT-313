import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const s3Config = {
  region: process.env.AWS_REGION || 'us-east-1',
};

if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  s3Config.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  };
}

if (process.env.S3_CUSTOM_ENDPOINT) {
  s3Config.endpoint = process.env.S3_CUSTOM_ENDPOINT;
}

export const s3Client = new S3Client(s3Config);
export const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || '';
export const S3_PUBLIC_BASE_URL = process.env.S3_PUBLIC_BASE_URL || '';

import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, S3_BUCKET_NAME, S3_PUBLIC_BASE_URL } from '../config/s3.js';

export class S3Service {
  /**
   * Returns public URL for an asset in an open S3 bucket
   */
  static getPublicUrl(key) {
    if (S3_PUBLIC_BASE_URL) {
      return `${S3_PUBLIC_BASE_URL.replace(/\/$/, '')}/${key}`;
    }
    const region = process.env.AWS_REGION || 'us-east-1';
    return `https://${S3_BUCKET_NAME}.s3.${region}.amazonaws.com/${key}`;
  }

  /**
   * Uploads file buffer / stream directly to S3
   */
  static async uploadFile({ fileBuffer, key, contentType = 'application/octet-stream', acl = null }) {
    if (!S3_BUCKET_NAME) {
      throw new Error('S3_BUCKET_NAME is not configured.');
    }

    const params = {
      Bucket: S3_BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    };

    if (acl) {
      params.ACL = acl;
    }

    const command = new PutObjectCommand(params);

    await s3Client.send(command);
    return this.getPublicUrl(key);
  }

  /**
   * Generates a pre-signed URL for direct frontend uploads
   */
  static async getPresignedUploadUrl(key, contentType, expiresIn = 3600) {
    if (!S3_BUCKET_NAME) {
      throw new Error('S3_BUCKET_NAME is not configured.');
    }

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    return await getSignedUrl(s3Client, command, { expiresIn });
  }

  /**
   * Generates a pre-signed download URL for private assets
   */
  static async getPresignedDownloadUrl(key, expiresIn = 3600) {
    if (!S3_BUCKET_NAME) {
      throw new Error('S3_BUCKET_NAME is not configured.');
    }

    const command = new GetObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
    });

    return await getSignedUrl(s3Client, command, { expiresIn });
  }

  /**
   * Deletes an object from S3
   */
  static async deleteFile(key) {
    if (!S3_BUCKET_NAME) {
      throw new Error('S3_BUCKET_NAME is not configured.');
    }

    const command = new DeleteObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  }
}

export default S3Service;

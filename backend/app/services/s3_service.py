import logging
from typing import BinaryIO, Optional
import boto3
from botocore.exceptions import ClientError
from app.config import get_settings

logger = logging.getLogger(__name__)


class S3Service:
    """
    AWS S3 / Object Storage client for media assets (open bucket or private).
    """

    def __init__(self):
        self.settings = get_settings()
        self._client = None

    @property
    def client(self):
        if self._client is None:
            kwargs = {
                "region_name": self.settings.AWS_REGION,
            }
            if self.settings.AWS_ACCESS_KEY_ID and self.settings.AWS_SECRET_ACCESS_KEY:
                kwargs["aws_access_key_id"] = self.settings.AWS_ACCESS_KEY_ID
                kwargs["aws_secret_access_key"] = self.settings.AWS_SECRET_ACCESS_KEY
            if self.settings.S3_CUSTOM_ENDPOINT:
                kwargs["endpoint_url"] = self.settings.S3_CUSTOM_ENDPOINT

            self._client = boto3.client("s3", **kwargs)
        return self._client

    @property
    def bucket_name(self) -> str:
        if not self.settings.S3_BUCKET_NAME:
            raise ValueError("S3_BUCKET_NAME is not configured in settings/environment.")
        return self.settings.S3_BUCKET_NAME

    def get_public_url(self, key: str) -> str:
        """
        Returns the public URL for an asset in an open S3 bucket.
        """
        if self.settings.S3_PUBLIC_BASE_URL:
            base = self.settings.S3_PUBLIC_BASE_URL.rstrip("/")
            return f"{base}/{key}"
        return f"https://{self.bucket_name}.s3.{self.settings.AWS_REGION}.amazonaws.com/{key}"

    def upload_file(
        self,
        file_obj: BinaryIO,
        key: str,
        content_type: str = "application/octet-stream",
        make_public: bool = True,
    ) -> str:
        """
        Uploads a file-like object to S3.
        Returns the public URL of the uploaded asset.
        """
        extra_args = {"ContentType": content_type}
        if make_public:
            # Set ACL to public-read if open bucket allows object ACLs
            extra_args["ACL"] = "public-read"

        try:
            self.client.upload_fileobj(
                Fileobj=file_obj,
                Bucket=self.bucket_name,
                Key=key,
                ExtraArgs=extra_args,
            )
            return self.get_public_url(key)
        except ClientError as e:
            logger.error(f"Failed to upload file '{key}' to S3: {e}")
            raise

    def generate_presigned_upload_url(
        self,
        key: str,
        content_type: str,
        expires_in_seconds: int = 3600,
    ) -> dict:
        """
        Generates a pre-signed URL allowing frontend clients to upload media directly to S3.
        """
        try:
            response = self.client.generate_presigned_post(
                Bucket=self.bucket_name,
                Key=key,
                Fields={"Content-Type": content_type},
                Conditions=[
                    {"Content-Type": content_type},
                    ["content-length-range", 0, 52428800],  # 50 MB limit
                ],
                ExpiresIn=expires_in_seconds,
            )
            return response
        except ClientError as e:
            logger.error(f"Failed to generate presigned upload url: {e}")
            raise

    def generate_presigned_download_url(
        self,
        key: str,
        expires_in_seconds: int = 3600,
    ) -> str:
        """
        Generates a pre-signed download URL for protected media.
        """
        try:
            return self.client.generate_presigned_url(
                "get_object",
                Params={"Bucket": self.bucket_name, "Key": key},
                ExpiresIn=expires_in_seconds,
            )
        except ClientError as e:
            logger.error(f"Failed to generate presigned download url: {e}")
            raise

    def delete_file(self, key: str) -> bool:
        """
        Deletes an object from the S3 bucket.
        """
        try:
            self.client.delete_object(Bucket=self.bucket_name, Key=key)
            return True
        except ClientError as e:
            logger.error(f"Failed to delete object '{key}' from S3: {e}")
            return False


s3_service = S3Service()

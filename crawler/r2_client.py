import json
import logging
import boto3
from datetime import datetime, timezone
from botocore.exceptions import ClientError

from config import R2_ENDPOINT, R2_ACCESS_KEY, R2_SECRET_KEY, R2_BUCKET

logger = logging.getLogger(__name__)

META_KEY = "meta.json"


def get_s3_client():
    return boto3.client(
        "s3",
        endpoint_url=R2_ENDPOINT,
        aws_access_key_id=R2_ACCESS_KEY,
        aws_secret_access_key=R2_SECRET_KEY,
    )


def _make_version() -> str:
    return datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")


def _read_json(s3, key: str) -> dict | list | None:
    try:
        resp = s3.get_object(Bucket=R2_BUCKET, Key=key)
        return json.loads(resp["Body"].read())
    except ClientError as e:
        if e.response["Error"]["Code"] == "NoSuchKey":
            return None
        raise
    except Exception:
        return None


def _write_json(s3, key: str, data):
    body = json.dumps(data, ensure_ascii=False, indent=2, default=str)
    s3.put_object(
        Bucket=R2_BUCKET,
        Key=key,
        Body=body.encode("utf-8"),
        ContentType="application/json",
    )


def _delete_key(s3, key: str):
    try:
        s3.delete_object(Bucket=R2_BUCKET, Key=key)
    except ClientError as e:
        error_code = e.response["Error"]["Code"]
        if error_code not in ("NoSuchKey", "AccessDenied"):
            logger.warning(f"Failed to delete {key}: {e}")


def _list_keys(s3, prefix: str) -> list[str]:
    try:
        resp = s3.list_objects_v2(Bucket=R2_BUCKET, Prefix=prefix)
        return [obj["Key"] for obj in resp.get("Contents", [])]
    except ClientError:
        return []


CHUNK_SIZE = 200

def upload_hackathons(items: list[dict]) -> bool:
    """
    Atomic upload with versioning and chunking:
    1. Generate new version
    2. Split items into chunks, upload hackathons-{version}-{i}.json
    3. Upload new meta.json with fileCount
    4. Delete old version files
    """
    if not R2_ENDPOINT or not R2_ACCESS_KEY:
        logger.warning("R2 credentials not configured, skipping upload")
        return False

    s3 = get_s3_client()
    version = _make_version()

    try:
        old_meta = _read_json(s3, META_KEY)
        old_version = old_meta.get("version") if old_meta else None

        # Split into chunks and upload
        chunk_count = (len(items) + CHUNK_SIZE - 1) // CHUNK_SIZE
        for i in range(chunk_count):
            chunk = items[i * CHUNK_SIZE : (i + 1) * CHUNK_SIZE]
            key = f"hackathons-{version}-{i + 1}.json"
            _write_json(s3, key, chunk)
            logger.info(f"Uploaded chunk {i + 1}/{chunk_count}: {key} ({len(chunk)} items)")

        now = datetime.now(timezone.utc).isoformat()
        # Update meta
        new_meta = {
            "version": version,
            "count": len(items),
            "fileCount": chunk_count,
            "crawledAt": now,
        }
        _write_json(s3, META_KEY, new_meta)
        logger.info(f"Uploaded meta.json: version={version}, count={len(items)}, fileCount={chunk_count}")

        # Clean up old version files
        if old_version and old_version != version:
            old_keys = _list_keys(s3, f"hackathons-{old_version}")
            for key in old_keys:
                _delete_key(s3, key)
                logger.info(f"Deleted old file: {key}")

            # Also delete old single-file format if it exists
            old_single = f"hackathons-{old_version}.json"
            _delete_key(s3, old_single)

        logger.info(f"Upload complete: version={version}")
        return True

    except Exception as e:
        logger.error(f"Upload failed: {e}", exc_info=True)
        return False

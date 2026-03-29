import os
import json
import firebase_admin
from firebase_admin import credentials, storage
from app.services.config import FIREBASE_BUCKET

# Initialize Firebase
cred = credentials.Certificate("firebase-key.json")
firebase_admin.initialize_app(cred, {"storageBucket": FIREBASE_BUCKET})

bucket = storage.bucket()

# ── Storage Limits ──
MAX_VIDEO_SIZE_MB = 50
MAX_TOTAL_STORAGE_PER_SESSION_MB = 200


def upload_file(local_path: str, remote_path: str) -> str:
    """Upload a file to Firebase Storage and return its public URL."""
    # Check file size
    size_mb = os.path.getsize(local_path) / (1024 * 1024)
    if size_mb > MAX_VIDEO_SIZE_MB:
        raise ValueError(f"File too large ({size_mb:.1f}MB). Max is {MAX_VIDEO_SIZE_MB}MB.")

    blob = bucket.blob(remote_path)
    blob.upload_from_filename(local_path)
    blob.make_public()
    return blob.public_url


def upload_json(data: dict, remote_path: str) -> str:
    """Upload a JSON dict directly to Firebase Storage."""
    blob = bucket.blob(remote_path)
    blob.upload_from_string(json.dumps(data, indent=2), content_type="application/json")
    blob.make_public()
    return blob.public_url


def upload_frame(frame_bytes: bytes, remote_path: str) -> str:
    """Upload a JPEG frame buffer to Firebase Storage."""
    blob = bucket.blob(remote_path)
    blob.upload_from_string(frame_bytes, content_type="image/jpeg")
    blob.make_public()
    return blob.public_url


def delete_session_files(session_id: str) -> int:
    """Delete all files in Firebase for a given session. Returns count of files deleted."""
    blobs = list(bucket.list_blobs(prefix=f"{session_id}/"))
    count = 0
    for blob in blobs:
        blob.delete()
        count += 1
    return count


def get_session_storage_size(session_id: str) -> float:
    """Get total storage used by a session in MB."""
    blobs = list(bucket.list_blobs(prefix=f"{session_id}/"))
    total_bytes = sum(blob.size or 0 for blob in blobs)
    return total_bytes / (1024 * 1024)


def list_session_files(session_id: str) -> list[dict]:
    """List all files stored for a session."""
    blobs = list(bucket.list_blobs(prefix=f"{session_id}/"))
    return [
        {
            "name": blob.name,
            "size_kb": round((blob.size or 0) / 1024, 1),
            "url": blob.public_url
        }
        for blob in blobs
    ]


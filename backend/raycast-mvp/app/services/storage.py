import os
import json
from pathlib import Path

import firebase_admin
from firebase_admin import credentials, storage

from app.services.config import FIREBASE_BUCKET

# Project root: backend/raycast-mvp (parent of app/)
_PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent


def _firebase_credentials_path() -> Path | None:
    """Resolve path to Firebase service account JSON (env or default filenames in project root)."""
    for key in ("FIREBASE_CREDENTIALS_PATH", "GOOGLE_APPLICATION_CREDENTIALS"):
        raw = os.getenv(key)
        if raw:
            p = Path(raw).expanduser()
            if not p.is_absolute():
                p = _PROJECT_ROOT / p
            if p.is_file():
                return p
    for name in ("firebase-key.json",):
        p = _PROJECT_ROOT / name
        if p.is_file():
            return p
    matches = sorted(_PROJECT_ROOT.glob("*firebase-adminsdk*.json"))
    if matches:
        return matches[0]
    return None


_bucket = None


def _get_bucket():
    """Lazily initialize Firebase so endpoints that don't need storage can still work."""
    global _bucket
    if _bucket is not None:
        return _bucket

    _cred_path = _firebase_credentials_path()
    if _cred_path is None:
        raise RuntimeError(
            "Firebase credentials JSON not found. Add your service account file under "
            "backend/raycast-mvp/ (e.g. rename/copy it to firebase-key.json) or set "
            "FIREBASE_CREDENTIALS_PATH in .env to the file path."
        )
    if not FIREBASE_BUCKET:
        raise RuntimeError("FIREBASE_BUCKET is not set in .env")

    cred = credentials.Certificate(str(_cred_path))
    firebase_admin.initialize_app(cred, {"storageBucket": FIREBASE_BUCKET})
    _bucket = storage.bucket()
    return _bucket

# ── Storage Limits ──
MAX_VIDEO_SIZE_MB = 50
MAX_TOTAL_STORAGE_PER_SESSION_MB = 200


def upload_file(local_path: str, remote_path: str) -> str:
    """Upload a file to Firebase Storage and return its public URL."""
    # Check file size
    size_mb = os.path.getsize(local_path) / (1024 * 1024)
    if size_mb > MAX_VIDEO_SIZE_MB:
        raise ValueError(f"File too large ({size_mb:.1f}MB). Max is {MAX_VIDEO_SIZE_MB}MB.")

    blob = _get_bucket().blob(remote_path)
    blob.upload_from_filename(local_path)
    blob.make_public()
    return blob.public_url


def upload_json(data: dict, remote_path: str) -> str:
    """Upload a JSON dict directly to Firebase Storage."""
    blob = _get_bucket().blob(remote_path)
    blob.upload_from_string(json.dumps(data, indent=2), content_type="application/json")
    blob.make_public()
    return blob.public_url


def upload_frame(frame_bytes: bytes, remote_path: str) -> str:
    """Upload a JPEG frame buffer to Firebase Storage."""
    blob = _get_bucket().blob(remote_path)
    blob.upload_from_string(frame_bytes, content_type="image/jpeg")
    blob.make_public()
    return blob.public_url


def delete_session_files(session_id: str) -> int:
    """Delete all files in Firebase for a given session. Returns count of files deleted."""
    blobs = list(_get_bucket().list_blobs(prefix=f"{session_id}/"))
    count = 0
    for blob in blobs:
        blob.delete()
        count += 1
    return count


def get_session_storage_size(session_id: str) -> float:
    """Get total storage used by a session in MB."""
    blobs = list(_get_bucket().list_blobs(prefix=f"{session_id}/"))
    total_bytes = sum(blob.size or 0 for blob in blobs)
    return total_bytes / (1024 * 1024)


def list_session_files(session_id: str) -> list[dict]:
    """List all files stored for a session."""
    blobs = list(_get_bucket().list_blobs(prefix=f"{session_id}/"))
    return [
        {
            "name": blob.name,
            "size_kb": round((blob.size or 0) / 1024, 1),
            "url": blob.public_url
        }
        for blob in blobs
    ]

def user_path(user_id: str, path: str) -> str:
    """Build a user-scoped Firebase storage path."""
    return f"users/{user_id}/{path}"
import time
import numpy as np
import cv2
from dataclasses import dataclass, field
from thefuzz import fuzz
from app.models.schemas import SceneDescription

SIMILARITY_THRESHOLD = 85
STALE_SESSION_SECONDS = 30 * 60

FRAME_DIFF_THRESHOLD = 0.92

@dataclass
class _SessionState:
    scene: SceneDescription
    last_updated: float = field(default_factory=time.time)
    last_frame_hash: np.ndarray | None = None


_sessions: dict[str, _SessionState] = {}


def _frame_hash(frame_bytes: bytes, hash_size: int = 16) -> np.ndarray:
    """Compute a perceptual hash (average hash) for a JPEG frame."""
    arr = np.frombuffer(frame_bytes, dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_GRAYSCALE)
    if img is None:
        return np.array([])
    resized = cv2.resize(img, (hash_size, hash_size), interpolation=cv2.INTER_AREA)
    mean_val = resized.mean()
    return (resized > mean_val).flatten().astype(np.uint8)


def frames_look_same(session_id: str, frame_bytes_list: list[bytes]) -> bool:
    """Fast pixel-level check: returns True if frames are visually similar to
    the last batch for this session. Runs before any API call to save cost."""
    if not frame_bytes_list:
        return False

    mid = frame_bytes_list[len(frame_bytes_list) // 2]
    current_hash = _frame_hash(mid)
    if current_hash.size == 0:
        return False

    state = _sessions.get(session_id)
    if state is None or state.last_frame_hash is None:
        return False

    if current_hash.shape != state.last_frame_hash.shape:
        return False

    similarity = np.mean(current_hash == state.last_frame_hash)
    return similarity >= FRAME_DIFF_THRESHOLD


def _update_frame_hash(session_id: str, frame_bytes_list: list[bytes]) -> None:
    """Store the perceptual hash of the middle frame for future comparisons."""
    if not frame_bytes_list:
        return
    mid = frame_bytes_list[len(frame_bytes_list) // 2]
    h = _frame_hash(mid)
    state = _sessions.get(session_id)
    if state is not None:
        state.last_frame_hash = h


def _objects_signature(scene: SceneDescription) -> str:
    """Stable string representation of the object list for comparison."""
    return ",".join(
        sorted(f"{o.label}:{o.count}" for o in scene.objects)
    )


def scene_changed(session_id: str, new_scene: SceneDescription,
                  frame_bytes_list: list[bytes] | None = None) -> bool:
    """Return True if the scene is meaningfully different from the last one stored for this session."""
    _purge_stale()

    prev = _sessions.get(session_id)
    if prev is None:
        _sessions[session_id] = _SessionState(scene=new_scene)
        if frame_bytes_list:
            _update_frame_hash(session_id, frame_bytes_list)
        return True

    summary_ratio = fuzz.ratio(prev.scene.scene_summary, new_scene.scene_summary)
    objects_same = _objects_signature(prev.scene) == _objects_signature(new_scene)

    if summary_ratio >= SIMILARITY_THRESHOLD and objects_same:
        prev.last_updated = time.time()
        if frame_bytes_list:
            _update_frame_hash(session_id, frame_bytes_list)
        return False

    _sessions[session_id] = _SessionState(scene=new_scene)
    if frame_bytes_list:
        _update_frame_hash(session_id, frame_bytes_list)
    return True


def clear_session(session_id: str) -> None:
    _sessions.pop(session_id, None)


def _purge_stale() -> None:
    now = time.time()
    stale = [
        sid for sid, state in _sessions.items()
        if now - state.last_updated > STALE_SESSION_SECONDS
    ]
    for sid in stale:
        del _sessions[sid]

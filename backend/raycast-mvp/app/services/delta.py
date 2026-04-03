import time
from dataclasses import dataclass, field
from thefuzz import fuzz
from app.models.schemas import SceneDescription

SIMILARITY_THRESHOLD = 85
STALE_SESSION_SECONDS = 30 * 60


@dataclass
class _SessionState:
    scene: SceneDescription
    last_updated: float = field(default_factory=time.time)


_sessions: dict[str, _SessionState] = {}


def _objects_signature(scene: SceneDescription) -> str:
    """Stable string representation of the object list for comparison."""
    return ",".join(
        sorted(f"{o.label}:{o.count}" for o in scene.objects)
    )


def scene_changed(session_id: str, new_scene: SceneDescription) -> bool:
    """Return True if the scene is meaningfully different from the last one stored for this session."""
    _purge_stale()

    prev = _sessions.get(session_id)
    if prev is None:
        _sessions[session_id] = _SessionState(scene=new_scene)
        return True

    summary_ratio = fuzz.ratio(prev.scene.scene_summary, new_scene.scene_summary)
    objects_same = _objects_signature(prev.scene) == _objects_signature(new_scene)

    if summary_ratio >= SIMILARITY_THRESHOLD and objects_same:
        prev.last_updated = time.time()
        return False

    _sessions[session_id] = _SessionState(scene=new_scene)
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

from datetime import datetime

# In-memory stores
sessions: dict = {}
archived_sessions: dict = {}  # Expired sessions land here

MAX_CHUNKS_PER_SESSION = 60
MAX_SESSION_DURATION = 600
CHUNK_FRAME_COUNT = 6
MAX_CHUNK_DURATION = 10


def create_session() -> str:
    # Archive any expired sessions before creating a new one
    archive_expired_sessions()

    session_id = f"session-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    sessions[session_id] = {
        "created_at": datetime.now(),
        "chunks": [],
        "chunk_count": 0
    }
    return session_id


def get_session(session_id: str) -> dict | None:
    return sessions.get(session_id)


def add_chunk(session_id: str, chunk_packet: dict):
    session = sessions.get(session_id)
    if not session:
        return

    session["chunks"].append(chunk_packet)
    session["chunk_count"] += 1

    if len(session["chunks"]) > 10:
        session["chunks"] = session["chunks"][-10:]


def is_session_expired(session_id: str) -> bool:
    session = sessions.get(session_id)
    if not session:
        return True
    elapsed = (datetime.now() - session["created_at"]).total_seconds()
    return elapsed > MAX_SESSION_DURATION


def is_session_full(session_id: str) -> bool:
    session = sessions.get(session_id)
    if not session:
        return True
    return session["chunk_count"] >= MAX_CHUNKS_PER_SESSION


def get_recent_context(session_id: str, n: int = 3) -> list[dict]:
    session = sessions.get(session_id)
    if not session:
        return []
    return session["chunks"][-n:]


def delete_session(session_id: str):
    sessions.pop(session_id, None)
    archived_sessions.pop(session_id, None)


def archive_expired_sessions() -> list[str]:
    """Move expired sessions to the archive instead of deleting them."""
    expired = [sid for sid in sessions if is_session_expired(sid)]
    for sid in expired:
        session = sessions.pop(sid)
        archived_sessions[sid] = {
            "created_at": session["created_at"],
            "chunk_count": session["chunk_count"],
            "archived_at": datetime.now()
        }
    return expired


def get_all_sessions() -> dict:
    return {
        sid: {
            "created_at": s["created_at"].isoformat(),
            "chunk_count": s["chunk_count"],
            "expired": is_session_expired(sid),
            "status": "active"
        }
        for sid, s in sessions.items()
    }


def get_archived_sessions() -> dict:
    return {
        sid: {
            "created_at": s["created_at"].isoformat(),
            "chunk_count": s["chunk_count"],
            "archived_at": s["archived_at"].isoformat(),
            "status": "archived"
        }
        for sid, s in archived_sessions.items()
    }
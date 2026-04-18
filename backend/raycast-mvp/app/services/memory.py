"""Per-session rolling memory for the reasoning agent.

Stores the last N scene summaries and agent responses so that
subsequent analysis cycles can reference what the agent already saw
and said.  Pattern mirrors delta.py (in-memory dict, auto-purge).
"""

import time
from dataclasses import dataclass, field

MAX_TURNS = 5
STALE_SESSION_SECONDS = 30 * 60


@dataclass
class MemoryTurn:
    scene_summary: str
    analysis_text: str
    timestamp: float = field(default_factory=time.time)


@dataclass
class _SessionMemory:
    turns: list[MemoryTurn] = field(default_factory=list)
    last_updated: float = field(default_factory=time.time)


_sessions: dict[str, _SessionMemory] = {}


def _purge_stale() -> None:
    now = time.time()
    stale = [
        sid for sid, mem in _sessions.items()
        if now - mem.last_updated > STALE_SESSION_SECONDS
    ]
    for sid in stale:
        del _sessions[sid]


def store_turn(session_id: str, scene_summary: str, analysis_text: str) -> None:
    """Append a new turn to the session's memory, keeping at most MAX_TURNS."""
    _purge_stale()
    mem = _sessions.setdefault(session_id, _SessionMemory())
    mem.turns.append(MemoryTurn(
        scene_summary=scene_summary,
        analysis_text=analysis_text,
    ))
    if len(mem.turns) > MAX_TURNS:
        mem.turns = mem.turns[-MAX_TURNS:]
    mem.last_updated = time.time()


def get_history(session_id: str) -> list[MemoryTurn]:
    """Return the stored turns for a session (empty list if none)."""
    _purge_stale()
    mem = _sessions.get(session_id)
    if mem is None:
        return []
    mem.last_updated = time.time()
    return list(mem.turns)


def format_history_for_prompt(session_id: str) -> str:
    """Build a concise text block summarising recent turns for injection
    into the system prompt.  Returns empty string if no history."""
    turns = get_history(session_id)
    if not turns:
        return ""

    lines = ["[Recent history — what you saw and said previously]"]
    for i, t in enumerate(turns, 1):
        lines.append(f"  Turn {i}: Scene: {t.scene_summary}")
        lines.append(f"           You said: {t.analysis_text}")
    lines.append("[End of history — use this context to avoid repetition and to note changes]")
    return "\n".join(lines)


def clear_session(session_id: str) -> None:
    _sessions.pop(session_id, None)

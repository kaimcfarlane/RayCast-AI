import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()


def _openai_responses_model(env_key: str, default: str) -> str:
    """Per-route env wins; else optional OPENAI_MODEL blanket override; else default."""
    specific = os.getenv(env_key, "").strip()
    if specific:
        return specific
    blanket = os.getenv("OPENAI_MODEL", "").strip()
    if blanket:
        return blanket
    return default


# Responses API — tuned per use case (override individually or set OPENAI_MODEL for all).
# Live /analyze-stream: latency-sensitive multimodal → mini
OPENAI_STREAM_MODEL = _openai_responses_model("OPENAI_STREAM_MODEL", "gpt-5.4-mini")
# Standalone scene JSON from frames (e.g. video pipeline): favor quality
OPENAI_SCENE_MODEL = _openai_responses_model("OPENAI_SCENE_MODEL", "gpt-5.4")
# Text-only reasoning on an existing SceneDescription
OPENAI_REASON_MODEL = _openai_responses_model("OPENAI_REASON_MODEL", "gpt-5.4-mini")
# Conversational chat
OPENAI_CHAT_MODEL = _openai_responses_model("OPENAI_CHAT_MODEL", "gpt-5.4-mini")

# Transcription / speech endpoints only support dedicated models (not gpt-5.x Responses IDs).
OPENAI_TRANSCRIBE_MODEL = os.getenv("OPENAI_TRANSCRIBE_MODEL", "gpt-4o-mini-transcribe")
OPENAI_TTS_MODEL = os.getenv("OPENAI_TTS_MODEL", "gpt-4o-mini-tts")

FFMPEG_PATH = os.getenv("FFMPEG_PATH", "ffmpeg")
FIREBASE_BUCKET = os.getenv("FIREBASE_BUCKET")

_client: OpenAI | None = None

def get_openai_client() -> OpenAI:
    """
    Lazily create the OpenAI client.
    This allows /mock and /health to work without OPENAI_API_KEY set.
    """
    global _client
    if _client is not None:
        return _client

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError(
            "OPENAI_API_KEY is not set. Create backend/raycast-mvp/.env with OPENAI_API_KEY=... "
            "to use /analyze-video."
        )

    _client = OpenAI(api_key=api_key)
    return _client
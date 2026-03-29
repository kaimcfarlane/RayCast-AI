import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

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
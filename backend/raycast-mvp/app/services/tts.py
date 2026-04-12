from app.services.config import get_openai_client, OPENAI_TTS_MODEL


def generate_speech(text: str, voice: str = "alloy") -> bytes:
    """Convert text to MP3 audio using OpenAI TTS. Returns raw MP3 bytes."""
    client = get_openai_client()
    response = client.audio.speech.create(
        model=OPENAI_TTS_MODEL,
        voice=voice,
        input=text,
        response_format="mp3",
    )
    return response.content

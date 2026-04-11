import subprocess
from app.services.config import get_openai_client, FFMPEG_PATH, OPENAI_TRANSCRIBE_MODEL

def extract_audio(video_path: str, wav_path: str = "outputs/test.wav") -> str:
    """Extract audio track from video as 16kHz mono WAV."""
    result = subprocess.run(
        [FFMPEG_PATH, "-y", "-i", video_path, "-vn", "-ac", "1", "-ar", "16000", wav_path],
        capture_output=True,
        text=True
    )
    if result.returncode != 0:
        raise ValueError(f"Failed to extract audio: {result.stderr}")
    return wav_path


def transcribe_audio(wav_path: str) -> str:
    """Transcribe WAV file using OpenAI STT."""
    with open(wav_path, "rb") as f:
        client = get_openai_client()
        transcript = client.audio.transcriptions.create(
            model=OPENAI_TRANSCRIBE_MODEL,
            file=f,
        )
    return transcript.text
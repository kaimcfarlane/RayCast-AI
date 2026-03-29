import os
import subprocess
from app.services.config import FFMPEG_PATH


def split_video(video_path: str, chunk_duration: int = 5, output_dir: str = "outputs/chunks") -> list[str]:
    """Split a video into chunks of specified duration (seconds). Returns list of chunk file paths."""
    os.makedirs(output_dir, exist_ok=True)

    # Get video duration
    import cv2
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS) or 30
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = total_frames / fps
    cap.release()

    chunk_paths = []
    start = 0
    i = 0

    while start < duration:
        chunk_path = os.path.join(output_dir, f"chunk_{i}.mp4")
        result = subprocess.run(
            [FFMPEG_PATH, "-y", "-i", video_path, "-ss", str(start), "-t", str(chunk_duration), "-c", "copy", chunk_path],
            capture_output=True, text=True
        )
        if result.returncode != 0:
            break

        # Only add if the file was actually created and has content
        if os.path.exists(chunk_path) and os.path.getsize(chunk_path) > 0:
            chunk_paths.append(chunk_path)

        start += chunk_duration
        i += 1

    return chunk_paths
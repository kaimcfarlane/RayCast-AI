import json, shutil, os, webbrowser
from datetime import datetime
from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.services.vision import extract_frames, scene_description
from app.services.audio import extract_audio, transcribe_audio
from app.models.schemas import ContextPacket


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: open Swagger UI in default browser
    port = int(os.getenv("PORT", "8000"))
    webbrowser.open(f"http://127.0.0.1:{port}/docs")
    yield
    # Shutdown (if needed later)


server = FastAPI(title="RayCast AI", version="0.1.0", lifespan=lifespan)

# CORS — allow React Native app to connect
server.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this later
    allow_methods=["*"],
    allow_headers=["*"],
)

FRAME_INTERVAL = 6


@server.get("/")
def root():
    return {
        "message": "RayCast AI API",
        "version": "0.1.0",
        "docs": "/docs",
        "health": "/health",
        "analyze": "POST /analyze-video",
        "mock": "GET /mock",
    }


@server.get("/health")
def health():
    return {"status": "ok", "version": "0.1.0"}


@server.post("/analyze-video", response_model=ContextPacket)
async def analyze_video(file: UploadFile = File(...)):
    """Accept a video upload, run perception pipeline, return Context Packet."""

    # Save uploaded file temporarily
    temp_video = f"outputs/temp_{file.filename}"
    try:
        with open(temp_video, "wb") as f:
            shutil.copyfileobj(file.file, f)

        # Vision
        frames = extract_frames(temp_video, FRAME_INTERVAL)
        scene = scene_description(frames)

        # Audio
        wav_path = extract_audio(temp_video)
        transcript = transcribe_audio(wav_path)

        packet = ContextPacket(
            session_id=f"session-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            source_type="video",
            video_file_name=file.filename,
            frame_interval=FRAME_INTERVAL,
            timestamp=datetime.now().isoformat(),
            scene=scene,
            transcript=transcript
        )

        # Save for debugging
        with open("outputs/context_packet.json", "w") as f:
            json.dump(packet.model_dump(), f, indent=2)

        return packet

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        # Clean up temp files
        if os.path.exists(temp_video):
            os.remove(temp_video)


@server.get("/mock")
def mock_context():
    """Return a hardcoded Context Packet so frontend can develop independently."""
    return {
        "session_id": "mock-001",
        "source_type": "video",
        "video_file_name": "mock.mp4",
        "frame_interval": 6,
        "timestamp": datetime.now().isoformat(),
        "scene": {
            "scene_summary": "A room with a desk, monitor, and LED lights.",
            "objects": [{"label": "monitor", "count": 1}, {"label": "desk", "count": 1}],
            "text_in_scene": [],
            "key_details": ["LED ambient lighting", "Gaming setup visible"],
            "uncertainties": ["Unclear items on shelf"]
        },
        "transcript": "This is a mock transcript for frontend testing."
    }
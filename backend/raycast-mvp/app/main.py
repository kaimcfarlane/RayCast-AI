import base64, json, shutil, os, webbrowser
from datetime import datetime
from contextlib import asynccontextmanager
from typing import Annotated
from fastapi import FastAPI, Form, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.services.vision import extract_frames, scene_description
from app.services.audio import extract_audio, transcribe_audio
from app.services.reasoning import reason
from app.services.tts import generate_speech
from app.services.delta import scene_changed
from app.models.schemas import ContextPacket, SceneDescription, StreamAnalysisResponse


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
        "analyze_video": "POST /analyze-video",
        "analyze_stream": "POST /analyze-stream",
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


VALID_TASK_MODES = {"chess", "navigate", "findObject", "readText", "describe", "general"}


@server.post("/analyze-stream", response_model=StreamAnalysisResponse)
async def analyze_stream(
    task_mode: Annotated[str, Form()],
    session_id: Annotated[str, Form()],
    frames: list[UploadFile] = File(...),
):
    """Accept JPEG frames from a live stream, run perception + reasoning pipeline.

    Returns analysis text and TTS audio only when the scene has changed.
    """
    if task_mode not in VALID_TASK_MODES:
        raise HTTPException(status_code=422, detail=f"Invalid task_mode: {task_mode}")

    if not frames or len(frames) > 12:
        raise HTTPException(status_code=422, detail="Provide 1-12 JPEG frames")

    try:
        frame_bytes: list[bytes] = []
        for f in frames:
            data = await f.read()
            if data and len(data) > 100:
                frame_bytes.append(data)

        if not frame_bytes:
            raise HTTPException(
                status_code=422,
                detail=f"No valid frames received ({len(frames)} uploads, all empty or too small)",
            )

        scene_dict = scene_description(frame_bytes)
        scene = SceneDescription(**scene_dict)

        changed = scene_changed(session_id, scene)

        analysis_text: str | None = None
        audio_b64: str | None = None

        if changed:
            analysis_text = reason(scene, task_mode)
            audio_bytes = generate_speech(analysis_text)
            audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")

        return StreamAnalysisResponse(
            session_id=session_id,
            changed=changed,
            scene=scene if changed else None,
            analysis_text=analysis_text,
            audio_base64=audio_b64,
            task_mode=task_mode,
            timestamp=datetime.now().isoformat(),
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


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
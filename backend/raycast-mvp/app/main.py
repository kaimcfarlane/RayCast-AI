import asyncio
import base64, json, shutil, os, webbrowser, time, logging
from datetime import datetime
from fastapi.responses import HTMLResponse
from pathlib import Path
from contextlib import asynccontextmanager
from typing import Annotated
from app.services.reasoning import reason, chat as chat_reason, perceive_and_reason
from app.services.tts import generate_speech
from app.services.delta import scene_changed, frames_look_same
from app.models.schemas import ContextPacket, SceneDescription, StreamAnalysisResponse, ChatResponse
from fastapi import FastAPI, UploadFile, File, HTTPException, Query, Depends, Form
from fastapi.middleware.cors import CORSMiddleware
from app.services.vision import extract_frames, scene_description
from app.services.audio import extract_audio, transcribe_audio
from app.services.storage import (
    upload_file, upload_json, upload_frame,
    delete_session_files, get_session_storage_size, list_session_files,
    user_path, MAX_VIDEO_SIZE_MB
)
from app.services.video import split_video
from app.services.session import (
    create_session, add_chunk, get_session, is_session_expired,
    is_session_full, get_recent_context, delete_session,
    get_all_sessions, archive_expired_sessions, get_archived_sessions,
    CHUNK_FRAME_COUNT, MAX_CHUNK_DURATION
)
from app.services.auth import verify_token, get_user_id
import cv2

logger = logging.getLogger("raycast")


@asynccontextmanager
async def lifespan(app: FastAPI):
    port = int(os.getenv("PORT", "8000"))
    webbrowser.open(f"http://127.0.0.1:{port}/docs")
    yield


# ── App Setup ──
server = FastAPI(
    title="RayCast AI",
    description="Backend API for the RayCast AI multimodal smart glasses assistant. "
                "Processes video and audio into structured Context Packets for real-time assistance.",
    version="0.1.0",
    lifespan=lifespan,
    docs_url=None,  # Disable default docs
    openapi_tags=[
        {"name": "General", "description": "Health checks and API info"},
        {"name": "Auth", "description": "User authentication info"},
        {"name": "Video Analysis", "description": "Upload and process full video files (requires auth)"},
        {"name": "Streaming", "description": "Session-based chunked video processing (requires auth)"},
        {"name": "Storage", "description": "Firebase storage management and cleanup (requires auth)"},
        {"name": "Testing", "description": "Mock endpoints for frontend development"},
    ]
)

@server.get("/docs", include_in_schema=False)
async def custom_docs():
    html = Path("app/static/docs.html").read_text()
    return HTMLResponse(content=html)

    
server.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

FRAME_INTERVAL = 10


# ══════════════════════════════════════════════
#  GENERAL (no auth required)
# ══════════════════════════════════════════════

@server.get("/", tags=["General"])
def root():
    """API root — shows available endpoints."""
    return {
        "message": "RayCast AI API",
        "version": "0.1.0",
        "docs": "/docs",
        "health": "/health",
        "analyze_video": "POST /analyze-video",
        "analyze_stream": "POST /analyze-stream",
        "analyze_stream_full": "POST /analyze-stream-full",
        "mock": "GET /mock",
        "endpoints": {
            "docs": "GET /docs",
            "health": "GET /health",
            "analyze_video": "POST /analyze-video",
            "analyze_stream": "POST /analyze-stream (live frames, no auth)",
            "analyze_stream_full": "POST /analyze-stream-full (full video, auth required)",
            "analyze_chunk": "POST /analyze-chunk",
            "session_start": "POST /session/start",
            "mock": "GET /mock"
        }
    }


@server.get("/health", tags=["General"])
def health():
    """Health check — returns API status and version."""
    return {"status": "ok", "version": "0.1.0"}


# ══════════════════════════════════════════════
#  AUTH
# ══════════════════════════════════════════════

@server.get("/me", tags=["Auth"])
def get_current_user(token: dict = Depends(verify_token)):
    """Returns the authenticated user's info. Tests that auth is working."""
    return {
        "uid": token.get("uid"),
        "email": token.get("email"),
        "name": token.get("name"),
        "provider": token.get("firebase", {}).get("sign_in_provider")
    }


# ══════════════════════════════════════════════
#  VIDEO ANALYSIS (auth required)
# ══════════════════════════════════════════════

@server.post("/analyze-video", tags=["Video Analysis"])
async def analyze_video(
    file: UploadFile = File(...),
    token: dict = Depends(verify_token)
):
    """Upload a full video file. Extracts frames + audio, runs scene analysis and transcription,
    uploads everything to Firebase under the user's storage, and returns a complete Context Packet."""

    user_id = get_user_id(token)
    session_id = f"session-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    temp_video = f"outputs/temp_{file.filename}"
    wav_path = "outputs/temp_audio.wav"

    try:
        with open(temp_video, "wb") as f:
            shutil.copyfileobj(file.file, f)

        frames = extract_frames(temp_video, FRAME_INTERVAL)
        scene = scene_description(frames)

        wav_path = extract_audio(temp_video, wav_path)
        transcript = transcribe_audio(wav_path)

        video_url = upload_file(temp_video, user_path(user_id, f"{session_id}/video/{file.filename}"))
        audio_url = upload_file(wav_path, user_path(user_id, f"{session_id}/audio/audio.wav"))

        frame_urls = []
        for i, frame_bytes in enumerate(frames):
            frame_url = upload_frame(frame_bytes, user_path(user_id, f"{session_id}/frames/frame_{i}.jpg"))
            frame_urls.append(frame_url)

        packet = {
            "user_id": user_id,
            "session_id": session_id,
            "source_type": "video",
            "video_file_name": file.filename,
            "frame_interval": FRAME_INTERVAL,
            "timestamp": datetime.now().isoformat(),
            "scene": scene,
            "transcript": transcript,
            "storage": {
                "video_url": video_url,
                "audio_url": audio_url,
                "frame_urls": frame_urls
            }
        }

        packet_url = upload_json(packet, user_path(user_id, f"{session_id}/context_packet.json"))
        packet["storage"]["packet_url"] = packet_url

        with open("outputs/context_packet.json", "w") as f:
            json.dump(packet, f, indent=2)

        return packet

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if os.path.exists(temp_video):
            os.remove(temp_video)
        if os.path.exists(wav_path):
            os.remove(wav_path)


@server.post("/analyze-stream-full", tags=["Video Analysis"])
async def analyze_stream_full(
    file: UploadFile = File(...),
    chunk_duration: int = Query(default=5, ge=2, le=10, description="Duration of each chunk in seconds"),
    token: dict = Depends(verify_token)
):
    """Upload a full video and automatically split it into chunks for processing.
    Each chunk gets its own scene analysis, transcription, and Firebase upload under the user's storage."""

    user_id = get_user_id(token)
    session_id = create_session()
    temp_video = f"outputs/stream_temp_{file.filename}"

    try:
        with open(temp_video, "wb") as f:
            shutil.copyfileobj(file.file, f)

        chunk_paths = split_video(temp_video, chunk_duration)

        if not chunk_paths:
            raise HTTPException(status_code=400, detail="Could not split video into chunks")

        all_packets = []

        for i, chunk_path in enumerate(chunk_paths):
            wav_path = f"outputs/stream_chunk_{i}.wav"

            try:
                frames = extract_frames(chunk_path, CHUNK_FRAME_COUNT)
                scene = scene_description(frames)

                wav_path = extract_audio(chunk_path, wav_path)
                transcript = transcribe_audio(wav_path)

                video_url = upload_file(chunk_path, user_path(user_id, f"{session_id}/chunks/{i}/video.mp4"))
                audio_url = upload_file(wav_path, user_path(user_id, f"{session_id}/chunks/{i}/audio.wav"))

                frame_urls = []
                for j, frame_bytes in enumerate(frames):
                    url = upload_frame(frame_bytes, user_path(user_id, f"{session_id}/chunks/{i}/frame_{j}.jpg"))
                    frame_urls.append(url)

                packet = {
                    "user_id": user_id,
                    "session_id": session_id,
                    "chunk_index": i,
                    "source_type": "chunk",
                    "timestamp": datetime.now().isoformat(),
                    "scene": scene,
                    "transcript": transcript,
                    "storage": {
                        "video_url": video_url,
                        "audio_url": audio_url,
                        "frame_urls": frame_urls
                    }
                }

                packet_url = upload_json(packet, user_path(user_id, f"{session_id}/chunks/{i}/chunk_packet.json"))
                packet["storage"]["packet_url"] = packet_url

                add_chunk(session_id, packet)
                all_packets.append(packet)

            finally:
                if os.path.exists(wav_path):
                    os.remove(wav_path)
                if os.path.exists(chunk_path):
                    os.remove(chunk_path)

        return {
            "user_id": user_id,
            "session_id": session_id,
            "total_chunks": len(all_packets),
            "packets": all_packets
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if os.path.exists(temp_video):
            os.remove(temp_video)


# ══════════════════════════════════════════════
#  STREAMING (SESSION-BASED, auth required)
# ══════════════════════════════════════════════

@server.post("/session/start", tags=["Streaming"])
def start_session(token: dict = Depends(verify_token)):
    """Start a new streaming session. Returns a session_id to use with /analyze-chunk."""
    user_id = get_user_id(token)
    session_id = create_session()
    return {
        "user_id": user_id,
        "session_id": session_id,
        "status": "active",
        "limits": {
            "max_chunk_duration_seconds": MAX_CHUNK_DURATION,
            "max_chunks": 60,
            "max_session_duration_seconds": 600,
            "max_file_size_mb": MAX_VIDEO_SIZE_MB
        },
        "message": "Session started. Send chunks to POST /analyze-chunk with this session_id."
    }


@server.get("/session/all", tags=["Streaming"])
def all_sessions(token: dict = Depends(verify_token)):
    """List all active sessions and their status."""
    return {"sessions": get_all_sessions()}


@server.get("/session/{session_id}", tags=["Streaming"])
def session_status(session_id: str, token: dict = Depends(verify_token)):
    """Check the status, chunk count, and expiry of a session."""
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return {
        "session_id": session_id,
        "chunk_count": session["chunk_count"],
        "expired": is_session_expired(session_id),
        "full": is_session_full(session_id),
        "created_at": session["created_at"].isoformat()
    }


@server.get("/session/{session_id}/history", tags=["Streaming"])
def session_history(session_id: str, token: dict = Depends(verify_token)):
    """Get the recent chunk packets from a session (last 10 kept in memory)."""
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"session_id": session_id, "chunks": session["chunks"]}


@server.delete("/session/{session_id}", tags=["Streaming"])
def end_session(
    session_id: str,
    delete_files: bool = Query(default=False, description="Also delete Firebase files"),
    token: dict = Depends(verify_token)
):
    """End a session. Optionally delete all associated Firebase files."""
    user_id = get_user_id(token)
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    files_deleted = 0
    if delete_files:
        files_deleted = delete_session_files(user_path(user_id, session_id))

    delete_session(session_id)
    return {
        "session_id": session_id,
        "status": "ended",
        "firebase_files_deleted": files_deleted
    }


@server.post("/analyze-chunk", tags=["Streaming"])
async def analyze_chunk(
    session_id: str = Query(..., description="Session ID from POST /session/start"),
    file: UploadFile = File(...),
    token: dict = Depends(verify_token)
):
    """Process a short video chunk (up to 10 sec) within an active session.
    Extracts frames + audio, runs analysis, uploads to Firebase under the user's storage."""

    user_id = get_user_id(token)
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found. Call POST /session/start first.")
    if is_session_expired(session_id):
        raise HTTPException(status_code=410, detail="Session expired (max 10 minutes).")
    if is_session_full(session_id):
        raise HTTPException(status_code=429, detail="Session full (max chunks reached).")

    temp_video = f"outputs/chunk_temp_{file.filename}"
    wav_path = "outputs/chunk_temp_audio.wav"
    chunk_index = session["chunk_count"]

    try:
        with open(temp_video, "wb") as f:
            shutil.copyfileobj(file.file, f)

        cap = cv2.VideoCapture(temp_video)
        fps = cap.get(cv2.CAP_PROP_FPS) or 30
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration = total_frames / fps
        cap.release()

        if duration > MAX_CHUNK_DURATION:
            raise HTTPException(
                status_code=400,
                detail=f"Chunk too long ({duration:.1f}s). Max is {MAX_CHUNK_DURATION}s."
            )

        frames = extract_frames(temp_video, CHUNK_FRAME_COUNT)
        scene = scene_description(frames)

        wav_path = extract_audio(temp_video, wav_path)
        transcript = transcribe_audio(wav_path)

        video_url = upload_file(temp_video, user_path(user_id, f"{session_id}/chunks/{chunk_index}/video.mp4"))
        audio_url = upload_file(wav_path, user_path(user_id, f"{session_id}/chunks/{chunk_index}/audio.wav"))

        frame_urls = []
        for i, frame_bytes in enumerate(frames):
            url = upload_frame(frame_bytes, user_path(user_id, f"{session_id}/chunks/{chunk_index}/frame_{i}.jpg"))
            frame_urls.append(url)

        packet = {
            "user_id": user_id,
            "session_id": session_id,
            "chunk_index": chunk_index,
            "source_type": "chunk",
            "timestamp": datetime.now().isoformat(),
            "duration_seconds": round(duration, 2),
            "scene": scene,
            "transcript": transcript,
            "storage": {
                "video_url": video_url,
                "audio_url": audio_url,
                "frame_urls": frame_urls
            }
        }

        packet_url = upload_json(packet, user_path(user_id, f"{session_id}/chunks/{chunk_index}/chunk_packet.json"))
        packet["storage"]["packet_url"] = packet_url

        add_chunk(session_id, packet)

        return packet

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if os.path.exists(temp_video):
            os.remove(temp_video)
        if os.path.exists(wav_path):
            os.remove(wav_path)


# ══════════════════════════════════════════════
#  STORAGE MANAGEMENT (auth required)
# ══════════════════════════════════════════════

@server.get("/storage/archived", tags=["Storage"])
def archived_sessions_list(token: dict = Depends(verify_token)):
    """View all expired sessions. Firebase files are still available until you manually delete them."""
    archived = get_archived_sessions()
    return {
        "archived_count": len(archived),
        "sessions": archived,
        "hint": "Use DELETE /storage/{session_id} to remove files you no longer need."
    }


@server.get("/storage/archived/{session_id}", tags=["Storage"])
def archived_session_files(session_id: str, token: dict = Depends(verify_token)):
    """View all Firebase files for an archived session — handy for showing teammates."""
    user_id = get_user_id(token)
    files = list_session_files(user_path(user_id, session_id))
    total_mb = get_session_storage_size(user_path(user_id, session_id))
    return {
        "session_id": session_id,
        "status": "archived",
        "total_size_mb": round(total_mb, 2),
        "file_count": len(files),
        "files": files
    }


@server.post("/storage/cleanup", tags=["Storage"])
def cleanup_storage(token: dict = Depends(verify_token)):
    """Archive expired sessions and clean up their Firebase files."""
    user_id = get_user_id(token)
    expired = archive_expired_sessions()
    total_deleted = 0
    for sid in expired:
        total_deleted += delete_session_files(user_path(user_id, sid))
    return {
        "expired_sessions_cleaned": len(expired),
        "firebase_files_deleted": total_deleted
    }


@server.get("/storage/{session_id}", tags=["Storage"])
def storage_info(session_id: str, token: dict = Depends(verify_token)):
    """View all files stored in Firebase for a session, with sizes and URLs."""
    user_id = get_user_id(token)
    files = list_session_files(user_path(user_id, session_id))
    total_mb = get_session_storage_size(user_path(user_id, session_id))
    return {
        "session_id": session_id,
        "total_size_mb": round(total_mb, 2),
        "file_count": len(files),
        "files": files
    }


@server.delete("/storage/{session_id}", tags=["Storage"])
def delete_storage(session_id: str, token: dict = Depends(verify_token)):
    """Delete all Firebase files for a session."""
    user_id = get_user_id(token)
    count = delete_session_files(user_path(user_id, session_id))
    return {
        "session_id": session_id,
        "files_deleted": count,
        "status": "cleaned"
    }


# ══════════════════════════════════════════════
#  TESTING (no auth required)
# ══════════════════════════════════════════════

VALID_TASK_MODES = {"chess", "navigate", "findObject", "readText", "describe", "general"}


@server.post("/analyze-stream", response_model=StreamAnalysisResponse)
async def analyze_stream(
    task_mode: Annotated[str, Form()],
    session_id: Annotated[str, Form()],
    frames: list[UploadFile] = File(...),
):
    """Optimized live-stream analysis pipeline.

    Improvements over v1:
    - Fast frame-diff pre-check skips API calls when nothing visually changed
    - Single-pass perceive_and_reason() merges vision + reasoning into one API call
    - TTS runs in a background thread concurrently where possible
    """
    t_start = time.perf_counter()

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

        t_read = time.perf_counter()

        if frames_look_same(session_id, frame_bytes):
            elapsed = time.perf_counter() - t_start
            logger.info(f"[stream] SKIP (frame-diff) session={session_id} total={elapsed:.2f}s")
            return StreamAnalysisResponse(
                session_id=session_id,
                changed=False,
                scene=None,
                analysis_text=None,
                audio_base64=None,
                task_mode=task_mode,
                timestamp=datetime.now().isoformat(),
            )

        t_diff = time.perf_counter()

        result = await asyncio.to_thread(perceive_and_reason, frame_bytes, task_mode)
        scene = SceneDescription(**result["scene"])
        analysis_text: str = result["analysis_text"]

        t_perceive = time.perf_counter()

        changed = scene_changed(session_id, scene, frame_bytes)

        if not changed:
            elapsed = time.perf_counter() - t_start
            logger.info(
                f"[stream] SKIP (delta) session={session_id} "
                f"perceive={t_perceive - t_diff:.2f}s total={elapsed:.2f}s"
            )
            return StreamAnalysisResponse(
                session_id=session_id,
                changed=False,
                scene=None,
                analysis_text=None,
                audio_base64=None,
                task_mode=task_mode,
                timestamp=datetime.now().isoformat(),
            )

        audio_bytes = await asyncio.to_thread(generate_speech, analysis_text)
        audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")

        t_tts = time.perf_counter()

        elapsed = t_tts - t_start
        logger.info(
            f"[stream] OK session={session_id} mode={task_mode} "
            f"read={t_read - t_start:.2f}s diff={t_diff - t_read:.2f}s "
            f"perceive={t_perceive - t_diff:.2f}s tts={t_tts - t_perceive:.2f}s "
            f"total={elapsed:.2f}s"
        )

        return StreamAnalysisResponse(
            session_id=session_id,
            changed=True,
            scene=scene,
            analysis_text=analysis_text,
            audio_base64=audio_b64,
            task_mode=task_mode,
            timestamp=datetime.now().isoformat(),
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"[stream] ERROR session={session_id}")
        raise HTTPException(status_code=500, detail=str(e))


@server.post("/chat", response_model=ChatResponse)
async def chat_endpoint(
    user_text: Annotated[str, Form()],
    session_id: Annotated[str, Form()],
    frames: list[UploadFile] = File(default=[]),
):
    """Conversational chat with optional visual context from glasses frames.

    Sends user speech text + optional scene to the reasoning agent and returns
    a text response with TTS audio.
    """
    t_start = time.perf_counter()
    try:
        scene: SceneDescription | None = None

        frame_bytes: list[bytes] = []
        for f in frames:
            data = await f.read()
            if data and len(data) > 100:
                frame_bytes.append(data)

        if frame_bytes:
            scene_dict = await asyncio.to_thread(scene_description, frame_bytes)
            scene = SceneDescription(**scene_dict)

        response_text = await asyncio.to_thread(chat_reason, user_text, scene)
        audio_bytes = await asyncio.to_thread(generate_speech, response_text)
        audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")

        elapsed = time.perf_counter() - t_start
        logger.info(f"[chat] OK session={session_id} total={elapsed:.2f}s")

        return ChatResponse(
            session_id=session_id,
            response_text=response_text,
            audio_base64=audio_b64,
            timestamp=datetime.now().isoformat(),
        )

    except Exception as e:
        logger.exception(f"[chat] ERROR session={session_id}")
        raise HTTPException(status_code=500, detail=str(e))


@server.get("/mock", tags=["Testing"])
def mock_context():
    """Returns a hardcoded Context Packet for frontend development.
    Response shape matches /analyze-video output exactly."""
    return {
        "user_id": "mock-user-001",
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
        "transcript": "This is a mock transcript for frontend testing.",
        "storage": {
            "video_url": "https://mock-url.com/video.mp4",
            "audio_url": "https://mock-url.com/audio.wav",
            "frame_urls": ["https://mock-url.com/frame_0.jpg"],
            "packet_url": "https://mock-url.com/context_packet.json"
        }
    }
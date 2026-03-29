# RayCast AI — Backend

The backend perception pipeline and API server for RayCast AI, a multimodal AI glasses assistant that processes POV video and audio into structured context for real-time assistance.

## What This Does

Takes video input → extracts frames + audio → sends frames to a vision model for scene analysis → transcribes the audio → combines everything into a **Context Packet** → uploads all files to Firebase Storage.

```
Video Input
  ├── Frames (OpenCV) ──→ Vision Model (GPT-4o-mini) ──→ Scene Description JSON
  └── Audio  (FFmpeg)  ──→ STT (gpt-4o-mini-transcribe) ──→ Transcript
                                                                 ↓
                                                          Context Packet
                                                                 ↓
                                                        Firebase Storage
```

Supports three modes of input:
- **Full video upload** — process an entire video at once
- **Stream mode** — upload a full video that gets auto-split into chunks and processed sequentially
- **Chunk mode** — send individual 3-10 second clips within a managed session (designed for live streaming)

## Context Packet Schema

The Context Packet is the core data contract. Every processed video or chunk returns this shape:

```json
{
  "session_id": "session-20260328150000",
  "source_type": "video",
  "video_file_name": "test.mp4",
  "frame_interval": 10,
  "timestamp": "2026-03-28T15:00:00.000000",
  "scene": {
    "scene_summary": "A cozy room with a black dresser and a TV displaying a broadcast.",
    "objects": [
      { "label": "dresser", "count": 1 },
      { "label": "TV", "count": 1 }
    ],
    "text_in_scene": [
      { "text": "Five Nights at Freddy's", "confidence": 0.85 }
    ],
    "key_details": [
      "Warm ambient lighting from red LED lights",
      "Wall decorations present"
    ],
    "uncertainties": [
      "Unclear content on TV"
    ]
  },
  "transcript": "This is a test video. I am currently testing the audio for my side of the project.",
  "storage": {
    "video_url": "https://storage.googleapis.com/.../video.mp4",
    "audio_url": "https://storage.googleapis.com/.../audio.wav",
    "frame_urls": ["https://storage.googleapis.com/.../frame_0.jpg"],
    "packet_url": "https://storage.googleapis.com/.../context_packet.json"
  }
}
```

## Project Structure

```
backend/raycast-mvp/
├── app/
│   ├── __init__.py
│   ├── main.py                # FastAPI server + all route definitions
│   ├── services/
│   │   ├── __init__.py
│   │   ├── config.py          # Shared OpenAI client + env config
│   │   ├── vision.py          # Frame extraction + scene description
│   │   ├── audio.py           # Audio extraction + transcription
│   │   ├── video.py           # Video splitting for stream/chunk processing
│   │   ├── storage.py         # Firebase Storage upload, delete, list
│   │   └── session.py         # In-memory session management + archiving
│   └── models/
│       ├── __init__.py
│       └── schemas.py         # Pydantic models (ContextPacket, ChunkPacket, etc.)
├── tests/
│   └── fixtures/
│       └── test.mp4           # Test video files
├── outputs/                   # Temp files during processing (gitignored)
├── .env                       # API keys + config (gitignored)
├── .gitignore
├── firebase-key.json          # Firebase service account key (gitignored)
├── requirements.txt
└── README.md
```

## Setup

### Prerequisites

- **Python 3.10+**
- **FFmpeg** — required for audio extraction and video splitting

### 1. Clone the repo

```bash
git clone <repo-url>
cd backend/raycast-mvp
```

### 2. Install Python dependencies

```bash
pip install -r requirements.txt
```

### 3. Install FFmpeg

**Windows:**
```bash
winget install ffmpeg
```

**Mac:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt install ffmpeg
```

Verify: `ffmpeg -version`

### 4. Set up your `.env` file

Create a `.env` file in the `raycast-mvp/` root:

```env
OPENAI_API_KEY=sk-your-key-here
FIREBASE_BUCKET=your-project.firebasestorage.app
```

If FFmpeg isn't on your PATH (common on Windows), add the full path:

```env
FFMPEG_PATH=C:\path\to\ffmpeg.exe
```

### 5. Set up Firebase

- Go to [Firebase Console](https://console.firebase.google.com) and create a project (or use the existing one)
- Enable **Storage** under Build → Storage
- Go to **Project Settings → Service accounts → Generate new private key**
- Save the downloaded JSON as `firebase-key.json` in the `raycast-mvp/` root
- **Do not commit this file** — it's already in `.gitignore`

### 6. Create the outputs directory

```bash
mkdir outputs
```

### 7. Add a test video

Place a short video file (`.mp4` or `.mov`) in `tests/fixtures/`.

## Running the Server

```bash
python -m uvicorn app.main:server --reload --port 8000
```

The server starts at `http://127.0.0.1:8000` and auto-opens the Swagger docs.

## API Endpoints

### General

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | API root — lists all available endpoints |
| `GET` | `/health` | Health check — returns status + version |
| `GET` | `/docs` | Interactive Swagger UI (auto-generated) |

### Video Analysis

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/analyze-video` | Upload a full video → get a Context Packet |
| `POST` | `/analyze-stream` | Upload a full video → auto-split into chunks → process each → get all packets |

### Streaming (Session-Based)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/session/start` | Create a new streaming session |
| `GET` | `/session/all` | List all active sessions |
| `GET` | `/session/{id}` | Check session status, chunk count, expiry |
| `GET` | `/session/{id}/history` | Get recent chunk packets from a session |
| `DELETE` | `/session/{id}` | End a session (optionally delete Firebase files) |
| `POST` | `/analyze-chunk` | Process a short video chunk within an active session |

### Storage Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/storage/archived` | View all expired/archived sessions |
| `GET` | `/storage/archived/{id}` | View Firebase files for an archived session |
| `POST` | `/storage/cleanup` | Archive expired sessions and clean up Firebase files |
| `GET` | `/storage/{id}` | View all Firebase files for a session |
| `DELETE` | `/storage/{id}` | Delete all Firebase files for a session |

### Testing

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/mock` | Returns a hardcoded Context Packet for frontend development |

## Usage Examples

### Full video analysis

```bash
curl -X POST http://localhost:8000/analyze-video \
  -F "file=@tests/fixtures/test.mp4"
```

### Stream mode (auto-split into 5-second chunks)

```bash
curl -X POST "http://localhost:8000/analyze-stream?chunk_duration=5" \
  -F "file=@tests/fixtures/test.mp4"
```

### Chunk mode (session-based)

```bash
# 1. Start a session
curl http://localhost:8000/session/start -X POST

# 2. Send chunks (use the session_id from step 1)
curl -X POST "http://localhost:8000/analyze-chunk?session_id=session-20260328150000" \
  -F "file=@outputs/chunk_0.mp4"

# 3. Check history
curl http://localhost:8000/session/session-20260328150000/history

# 4. End session
curl -X DELETE http://localhost:8000/session/session-20260328150000
```

## Limits & Safeguards

| Limit | Value |
|-------|-------|
| Max file size per upload | 50 MB |
| Max chunk duration | 10 seconds |
| Max chunks per session | 60 |
| Max session duration | 10 minutes |
| Max storage per session | 200 MB |
| Frames per chunk | 6 |
| Frames per full video | 10 |

## Firebase Storage Structure

```
session-20260328150000/
├── video/test.mp4                    ← from /analyze-video
├── audio/audio.wav
├── frames/
│   ├── frame_0.jpg
│   └── ...
├── chunks/                           ← from /analyze-stream or /analyze-chunk
│   ├── 0/
│   │   ├── video.mp4
│   │   ├── audio.wav
│   │   ├── frame_0.jpg ... frame_5.jpg
│   │   └── chunk_packet.json
│   ├── 1/
│   │   └── ...
│   └── 2/
│       └── ...
└── context_packet.json
```

## Tech Stack

| Component | Technology |
|-----------|-----------|
| API Framework | FastAPI |
| Vision Model | GPT-4o-mini (OpenAI Responses API) |
| Speech-to-Text | gpt-4o-mini-transcribe (OpenAI) |
| Frame Extraction | OpenCV |
| Audio/Video Processing | FFmpeg |
| Cloud Storage | Firebase Storage |
| Data Validation | Pydantic |
| Server | Uvicorn |

## Requirements

```
openai
python-dotenv
opencv-python
pydantic
fastapi
uvicorn
python-multipart
firebase-admin
```

## Notes

- **Supported video formats:** `.mp4` and `.mov` (iPhone recordings work directly)
- **The Context Packet schema is the stable API contract** — frontend and reasoning agent build against this shape
- **Expired sessions are archived, not deleted** — use `/storage/archived` to review old sessions before manually deleting
- **Don't commit `.env` or `firebase-key.json`** — both contain secrets

## Team

| Name | Role |
|------|------|
| Kai McFarlane | Team Lead / Scrum |
| Charles James Jr | Backend |
| Michael Mwaura | Frontend |
| Hoang Tran | AI / Perception |
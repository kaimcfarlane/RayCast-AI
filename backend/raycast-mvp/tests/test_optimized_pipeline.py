"""
End-to-end tests for the optimized /analyze-stream pipeline.

Mocks OpenAI so no API key or network is needed.
Run:  cd backend/raycast-mvp && ./venv/bin/python3 -m pytest tests/ -v
"""

import base64
import json
import time
from unittest.mock import patch, MagicMock

import cv2
import numpy as np
import pytest
from fastapi.testclient import TestClient


MOCK_SCENE = {
    "scene": {
        "scene_summary": "A desk with a laptop and a coffee mug.",
        "objects": [
            {"label": "laptop", "count": 1},
            {"label": "mug", "count": 1},
        ],
        "text_in_scene": [{"text": "MacBook Pro", "confidence": 0.95}],
        "key_details": ["Laptop is open", "Mug is to the right"],
        "uncertainties": ["Unclear item behind laptop"],
    },
    "analysis_text": "I see a desk with an open laptop and a coffee mug to the right.",
}

MOCK_SCENE_CHANGED = {
    "scene": {
        "scene_summary": "A kitchen counter with a bowl of fruit.",
        "objects": [
            {"label": "bowl", "count": 1},
            {"label": "banana", "count": 3},
        ],
        "text_in_scene": [],
        "key_details": ["Fruit bowl on granite counter"],
        "uncertainties": [],
    },
    "analysis_text": "You're looking at a kitchen counter with a bowl of bananas.",
}

FAKE_MP3 = b"\xff\xfb\x90\x00" + b"\x00" * 100


def _make_test_frame(text: str = "test", color=(255, 255, 255)) -> bytes:
    img = np.zeros((240, 320, 3), dtype=np.uint8)
    cv2.putText(img, text, (50, 120), cv2.FONT_HERSHEY_SIMPLEX, 1.0, color, 2)
    _, buf = cv2.imencode(".jpg", img)
    return buf.tobytes()


def _make_different_frame() -> bytes:
    img = np.full((240, 320, 3), 200, dtype=np.uint8)
    cv2.circle(img, (160, 120), 80, (0, 0, 255), -1)
    _, buf = cv2.imencode(".jpg", img)
    return buf.tobytes()


@pytest.fixture()
def client():
    with patch("app.services.reasoning.get_openai_client") as mock_client, \
         patch("app.services.tts.get_openai_client") as mock_tts_client:

        mock_response = MagicMock()
        mock_response.output_text = json.dumps(MOCK_SCENE)
        mock_client.return_value.responses.create.return_value = mock_response

        mock_tts_response = MagicMock()
        mock_tts_response.content = FAKE_MP3
        mock_tts_client.return_value.audio.speech.create.return_value = mock_tts_response

        from app.services.delta import _sessions
        _sessions.clear()

        from app.main import server
        yield TestClient(server)


class TestAnalyzeStream:
    def test_valid_request_returns_analysis(self, client):
        frame = _make_test_frame()
        resp = client.post(
            "/analyze-stream",
            data={"task_mode": "describe", "session_id": "s1"},
            files=[("frames", ("frame.jpg", frame, "image/jpeg"))],
        )
        assert resp.status_code == 200
        body = resp.json()

        assert body["session_id"] == "s1"
        assert body["changed"] is True
        assert body["task_mode"] == "describe"
        assert body["scene"] is not None
        assert body["scene"]["scene_summary"] == MOCK_SCENE["scene"]["scene_summary"]
        assert body["analysis_text"] == MOCK_SCENE["analysis_text"]
        assert body["audio_base64"] is not None

        audio_bytes = base64.b64decode(body["audio_base64"])
        assert audio_bytes == FAKE_MP3

    def test_invalid_task_mode_rejected(self, client):
        frame = _make_test_frame()
        resp = client.post(
            "/analyze-stream",
            data={"task_mode": "fly_to_moon", "session_id": "s1"},
            files=[("frames", ("frame.jpg", frame, "image/jpeg"))],
        )
        assert resp.status_code == 422
        assert "Invalid task_mode" in resp.json()["detail"]

    def test_no_frames_rejected(self, client):
        resp = client.post(
            "/analyze-stream",
            data={"task_mode": "describe", "session_id": "s1"},
        )
        assert resp.status_code == 422

    def test_delta_skips_unchanged_scene(self, client):
        """Second request with same scene → changed=False, no audio."""
        frame = _make_test_frame()
        files = [("frames", ("frame.jpg", frame, "image/jpeg"))]

        r1 = client.post("/analyze-stream",
                         data={"task_mode": "describe", "session_id": "s-delta"},
                         files=files)
        assert r1.json()["changed"] is True

        r2 = client.post("/analyze-stream",
                         data={"task_mode": "describe", "session_id": "s-delta"},
                         files=files)
        body = r2.json()
        assert body["changed"] is False
        assert body["scene"] is None
        assert body["analysis_text"] is None
        assert body["audio_base64"] is None

    def test_frame_diff_skips_identical_frames(self, client):
        """Identical frames on consecutive calls → fast skip via frame-diff."""
        frame = _make_test_frame()
        files = [("frames", ("frame.jpg", frame, "image/jpeg"))]

        r1 = client.post("/analyze-stream",
                         data={"task_mode": "general", "session_id": "s-fdiff"},
                         files=files)
        assert r1.json()["changed"] is True

        t0 = time.perf_counter()
        r2 = client.post("/analyze-stream",
                         data={"task_mode": "general", "session_id": "s-fdiff"},
                         files=files)
        elapsed = time.perf_counter() - t0

        body = r2.json()
        assert body["changed"] is False
        assert elapsed < 0.5, f"Frame-diff skip should be fast, took {elapsed:.2f}s"

    def test_changed_scene_triggers_new_analysis(self, client):
        """Different mock scene on second call → changed=True again."""
        frame1 = _make_test_frame("scene1")
        frame2 = _make_different_frame()

        r1 = client.post("/analyze-stream",
                         data={"task_mode": "describe", "session_id": "s-change"},
                         files=[("frames", ("f.jpg", frame1, "image/jpeg"))])
        assert r1.json()["changed"] is True

        from app.services.reasoning import get_openai_client
        mock_resp2 = MagicMock()
        mock_resp2.output_text = json.dumps(MOCK_SCENE_CHANGED)
        get_openai_client.return_value.responses.create.return_value = mock_resp2

        r2 = client.post("/analyze-stream",
                         data={"task_mode": "describe", "session_id": "s-change"},
                         files=[("frames", ("f.jpg", frame2, "image/jpeg"))])
        body = r2.json()
        assert body["changed"] is True
        assert "kitchen" in body["scene"]["scene_summary"].lower()

    def test_multiple_frames_accepted(self, client):
        frames = [_make_test_frame(f"f{i}") for i in range(6)]
        files = [("frames", (f"frame_{i}.jpg", f, "image/jpeg")) for i, f in enumerate(frames)]

        resp = client.post("/analyze-stream",
                           data={"task_mode": "navigate", "session_id": "s-multi"},
                           files=files)
        assert resp.status_code == 200
        assert resp.json()["changed"] is True

    def test_all_task_modes_accepted(self, client):
        frame = _make_test_frame()
        for mode in ("chess", "navigate", "findObject", "readText", "describe", "general"):
            resp = client.post(
                "/analyze-stream",
                data={"task_mode": mode, "session_id": f"s-mode-{mode}"},
                files=[("frames", ("f.jpg", frame, "image/jpeg"))],
            )
            assert resp.status_code == 200, f"mode {mode} failed: {resp.text}"


class TestChat:
    def test_chat_returns_response(self, client):
        with patch("app.services.reasoning.get_openai_client") as mock_chat:
            mock_resp = MagicMock()
            mock_resp.output_text = "I can see a laptop on the desk."
            mock_chat.return_value.responses.create.return_value = mock_resp

            resp = client.post(
                "/chat",
                data={"user_text": "what do you see?", "session_id": "chat-1"},
            )
            assert resp.status_code == 200
            body = resp.json()
            assert body["response_text"] == "I can see a laptop on the desk."
            assert body["audio_base64"] is not None


class TestHealth:
    def test_health(self, client):
        resp = client.get("/health")
        assert resp.status_code == 200
        assert resp.json()["status"] == "ok"

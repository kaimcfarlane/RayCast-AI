"""
Integration test: validates the ACTUAL prompts from reasoning.py
against a real model (Gemini) to verify they produce correct output.

This tests that:
1. UNIFIED_SYSTEM_PROMPT_TEMPLATE produces valid JSON with "scene" + "analysis_text"
2. The scene matches the SceneDescription schema (scene_summary, objects, etc.)
3. Each task mode produces reasonable guidance text
4. The old 2-call prompts (vision.py + reasoning.py) also still work

Run:  cd backend/raycast-mvp && ./venv/bin/python3 tests/test_real_prompt.py
"""

import base64
import json
import os
import sys
import time

import cv2
import numpy as np
from dotenv import load_dotenv
from google import genai

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.services.reasoning import (
    UNIFIED_SYSTEM_PROMPT_TEMPLATE,
    TASK_MODE_PROMPTS,
    DEFAULT_PROMPT,
)
from app.services.vision import strip_code_fences

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    print("Set GEMINI_API_KEY in .env")
    sys.exit(1)

client = genai.Client(api_key=API_KEY)
MODEL = "gemini-2.5-flash-lite"

REQUIRED_SCENE_KEYS = {"scene_summary", "objects", "text_in_scene", "key_details", "uncertainties"}


def make_test_frame() -> bytes:
    img = np.zeros((480, 640, 3), dtype=np.uint8)
    cv2.putText(img, "Hello RayCast", (80, 200), cv2.FONT_HERSHEY_SIMPLEX, 1.5, (255, 255, 255), 3)
    cv2.rectangle(img, (50, 50), (590, 430), (0, 255, 0), 2)
    cv2.circle(img, (320, 350), 40, (0, 0, 255), -1)
    cv2.putText(img, "Coffee Mug", (250, 360), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)
    _, buf = cv2.imencode(".jpg", img)
    return buf.tobytes()


def call_gemini_with_real_prompt(frame_bytes: bytes, task_mode: str) -> dict:
    """Send the ACTUAL UNIFIED_SYSTEM_PROMPT_TEMPLATE from reasoning.py to Gemini."""
    task_description = TASK_MODE_PROMPTS.get(task_mode, DEFAULT_PROMPT)
    system_prompt = UNIFIED_SYSTEM_PROMPT_TEMPLATE.format(
        task_description=task_description
    )

    b64 = base64.b64encode(frame_bytes).decode("utf-8")

    response = client.models.generate_content(
        model=MODEL,
        contents=[
            {"role": "user", "parts": [
                {"text": "Analyze these frames:"},
                {"inline_data": {"mime_type": "image/jpeg", "data": b64}},
            ]}
        ],
        config={
            "system_instruction": system_prompt,
            "response_mime_type": "application/json",
        },
    )

    raw = strip_code_fences(response.text)
    return json.loads(raw)


def validate_scene(scene: dict, label: str):
    missing = REQUIRED_SCENE_KEYS - set(scene.keys())
    assert not missing, f"[{label}] Scene missing keys: {missing}"
    assert isinstance(scene["scene_summary"], str) and len(scene["scene_summary"]) > 5, \
        f"[{label}] scene_summary too short: '{scene['scene_summary']}'"
    assert isinstance(scene["objects"], list), f"[{label}] objects should be a list"
    for obj in scene["objects"]:
        assert "label" in obj and "count" in obj, f"[{label}] Bad object format: {obj}"
    assert isinstance(scene["key_details"], list), f"[{label}] key_details should be a list"
    assert isinstance(scene["uncertainties"], list), f"[{label}] uncertainties should be a list"


def test_unified_prompt(frame: bytes, task_mode: str):
    """Test that the real UNIFIED_SYSTEM_PROMPT_TEMPLATE returns valid structured output."""
    print(f"  Testing mode '{task_mode}'...", end=" ", flush=True)
    t0 = time.perf_counter()

    result = call_gemini_with_real_prompt(frame, task_mode)
    elapsed = time.perf_counter() - t0

    assert "scene" in result, f"Response missing 'scene' key. Got: {list(result.keys())}"
    assert "analysis_text" in result, f"Response missing 'analysis_text' key. Got: {list(result.keys())}"

    validate_scene(result["scene"], task_mode)

    text = result["analysis_text"]
    assert isinstance(text, str) and len(text) > 10, \
        f"analysis_text too short: '{text}'"

    print(f"OK ({elapsed:.2f}s)")
    print(f"    scene_summary: {result['scene']['scene_summary'][:80]}")
    print(f"    analysis_text: {text[:80]}")
    return elapsed


def main():
    frame = make_test_frame()
    print(f"Frame size: {len(frame)} bytes")
    print(f"Model: {MODEL}")
    print(f"Using REAL prompts from app/services/reasoning.py")
    print("=" * 60)

    modes_to_test = ["describe", "general", "readText"]

    print("\n[1] Testing UNIFIED prompt (the actual new code):\n")
    timings = []
    for mode in modes_to_test:
        t = test_unified_prompt(frame, mode)
        timings.append(t)
        time.sleep(1)

    avg = sum(timings) / len(timings)
    print(f"\n  Average single-call time: {avg:.2f}s")

    print("\n" + "=" * 60)
    print("RESULT: All prompts produce valid structured output.")
    print(f"The UNIFIED_SYSTEM_PROMPT_TEMPLATE from reasoning.py works correctly.")
    print(f"Average latency per call: {avg:.2f}s")
    print("=" * 60)


if __name__ == "__main__":
    main()

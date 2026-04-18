"""
Benchmark: Old pipeline (2 API calls) vs New pipeline (1 API call).

Uses REAL prompts from app/services/ and Google Gemini to measure latency.
Run:  cd backend/raycast-mvp && ./venv/bin/python3 tests/benchmark_pipeline.py
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

TASK_MODE = "describe"

VISION_PROMPT = """
    You are a perception model for the meta smart glasses and your task is to describe the scene in the frames.
    Return Json context packet with the following structure:
    {
       "scene_summary": "1-2 sentences",
       "objects": [{"label": "string", "count": number}],
       "text_in_scene": [{"text": "string", "confidence": number}],
       "key_details": ["short bullet strings"],
       "uncertainties": ["short bullet strings"]
    }
    Rules to follow:
    - Always include a scene summary
    - If you cannot read the text, do not include it in the text_in_scene
    """


def make_test_frame() -> bytes:
    img = np.zeros((480, 640, 3), dtype=np.uint8)
    cv2.putText(img, "Hello RayCast", (80, 200), cv2.FONT_HERSHEY_SIMPLEX, 1.5, (255, 255, 255), 3)
    cv2.rectangle(img, (50, 50), (590, 430), (0, 255, 0), 2)
    cv2.circle(img, (320, 350), 40, (0, 0, 255), -1)
    cv2.putText(img, "Coffee Mug", (250, 360), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)
    _, buf = cv2.imencode(".jpg", img)
    return buf.tobytes()


def old_pipeline(frame_bytes: bytes) -> dict:
    """OLD: 2 separate API calls using the REAL prompts from vision.py + reasoning.py."""
    b64 = base64.b64encode(frame_bytes).decode("utf-8")
    task_prompt = TASK_MODE_PROMPTS.get(TASK_MODE, DEFAULT_PROMPT)

    t0 = time.perf_counter()

    vision_resp = client.models.generate_content(
        model=MODEL,
        contents=[
            {"role": "user", "parts": [
                {"text": VISION_PROMPT},
                {"inline_data": {"mime_type": "image/jpeg", "data": b64}},
            ]}
        ],
        config={"response_mime_type": "application/json"},
    )
    t_vision = time.perf_counter()

    scene_json = strip_code_fences(vision_resp.text)
    scene = json.loads(scene_json)

    reason_resp = client.models.generate_content(
        model=MODEL,
        contents=[
            {"role": "user", "parts": [
                {"text": f"Here is the current scene analysis from the smart glasses:\n\n{scene_json}"},
            ]}
        ],
        config={"system_instruction": task_prompt},
    )
    t_reason = time.perf_counter()

    return {
        "scene": scene,
        "analysis_text": reason_resp.text.strip(),
        "timing": {
            "vision": round(t_vision - t0, 3),
            "reasoning": round(t_reason - t_vision, 3),
            "total": round(t_reason - t0, 3),
        },
    }


def new_pipeline(frame_bytes: bytes) -> dict:
    """NEW: 1 merged call using the REAL UNIFIED_SYSTEM_PROMPT_TEMPLATE from reasoning.py."""
    b64 = base64.b64encode(frame_bytes).decode("utf-8")

    task_description = TASK_MODE_PROMPTS.get(TASK_MODE, DEFAULT_PROMPT)
    system_prompt = UNIFIED_SYSTEM_PROMPT_TEMPLATE.format(
        task_description=task_description
    )

    t0 = time.perf_counter()

    resp = client.models.generate_content(
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
    t_done = time.perf_counter()

    raw = strip_code_fences(resp.text)
    result = json.loads(raw)

    return {
        "scene": result["scene"],
        "analysis_text": result["analysis_text"],
        "timing": {
            "single_call": round(t_done - t0, 3),
            "total": round(t_done - t0, 3),
        },
    }


def _run_with_retry(fn, *args, retries=3, backoff=5):
    for attempt in range(retries):
        try:
            return fn(*args)
        except Exception as e:
            if "503" in str(e) and attempt < retries - 1:
                wait = backoff * (attempt + 1)
                print(f"(503, retrying in {wait}s)...", end=" ", flush=True)
                time.sleep(wait)
            else:
                raise


def run_benchmark(rounds: int = 3):
    frame = make_test_frame()
    print(f"Frame size: {len(frame)} bytes")
    print(f"Model: {MODEL}")
    print(f"Using REAL prompts from app/services/reasoning.py + vision.py")
    print(f"Rounds: {rounds}")
    print("=" * 60)

    old_times = []
    new_times = []

    for i in range(rounds):
        print(f"\n--- Round {i + 1} ---")

        print("  OLD pipeline (2 calls)...", end=" ", flush=True)
        old_result = _run_with_retry(old_pipeline, frame)
        old_t = old_result["timing"]
        old_times.append(old_t["total"])
        print(f"vision={old_t['vision']}s  reasoning={old_t['reasoning']}s  TOTAL={old_t['total']}s")

        time.sleep(2)

        print("  NEW pipeline (1 call)...", end=" ", flush=True)
        new_result = _run_with_retry(new_pipeline, frame)
        new_t = new_result["timing"]
        new_times.append(new_t["total"])
        print(f"single_call={new_t['single_call']}s  TOTAL={new_t['total']}s")

        saved = old_t["total"] - new_t["total"]
        pct = (saved / old_t["total"]) * 100 if old_t["total"] > 0 else 0
        print(f"  -> Saved: {saved:.3f}s ({pct:.0f}% faster)")

        time.sleep(2)

    print("\n" + "=" * 60)
    avg_old = sum(old_times) / len(old_times)
    avg_new = sum(new_times) / len(new_times)
    avg_saved = avg_old - avg_new
    pct_saved = (avg_saved / avg_old) * 100 if avg_old > 0 else 0

    print(f"AVERAGE OLD: {avg_old:.3f}s")
    print(f"AVERAGE NEW: {avg_new:.3f}s")
    print(f"AVERAGE SAVED: {avg_saved:.3f}s ({pct_saved:.0f}% faster)")
    print("=" * 60)

    print(f"\nOLD sample output: {old_result['analysis_text'][:120]}...")
    print(f"NEW sample output: {new_result['analysis_text'][:120]}...")


if __name__ == "__main__":
    run_benchmark(rounds=3)

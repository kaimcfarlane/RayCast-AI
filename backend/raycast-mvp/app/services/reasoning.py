import json
import base64
from app.services.config import get_openai_client
from app.models.schemas import SceneDescription
from app.services.vision import strip_code_fences

TASK_MODE_PROMPTS: dict[str, str] = {
    "chess": (
        "You are analyzing a chess game visible through smart glasses. "
        "Describe the board position, identify pieces and their locations, "
        "and suggest the best next move if possible. Be concise (1-3 sentences)."
    ),
    "navigate": (
        "You are a real-time navigation assistant for smart glasses. "
        "Describe the user's surroundings, identify obstacles, doorways, signs, "
        "and suggest clear directional guidance. Be concise (1-3 sentences)."
    ),
    "findObject": (
        "You are helping the user locate a specific object in their environment "
        "through smart glasses. Describe where notable objects are positioned "
        "relative to the user's viewpoint. Be concise (1-3 sentences)."
    ),
    "readText": (
        "You are a text-reading assistant for smart glasses. Read and relay "
        "any text visible in the scene — signs, labels, screens, documents. "
        "Prioritize the most prominent or relevant text. Be concise (1-3 sentences)."
    ),
    "describe": (
        "You are providing a rich, detailed audio description of the scene "
        "for a visually impaired user wearing smart glasses. Describe spatial layout, "
        "colors, people, and activity. Be concise but vivid (1-3 sentences)."
    ),
    "general": (
        "You are a helpful general-purpose AI assistant observing through smart glasses. "
        "Provide a useful, context-aware analysis of what you observe. "
        "Be concise (1-3 sentences)."
    ),
}

DEFAULT_PROMPT = TASK_MODE_PROMPTS["general"]


def reason(scene: SceneDescription, task_mode: str) -> str:
    """Run the reasoning agent on a scene description for the given task mode."""
    system_prompt = TASK_MODE_PROMPTS.get(task_mode, DEFAULT_PROMPT)

    scene_json = scene.model_dump_json(indent=2)
    user_message = f"Here is the current scene analysis from the smart glasses:\n\n{scene_json}"

    client = get_openai_client()
    response = client.responses.create(
        model="gpt-4o-mini",
        instructions=system_prompt,
        input=[{"role": "user", "content": user_message}],
    )

    text = (response.output_text or "").strip()
    if not text:
        return "I couldn't generate an analysis for this scene."
    return text


UNIFIED_SYSTEM_PROMPT_TEMPLATE = """\
You are a perception + reasoning agent for Meta smart glasses.

Given camera frames, perform TWO tasks in a single pass:
1. **Scene analysis**: structured JSON describing what you see.
2. **Task guidance**: a short spoken response for the user ({task_description}).

Return ONLY a JSON object with this exact structure (no markdown fences):
{{
  "scene": {{
    "scene_summary": "1-2 sentences",
    "objects": [{{"label": "string", "count": number}}],
    "text_in_scene": [{{"text": "string", "confidence": number}}],
    "key_details": ["short bullet strings"],
    "uncertainties": ["short bullet strings"]
  }},
  "analysis_text": "Your 1-3 sentence spoken guidance for the user"
}}

Rules:
- scene_summary is required
- If you cannot read text, omit it from text_in_scene
- analysis_text should be natural spoken language, concise and helpful
- Respond ONLY with the JSON object, nothing else"""


def perceive_and_reason(frames: list[bytes], task_mode: str) -> dict:
    """Single-pass: frames → scene description + task-specific reasoning.

    Collapses the old two-call pipeline (vision → reasoning) into one API
    round-trip, cutting ~2-3 seconds of latency.

    Returns dict with keys: "scene" (SceneDescription-compatible) and
    "analysis_text" (str).
    """
    task_description = TASK_MODE_PROMPTS.get(task_mode, DEFAULT_PROMPT)
    system_prompt = UNIFIED_SYSTEM_PROMPT_TEMPLATE.format(
        task_description=task_description
    )

    content: list[dict] = [{"type": "input_text", "text": "Analyze these frames:"}]
    for frame_bytes in frames:
        b64 = base64.b64encode(frame_bytes).decode("utf-8").replace("\n", "").replace("\r", "")
        content.append({
            "type": "input_image",
            "image_url": f"data:image/jpeg;base64,{b64}",
        })

    client = get_openai_client()
    response = client.responses.create(
        model="gpt-4o-mini",
        instructions=system_prompt,
        input=[{"role": "user", "content": content}],
        text={"format": {"type": "json_object"}},
    )

    raw = strip_code_fences(response.output_text)
    if not raw:
        raise ValueError("Model returned no output")

    result = json.loads(raw)

    if "scene" not in result or "analysis_text" not in result:
        raise ValueError(f"Unexpected response structure: {list(result.keys())}")

    return result


CHAT_SYSTEM_PROMPT = (
    "You are RayCast AI, a conversational assistant embedded in smart glasses. "
    "The user is speaking to you while wearing the glasses. You can see what they see "
    "through the scene analysis provided. Answer their question or fulfill their request "
    "based on both what they said and what you can observe. Be conversational, helpful, "
    "and concise (1-3 sentences). Speak naturally as if talking to them."
)


def chat(user_text: str, scene: SceneDescription | None = None) -> str:
    """Handle a conversational chat request, optionally with visual context."""
    context_parts = []
    if scene:
        context_parts.append(
            f"Current scene from glasses:\n{scene.model_dump_json(indent=2)}"
        )
    context_parts.append(f"User said: {user_text}")

    client = get_openai_client()
    response = client.responses.create(
        model="gpt-4o-mini",
        instructions=CHAT_SYSTEM_PROMPT,
        input=[{"role": "user", "content": "\n\n".join(context_parts)}],
    )

    text = (response.output_text or "").strip()
    if not text:
        return "I'm sorry, I couldn't understand that. Could you try again?"
    return text

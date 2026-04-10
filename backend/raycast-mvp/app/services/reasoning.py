import json
import base64
from app.services.config import get_openai_client
from app.models.schemas import SceneDescription
from app.services.vision import strip_code_fences
from app.services.memory import format_history_for_prompt, store_turn

# ── Task-mode prompts (used in both unified and standalone paths) ──

TASK_MODE_PROMPTS: dict[str, str] = {
    "chess": (
        "You are a chess coach observing a game through smart glasses. "
        "First identify each piece and its square (e.g. 'White Rook on a1'). "
        "Then assess who has the advantage and why. "
        "Finally suggest the best next move with brief reasoning. "
        "If the board is unclear, say so. Keep your spoken guidance to 2-4 sentences."
    ),
    "navigate": (
        "You are a real-time navigation assistant for smart glasses. "
        "Use spatial language relative to the wearer: clock positions "
        "(e.g. 'door at 2 o'clock'), distances ('about 3 meters ahead'), "
        "and left/right cues. Prioritize safety-critical info first "
        "(obstacles, vehicles, stairs), then wayfinding. "
        "Keep your spoken guidance to 1-3 sentences."
    ),
    "findObject": (
        "You are helping the user locate a specific object through smart glasses. "
        "{search_context}"
        "Scan the entire frame carefully. If you spot the target, describe its "
        "exact position relative to the wearer (e.g. 'on the counter to your left'). "
        "If not visible, say so and suggest where to look next. "
        "Keep your spoken guidance to 1-3 sentences."
    ),
    "readText": (
        "You are a text-reading assistant for smart glasses. "
        "Read ALL visible text in the scene: signs, labels, screens, documents, "
        "packaging, buttons. Format each piece of text clearly. "
        "For partially visible or blurry text, give your best reading and note "
        "the uncertainty. Prioritize the most prominent text first. "
        "Keep your spoken guidance to 1-4 sentences."
    ),
    "describe": (
        "You are providing a detailed audio description for a smart glasses wearer. "
        "Start with the overall spatial layout (what's in front, left, right). "
        "Then describe key elements: people (count, posture, activity), objects, "
        "colors, lighting, and movement. Include distances where possible. "
        "Keep your spoken guidance to 2-4 sentences, vivid but efficient."
    ),
    "general": (
        "You are RayCast AI, a helpful assistant observing through smart glasses. "
        "Provide the most useful, context-aware observation about the current scene. "
        "If you notice something important, urgent, or interesting, lead with that. "
        "Keep your spoken guidance to 1-3 sentences."
    ),
}

DEFAULT_PROMPT = TASK_MODE_PROMPTS["general"]


def _resolve_task_prompt(task_mode: str, search_query: str | None = None) -> str:
    """Get the task prompt, injecting search_query for findObject mode."""
    prompt = TASK_MODE_PROMPTS.get(task_mode, DEFAULT_PROMPT)
    if task_mode == "findObject" and search_query:
        search_context = f'The user is looking for: "{search_query}". '
    elif task_mode == "findObject":
        search_context = (
            "The user has not specified a target. Describe where notable "
            "objects are positioned relative to the wearer. "
        )
    else:
        search_context = ""
    return prompt.format(search_context=search_context)


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


# ── Unified single-pass prompt (vision + reasoning in one call) ──

UNIFIED_SYSTEM_PROMPT_TEMPLATE = """\
You are a perception + reasoning agent for Meta smart glasses.

Given camera frames, perform TWO tasks in a single pass:
1. **Scene analysis**: structured JSON describing what you see.
2. **Task guidance**: a short spoken response for the user.

Task instructions: {task_description}

{history_block}

Return ONLY a JSON object with this exact structure (no markdown fences):
{{
  "scene": {{
    "scene_summary": "1-2 sentences",
    "objects": [{{"label": "string", "count": number}}],
    "text_in_scene": [{{"text": "string", "confidence": number}}],
    "key_details": ["short bullet strings"],
    "uncertainties": ["short bullet strings"]
  }},
  "analysis_text": "Your spoken guidance for the user"
}}

Rules:
- scene_summary is required
- If you cannot read text, omit it from text_in_scene
- analysis_text should be natural spoken language, concise and helpful
- If history is provided, reference changes you notice and avoid repeating yourself
- Respond ONLY with the JSON object, nothing else"""


def perceive_and_reason(
    frames: list[bytes],
    task_mode: str,
    session_id: str | None = None,
    search_query: str | None = None,
) -> dict:
    """Single-pass: frames -> scene description + task-specific reasoning.

    Collapses the old two-call pipeline (vision -> reasoning) into one API
    round-trip, cutting ~2-3 seconds of latency.

    When session_id is provided, injects recent conversation history so the
    agent can reference what it previously saw and said.

    Returns dict with keys: "scene" (SceneDescription-compatible) and
    "analysis_text" (str).
    """
    task_description = _resolve_task_prompt(task_mode, search_query)

    history_block = ""
    if session_id:
        history_block = format_history_for_prompt(session_id)

    system_prompt = UNIFIED_SYSTEM_PROMPT_TEMPLATE.format(
        task_description=task_description,
        history_block=history_block,
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

    if session_id:
        store_turn(
            session_id,
            scene_summary=result["scene"].get("scene_summary", ""),
            analysis_text=result["analysis_text"],
        )

    return result


# ── Chat (conversational) ──

CHAT_SYSTEM_PROMPT_TEMPLATE = """\
You are RayCast AI, a conversational assistant embedded in smart glasses. \
The user is speaking to you while wearing the glasses. You can see what they see \
through the scene analysis provided. Answer their question or fulfill their request \
based on both what they said and what you can observe. Be conversational, helpful, \
and concise (1-3 sentences). Speak naturally as if talking to them.

{history_block}"""


def chat(
    user_text: str,
    scene: SceneDescription | None = None,
    session_id: str | None = None,
) -> str:
    """Handle a conversational chat request, optionally with visual context."""
    history_block = ""
    if session_id:
        history_block = format_history_for_prompt(session_id)

    system_prompt = CHAT_SYSTEM_PROMPT_TEMPLATE.format(
        history_block=history_block,
    )

    context_parts = []
    if scene:
        context_parts.append(
            f"Current scene from glasses:\n{scene.model_dump_json(indent=2)}"
        )
    context_parts.append(f"User said: {user_text}")

    client = get_openai_client()
    response = client.responses.create(
        model="gpt-4o-mini",
        instructions=system_prompt,
        input=[{"role": "user", "content": "\n\n".join(context_parts)}],
    )

    text = (response.output_text or "").strip()
    if not text:
        return "I'm sorry, I couldn't understand that. Could you try again?"

    if session_id:
        scene_summary = scene.scene_summary if scene else "No visual context"
        store_turn(session_id, scene_summary=scene_summary, analysis_text=text)

    return text

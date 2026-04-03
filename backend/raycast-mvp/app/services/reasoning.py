from app.services.config import get_openai_client
from app.models.schemas import SceneDescription

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

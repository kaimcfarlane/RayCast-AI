"""
Direct unit tests for the memory module and reasoning functions.

Tests every public function in memory.py, the prompt resolution logic
in reasoning.py, and verifies memory integration with perceive_and_reason / chat.

Run:  cd backend/raycast-mvp && ./venv/bin/python3 -m pytest tests/test_memory.py -v
"""

import time
import json
from unittest.mock import patch, MagicMock

import pytest

from app.services.memory import (
    store_turn,
    get_history,
    format_history_for_prompt,
    clear_session,
    _sessions,
    MAX_TURNS,
    STALE_SESSION_SECONDS,
)
from app.services.reasoning import (
    _resolve_task_prompt,
    TASK_MODE_PROMPTS,
    UNIFIED_SYSTEM_PROMPT_TEMPLATE,
    CHAT_SYSTEM_PROMPT_TEMPLATE,
    perceive_and_reason,
    chat,
)


@pytest.fixture(autouse=True)
def clean_memory():
    """Clear all session memory before and after each test."""
    _sessions.clear()
    yield
    _sessions.clear()


# ═══════════════════════════════════════════
#  memory.py — store_turn
# ═══════════════════════════════════════════

class TestStoreTurn:
    def test_stores_single_turn(self):
        store_turn("s1", "A desk with a laptop.", "I see a laptop on the desk.")
        history = get_history("s1")
        assert len(history) == 1
        assert history[0].scene_summary == "A desk with a laptop."
        assert history[0].analysis_text == "I see a laptop on the desk."

    def test_stores_multiple_turns(self):
        store_turn("s1", "Scene A", "Response A")
        store_turn("s1", "Scene B", "Response B")
        store_turn("s1", "Scene C", "Response C")
        history = get_history("s1")
        assert len(history) == 3
        assert history[0].scene_summary == "Scene A"
        assert history[2].scene_summary == "Scene C"

    def test_caps_at_max_turns(self):
        for i in range(MAX_TURNS + 3):
            store_turn("s1", f"Scene {i}", f"Response {i}")
        history = get_history("s1")
        assert len(history) == MAX_TURNS
        assert history[0].scene_summary == "Scene 3"
        assert history[-1].scene_summary == f"Scene {MAX_TURNS + 2}"

    def test_separate_sessions_isolated(self):
        store_turn("session-a", "Scene A", "Response A")
        store_turn("session-b", "Scene B", "Response B")
        assert len(get_history("session-a")) == 1
        assert len(get_history("session-b")) == 1
        assert get_history("session-a")[0].scene_summary == "Scene A"
        assert get_history("session-b")[0].scene_summary == "Scene B"

    def test_timestamp_is_set(self):
        before = time.time()
        store_turn("s1", "Scene", "Response")
        after = time.time()
        turn = get_history("s1")[0]
        assert before <= turn.timestamp <= after


# ═══════════════════════════════════════════
#  memory.py — get_history
# ═══════════════════════════════════════════

class TestGetHistory:
    def test_empty_for_unknown_session(self):
        assert get_history("nonexistent") == []

    def test_returns_copy_not_reference(self):
        store_turn("s1", "Scene", "Response")
        h1 = get_history("s1")
        h2 = get_history("s1")
        assert h1 is not h2
        assert h1[0].scene_summary == h2[0].scene_summary


# ═══════════════════════════════════════════
#  memory.py — format_history_for_prompt
# ═══════════════════════════════════════════

class TestFormatHistory:
    def test_empty_for_no_history(self):
        assert format_history_for_prompt("empty-session") == ""

    def test_contains_scene_and_response(self):
        store_turn("s1", "A park with trees.", "You're in a park.")
        prompt = format_history_for_prompt("s1")
        assert "A park with trees." in prompt
        assert "You're in a park." in prompt

    def test_contains_multiple_turns(self):
        store_turn("s1", "Scene 1", "Response 1")
        store_turn("s1", "Scene 2", "Response 2")
        prompt = format_history_for_prompt("s1")
        assert "Turn 1" in prompt
        assert "Turn 2" in prompt
        assert "Scene 1" in prompt
        assert "Scene 2" in prompt

    def test_has_header_and_footer(self):
        store_turn("s1", "Scene", "Response")
        prompt = format_history_for_prompt("s1")
        assert "[Recent history" in prompt
        assert "[End of history" in prompt


# ═══════════════════════════════════════════
#  memory.py — clear_session
# ═══════════════════════════════════════════

class TestClearSession:
    def test_clears_existing_session(self):
        store_turn("s1", "Scene", "Response")
        assert len(get_history("s1")) == 1
        clear_session("s1")
        assert get_history("s1") == []

    def test_clearing_nonexistent_session_is_safe(self):
        clear_session("does-not-exist")


# ═══════════════════════════════════════════
#  memory.py — stale session purge
# ═══════════════════════════════════════════

class TestStalePurge:
    def test_stale_sessions_are_purged(self):
        store_turn("old-session", "Old scene", "Old response")
        _sessions["old-session"].last_updated = time.time() - STALE_SESSION_SECONDS - 1
        assert get_history("old-session") == []

    def test_fresh_sessions_are_kept(self):
        store_turn("fresh", "Scene", "Response")
        store_turn("trigger-purge", "X", "Y")
        assert len(get_history("fresh")) == 1


# ═══════════════════════════════════════════
#  reasoning.py — _resolve_task_prompt
# ═══════════════════════════════════════════

class TestResolveTaskPrompt:
    def test_general_mode_returns_prompt(self):
        prompt = _resolve_task_prompt("general")
        assert "RayCast AI" in prompt

    def test_chess_mode_returns_chess_prompt(self):
        prompt = _resolve_task_prompt("chess")
        assert "chess" in prompt.lower()
        assert "piece" in prompt.lower()

    def test_navigate_mode_uses_clock_positions(self):
        prompt = _resolve_task_prompt("navigate")
        assert "clock" in prompt.lower()

    def test_readtext_mode_reads_all_text(self):
        prompt = _resolve_task_prompt("readText")
        assert "ALL visible text" in prompt

    def test_describe_mode_spatial_layout(self):
        prompt = _resolve_task_prompt("describe")
        assert "spatial" in prompt.lower()

    def test_findobject_with_query(self):
        prompt = _resolve_task_prompt("findObject", search_query="red backpack")
        assert 'red backpack' in prompt
        assert "looking for" in prompt.lower()

    def test_findobject_without_query(self):
        prompt = _resolve_task_prompt("findObject", search_query=None)
        assert "not specified a target" in prompt.lower()

    def test_findobject_empty_query(self):
        prompt = _resolve_task_prompt("findObject", search_query="")
        assert "not specified a target" in prompt.lower()

    def test_unknown_mode_falls_back_to_general(self):
        prompt = _resolve_task_prompt("nonexistent_mode")
        assert "RayCast AI" in prompt

    def test_all_modes_have_prompts(self):
        for mode in ("chess", "navigate", "findObject", "readText", "describe", "general"):
            assert mode in TASK_MODE_PROMPTS


# ═══════════════════════════════════════════
#  reasoning.py — perceive_and_reason with memory
# ═══════════════════════════════════════════

MOCK_RESPONSE = {
    "scene": {
        "scene_summary": "A park with a bench.",
        "objects": [{"label": "bench", "count": 1}],
        "text_in_scene": [],
        "key_details": ["Sunny day"],
        "uncertainties": [],
    },
    "analysis_text": "You're in a sunny park with a bench ahead.",
}


class TestPerceiveAndReasonMemory:
    @patch("app.services.reasoning.get_openai_client")
    def test_stores_turn_in_memory(self, mock_client):
        mock_resp = MagicMock()
        mock_resp.output_text = json.dumps(MOCK_RESPONSE)
        mock_client.return_value.responses.create.return_value = mock_resp

        fake_frame = b"\xff\xd8\xff\xe0" + b"\x00" * 200

        result = perceive_and_reason(
            [fake_frame], "describe", session_id="test-mem"
        )

        assert result["analysis_text"] == MOCK_RESPONSE["analysis_text"]

        history = get_history("test-mem")
        assert len(history) == 1
        assert history[0].scene_summary == "A park with a bench."

    @patch("app.services.reasoning.get_openai_client")
    def test_no_memory_without_session_id(self, mock_client):
        mock_resp = MagicMock()
        mock_resp.output_text = json.dumps(MOCK_RESPONSE)
        mock_client.return_value.responses.create.return_value = mock_resp

        fake_frame = b"\xff\xd8\xff\xe0" + b"\x00" * 200

        perceive_and_reason([fake_frame], "describe", session_id=None)

        assert len(_sessions) == 0

    @patch("app.services.reasoning.get_openai_client")
    def test_history_injected_into_prompt(self, mock_client):
        store_turn("test-inject", "Previous scene", "Previous response")

        mock_resp = MagicMock()
        mock_resp.output_text = json.dumps(MOCK_RESPONSE)
        mock_client.return_value.responses.create.return_value = mock_resp

        fake_frame = b"\xff\xd8\xff\xe0" + b"\x00" * 200
        perceive_and_reason([fake_frame], "general", session_id="test-inject")

        call_args = mock_client.return_value.responses.create.call_args
        system_prompt = call_args.kwargs.get("instructions", "")
        assert "Previous scene" in system_prompt
        assert "Previous response" in system_prompt

    @patch("app.services.reasoning.get_openai_client")
    def test_search_query_injected_into_prompt(self, mock_client):
        mock_resp = MagicMock()
        mock_resp.output_text = json.dumps(MOCK_RESPONSE)
        mock_client.return_value.responses.create.return_value = mock_resp

        fake_frame = b"\xff\xd8\xff\xe0" + b"\x00" * 200
        perceive_and_reason(
            [fake_frame], "findObject",
            session_id="test-search", search_query="my wallet",
        )

        call_args = mock_client.return_value.responses.create.call_args
        system_prompt = call_args.kwargs.get("instructions", "")
        assert "my wallet" in system_prompt

    @patch("app.services.reasoning.get_openai_client")
    def test_raises_on_empty_output(self, mock_client):
        mock_resp = MagicMock()
        mock_resp.output_text = ""
        mock_client.return_value.responses.create.return_value = mock_resp

        fake_frame = b"\xff\xd8\xff\xe0" + b"\x00" * 200
        with pytest.raises(ValueError, match="no output"):
            perceive_and_reason([fake_frame], "describe")

    @patch("app.services.reasoning.get_openai_client")
    def test_raises_on_missing_keys(self, mock_client):
        mock_resp = MagicMock()
        mock_resp.output_text = json.dumps({"wrong_key": "value"})
        mock_client.return_value.responses.create.return_value = mock_resp

        fake_frame = b"\xff\xd8\xff\xe0" + b"\x00" * 200
        with pytest.raises(ValueError, match="Unexpected response structure"):
            perceive_and_reason([fake_frame], "describe")


# ═══════════════════════════════════════════
#  reasoning.py — chat with memory
# ═══════════════════════════════════════════

class TestChatMemory:
    @patch("app.services.reasoning.get_openai_client")
    def test_chat_stores_turn(self, mock_client):
        mock_resp = MagicMock()
        mock_resp.output_text = "The sign says 'Exit'."
        mock_client.return_value.responses.create.return_value = mock_resp

        chat("What does that sign say?", session_id="chat-mem")

        history = get_history("chat-mem")
        assert len(history) == 1
        assert "Exit" in history[0].analysis_text

    @patch("app.services.reasoning.get_openai_client")
    def test_chat_no_memory_without_session_id(self, mock_client):
        mock_resp = MagicMock()
        mock_resp.output_text = "Hello!"
        mock_client.return_value.responses.create.return_value = mock_resp

        chat("Hi", session_id=None)
        assert len(_sessions) == 0

    @patch("app.services.reasoning.get_openai_client")
    def test_chat_injects_history_into_prompt(self, mock_client):
        store_turn("chat-hist", "A kitchen", "You're in a kitchen.")

        mock_resp = MagicMock()
        mock_resp.output_text = "Yes, you were in the kitchen earlier."
        mock_client.return_value.responses.create.return_value = mock_resp

        chat("Where was I before?", session_id="chat-hist")

        call_args = mock_client.return_value.responses.create.call_args
        system_prompt = call_args.kwargs.get("instructions", "")
        assert "A kitchen" in system_prompt
        assert "You're in a kitchen" in system_prompt

    @patch("app.services.reasoning.get_openai_client")
    def test_chat_empty_response_returns_fallback(self, mock_client):
        mock_resp = MagicMock()
        mock_resp.output_text = ""
        mock_client.return_value.responses.create.return_value = mock_resp

        result = chat("Hello?")
        assert "sorry" in result.lower() or "couldn't" in result.lower()


# ═══════════════════════════════════════════
#  Prompt template validation
# ═══════════════════════════════════════════

class TestPromptTemplates:
    def test_unified_template_has_placeholders(self):
        assert "{task_description}" in UNIFIED_SYSTEM_PROMPT_TEMPLATE
        assert "{history_block}" in UNIFIED_SYSTEM_PROMPT_TEMPLATE

    def test_unified_template_formats_without_history(self):
        prompt = UNIFIED_SYSTEM_PROMPT_TEMPLATE.format(
            task_description="Test task", history_block=""
        )
        assert "Test task" in prompt
        assert "scene_summary" in prompt

    def test_unified_template_formats_with_history(self):
        history = "Turn 1: Scene: A desk\n         You said: I see a desk"
        prompt = UNIFIED_SYSTEM_PROMPT_TEMPLATE.format(
            task_description="Test task", history_block=history
        )
        assert "A desk" in prompt
        assert "I see a desk" in prompt

    def test_chat_template_has_placeholder(self):
        assert "{history_block}" in CHAT_SYSTEM_PROMPT_TEMPLATE

    def test_chat_template_formats_cleanly(self):
        prompt = CHAT_SYSTEM_PROMPT_TEMPLATE.format(history_block="")
        assert "RayCast AI" in prompt

    def test_findobject_prompt_has_search_placeholder(self):
        raw = TASK_MODE_PROMPTS["findObject"]
        assert "{search_context}" in raw

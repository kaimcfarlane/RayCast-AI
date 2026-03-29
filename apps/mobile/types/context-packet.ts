/**
 * Context Packet — matches backend schema (backend/raycast-mvp/app/models/schemas.py).
 * Same shape returned by GET /mock and POST /analyze-video.
 */

export interface ObjectLabel {
  label: string;
  count: number;
}

export interface TextInScene {
  text: string;
  confidence: number;
}

export interface SceneDescription {
  scene_summary: string;
  objects: ObjectLabel[];
  text_in_scene: TextInScene[];
  key_details: string[];
  uncertainties: string[];
}

export interface ContextPacket {
  session_id: string;
  source_type: string;
  video_file_name: string;
  frame_interval: number;
  timestamp: string;
  scene: SceneDescription;
  transcript: string;
}

from pydantic import BaseModel
from typing import Optional

class ObjectLabel(BaseModel):
    label: str
    count: int

class TextInScene(BaseModel):
    text: str
    confidence: float

class SceneDescription(BaseModel):
    scene_summary: str
    objects: list[ObjectLabel]
    text_in_scene: list[TextInScene]
    key_details: list[str]
    uncertainties: list[str]

class StorageUrls(BaseModel):
    video_url: Optional[str] = None
    audio_url: Optional[str] = None
    frame_urls: list[str] = []
    packet_url: Optional[str] = None

class ContextPacket(BaseModel):
    session_id: str
    source_type: str
    video_file_name: str
    frame_interval: int
    timestamp: str
    scene: SceneDescription
    transcript: str
    storage: Optional[StorageUrls] = None

class ChunkPacket(BaseModel):
    session_id: str
    chunk_index: int
    source_type: str
    timestamp: str
    scene: SceneDescription
    transcript: str
    storage: Optional[StorageUrls] = None


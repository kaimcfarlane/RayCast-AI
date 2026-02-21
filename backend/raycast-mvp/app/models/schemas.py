from pydantic import BaseModel

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

class ContextPacket(BaseModel):
    session_id: str
    source_type: str
    video_file_name: str
    frame_interval: int
    timestamp: str
    scene: SceneDescription
    transcript: str
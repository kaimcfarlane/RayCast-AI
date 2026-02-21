import os, json, base64, cv2
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

VIDEO_PATH = "test.mp4"
Frame_interval = 6

def extract_frames(video_path: str, frame_interval: int):
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError("Could not open video")
    
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if total_frames <= 0:
        raise ValueError("Video has no frames")
    
    #want to pick evenly spaced frames from the video
    frame_indexes = [int(i * (total_frames - 1) / max(frame_interval- 1, 1)) for i in range(frame_interval)]
    frames = []
    for i in frame_indexes:
        cap.set(cv2.CAP_PROP_POS_FRAMES, i)
        ret, frame = cap.read()
        if not ret:
            continue
        ret, jpg_frame = cv2.imencode(".jpg", frame, [int(cv2.IMWRITE_JPEG_QUALITY), 85])
        if not ret:
            continue
        frames.append(jpg_frame.tobytes())
    cap.release()
    if not frames:
        raise ValueError("No frames extracted")
    return frames

def scene_description(frames: list[bytes]):
    prompt = """
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
    - Do NOT include 
    - If you cannot read the text, do not include it in the text_in_scene

    """
    content = [{"type": "input_text", "text": prompt}]
    for frame_bytes in frames:
        b64 = base64.b64encode(frame_bytes).decode("utf-8")
        b64 = b64.replace("\n", "").replace("\r", "")  # safety
        data_url = f"data:image/jpeg;base64,{b64}"

        content.append({
            "type": "input_image",
            "image_url": data_url
        })


    response = client.responses.create(
        model="gpt-4o-mini",
        input = [{"role": "user", "content": content}]
    )

    raw_text = response.output_text

    if not raw_text:
        raise ValueError("Model returned no text output")

    return json.loads(raw_text)

if __name__ == "__main__":
    frames = extract_frames(VIDEO_PATH, Frame_interval)
    result= scene_description(frames)
    print(json.dumps(result, indent=2))

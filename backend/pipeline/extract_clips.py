import os
import subprocess


def extract_keyframes_simple(video_path, output_dir, count=4):
    os.makedirs(output_dir, exist_ok=True)
    # Get video duration first
    result = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", video_path],
        capture_output=True, text=True
    )
    duration = float(result.stdout.strip())

    frame_paths = []
    for i in range(count):
        timestamp = (duration / count) * i
        out_path = f"{output_dir}/frame_{i:02d}.jpg"
        subprocess.run([
            "ffmpeg", "-ss", str(timestamp), "-i", video_path,
            "-frames:v", "1", "-q:v", "2", out_path, "-y"
        ], check=True)
        frame_paths.append(out_path)
    return frame_paths

# import cv2
# 
# def extract_keyframes_cv2(video_path, output_dir, count=4):
#     os.makedirs(output_dir, exist_ok=True)
#     cap = cv2.VideoCapture(video_path)
#     total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
#     frame_paths = []

#     for i in range(count):
#         frame_idx = int((total_frames / count) * i)
#         cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
#         ret, frame = cap.read()
#         if ret:
#             path = f"{output_dir}/frame_{i:02d}.jpg"
#             cv2.imwrite(path, frame)
#             frame_paths.append(path)

#     cap.release()
#     return frame_paths
import subprocess


def composite_vlog(source_video, audio_path, output_video_path):
    print("Compositing video and audio with FFmpeg...")
    cmd = [
        "ffmpeg", "-y",
        "-i", source_video,
        "-i", audio_path,
        "-map", "0:v:0",       # Extract video stream only (mutes original sound)
        "-map", "1:a:0",       # Use generated gTTS audio stream
        "-c:v", "copy",        # Fast copy video codec
        "-c:a", "aac",         # AAC audio stream
        "-b:a", "192k",
        "-shortest",           # Match duration to shortest stream
        output_video_path
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f"Final AnimalVlog produced at: {output_video_path}")
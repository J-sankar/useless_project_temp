from pipeline.extract_clips import extract_keyframes_simple
from pipeline.analyze_script import analyze_and_script
from pipeline.generate_audio import generate_malayalam_audio
from pipeline.composite_clips import composite_vlog
import os
from pathlib import Path


def main():
	backend_dir = Path(__file__).resolve().parents[1]
	source_video = backend_dir / "assets" / "test.mp4"
	output_dir = backend_dir / "pipeline" / "output"
	frames_dir = output_dir / "frames"
	audio_path = output_dir / "malayalam_narration.mp3"
	output_video = output_dir / "animal_vlog.mp4"

	if not source_video.is_file():
		raise FileNotFoundError(f"Example video not found: {source_video}")
	if not os.getenv("GEMINI_API_KEY"):
		raise RuntimeError("Set GEMINI_API_KEY before running the pipeline.")

	output_dir.mkdir(parents=True, exist_ok=True)
	frame_paths = extract_keyframes_simple(str(source_video), str(frames_dir))
	script = analyze_and_script(
		frame_paths,
		personality_prompt="You are playful, curious, and warmly dramatic.",
		pet_name="Milo",
	)
	if not script:
		raise RuntimeError("The script analysis did not return any narration.")

	print("Generated script:")
	print(script)
	generate_malayalam_audio(script, str(audio_path))
	composite_vlog(str(source_video), str(audio_path), str(output_video))
	print(f"Pipeline complete: {output_video}")


if __name__ == "__main__":
	main()
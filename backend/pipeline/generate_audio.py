from gtts import gTTS

def generate_malayalam_audio(script_text, output_audio_path):
    print("Generating Malayalam TTS...")
    # lang='ml' natively generates Malayalam speech via gTTS
    tts = gTTS(text=script_text, lang="ml", slow=False)
    tts.save(output_audio_path)
    print(f"Audio saved to: {output_audio_path}")
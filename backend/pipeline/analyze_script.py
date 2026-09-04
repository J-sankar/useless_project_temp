from google import genai
from google.genai import types
import PIL.Image
import os
from dotenv import load_dotenv

# Load key-value pairs from .env into os.environ
load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

client = genai.Client(api_key=API_KEY)

def analyze_and_script(frame_paths, personality_prompt, pet_name):
    images = [PIL.Image.open(p) for p in frame_paths]

    prompt = f"""These are frames from a short video of a pet named {pet_name}.
    {personality_prompt}

    Write a short first-person monologue (4-6 short lines, ~15-20 words each)
    as if {pet_name} is narrating this exact moment in that personality's voice.
    Before generating make sure the content matches the actual scenario, it should be proper.
    Base it on what's actually happening in the frames.
    Return ONLY the monologue lines, one per line, no preamble."""
    try:

        response = client.models.generate_content(
            model="gemini-3.1-flash-lite",
            contents=images + [prompt]
        )
        return response.text.strip()
    except Exception as e:
        print(f"ERROR: {str(e).lower()}")
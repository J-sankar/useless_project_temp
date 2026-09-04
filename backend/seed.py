
from models import PersonalityPreset


def seed_default_presets(db):
    if db.query(PersonalityPreset).first():
        return  # Already seeded

    default_presets = [
        PersonalityPreset(
            name="Dramatic Diva",
            voice_id="EXAVITQu4vr4xnSDxMaL",  # Example ElevenLabs voice ID
            prompt_template="You are a dramatic, high-maintenance pet. Narrate this clip with extreme exaggerated emotion and theatrical main-character energy.",
            description="High drama, theatrical, always the main character."
        ),
        PersonalityPreset(
            name="Judgmental Cat",
            voice_id="21m00Tcm4TlvDq8ikWAM",
            prompt_template="You are a condescending, unimpressed pet who thinks humans are inept. Narrate this clip with heavy sarcasm and dry wit.",
            description="Dry, sarcastic, perpetually unimpressed."
        ),
        PersonalityPreset(
            name="Hyper Golden Retriever",
            voice_id="AZnzlk1XvdvUeBnXmlld",
            prompt_template="You have infinite energy and love EVERYTHING! Everything is the most exciting thing that has ever happened. Use lots of enthusiasm.",
            description="Pure chaotic joy, high energy, loves everything."
        ),
    ]
    
    db.add_all(default_presets)
    db.commit()
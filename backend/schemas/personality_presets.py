from datetime import datetime

from typing import Optional

from pydantic import BaseModel

class PersonalityPresetResponse(BaseModel):
    id: int
    name: str
    tts_lang: str
    tts_tld: str
    description: Optional[str] = None

    class Config:
        from_attributes = True
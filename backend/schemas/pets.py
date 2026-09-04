# schemas.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# ---- Request schemas ----

class PetCreateRequest(BaseModel):
    name: str
    species: str
    breed: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    personality_preset_id: int

class PetUpdateRequest(BaseModel):
    name: Optional[str] = None
    species: Optional[str] = None
    breed: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    personality_preset_id: Optional[int] = None

# ---- Response schemas ----

class PetResponse(BaseModel):
    id: int
    name: str
    species: str
    breed: Optional[str]
    bio: Optional[str]
    avatar_url: Optional[str]
    personality_preset_id: int
    created_at: datetime

    class Config:
        from_attributes = True  # lets this build directly from a SQLAlchemy model

class PetListResponse(BaseModel):
    pets: list[PetResponse]
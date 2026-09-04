from datetime import datetime

from typing import Optional

from pydantic import BaseModel

class PostCreate(BaseModel):
    pet_id: int
    caption: Optional[str] = None
    media_url: str
    media_type: str  # image / video / animalvlog

class PostResponse(BaseModel):
    id: int
    pet_id: int
    pet_name: Optional[str] = None
    avatar_url: Optional[str] = None
    pet_avatar_url: Optional[str] = None
    caption: Optional[str] = None
    media_url: Optional[str] = None
    media_type: Optional[str] = None
    created_at: datetime
    like_count: int = 0
    comment_count: int = 0

    class Config:
        from_attributes = True


class AnimalVlogJobResponse(BaseModel):
    job_id: int
    status: str
    generated_script: Optional[str] = None
    output_video_url: Optional[str] = None
    error: Optional[str] = None

    class Config:
        from_attributes = True
from datetime import datetime

from typing import Optional

from pydantic import BaseModel

class LikeToggle(BaseModel):
    pet_id: int

class LikeResponse(BaseModel):
    liked: bool
    like_count: int
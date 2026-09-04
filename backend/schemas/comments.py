from datetime import datetime

from pydantic import BaseModel

class CommentCreate(BaseModel):
    pet_id: int
    text: str

class CommentResponse(BaseModel):
    id: int
    post_id: int
    pet_id: int
    pet_name: str
    text: str
    created_at: datetime

    class Config:
        from_attributes = True
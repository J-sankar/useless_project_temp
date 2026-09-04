from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class PersonalityPreset(Base):
    __tablename__ = "personality_presets"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    voice_id = Column(String, nullable=False)
    prompt_template = Column(Text, nullable=False)
    description = Column(String)

class Pet(Base):
    __tablename__ = "pets"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    species = Column(String)
    breed = Column(String)
    bio = Column(Text)
    avatar_url = Column(String)
    personality_preset_id = Column(Integer, ForeignKey("personality_presets.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

class Post(Base):
    __tablename__ = "posts"
    id = Column(Integer, primary_key=True)
    pet_id = Column(Integer, ForeignKey("pets.id"), nullable=False)
    caption = Column(Text)
    media_url = Column(String)
    media_type = Column(String)  # image / video / animalvlog
    created_at = Column(DateTime, default=datetime.utcnow)

class Comment(Base):
    __tablename__ = "comments"
    id = Column(Integer, primary_key=True)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)
    pet_id = Column(Integer, ForeignKey("pets.id"), nullable=False)
    text = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class Like(Base):
    __tablename__ = "likes"
    id = Column(Integer, primary_key=True)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)
    pet_id = Column(Integer, ForeignKey("pets.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    __table_args__ = (UniqueConstraint("post_id", "pet_id", name="unique_like"),)

class AnimalVlogJob(Base):
    __tablename__ = "animalvlog_jobs"
    id = Column(Integer, primary_key=True)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=True)
    pet_id = Column(Integer, ForeignKey("pets.id"), nullable=False)
    source_video_url = Column(String)
    personality_preset_id = Column(Integer, ForeignKey("personality_presets.id"))
    status = Column(String, default="pending")
    vision_description = Column(Text)
    generated_script = Column(Text)
    audio_url = Column(String)
    output_video_url = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
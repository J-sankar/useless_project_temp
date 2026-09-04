from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
import models
from schemas.personality_presets import PersonalityPresetResponse

router = APIRouter(prefix="/personality-presets", tags=["pets"])

@router.get("", response_model=list[PersonalityPresetResponse])
def get_presets(db: Session = Depends(get_db)):
    return db.query(models.PersonalityPreset).all()
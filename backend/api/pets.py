from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError, IntegrityError

from database import get_db
import models
from schemas.pets import PetCreateRequest, PetUpdateRequest, PetResponse, PetListResponse

router = APIRouter(prefix="/pets", tags=["pets"])


@router.post("", response_model=PetResponse, status_code=201)
def create_pet(pet: PetCreateRequest, db: Session = Depends(get_db)):
    print(f"[POST /pets] Creating pet: name={pet.name}, species={pet.species}")

    # Validate the personality preset actually exists before inserting
    preset = db.query(models.PersonalityPreset).filter_by(
        id=pet.personality_preset_id
    ).first()
    if not preset:
        print(f"[POST /pets] FAILED — invalid personality_preset_id={pet.personality_preset_id}")
        raise HTTPException(
            status_code=400,
            detail=f"personality_preset_id {pet.personality_preset_id} does not exist"
        )

    try:
        new_pet = models.Pet(**pet.model_dump())
        db.add(new_pet)
        db.commit()
        db.refresh(new_pet)
        print(f"[POST /pets] SUCCESS — created pet id={new_pet.id}, name={new_pet.name}")
        return new_pet

    except IntegrityError as e:
        db.rollback()
        print(f"[POST /pets] INTEGRITY ERROR: {e}")
        raise HTTPException(status_code=400, detail="Invalid pet data — constraint violation")

    except SQLAlchemyError as e:
        db.rollback()
        print(f"[POST /pets] DB ERROR: {e}")
        raise HTTPException(status_code=500, detail="Failed to create pet due to a server error")


@router.get("", response_model=PetListResponse)
def list_pets(db: Session = Depends(get_db)):
    print("[GET /pets] Fetching all pets")
    try:
        pets = db.query(models.Pet).all()
        print(f"[GET /pets] SUCCESS — retrieved {len(pets)} pets")
        return {"pets": pets}

    except SQLAlchemyError as e:
        print(f"[GET /pets] DB ERROR: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch pets")


@router.get("/{pet_id}", response_model=PetResponse)
def get_pet(pet_id: int, db: Session = Depends(get_db)):
    print(f"[GET /pets/{pet_id}] Fetching pet")
    try:
        pet = db.query(models.Pet).filter_by(id=pet_id).first()

        if not pet:
            print(f"[GET /pets/{pet_id}] NOT FOUND")
            raise HTTPException(status_code=404, detail="Pet not found")

        print(f"[GET /pets/{pet_id}] SUCCESS")
        return pet

    except HTTPException:
        raise  # re-raise without catching it below as a 500

    except SQLAlchemyError as e:
        print(f"[GET /pets/{pet_id}] DB ERROR: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch pet")


@router.patch("/{pet_id}", response_model=PetResponse)
def update_pet(pet_id: int, updates: PetUpdateRequest, db: Session = Depends(get_db)):
    print(f"[PATCH /pets/{pet_id}] Updating pet")

    try:
        pet = db.query(models.Pet).filter_by(id=pet_id).first()
        if not pet:
            print(f"[PATCH /pets/{pet_id}] NOT FOUND")
            raise HTTPException(status_code=404, detail="Pet not found")

        update_data = updates.model_dump(exclude_unset=True)

        if not update_data:
            print(f"[PATCH /pets/{pet_id}] FAILED — no fields provided")
            raise HTTPException(status_code=400, detail="No fields provided to update")

        # Validate new personality_preset_id if it's being changed
        if "personality_preset_id" in update_data:
            preset = db.query(models.PersonalityPreset).filter_by(
                id=update_data["personality_preset_id"]
            ).first()
            if not preset:
                print(
                    f"[PATCH /pets/{pet_id}] FAILED — invalid personality_preset_id="
                    f"{update_data['personality_preset_id']}"
                )
                raise HTTPException(
                    status_code=400,
                    detail=f"personality_preset_id {update_data['personality_preset_id']} does not exist"
                )

        for field, value in update_data.items():
            setattr(pet, field, value)

        db.commit()
        db.refresh(pet)
        print(f"[PATCH /pets/{pet_id}] SUCCESS")
        return pet

    except HTTPException:
        raise

    except SQLAlchemyError as e:
        db.rollback()
        print(f"[PATCH /pets/{pet_id}] DB ERROR: {e}")
        raise HTTPException(status_code=500, detail="Failed to update pet")
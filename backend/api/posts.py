import shutil
from pathlib import Path
from typing import List
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from models import Post, Like, Comment, Pet
from schemas.posts import PostCreate, PostResponse
from schemas.comments import CommentCreate, CommentResponse
from schemas.likes import LikeResponse, LikeToggle
from pipeline.analyze_script import analyze_and_script
from pipeline.composite_clips import composite_vlog
from pipeline.extract_clips import extract_keyframes_simple
from pipeline.generate_audio import generate_malayalam_audio

router = APIRouter(prefix="/posts", tags=["posts"])
MEDIA_DIR = Path(__file__).resolve().parents[1] / "media" / "animal_vlogs"
POST_MEDIA_DIR = Path(__file__).resolve().parents[1] / "media" / "posts"


@router.get("", response_model=List[PostResponse])
def get_feed(db: Session = Depends(get_db)):
    posts = db.query(Post, Pet).join(Pet, Pet.id == Post.pet_id).order_by(Post.created_at.desc()).all()
    feed = []
    for post, pet in posts:
        like_cnt = db.query(func.count(Like.id)).filter(Like.post_id == post.id).scalar()
        comment_cnt = db.query(func.count(Comment.id)).filter(Comment.post_id == post.id).scalar()
        
        feed.append(PostResponse(
            id=post.id,
            pet_id=post.pet_id,
            pet_name=pet.name,
            avatar_url=pet.avatar_url,
            pet_avatar_url=pet.avatar_url,
            caption=post.caption,
            media_url=post.media_url,
            media_type=post.media_type,
            created_at=post.created_at,
            like_count=like_cnt or 0,
            comment_count=comment_cnt or 0
        ))
    return feed


@router.post("", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
def create_post(payload: PostCreate, db: Session = Depends(get_db)):
    pet = db.query(Pet).filter(Pet.id == payload.pet_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")

    new_post = Post(
        pet_id=payload.pet_id,
        caption=payload.caption,
        media_url=payload.media_url,
        media_type=payload.media_type,
    )
    db.add(new_post)
    db.commit()
    db.refresh(new_post)

    return PostResponse(
        id=new_post.id,
        pet_id=new_post.pet_id,
        pet_name=pet.name,
        avatar_url=pet.avatar_url,
        pet_avatar_url=pet.avatar_url,
        caption=new_post.caption,
        media_url=new_post.media_url,
        media_type=new_post.media_type,
        created_at=new_post.created_at,
        like_count=0,
        comment_count=0,
    )


@router.post("/upload", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
def create_file_post(
    media: UploadFile = File(...),
    pet_id: int = Form(...),
    caption: str = Form(""),
    db: Session = Depends(get_db),
):
    pet = db.query(Pet).filter(Pet.id == pet_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    if not media.filename or media.content_type not in {"image/jpeg", "image/png", "image/gif", "image/webp", "video/mp4", "video/webm", "video/quicktime"}:
        raise HTTPException(status_code=400, detail="Upload a JPEG, PNG, GIF, WEBP, MP4, WEBM, or MOV file.")

    POST_MEDIA_DIR.mkdir(parents=True, exist_ok=True)
    suffix = Path(media.filename).suffix.lower()
    stored_name = f"{uuid4().hex}{suffix}"
    stored_path = POST_MEDIA_DIR / stored_name
    with stored_path.open("wb") as destination:
        shutil.copyfileobj(media.file, destination)

    media_type = "image" if media.content_type.startswith("image/") else "video"
    post = Post(
        pet_id=pet_id,
        caption=caption.strip() or None,
        media_url=f"/posts/media/{stored_name}",
        media_type=media_type,
    )
    try:
        db.add(post)
        db.commit()
        db.refresh(post)
    except Exception:
        db.rollback()
        stored_path.unlink(missing_ok=True)
        raise

    return PostResponse(
        id=post.id,
        pet_id=post.pet_id,
        pet_name=pet.name,
        avatar_url=pet.avatar_url,
        pet_avatar_url=pet.avatar_url,
        caption=post.caption,
        media_url=post.media_url,
        media_type=post.media_type,
        created_at=post.created_at,
        like_count=0,
        comment_count=0,
    )


@router.get("/media/{filename}")
def get_post_media(filename: str):
    media_path = POST_MEDIA_DIR / filename
    if media_path.parent != POST_MEDIA_DIR or not media_path.is_file():
        raise HTTPException(status_code=404, detail="Post media not found")
    return FileResponse(media_path)


@router.post("/animal-vlog", status_code=status.HTTP_201_CREATED)
def create_animal_vlog(
    video: UploadFile = File(...),
    pet_id: int = Form(...),
    pet_name: str = Form(...),
    personality_prompt: str = Form("You are playful, curious, and warmly dramatic."),
    caption: str = Form("Animal vlog"),
    db: Session = Depends(get_db),
):
    pet = db.query(Pet).filter(Pet.id == pet_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    if not video.filename:
        raise HTTPException(status_code=400, detail="A video file is required")

    job_dir = MEDIA_DIR / uuid4().hex
    job_dir.mkdir(parents=True, exist_ok=True)
    source_path = job_dir / Path(video.filename).name
    audio_path = job_dir / "narration.mp3"
    output_path = job_dir / "animal_vlog.mp4"

    try:
        with source_path.open("wb") as destination:
            shutil.copyfileobj(video.file, destination)

        frame_paths = extract_keyframes_simple(str(source_path), str(job_dir / "frames"))
        script = analyze_and_script(frame_paths, personality_prompt, pet_name)
        if not script:
            raise RuntimeError("No narration was generated")

        generate_malayalam_audio(script, str(audio_path))
        composite_vlog(str(source_path), str(audio_path), str(output_path))

        post = Post(
            pet_id=pet_id,
            caption=caption,
            media_url=f"/posts/animal-vlog/media/{job_dir.name}",
            media_type="animalvlog",
        )
        db.add(post)
        db.commit()
        db.refresh(post)
        return {
            "id": post.id,
            "post_id": post.id,
            "pet_id": post.pet_id,
            "pet_name": pet.name,
            "avatar_url": pet.avatar_url,
            "pet_avatar_url": pet.avatar_url,
            "caption": post.caption,
            "media_type": post.media_type,
            "media_url": post.media_url,
            "generated_script": script,
        }
    except Exception as error:
        db.rollback()
        shutil.rmtree(job_dir, ignore_errors=True)
        raise HTTPException(status_code=500, detail=f"Animal vlog generation failed: {error}") from error


@router.get("/animal-vlog/media/{job_name}")
def get_animal_vlog_media(job_name: str):
    output_path = MEDIA_DIR / job_name / "animal_vlog.mp4"
    if not output_path.is_file() or output_path.parent.parent != MEDIA_DIR:
        raise HTTPException(status_code=404, detail="Animal vlog not found")
    return FileResponse(output_path, media_type="video/mp4", filename="animal_vlog.mp4")


@router.post("/{post_id}/like", response_model=LikeResponse)
def toggle_like(post_id: int, payload: LikeToggle, db: Session = Depends(get_db)):
    # Validate post and pet existence to avoid Foreign Key errors
    if not db.query(Post).filter(Post.id == post_id).first():
        raise HTTPException(status_code=404, detail="Post not found")
    if not db.query(Pet).filter(Pet.id == payload.pet_id).first():
        raise HTTPException(status_code=404, detail="Pet not found")

    existing_like = db.query(Like).filter(
        Like.post_id == post_id,
        Like.pet_id == payload.pet_id
    ).first()

    if existing_like:
        db.delete(existing_like)
        db.commit()
        liked = False
    else:
        new_like = Like(post_id=post_id, pet_id=payload.pet_id)
        db.add(new_like)
        db.commit()
        liked = True

    like_count = db.query(func.count(Like.id)).filter(Like.post_id == post_id).scalar()
    return LikeResponse(liked=liked, like_count=like_count or 0)


@router.post("/{post_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def add_comment(post_id: int, payload: CommentCreate, db: Session = Depends(get_db)):
    if not db.query(Post).filter(Post.id == post_id).first():
        raise HTTPException(status_code=404, detail="Post not found")
    pet = db.query(Pet).filter(Pet.id == payload.pet_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")

    new_comment = Comment(
        post_id=post_id,
        pet_id=payload.pet_id,
        pet_name=pet.name,
        text=payload.text
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    return new_comment


@router.get("/{post_id}/comments", response_model=List[CommentResponse])
def get_post_comments(post_id: int, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    comments = (
        db.query(Comment, Pet.name)
        .join(Pet, Pet.id == Comment.pet_id)
        .filter(Comment.post_id == post_id)
        .order_by(Comment.created_at.asc())
        .all()
    )
    return [
        CommentResponse(
            id=comment.id,
            post_id=comment.post_id,
            pet_id=comment.pet_id,
            pet_name=comment.pet_name or pet_name,
            text=comment.text,
            created_at=comment.created_at,
        )
        for comment, pet_name in comments
    ]
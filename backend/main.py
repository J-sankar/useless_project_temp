from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import event
from database import engine, Base, SessionLocal
from models import PersonalityPreset  # Adjust import paths as needed
from api.pets import router as petRouter 
from api.personality import router 
from api.posts import router as postsRouter
from seed import seed_default_presets
from dotenv import load_dotenv
import os
# Force SQLite to enforce Foreign Key constraints
load_dotenv()
app = FastAPI(title="Unplanned")
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()



@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- Startup Logic ---
    # Create all database tables
    Base.metadata.create_all(bind=engine)
    
    # Seed default personality presets
    db = SessionLocal()
    print("db ready")
    try:
        seed_default_presets(db)
    finally:
        db.close()
        
    yield
    
    # --- Shutdown Logic ---
    # Dispose connection pools gracefully
    engine.dispose()

# Pass the lifespan function directly to your FastAPI app instance:
app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        os.getenv("FRONTEND_URL")
    ],             # Allows requests from Vite, Next.js, or local HTML
    allow_credentials=True,
    allow_methods=["*"],             # Allows GET, POST, PUT, DELETE, OPTIONS
    allow_headers=["*"],             # Allows headers like Content-Type and Authorization
)
app.mount(
    "/assets",
    StaticFiles(directory=Path(__file__).resolve().parents[1] / "frontend" / "assets"),
    name="frontend-assets",
)


@app.api_route("/", methods=["GET", "HEAD"])
def read_root():
    return {"status": "ok"}

app.include_router(petRouter)
app.include_router(router)
app.include_router(postsRouter)
from contextlib import asynccontextmanager
from fastapi import FastAPI
from sqlalchemy import event
from database import engine, Base, SessionLocal
from models import PersonalityPreset  # Adjust import paths as needed
from seed import seed_default_presets
# Force SQLite to enforce Foreign Key constraints

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
@app.get("/")
def read_root(count:int):
    return {"status": "PawPost backend running"}
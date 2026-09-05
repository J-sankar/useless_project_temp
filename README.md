<img width="1280" height="640" alt="git (1)" src="https://github.com/user-attachments/assets/8920b256-2ba8-4988-b824-5351134eb4bd" />



# e-മൃഗാലയം 🎯


## Basic Details
### Team Name: Useless4lyf


### Team Members
- Team Lead: Jayasankar Menon V - Model Engineering College
- Member 2: Devikrishna M K - Model Engineering College

### Project Description
e-മൃഗാലയം is a pet-only social media platform where animals can create profiles, share photos and videos, like posts, and leave comments. Its main feature, AnimalVlog, uses AI-generated personalities and voiceovers to turn pet videos into funny narrated clips.

### The Problem (that doesn't exist)
Animals everywhere are constantly photographed, filmed, and posted online without their permission. Pets are given social media accounts they cannot control, while stray, farm, and wild animals have no platform to share their experiences at all. The entire animal kingdom is forced to watch humans dominate the internet.

### The Solution (that nobody asked for)
e-മൃഗാലയം creates a social network for the entire animal kingdom. Pets, strays, farm animals, and even wild creatures can have digital profiles, share their adventures, express their personalities, and interact with other animals. With AnimalVlog, videos can receive hilarious AI-generated voices, finally letting every animal tell its own side of the story. 

## Technical Details
### Technologies/Components Used
For Software:
- Languages: JavaScript, Python, HTML, CSS
- Frontend: React, Vite, React Router
- Backend: FastAPI
- Database: SQLite with SQLAlchemy
- Libraries: Lucide React, Pydantic, Uvicorn, gTTS
- Tools: VS Code, Git, GitHub, uv, npm

For Hardware:
- No hardware components required

### Implementation
For Software:
# Installation

### Prerequisites

- Python 3.11 or newer
- Node.js 18 or newer and npm
- `uv`
- FFmpeg and FFprobe for AnimalVlog processing

On Ubuntu/Debian, install FFmpeg with:

```bash
sudo apt update
sudo apt install ffmpeg
```

### Backend

From the project root:

```bash
cd backend
uv sync
```

Create `backend/.env` and add your Gemini API key:

```env
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:5173
PROD=0
```

### Frontend

In a second terminal:

```bash
cd frontend
npm install
```

The frontend uses `http://localhost:8000` as the default backend URL. To use another backend URL, create `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000
```

# Run

Start the backend in the first terminal:

```bash
cd backend
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Start the frontend in the second terminal:

```bash
cd frontend
npm run dev
```

Open the application at [http://localhost:5173](http://localhost:5173). The API is available at [http://localhost:8000](http://localhost:8000), and its interactive documentation is at [http://localhost:8000/docs](http://localhost:8000/docs).

For a production frontend build:

```bash
cd frontend
npm run build
npm run preview
```

### Project Documentation
For Software:

# Screenshots (Add at least 3)
![Screenshot1](Add screenshot 1 here with proper name)
*Add caption explaining what this shows*

![Screenshot2](Add screenshot 2 here with proper name)
*Add caption explaining what this shows*

![Screenshot3](Add screenshot 3 here with proper name)
*Add caption explaining what this shows*

# Diagrams

## System Architecture

```mermaid
graph TD
    A[React Frontend] -->|REST API calls| B[FastAPI Backend]
    B --> C[(SQLite DB)]
    B --> D[AnimalVlog Pipeline]
    D --> E[ffmpeg: Keyframe Extraction]
    E --> F[Gemini Vision + Script Generation]
    F --> G[gTTS: Text-to-Speech]
    G --> H[ffmpeg: Video Compositing]
    H --> I[Final Video]
    I --> B
    B --> A
```
*High-level architecture: the frontend talks to a FastAPI backend backed by SQLite, with uploaded videos routed through the AnimalVlog pipeline before the finished clip is posted back to the feed.*

## AnimalVlog Pipeline Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant ffmpeg
    participant Gemini
    participant gTTS

    User->>Frontend: Upload video + select personality
    Frontend->>Backend: POST /animalvlog/upload (multipart)
    Backend->>Backend: Create AnimalVlogJob (status: pending)
    Backend-->>Frontend: 202 Accepted (job_id)
    
    Backend->>ffmpeg: Extract keyframes
    ffmpeg-->>Backend: Frame images
    Backend->>Backend: status: analyzing

    Backend->>Gemini: Analyze frames + personality prompt
    Gemini-->>Backend: Generated script
    Backend->>Backend: status: scripting

    Backend->>gTTS: Convert script to speech
    gTTS-->>Backend: Audio file
    Backend->>Backend: status: voicing

    Backend->>ffmpeg: Mute original + overlay audio + captions
    ffmpeg-->>Backend: Final video
    Backend->>Backend: status: done

    loop Poll every few seconds
        Frontend->>Backend: GET /animalvlog/status/{job_id}
        Backend-->>Frontend: status + result
    end

    Frontend->>User: Display dubbed video in feed
```
*Step-by-step flow of the AnimalVlog feature: the upload kicks off a background pipeline that moves through keyframe extraction, vision analysis, script generation, TTS, and compositing, with the frontend polling job status until the final dubbed video is ready.*
For Hardware:

# Schematic & Circuit
![Circuit](Add your circuit diagram here)
*Add caption explaining connections*

![Schematic](Add your schematic diagram here)
*Add caption explaining the schematic*

# Build Photos
![Components](Add photo of your components here)
*List out all components shown*

![Build](Add photos of build process here)
*Explain the build steps*

![Final](Add photo of final product here)
*Explain the final build*

### Project Demo
# Video
[Add your demo video link here]
*Explain what the video demonstrates*

# Additional Demos
[Add any extra demo materials/links]

## Team Contributions
- [Name 1]: [Specific contributions]
- [Name 2]: [Specific contributions]
- [Name 3]: [Specific contributions]

---
Made with ❤️ at TinkerHub Useless Projects 

![Static Badge](https://img.shields.io/badge/TinkerHub-24?color=%23000000&link=https%3A%2F%2Fwww.tinkerhub.org%2F)
![Static Badge](https://img.shields.io/badge/UselessProjects--26-26?link=https%3A%2F%2Ftinkerhub.org%2Fevents%2F1M8ORET9A1%2Fuseless-projects-3.0)
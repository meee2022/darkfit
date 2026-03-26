from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "DarkFit Backend is running"}

@app.get("/api/status")
def status():
    return {
        "app": "DarkFit",
        "backend": "Convex Cloud",
        "note": "This is a minimal proxy. Main backend is on Convex."
    }

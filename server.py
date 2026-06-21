import os
from pathlib import Path

import uvicorn
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles


BASE_DIR = Path(__file__).resolve().parent

app = FastAPI(
    title="Climbase",
    description="A small app for uploading a climbing wall picture and making routes.",
    version="1.0.0",
)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": "climbase"}


app.mount("/", StaticFiles(directory=BASE_DIR, html=True), name="frontend")


def main():
    reload_enabled = os.getenv("CLIMBASE_RELOAD", "0") == "1"
    uvicorn.run(
        "server:app",
        host="127.0.0.1",
        port=8000,
        reload=reload_enabled,
    )


if __name__ == "__main__":
    main()

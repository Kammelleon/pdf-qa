from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from consts import API_TITLE
from settings import get_host_env, get_port_env
from logger import get_logger
from pathlib import Path
from settings import UPLOADED_FILES_DIRECTORY_NAME, VECTOR_STORE_DIRECTORY_NAME

UPLOADED_FILES_DIRECTORY = Path(UPLOADED_FILES_DIRECTORY_NAME)
VECTOR_STORE_DIRECTORY = Path(VECTOR_STORE_DIRECTORY_NAME)
UPLOADED_FILES_DIRECTORY.mkdir(exist_ok=True)
VECTOR_STORE_DIRECTORY.mkdir(exist_ok=True)

CORS_ALLOW_ORIGINS = ["*"]
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_METHODS = ["*"]
CORS_ALLOW_HEADERS = ["*"]

logger = get_logger(__name__)

app = FastAPI(title=API_TITLE)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ALLOW_ORIGINS,
    allow_credentials=CORS_ALLOW_CREDENTIALS,
    allow_methods=CORS_ALLOW_METHODS,
    allow_headers=CORS_ALLOW_HEADERS,
)

logger.info("Initializing API router with /api prefix")
api_router = FastAPI(title=f"{API_TITLE} API")
app.mount("/api", api_router)
logger.info("API router mounted at /api")

@app.get("/")
async def root():
    return {"message": API_TITLE}

@api_router.get("/")
async def api_root():
    return {"message": f"{API_TITLE} API"}

if __name__ == "__main__":
    uvicorn.run("main:app", host=get_host_env(), port=get_port_env(), reload=True)

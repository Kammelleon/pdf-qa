from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from consts import API_TITLE
from settings import get_host_env, get_port_env

CORS_ALLOW_ORIGINS = ["*"]
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_METHODS = ["*"]
CORS_ALLOW_HEADERS = ["*"]

app = FastAPI(title=API_TITLE)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ALLOW_ORIGINS,
    allow_credentials=CORS_ALLOW_CREDENTIALS,
    allow_methods=CORS_ALLOW_METHODS,
    allow_headers=CORS_ALLOW_HEADERS,
)

@app.get("/")
async def root():
    return {"message": API_TITLE}

if __name__ == "__main__":
    uvicorn.run("main:app", host=get_host_env(), port=get_port_env(), reload=True)

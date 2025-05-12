import os
from pathlib import Path
from dotenv import load_dotenv

# Directories settings
UPLOADED_FILES_DIRECTORY_NAME = "uploads"
VECTOR_STORE_DIRECTORY_NAME = "vector_store"

# API settings
DEFAULT_HOST = "0.0.0.0"
DEFAULT_PORT = 8000

# Load environment variables from .env file
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

def get_host_env() -> str:
    return os.getenv("HOST", DEFAULT_HOST)

def get_port_env() -> int:
    port = os.getenv("PORT", DEFAULT_PORT)
    return int(port)

import os
from pathlib import Path
from dotenv import load_dotenv
from pydantic import SecretStr

# Directories settings
UPLOADED_FILES_DIRECTORY_NAME = "uploads"
VECTOR_STORE_DIRECTORY_NAME = "vector_store"

# OpenAI model settings
MODEL_NAME = "gpt-3.5-turbo"
TEMPERATURE = 0

# PDF processing settings
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200
SEARCH_TYPE = "similarity"
TOP_K_RESULTS = 5
CHAIN_TYPE = "refine"

# API settings
DEFAULT_HOST = "0.0.0.0"
DEFAULT_PORT = 8000

# Load environment variables from .env file
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)


def get_openai_api_key_env() -> SecretStr:
    api_key = SecretStr(os.getenv("OPENAI_API_KEY"))
    if not api_key:
        raise ValueError("OPENAI_API_KEY environment variable is not set.")
    return api_key


def get_host_env() -> str:
    return os.getenv("HOST", DEFAULT_HOST)


def get_port_env() -> int:
    port = os.getenv("PORT", DEFAULT_PORT)
    return int(port)

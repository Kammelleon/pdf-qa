import uvicorn
import shutil
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pdf_processor import process_pdf, get_answer_from_pdf
from schemas import AnswerResponse, QuestionRequest
from consts import API_TITLE, ERROR_INVALID_FILE, ERROR_FILE_SAVE, ERROR_FILE_NOT_FOUND, ERROR_PERMISSION, \
    ERROR_PROCESSING_PDF, ERROR_ANSWERING_QUESTION
from settings import get_host_env, get_port_env
from logger import get_logger
from utils import calculate_file_hash
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
logger.info("API router mounted at /api")


@app.get("/")
async def root():
    return {"message": API_TITLE}


@app.post("/api/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    logger.info(f"Received upload request for file: {file.filename}")

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail=ERROR_INVALID_FILE)

    try:
        temp_file_path = UPLOADED_FILES_DIRECTORY / file.filename
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except IOError as e:
        logger.error(f"Error saving file: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=ERROR_FILE_SAVE)

    try:
        file_hash = calculate_file_hash(temp_file_path)
        vector_store_path = VECTOR_STORE_DIRECTORY / file_hash
        if not vector_store_path.exists():
            logger.info(f"Processing new PDF file: {file.filename}")
            process_pdf(str(temp_file_path), str(VECTOR_STORE_DIRECTORY), file_hash)
        else:
            logger.info(f"Using existing vector store for file: {file.filename}")
        return {"file_hash": file_hash, "filename": file.filename}
    except FileNotFoundError as e:
        logger.error(f"File not found: {str(e)}", exc_info=True)
        raise HTTPException(status_code=404, detail=ERROR_FILE_NOT_FOUND)
    except PermissionError as e:
        logger.error(f"Permission error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=403, detail=ERROR_PERMISSION)
    except Exception as e:
        logger.error(f"Error processing PDF: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=ERROR_PROCESSING_PDF)


@app.post("/api/ask-question", response_model=AnswerResponse)
async def ask_question(request: QuestionRequest):
    file_hash = request.file_hash
    vector_store_path = VECTOR_STORE_DIRECTORY / file_hash

    if not vector_store_path.exists():
        logger.error(f"Vector store not found for hash: {file_hash}")
        raise HTTPException(status_code=404, detail=ERROR_FILE_NOT_FOUND)

    try:
        answer = get_answer_from_pdf(request.question, str(VECTOR_STORE_DIRECTORY), file_hash)
        return AnswerResponse(answer=answer, file_hash=file_hash)
    except FileNotFoundError as e:
        logger.error(f"File not found: {str(e)}", exc_info=True)
        raise HTTPException(status_code=404, detail=ERROR_FILE_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error answering question: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=ERROR_ANSWERING_QUESTION)


if __name__ == "__main__":
    uvicorn.run("main:app", host=get_host_env(), port=get_port_env())

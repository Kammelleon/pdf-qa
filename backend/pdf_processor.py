from pathlib import Path
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain.chains import RetrievalQA
from logger import get_logger
from settings import (get_openai_api_key_env, MODEL_NAME, TEMPERATURE, CHUNK_SIZE, CHUNK_OVERLAP, SEARCH_TYPE,
                      TOP_K_RESULTS, CHAIN_TYPE)


logger = get_logger(__name__)


def get_embeddings() -> OpenAIEmbeddings:
    """
    Initialize and return OpenAI embeddings.

    Returns:
        OpenAIEmbeddings: Initialized embeddings object

    Raises:
        ValueError: If API key is missing or invalid
    """
    try:
        api_key = get_openai_api_key_env()
        return OpenAIEmbeddings(api_key=api_key)
    except ValueError as e:
        logger.error(f"API key error: {str(e)}", exc_info=True)
        raise
    except Exception as e:
        logger.error(f"Error initializing OpenAI embeddings: {str(e)}", exc_info=True)
        raise

def process_pdf(pdf_path: str, vector_store_dir: str, file_hash: str) -> None:
    """
    Process a PDF file:
    1. Load and extract text from PDF
    2. Split text into chunks
    3. Generate embeddings
    4. Create and save FAISS vector store

    Args:
        pdf_path: Path to the PDF file
        vector_store_dir: Directory to save the vector store
        file_hash: Hash of the PDF file for identification

    Raises:
        FileNotFoundError: If the PDF file is not found
        ValueError: If there's an issue with the PDF content or embeddings
        IOError: If there's an issue reading the PDF or writing the vector store
    """
    try:
        logger.info(f"Loading PDF from {pdf_path}")
        loader = PyPDFLoader(pdf_path)
        documents = loader.load()
    except FileNotFoundError as e:
        logger.error(f"PDF file not found: {str(e)}", exc_info=True)
        raise
    except IOError as e:
        logger.error(f"Error reading PDF file: {str(e)}", exc_info=True)
        raise
    except Exception as e:
        logger.error(f"Unexpected error loading PDF: {str(e)}", exc_info=True)
        raise ValueError(f"Error processing PDF content: {str(e)}")

    try:
        logger.info(f"Splitting text into chunks")
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=CHUNK_SIZE,
            chunk_overlap=CHUNK_OVERLAP,
            length_function=len,
        )
        texts = text_splitter.split_documents(documents)
    except Exception as e:
        logger.error(f"Error splitting text: {str(e)}", exc_info=True)
        raise ValueError(f"Error splitting PDF content: {str(e)}")

    try:
        logger.info(f"Generating embeddings and creating vector store")
        embeddings = get_embeddings()
        vector_store = FAISS.from_documents(texts, embeddings)
    except ValueError as e:
        logger.error(f"Error with embeddings: {str(e)}", exc_info=True)
        raise
    except Exception as e:
        logger.error(f"Error creating vector store: {str(e)}", exc_info=True)
        raise ValueError(f"Error creating embeddings or vector store: {str(e)}")

    try:
        vector_store_path = Path(vector_store_dir) / file_hash
        vector_store.save_local(str(vector_store_path))
        logger.info(f"Vector store saved to {vector_store_path}")
    except IOError as e:
        logger.error(f"Error saving vector store: {str(e)}", exc_info=True)
        raise
    except Exception as e:
        logger.error(f"Unexpected error saving vector store: {str(e)}", exc_info=True)
        raise IOError(f"Error saving vector store: {str(e)}")

def get_answer_from_pdf(question: str, vector_store_dir: str, file_hash: str) -> str:
    """
    Answer a question based on the content of a processed PDF.

    Args:
        question: The question to answer
        vector_store_dir: Directory where vector stores are saved
        file_hash: Hash of the PDF file

    Returns:
        Answer to the question

    Raises:
        FileNotFoundError: If the vector store file is not found
        ValueError: If there's an issue with the question or embeddings
        IOError: If there's an issue reading the vector store
    """
    logger.info(f"Answering question: {question}")

    if not question.strip():
        logger.error("Empty question provided")
        raise ValueError("Question cannot be empty")

    try:
        vector_store_path = Path(vector_store_dir) / file_hash
        embeddings = get_embeddings()
        vector_store = FAISS.load_local(str(vector_store_path), embeddings, allow_dangerous_deserialization=True)
    except FileNotFoundError as e:
        logger.error(f"Vector store file not found: {str(e)}", exc_info=True)
        raise
    except IOError as e:
        logger.error(f"Error reading vector store: {str(e)}", exc_info=True)
        raise
    except ValueError as e:
        logger.error(f"Error with embeddings: {str(e)}", exc_info=True)
        raise
    except Exception as e:
        logger.error(f"Unexpected error loading vector store: {str(e)}", exc_info=True)
        raise IOError(f"Error loading vector store: {str(e)}")

    try:
        retriever = vector_store.as_retriever(
            search_type=SEARCH_TYPE,
            search_kwargs={"k": TOP_K_RESULTS}
        )
        api_key = get_openai_api_key_env()
        llm = ChatOpenAI(
            model=MODEL_NAME,
            temperature=TEMPERATURE,
            api_key=api_key
        )
    except ValueError as e:
        logger.error(f"Error setting up retriever or language model: {str(e)}", exc_info=True)
        raise
    except Exception as e:
        logger.error(f"Unexpected error in setup: {str(e)}", exc_info=True)
        raise ValueError(f"Error setting up question answering: {str(e)}")

    try:
        qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type=CHAIN_TYPE,
            retriever=retriever,
            return_source_documents=False
        )
        result = qa_chain.invoke({"query": question})
        logger.info(f"Result type: {type(result)}")
        if hasattr(result, "__dict__"):
            logger.info(f"Result attributes: {result.__dict__.keys()}")
        elif isinstance(result, dict):
            logger.info(f"Result keys: {result.keys()}")
        else:
            logger.info(f"Result: {result}")

        if isinstance(result, dict):
            answer = result.get("result", "I couldn't find an answer to that question in the document.")
            logger.info(f"Using dict format, extracted answer from 'result' key")
        elif hasattr(result, "content"):
            answer = result.content
            logger.info(f"Using object format, extracted answer from 'content' attribute")
        else:
            answer = str(result)
            logger.info(f"Using fallback format, converted result to string")
        logger.info(f"Answer generated successfully")
        return answer
    except Exception as e:
        logger.error(f"Error generating answer: {str(e)}", exc_info=True)
        raise ValueError(f"Error generating answer: {str(e)}")

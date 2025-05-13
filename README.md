# PDF Question Answering Application

AWS EC2 Application URL: http://63.178.19.5/ 

This is a web application that analyzes text from a PDF file and answers questions about that text using OpenAI's language model (specifically gpt-3.5-turbo). The application consists of a React frontend with a chat-like interface, field for PDF document upload and a Python FastAPI backend with PDF processing capabilities.

## Features

- Upload and process PDF files with drag-and-drop functionality
- Chat-like interface for asking questions about the PDF content
- AI-generated answers based on the document content using OpenAI's GPT models
- Vector-based search for finding relevant information in the document
- Caching mechanism to avoid reprocessing the same PDF files
- Comprehensive file validation (size, type, content)
- Real-time loading indicators and toast notifications
- Responsive design using Material-UI
- Comprehensive error handling and logging

## Project Structure

The project is organized into two main directories:

- `frontend/`: React application with Material-UI components and Vite build system
- `backend/`: FastAPI application with PDF processing and question answering functionality

## Application Architecture

The application follows a client-server architecture with clear separation of concerns between the frontend and backend components.

### Overall Architecture

```
┌─────────────────┐      HTTP/REST      ┌─────────────────┐      API       ┌─────────────────┐
│                 │                     │                 │                │                 │
│  React Frontend │ ─────────────────►  │ FastAPI Backend │ ─────────────► │   OpenAI API    │
│                 │ ◄─────────────────  │                 │ ◄───────────── │                 │
└─────────────────┘                     └─────────────────┘                └─────────────────┘
                                                │
                                                │
                                                ▼
                                       ┌─────────────────┐
                                       │                 │
                                       │  PDF Processing │
                                       │    (Langchain)  │
                                       │                 │
                                       └─────────────────┘
```

### Frontend (Client)
- **React Application**: Provides the user interface for file upload and question answering
- **Component Layer**: Modular UI components for different functionalities
  - `App.jsx`: Main application component that manages state and routing
  - `FileUpload.jsx`: Handles PDF file selection, validation, and uploading
  - `ChatInterface.jsx`: Manages the chat-like interface for questions and answers
- **Service Layer**: Handles API communication with the backend
  - `api.js`: API calls configuration
- **Utility Layer**: Provides helper functions for validation and other tasks
  - `PdfValidator.js`: Contains functions for validating PDF files

### Backend (Server)
- **FastAPI Application**: Handles HTTP requests and provides API endpoints
  - `main.py`: Defines API routes and request handlers
- **Processing Layer**: Manages PDF processing and question answering
  - `pdf_processor.py`: Contains the core logic for processing PDFs and answering questions
- **Data Layer**: Manages file storage and vector embeddings
  - `vector_store/`: Directory for storing FAISS vector stores
  - `uploads/`: Directory for storing uploaded PDF files
- **Configuration Layer**: Centralizes application settings
  - `settings.py`: Manages environment variables and application configuration

### Frontend-Backend Interaction

The frontend communicates with the backend through a RESTful API:

1. **API Endpoints**:
   - `POST /api/upload-pdf`: For uploading PDF files
   - `POST /api/ask-question`: For asking questions about PDF content

2. **Data Exchange Format**: JSON for request/response bodies, with multipart/form-data for file uploads

3. **Authentication**: Currently not implemented

### Backend-OpenAI Interaction

The backend interacts with the OpenAI API through the Langchain library:

1. **API Integration**:
   - Uses OpenAI's text-embedding-ada-002 model for generating vector embeddings
   - Uses OpenAI's gpt-3.5-turbo model for generating answers

2. **PDF Processing**:
   - Uses Langchain's PyPDFLoader for extracting text from PDFs
   - Uses Langchain's RecursiveCharacterTextSplitter for chunking text
   - Uses FAISS (CPU) for efficient vector similarity search

### Data Flow
1. User uploads a PDF file through the frontend
2. Frontend validates the file and sends it to the backend via a POST request
3. Backend processes the file:
   - Extracts text using PyPDFLoader
   - Splits text into chunks using RecursiveCharacterTextSplitter
   - Generates embeddings using OpenAI's text-embedding-ada-002 model
   - Stores embeddings in a FAISS vector store
4. User asks a question in the chat interface
5. Question is sent to the backend along with the file identifier
6. Backend processes the question:
   - Retrieves relevant text chunks using vector similarity search
   - Generates an answer using OpenAI's GPT-3.5-turbo model
7. Answer is returned to the frontend and displayed in the chat interface

## Requirements

### Backend
- Python 3.8+
- FastAPI and Uvicorn
- Langchain and Langchain-OpenAI
- FAISS vector store
- PyPDF
- Python-dotenv
- Pydantic

### Frontend
- Node.js 14+
- npm
- Vite
- React 18+
- Material-UI
- Axios
- React-Toastify

## Setup and Installation

### Prerequisites

Before setting up the application, ensure you have the following installed:
- Python 3.8 or higher
- Node.js 14 or higher
- npm
- Docker and Docker Compose (optional, for containerized setup)

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment (recommended):
   ```
   python -m venv venv
   venv\Scripts\activate  # On Windows
   source venv/bin/activate  # On Unix/MacOS
   ```

3. Install the required Python packages:
   ```
   pip install -r requirements.txt
   ```

4. Create a `.env` file based on `.env.example` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your-openai-api-key
   HOST=0.0.0.0
   PORT=8000
   ```
5. `Dockerfile` is already preconfigured to work with default `.env.example` values. If you want to change it then ensure that port value from `.env` file matches the value in the `Dockerfile`

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install the required npm packages:
   ```
   npm install
   ```

3. Create a `.env.development` file based on `.env.development.example` for development environment:
   ```
   VITE_API_HOST=localhost
   VITE_API_PORT=8000
   ```
   or create a `.env.production` file based on `.env.production.example` for production environment:
   ```
   VITE_API_HOST=backend
   VITE_API_PORT=8000
   ```
4. `vite.config.js`, `nginx.conf` and `Dockerfile` are already preconfigured to work with default values from `.env.development.example` and `.env.production.example`. If you want to change them, then ensure that host and port values in files `vite.config.js`, `nginx.conf` and `Dockerfile` are correctly set and matches the values from `.env` file

## Running the Application

### Option 1: Using Docker Compose (Recommended)

1. Make sure you have Docker and Docker Compose installed on your system.

2. Build and start the containers:
   ```
   docker-compose up --build -d
   ```
   or
   ```
   docker compose up --build -d
   ```

3. Access the application on the relevant URLs based on your `.env` files values. Example URLs for development environment might look like this:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000/api

4. To stop the application:
   ```
   docker-compose down
   ```
   or
   ```
   docker compose down
   ```

### Option 2: Manual Setup

#### Start the Backend Server

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Start the FastAPI server:
   ```
   python main.py
   ```

   The backend API should be available for e.g.: at http://localhost:8000

#### Start the Frontend Development Server

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Start the Vite development server:
   ```
   npm run dev
   ```

   The frontend application will be available for e.g.: at http://localhost:5173

## Usage

1. Open the React application in your web browser
2. Upload a PDF file by dragging it into the drop zone or clicking to select a file
3. Click "Upload" to process the file
4. Once the file is processed, a chat interface will appear
5. Type your question about the PDF content and press Enter or click the send button
6. View the answer in the chat interface
7. Continue asking questions as needed

## Example Questions

You can ask various questions about the uploaded PDF, such as:

- "Does the movie contain scenes of violence or sex?"
- "Make a catchy headline for this movie, that can be used as a subtitle"
- "What are the main characters in the movie?"
- "Summarize the plot of the movie"
- "What happens in the scene with Marcus?"
- "Tell me about the artifact mentioned in the document"


## Notes

- The application uses the OpenAI API, which requires an API key which is defined in the `.env` file located on the backend
- When running with Docker, the frontend makes API requests to relative URLs which are proxied to the backend service by Nginx.

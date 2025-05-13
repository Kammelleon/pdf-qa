FROM python:3.10-slim

WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Create directories for uploads and vector store
RUN mkdir -p uploads vector_store

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
CMD ["python", "main.py"]
from pydantic import BaseModel, Field

class QuestionRequest(BaseModel):
    question: str = Field(..., description="Question about the PDF content")
    file_hash: str = Field(..., description="Hash of the uploaded PDF file")

class AnswerResponse(BaseModel):
    answer: str = Field(..., description="Answer to the question")
    file_hash: str = Field(..., description="Hash of the processed PDF file")
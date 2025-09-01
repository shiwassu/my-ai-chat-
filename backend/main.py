import os
import requests
from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
GITPOD_WORKSPACE_URL = os.getenv("GITPOD_WORKSPACE_URL", "http://localhost")

class UserRequest(BaseModel):
    message: str
    language: str = 'zh'

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/chat")
def create_chat(request: UserRequest):
    if not OPENROUTER_API_KEY:
        return {"response": "错误：找不到 OPENROUTER_API_KEY，请检查 .env 文件。"}

    prompt_content = ""
    if request.language == 'en':
        prompt_content = f"Please respond in English: {request.message}"
    else:
        prompt_content = f"请只用简体中文回答: {request.message}"

    try:
        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "HTTP-Referer": GITPOD_WORKSPACE_URL,
            "X-Title": "My AI Chat"
        }

        api_response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json={
                "model": "mistralai/mistral-7b-instruct",
                "messages": [{"role": "user", "content": prompt_content}]
            }
        )
        api_response.raise_for_status()
        data = api_response.json()
        ai_message = data['choices'][0]['message']['content']
        return {"response": ai_message}
    except Exception as e:
        return {"response": f"调用API时发生未知错误: {e}"}
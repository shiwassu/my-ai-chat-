import os
import requests
from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware # 1. 导入CORS中间件

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
GITPOD_WORKSPACE_URL = os.getenv("GITPOD_WORKSPACE_URL", "http://localhost")

class UserRequest(BaseModel):
    message: str

app = FastAPI()

# 2. 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # 允许所有来源的请求
    allow_credentials=True,
    allow_methods=["*"], # 允许所有HTTP方法
    allow_headers=["*"], # 允许所有HTTP头
)


@app.post("/chat")
def create_chat(request: UserRequest):
    # ... (这部分代码和之前一样，无需改动)
    if not OPENROUTER_API_KEY:
        return {"response": "错误：找不到 OPENROUTER_API_KEY，请检查 .env 文件。"}

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
                "messages": [{"role": "user", "content": request.message}]
            }
        )
        api_response.raise_for_status()
        data = api_response.json()
        ai_message = data['choices'][0]['message']['content']
        return {"response": ai_message}
    except Exception as e:
        return {"response": f"调用API时发生未知错误: {e}"}
import google.generativeai as genai
from fastapi import FastAPI
from pydantic import BaseModel
import edge_tts
import uuid
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import os

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")



# ================== CONFIG ==================
genai.configure(api_key="GEMINI_API_KEY")

model = genai.GenerativeModel("models/gemini-2.5-flash")
chat = model.start_chat(
    history=[
        {
            "role": "user",
            "parts": [
                "You are my close friend. "
                "Talk casually, warmly, and naturally. "
                "No robotic tone. "
                "Keep replies short (20–25 words). "
                "Sound human and caring."
            ]
        }
    ]
)

app = FastAPI(title="Desk Buddy Backend")

# ✅ STATIC FILES (SAFE)
app.mount("/static", StaticFiles(directory="."), name="static")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # dev ke liye OK
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_WORDS = 25

class ChatRequest(BaseModel):
    message: str

async def generate_voice(text: str, filename: str):
    communicate = edge_tts.Communicate(
        text=text,
        voice="hi-IN-SwaraNeural",
        rate="-5%",
        pitch="+0Hz"
    )
    await communicate.save(filename)

@app.post("/chat")
async def chat_with_buddy(req: ChatRequest):
    user_text = req.message.strip()
    if not user_text:
        return {"error": "Empty message"}

    response = chat.send_message(
        f"Reply like a friendly human in max {MAX_WORDS} words: {user_text}"
    )

    reply = " ".join(response.text.strip().split()[:MAX_WORDS])

    audio_file = f"{uuid.uuid4()}.mp3"
    await generate_voice(reply, audio_file)

    return {
        "reply": reply,
        "audio_file": audio_file
    }

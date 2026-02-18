import google.generativeai as genai
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
import edge_tts
import uuid
import os

# ================== CONFIG ==================

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

model = genai.GenerativeModel("models/gemini-2.5-flash")
chat = model.start_chat()

app = FastAPI(title="Desk Buddy Backend")

# ✅ Static folder (IMPORTANT FIX)
app.mount("/static", StaticFiles(directory="static"), name="static")

# ✅ Templates folder
templates = Jinja2Templates(directory="templates")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_WORDS = 25

class ChatRequest(BaseModel):
    message: str


# ✅ ROOT ROUTE (VERY IMPORTANT – fixes 404)
@app.get("/")
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


# ✅ Voice generator
async def generate_voice(text: str, filename: str):
    communicate = edge_tts.Communicate(
        text=text,
        voice="hi-IN-SwaraNeural",
        rate="-5%",
        pitch="+0Hz"
    )
    await communicate.save(f"static/{filename}")


# ✅ Chat API
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
        "audio_file": f"/static/{audio_file}"
    }

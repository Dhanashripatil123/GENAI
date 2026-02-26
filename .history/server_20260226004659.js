import express from "express";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import fs from "fs";
import { vectorStore } from "./prepare.js";

dotenv.config();

const app = express();
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const PORT = 3000;
const MEMORY_FILE = "memory.json";

let conversationMemories = loadMemory();


// ================= MEMORY =================

function loadMemory() {
  if (!fs.existsSync(MEMORY_FILE)) {
    fs.writeFileSync(MEMORY_FILE, "{}");
    return {};
  }
  return JSON.parse(fs.readFileSync(MEMORY_FILE, "utf-8"));
}

function saveMemory() {
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(conversationMemories, null, 2));
}


// ================ UTIL ====================

function isCasualMessage(msg) {
  const casual = ["hi", "hello", "hii", "hey", "ok", "thanks"];
  return casual.includes(msg.toLowerCase().trim());
}


// ================= ROUTES =================

app.get("/chat", (req, res) => {
  res.send("POST {threadId, message} to chat");
});


app.post("/chat", async (req, res) => {
  const { message, threadId } = req.body;

  if (!message || !threadId) {
    return res.status(400).json({ message: "message & threadId required" });
  }

  try {

    // create thread memory
    if (!conversationMemories[threadId]) {
      conversationMemories[threadId] = [];
    }

    let context = "";

    // 👉 RAG only for real questions
    if (!isCasualMessage(message) && message.length > 15) {
      const relevantChunks = await vectorStore.similaritySearch(message, 3);
      context = relevantChunks.map(c => c.pageContent).join("\n\n");
    }


    const SYSTEM_PROMPT = `
You are a helpful AI assistant.

Rules:
- Reply normally to greetings.
- Use context only if relevant.
- If answer not found, say "I don't know".
`;

    let userMessage;

    if (context) {
      userMessage = `
Question: ${message}

Context:
${context}

Answer:
`;
    } else {
      userMessage = message;
    }


    conversationMemories[threadId].push({
      role: "user",
      content: userMessage
    });


    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...conversationMemories[threadId]
      ]
    });


    const reply = completion.choices[0].message.content;

    conversationMemories[threadId].push({
      role: "assistant",
      content: reply
    });

    saveMemory();

    res.json({ message: reply });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});



app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
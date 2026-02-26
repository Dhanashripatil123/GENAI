import express from "express";
import cors from "cors";
import Groq from "groq-sdk";
import fs from "fs";
import { vectorStore } from "./prepare.js";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/* ================= MEMORY ================= */

const MEMORY_FILE = "memory.json";

function loadMemory() {
  if (!fs.existsSync(MEMORY_FILE)) return {};
  return JSON.parse(fs.readFileSync(MEMORY_FILE, "utf-8"));
}

function saveMemory(mem) {
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(mem, null, 2));
}

const conversationMemories = loadMemory();

/* ================= ROUTES ================= */

app.get("/chat", (req, res) => {
  res.send("POST {threadId, message}");
});

app.post("/chat", async (req, res) => {
  const { message, threadId } = req.body;

  if (!message || !threadId) {
    return res.status(400).json({ message: "All fields required" });
  }

  try {
    if (!conversationMemories[threadId]) {
      conversationMemories[threadId] = [];
    }

    /* ============ RAG ONLY WHEN NEEDED ============ */

    let context = "";

    if (message.length > 15) {
      const chunks = await vectorStore.similaritySearch(message, 3);

      context = chunks
        .map(c => c.pageContent)
        .join("\n\n");
    }

    /* ============ PROMPTS ============ */

    const SYSTEM_PROMPT = `
You are a helpful assistant.

- If user says hi/hello → reply normally.
- Use company policy context ONLY when relevant.
- If no context → answer normally.
`;

    const userQuery = context
      ? `Question: ${message}\nContext:\n${context}\nAnswer:`
      : message;

    conversationMemories[threadId].push({
      role: "user",
      content: userQuery
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

    saveMemory(conversationMemories);

    res.json({ message: reply });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(port, () =>
  console.log(`✅ Server running → http://localhost:${port}`)
);
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import fs from "fs";
import { vectorStore } from "./prepare.js";

dotenv.config();

const app = express();
const port = 3000;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "frontend")));

/* ---------------- MEMORY ---------------- */

function loadMemory() {
  if (!fs.existsSync("memory.json")) return {};
  return JSON.parse(fs.readFileSync("memory.json"));
}

function saveMemory(data) {
  fs.writeFileSync("memory.json", JSON.stringify(data, null, 2));
}

let conversationMemories = loadMemory();

/* ---------------- ROUTES ---------------- */

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

app.post("/chat", async (req, res) => {
  const { message, threadId } = req.body;

  if (!message || !threadId) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    if (!conversationMemories[threadId]) {
      conversationMemories[threadId] = [];
    }

    /* -------- GREETING DETECTOR -------- */

    const isGreeting = /^(hi|hello|hey|hii)$/i.test(message.trim());

    let context = "";

    if (!isGreeting) {
      const docs = await vectorStore.similaritySearch(message, 3);
      context = docs.map(d => d.pageContent).join("\n\n");
    }

    /* -------- PROMPT -------- */

    const SYSTEM_PROMPT = `
You are a helpful company assistant.

Rules:
- Answer greetings normally.
- Use context ONLY when relevant.
- If answer not in context → say "I don't know".
- Ignore spelling mistakes.
`;

    const userMessage = `
User Question: ${message}

Context:
${context}
`;

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...conversationMemories[threadId],
      { role: "user", content: userMessage }
    ];

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages
    });

    const reply = completion.choices[0].message.content;

    conversationMemories[threadId].push(
      { role: "user", content: message },
      { role: "assistant", content: reply }
    );

    saveMemory(conversationMemories);

    res.json({ message: reply });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});
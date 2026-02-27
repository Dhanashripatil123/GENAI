import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { ChatGroq } from "@langchain/groq";
import { vectorStore } from "./prepare.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

//
// ✅ LLM
//
const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama3-8b-8192",
});

//
// ✅ ROUTE
//
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.json({ reply: "Please ask something." });
    }

    // 🔎 Search in vector DB
    const retriever = vectorStore.asRetriever(3);
    const docs = await retriever.invoke(userMessage);

    const context = docs.map(d => d.pageContent).join("\n");

    let finalPrompt;

    //
    // 🧠 RAG MODE
    //
    if (context && context.trim() !== "") {
      finalPrompt = `
You are a company assistant.

Answer ONLY from the company context.

If answer is not in the context, say:
"I don't know from company data."

----------------
Context:
${context}
----------------

Question:
${userMessage}
`;
    }

    //
    // 🌍 NORMAL AI MODE
    //
    else {
      finalPrompt = userMessage;
    }

    // 🤖 LLM CALL
    const result = await llm.invoke(finalPrompt);

    res.json({
      reply: result.content,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      reply: "Server error",
    });
  }
});

//
// ✅ SERVER START
//
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { ChatGroq } from "@langchain/groq";
import { vectorStore } from "./prepare.js";

dotenv.config();

const app = express();
app.use(cors());
// additional explicit CORS headers for robustness
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});
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

STRICT RULES:
1. Answer ONLY from the provided context.
2. If the context is empty or irrelevant → say "I don't know".
3. For greetings like "hi", "hello" → respond normally.

`;

       const userQuery = `
Question: ${message}
Relevant Context: ${context}
Answer:
`;

       conversationMemories[threadId].push({
         role: "user",
         content: userQuery
       });

       const completion = await groq.chat.completions.create({
         model: "openai/gpt-oss-20b",
         messages: [
           { role: "system", content: SYSTEM_PROMPT },
           ...conversationMemories[threadId]
         ],
       });

       const reply = completion.choices[0].message.content;

       conversationMemories[threadId].push({
         role: "assistant",
         content: reply
       });

       saveMemory(conversationMemories);

       res.json({message: reply});
     }catch(err){
       console.error(err);
       res.status(500).json({message:'Internal server error'});
     }
     
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
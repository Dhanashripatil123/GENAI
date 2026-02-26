import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import Groq from "groq-sdk";
import fs from "fs";
import dotenv from "dotenv";
import { vectorStore, initializeVectorStore } from './prepare.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;

// Initialize Groq client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Initialize vector store on startup (assuming PDF is in the root)
let isVectorStoreReady = false;
(async () => {
  try {
    const pdfPath = path.join(__dirname, 'company_policies.pdf'); // Adjust path as needed
    if (fs.existsSync(pdfPath)) {
      await initializeVectorStore(pdfPath);
      isVectorStoreReady = true;
      console.log("Vector store ready");
    } else {
      console.warn("PDF file not found. RAG will not work without it.");
    }
  } catch (error) {
    console.error("Failed to initialize vector store:", error);
  }
})();

// Function to detect if message is a greeting or casual
function isGreeting(message) {
  const lowerMessage = message.toLowerCase().trim();
  const greetingKeywords = [
    'hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening',
    'thanks', 'thank you', 'bye', 'goodbye', 'see you', 'how are you',
    'what\'s up', 'sup', 'yo', 'greetings', 'welcome'
  ];

  // Check for exact matches or short messages that are likely greetings
  return greetingKeywords.some(keyword => lowerMessage.includes(keyword)) ||
         lowerMessage.length < 15 && !lowerMessage.includes('?');
}

// Load conversation memories from file
function loadMemory() {
  if (!fs.existsSync("memory.json")) {
    fs.writeFileSync("memory.json", "{}");
    return {};
  }
  try {
    const data = fs.readFileSync("memory.json", "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error loading memory.json:", err.message);
    return {};
  }
}

// Save conversation memories to file
function saveMemory(memory) {
  fs.writeFileSync("memory.json", JSON.stringify(memory, null, 2));
}

let conversationMemories = loadMemory();

// Middleware
app.use(cors());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

// Request logger
app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.path);
  next();
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.get('/chat', (req, res) => {
  res.send('This endpoint accepts POST requests with JSON: {threadId, message}. Use the chat UI or POST to /chat');
});

app.post('/chat', async (req, res) => {
  const { message, threadId } = req.body;

  // Validate input
  if (!message || !threadId) {
    return res.status(400).json({ message: 'Both message and threadId are required' });
  }

  try {
    // Initialize thread memory if not exists
    if (!conversationMemories[threadId]) {
      conversationMemories[threadId] = [];
    }

    let context = '';
    let systemPrompt = '';
    let userQuery = message;

    if (isGreeting(message)) {
      // For greetings: No RAG, direct response
      systemPrompt = `You are a helpful company assistant for CodersGyan.
Respond naturally to greetings, casual conversation, and general questions.
Keep responses friendly and concise.`;
    } else {
      // For company-related questions: Use RAG
      if (!isVectorStoreReady) {
        return res.status(500).json({ message: 'Vector store not ready. Please try again later.' });
      }

      const relevantChunks = await vectorStore.similaritySearch(message, 3);
      context = relevantChunks.map(chunk => chunk.pageContent).join('\n\n');

      systemPrompt = `You are a helpful company assistant for CodersGyan.
Use the retrieved context to answer questions about company policies, procedures, benefits, and information.
If the context is relevant, provide accurate information based on it.
If the context doesn't contain the answer or is not relevant, say "I don't know" or ask for clarification.
Keep responses professional and helpful.`;

      userQuery = `Question: ${message}\n\nRelevant Context:\n${context}\n\nAnswer:`;
    }

    // Add user message to memory
    conversationMemories[threadId].push({
      role: "user",
      content: userQuery
    });

    // Call Groq API
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        ...conversationMemories[threadId]
      ],
    });

    const reply = completion.choices[0].message.content;

    // Add assistant response to memory
    conversationMemories[threadId].push({
      role: "assistant",
      content: reply
    });

    // Save memory
    saveMemory(conversationMemories);

    // Return response
    res.json({ message: reply });

  } catch (err) {
    console.error('Error in /chat:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
import readline from 'node:readline/promises';
import Groq from "groq-sdk";
import { vectorStore } from './prepare.js';
import fs from "fs";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Function to detect greetings
function isGreeting(message) {
  const greetingPatterns = [
    /^(hi|hello|hey|hii|hiii|howdy|greetings|what's up)/i,
    /^(good morning|good afternoon|good evening|good night)/i,
    /(how are you|how you doing|what's going on)/i
  ];
  return greetingPatterns.some(pattern => pattern.test(message.trim()));
}

// Function to get a greeting response
function getGreetingResponse() {
  const greetings = [
    "Hello! How can I help you today?",
    "Hi there! What can I assist you with?",
    "Hey! What would you like to know?",
    "Hello! I'm here to help. What do you need?",
    "Hi! How can I be of service?"
  ];
  return greetings[Math.floor(Math.random() * greetings.length)];
}
 
function loadMemory() {
    if (!fs.existsSync("memory.json")) {
        fs.writeFileSync("memory.json", "[]");
        return [];
    }

    const data = fs.readFileSync("memory.json", "utf-8");
    return JSON.parse(data);
}


function saveMemory(memory) {
    fs.writeFileSync("memory.json", JSON.stringify(memory, null, 2));
}

export async function chat() {

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    let conversationHistory = loadMemory();

    while (true) {

        const questions = await rl.question('You: ');

        if (questions === '/bye') {
            break;
        }

        // Check if it's a greeting
        if (isGreeting(questions)) {
            const greetingReply = getGreetingResponse();
            console.log(`Assistant: ${greetingReply}`);
            
            conversationHistory.push({
                role: "user",
                content: questions
            });
            conversationHistory.push({
                role: "assistant",
                content: greetingReply
            });
            
            saveMemory(conversationHistory);
            continue;
        }

        // For non-greeting messages, use RAG

        const context = relevantChunks
            .map(chunk => chunk.pageContent)
            .join('\n\n');

        const SYSTEM_PROMPT = `
You are a helpful assistant.
Use the retrieved context if relevant.
If you don't know the answer, say "I don't know".
`;

        const userQuery = `
Question: ${questions}
Relevant Context: ${context}
Answer:
`;

        conversationHistory.push({
            role: "user",
            content: userQuery
        });

        const completion = await groq.chat.completions.create({
            model: "openai/gpt-oss-20b",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                ...conversationHistory
            ],
        });

        const reply = completion.choices[0].message.content;

        console.log(`Assistant: ${reply}`);

        conversationHistory.push({
            role: "assistant",
            content: reply
        });

        saveMemory(conversationHistory);
    }

    rl.close();
}

chat();

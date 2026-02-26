import readline from 'node:readline/promises';
import Groq from "groq-sdk";
import { vectorStore } from './prepare.js';
import fs from "fs";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

function loadMemory() {
    if (!fs.existsSync("memory.json")) {
        fs.writeFileSync("memory.json", "[]");
        return [];
    }
    return JSON.parse(fs.readFileSync("memory.json", "utf-8"));
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

        const question = await rl.question('You: ');

        if (question === '/bye') break;

        // 🔍 RAG search
        const relevantChunks = await vectorStore.similaritySearch(question, 3);

        const context = relevantChunks
            .map(chunk => chunk.pageContent)
            .join('\n\n');

        const SYSTEM_PROMPT = `
You are a helpful assistant.
Use the retrieved context if relevant.
If you don't know the answer, say "I don't know".
`;

        // ❗ temporary RAG message (DO NOT SAVE THIS)
        const ragPrompt = `
Question: ${question}

Context:
${context}
`;

        const completion = await groq.chat.completions.create({
            model: "openai/gpt-oss-20b",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                ...conversationHistory,
                { role: "user", content: ragPrompt }
            ],
        });

        const reply = completion.choices[0].message.content;

        console.log(`Assistant: ${reply}`);

        // ✅ save ONLY real conversation
        conversationHistory.push(
            { role: "user", content: question },
            { role: "assistant", content: reply }
        );

        saveMemory(conversationHistory);
    }

    rl.close();
}

chat();
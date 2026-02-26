import readline from 'node:readline/promises';
import Groq from "groq-sdk";
import { vectorStore } from './prepare.js';
import { log } from 'node:console';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function chat() {
    const rl = readline.createInterface({input:process.stdin,output:process.stdout})                                              
    while(true){
            const questions = await rl.question('You:');
            //bye
            if(questions === '/bye'){
                break;
            }

            //retrival 
            const relevantChunks = await vectorStore.similaritySearch(questions, 3);

            const context = relevantChunks.map(chunk=>chunk.pageContent).join('\n\n');         
          
          const  SYSTEM_PROMT = `You are an assistant for question-answering tasks. Use the following relevent pieces of retrived context to an answer the question. If you dont know the answer then say i don't know`;


       
 const userquery = `Question: ${questions}
 Relevant Context: ${context}
 Answer:`;
const completions = groq.chat.completions.create({
    messages: [
        {
           role:'system',
           content: SYSTEM_PROMT
        },
      {
        role: "user",
        content: "Explain the importance of fast language models",
      },
    ],
    model: "openai/gpt-oss-20b",
  });

  console.log(`Assistant:${completions.choices[0].message.content}`);

 }
    rl.close(); 

}

chat();
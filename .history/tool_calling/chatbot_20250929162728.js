import readline from "node:readline/promises";
import "dotenv/config";
import { tavily } from "@tavily/core";
import Groq from "groq-sdk";
import NodeCache from "node-cache";


const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const Cache = new NodeCache({stdTTL: 60*60*24}); //cache for 24 hours


export async function generate(usermessage,threadId){

  // const rl = readline.createInterface({input:process.stdin,output:process.stdout})

   const basedmessages = [
      {
             role: 'system',
             content: `You are a smart personal assitant. who answers the asked question.
             If you know the answer to a question, answer it directly in plain English.
             If the answer requires real-time, local, or up-to-date information, or if you don’t know the answer, use the available tools to find it.
             You have access to following tools:
            
webSearch(query: string): Use this to search the internet for current or unknown information.
Decide when to use your own knowledge and when to use the tool.
Do not mention the tool unless needed.

Examples:
Q: What is the capital of France?
A: The capital of France is Paris.

Q: What is the weather in Mumbai right now?
A: (use the search tool to find the latest weather)

Q: Who is the Prime Minister of India?
A: The current Prime Minister of India is Narendra Modi.

Q: Tell me the latest IT news.
A: (use the search tool to get the latest news)

current date and time:${new Date().toUTCString()} `,
          },  

         //  {
         //     role: "user",
         //     content:"what is the wether in dhule now",
         //  }
   ];

    const messages =  Cache.get(threadId) ??  basedmessages;

  messages.push({
      role :'user',
      content : usermessage,
   })


    const MAX_RETRIES = 10; 
    let count = 0;
    while(true){

      if(count >= MAX_RETRIES){ 
        return
       }
       const completions = await groq.chat.completions.create({

     model:"llama-3.3-70b-versatile",
     temperature:0.7,
      messages:messages,
       tools: [
       {
      type: "function",
      "function": {
        "name": "webSearch",
        "description": "search the latest information and realtime data on the internet",
        "parameters": {
          "type": "object",
          "properties": {
            "query": {
              "type": "string",
              "description": "the search query to perform search on",
            },
           
          },
          "required": ["query"],
         }
         },
        },
      ],  
      tool_choice:'auto',
   })
   messages.push(completions.choices[0].message)

   const toolCalls = completions.choices[0].message.tool_calls 

   if(!toolCalls){
      // console.log(`Assistant:${completions.choices[0].message.content}`);
      // break;

      //here we end the chabot response
      Cache.set(threadId ,messages);
      console.log(JSON.stringify(Cache.data));
      
     return completions.choices[0].message.content;
   }

   for (const tool of toolCalls){
      //console.log('tool:',tool);
      const functionName = tool.function.name;
      //console.log("function:",functionName);
      
      const functionParams = tool.function.arguments;
       // console.log("functionpara:",functionParams);

      if(functionName === 'webSearch'){
         const toolResult = await webSearch(JSON.parse(functionParams));
        // console.log("Tool result:",toolResult);

         messages.push({
            tool_call_id: tool.id,
            role:'tool',
            name:functionName,
            content: toolResult,
         })
         
      }
      
   }

    const completions2 = await groq.chat.completions.create({

     model:"llama-3.3-70b-versatile",
     temperature:0.7,
     messages:messages,
     tools: [
       {
      type: "function",
      "function": {
        "name": "webSearch",
        "description": "search the latest information and realtime data on the internet",
        "parameters": {
          "type": "object",
          "properties": {
            "query": {
              "type": "string",
              "description": "the search query to perform search on",
            },
           
          },
          "required": ["query"],
         }
         },
        },
      ],  
      tool_choice:'auto',                                                                                      
   })

   //console.log(JSON.stringify(completions2.choices[0].message,null,2));
 }
  }
 
  async function webSearch({query}){
   //here we will do tavily api call
  console.log('Calling web searching'); 

   const response = await tvly.search(query);
   //console.log("response",response);

   const finalResult = response.results.map((result) => result.content).join('\n\n')
  // console.log("finalresult:",finalResult);
   

   return finalResult;
   // return 'Iphone was lauched on 20 sept 2024.';
}

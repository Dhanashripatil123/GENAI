import readline from "node:readline/promises";
import "dotenv/config";
import { tavily } from "@tavily/core";
import Groq from "groq-sdk";

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function main(){

   const rl = readline.createInterface({input:process.stdin,output:process.stdout})

   const messages = [
      {
             role: 'system',
             content: `You are a smart personal assitant. who answers the asked question.
             You have access to following tools:
             1. searchweb({query}: {query:string}) //search the latest information and realtime data on the internet`,
          },  

         //  {
         //     role: "user",
         //     content:"what is the wether in dhule now",
         //  }
   ];

  while(true){
   const question = await rl.question('You:')
   messages.push({
      role:'user',
      content
   })

    while(true){
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
      console.log(`Assistant:${completions.choices[0].message.content}`);
      break;
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
}
main();



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

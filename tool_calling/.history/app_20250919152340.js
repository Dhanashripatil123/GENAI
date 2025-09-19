
import Groq from "groq-sdk";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function main(){
   const completions = await groq.chat.completions.create({

     model:"llama-3.3-70b-versatile",
     temperature:0,
       messages :[
         {
             role: 'system',
             content: `You are a smart personal assitant. who answers the asked question.
             You have access to following tools:
             1. searchweb({query}: {query:string}) //search the latest information and realtime data on the internet`,
          },  

          {
             role: "user",
             content:"when iphone 16 launched?",
          },                                        
       ],
       tools: [
       {
      type: "function",
      "function": {
        "name": "websearch",
        "description": "search the latest information and realtime data on the internet",
        "parameters": {
          "type": "object",
          "properties": {
            "Query": {
              "type": "string",
              "description": "the search query to perform search on",
            },
           
          },
          "required": ["Query"],
         }
         },
        },
      ],  
      tool_choice:'auto',                                                                                      
   });

   const toolCalls = completions.choices[0].message.tool_calls 

   if(!toolCalls){
      console.log(`Assistant:${completions.choices[0].message.content}`);
      return;
   }

   for (const tool of toolCalls){
      console.log('tool:',tool);
      const functionName = tool.function.name;
      const functionParams = tool.function.arguments;

      if(functionName === 'webSearch'){
         const toolResult = await webSearch(JSON.parse(functionParams));
         console.log("");
         
      }
      
   }

   console.log(JSON.stringify(completions.choices[0].message));
   
   
} 
main();


function webSearch({query}){
   //here we will do tavily api call

   return "Iphone was lauched on 20 sept 2024.";
}


import Groq from "groq-sdk";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function main(){
   const completion = await groq.chat.completions.create({

     model:"llama-3.3-70b-versatile",
     temperature:0,
       messages :[
         {
             role: 'system',
             content: `You are a smart personal assitant. who answers the asked question.
             You have access to following tools:
             1. searchweb({query}: {})`,
          },  

          {
             role: "user",
             content:"what is the whether in dhule now",
          },                                        
       ],
       "tools": [
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
          "required": ["location"],
         }
         },
        },
      ],  
      tool_choice:'auto',                                                                                      
   });

   console.log(completion.choices[0].message.content);
   
   
} 

main();

function webSearch({query}){
   //here we will do tavily api call

   return "Iphone was lauched on 20 sept 2024.";
}

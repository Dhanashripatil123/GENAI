
import Groq from "groq-sdk";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function main(){
   const completion = await groq.chat.completions.create({

     model:"llama-3.3-70b-versatile",
     temperature:0,
       messages :[
         {
             role: 'system',
             content: 'You are a smart personal assitant. who answers the asked question.',
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
            "location": {
              "type": "string",
              "description": "The city and state, e.g. San Francisco, CA"
            },
            "unit": {
              "type": "string",
              "enum": ["celsius", "fahrenheit"]
            }
          },
          "required": ["location"]
         }
        },
      ]                                                                                        
   });

   console.log(completion.choices[0].message.content);
   
   
} 

main();

function webSearch({query}){
   //here we will do tavily api call

   return "Iphone was lauched on 20 sept 2024.";
}

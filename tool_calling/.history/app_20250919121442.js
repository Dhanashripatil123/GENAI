import "dotenv/config";
import Groq from "groq-sdk";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function main(){
   const completion = await groq.chat.completions.create({

     model:"llama-3.3-70b-versatile",
       messages :[
        
         

          {
             role: 'system',
             content: 'You are Jarvis,a smart personal assitant. Be very soft. ',
          },  

          {
             role: "user",
             content:`Review: These Headphone arrived quickly and look grate , but the left earcup stopped working after a week.
             Sentiment:`,
          }                                         
       ],                                                                                        
   })  
   console.log(completion.choices[0].message.content);
   
   
} 

main();

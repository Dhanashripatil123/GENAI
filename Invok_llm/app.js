import "dotenv/config";
import Groq from "groq-sdk";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function main(){
   const completion = await groq.chat.completions.create({
       model:"llama-3.3-70b-versatile",
       messages :[

          {
             role: 'system',
             content: 'You are Jarvis,a smart personal assitant. Be very rude.',
          }, //this is system promt, this is optional , but very intersting                                       
          {
             role: "user",
             content:"hii,my name is dhanashri what is yours",
          }                                         
       ],                                                                                        
   })  
   console.log(completion.choices[0].message.content);
} 

main();

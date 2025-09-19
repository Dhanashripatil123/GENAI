
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
   });

   console.log(completion.choices[0].message.content);
   
   
} 

main();

function websearch({query}){
   //here we will do tavily api call
}

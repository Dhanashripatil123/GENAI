import "dotenv/config";
import Groq from "groq-sdk";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function main(){
   const completion = await groq.chat.completions.create({
      temperature:1,
      // top_p:'0.2',
      // stop: 'ga',//Negative
      // max_completion_tokens: 1000,
      // frequency_penalty: 1,
      // presence_penalty:1,
      // max_token: '',
      /**
       * 1. item 1
       * 2. item 2
       *....
       *10. item 10
       *11. item 11
       */
      // stop: '11',
      response_format:{'type':'json_object'},
       model:"llama-3.3-70b-versatile",
       messages :[
        
          {   
             role: 'system',
             content: ``
          }

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

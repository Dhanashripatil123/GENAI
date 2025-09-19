import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const completion = await groq.chat.completions.create({
               {
             role: 'system',
             content: 'You are Jarvis,a smart personal assitant. Be very soft. ',
          }, //this is system promt, this is optional , but very intersting 

          {
             role: "user",
             content:`Review: These Headphone arrived quickly and look grate , but the left earcup stopped working after a week.
             Sentiment:`,
          }                                         
       ],                                                                                        
   })  
   console.log(completion.choices[0].message.content);                                             
main();
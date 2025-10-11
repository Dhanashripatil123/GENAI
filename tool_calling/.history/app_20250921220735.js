import "dotenv/config";
import { tavily } from "@tavily/core";
import Groq from "groq-sdk";

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function main(){

   const messages = [
      {
             role: 'system',
             content: `You are a smart personal assitant. who answers the asked question.
             You have access to following tools:
             1. searchweb({query}: {query:string}) //search the latest information and realtime data on the internet`,
          },  

          {
             role: "user",
             content:"what is the wether in dhule now",
          }
   ];

  while()
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

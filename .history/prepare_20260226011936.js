import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";

import dotenv from "dotenv";  
dotenv.config();  

// Initialize fake embeddings for testing (no API key required)
const embeddings = new FakeEmbeddings({
  size: 384, // Dimension size
});


const pinecone = new PineconeClient({apiKey: process.env.PINECONE_API_KEY});
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);
export const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
  pineconeIndex,
  maxConcurrency: 5,
});

export async function indexTheDocument(filePath) {
  const loader =  new PDFLoader(filePath,{splitPages:false});
  const doc = await loader.load();

  const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 300,
  chunkOverlap: 100,
});

const texts = await textSplitter.splitText(doc[0].pageContent);
console.log("Number of chunks:", texts.length);


const documents=texts.map((chunk) => {
   return { 
    pageContent: chunk, 
    metadata: doc[0].metadata
  }; 
   
})

await vectorStore.addDocuments(documents);
console.log(documents);
console.log("RAG script started");
}

console.log("Embedding length:", embeddings.length);


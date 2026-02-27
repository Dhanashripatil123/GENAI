import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
import { TextLoader } from "langchain/document_loaders/fs/text";
import dotenv from "dotenv";

dotenv.config();

//
//  LOAD COMPANY DATA

const loader = new TextLoader("./data/company.txt");
const docs = await loader.load();


// EMBEDDINGS
const embeddings = new OpenAIEmbeddings({
  apiKey: process.env.OPENAI_API_KEY,
});


//  VECTOR STORE

export const vectorStore = await MemoryVectorStore.fromDocuments(
  docs,
  embeddings
);
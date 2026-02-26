import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import dotenv from "dotenv";

dotenv.config();

/* ---------------- EMBEDDINGS ---------------- */

const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "gemini-embedding-001"
});

const test = await embeddings.embedQuery("test");
console.log("✅ Embedding length:", test.length);

/* ---------------- PINECONE ---------------- */

const pinecone = new PineconeClient({
  apiKey: process.env.PINECONE_API_KEY
});

const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

/* ---------------- VECTOR STORE ---------------- */

export const vectorStore = await PineconeStore.fromExistingIndex(
  embeddings,
  { pineconeIndex }
);

/* ---------------- INDEX FUNCTION ---------------- */

export async function indexTheDocument(filePath) {

  const loader = new PDFLoader(filePath);
  const docs = await loader.load();

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 100
  });

  const splitDocs = await splitter.splitDocuments(docs);

  await vectorStore.addDocuments(splitDocs);

  console.log("✅ Document indexed successfully");
}
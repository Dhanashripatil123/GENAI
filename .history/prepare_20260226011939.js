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


// Create an in-memory vector store
export let vectorStore = null;

// Function to initialize the vector store by loading and indexing the PDF
export async function initializeVectorStore(pdfPath) {
  try {
    // Load the PDF document
    const loader = new PDFLoader(pdfPath, { splitPages: false });
    const docs = await loader.load();

    // Split the document into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500, // Slightly larger chunks for better context
      chunkOverlap: 100,
    });

    const chunks = await textSplitter.splitDocuments(docs);
    console.log(`Split document into ${chunks.length} chunks`);

    // Create the vector store from the chunks
    vectorStore = await MemoryVectorStore.fromDocuments(chunks, embeddings);
    console.log("Vector store initialized successfully");

    return vectorStore;
  } catch (error) {
    console.error("Error initializing vector store:", error);
    throw error;
  }
}

// Export the vector store (will be set after initialization)
export { embeddings };


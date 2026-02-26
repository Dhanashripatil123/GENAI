import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { HuggingFaceInferenceEmbeddings } from "@langchain/huggingface";
import { MemoryVectorStore } from "@langchain/community/vectorstores/memory";

import dotenv from "dotenv";
dotenv.config();

// Initialize HuggingFace embeddings (free inference API)
const embeddings = new HuggingFaceInferenceEmbeddings({
  model: "sentence-transformers/all-MiniLM-L6-v2", // Free model for embeddings
  apiKey: process.env.HUGGINGFACE_API_KEY, // Optional, but recommended
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


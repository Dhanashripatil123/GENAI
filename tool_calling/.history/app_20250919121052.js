import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function main() {
  const completion = await getGroqChatCompletion();
  console.log(completion.choices[0]?.message?.content || "");
}

export const getGroqChatCompletion = async () => {
  return groq.chat.completions.create({
    messages: [
      // Set an optional system message. This sets the behavior of the
      // assistant and can be used to provide specific instructions for
      // how it should behave throughout the conversation.
      {
        role: "system",
        content: "You are a helpful assistant.",
      },
      // Set a user message for the assistant to respond to.
      {
        role: "user",
        content: "Explain the importance of fast language models",
      },
    ],
    model: "openai/gpt-oss-20b",
  });
};

main();
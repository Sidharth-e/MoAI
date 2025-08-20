import { GoogleGenAI } from "@google/genai";

export const createGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY!;
  
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  return { client: ai };
};

export const generateGeminiResponse = async (
  messages: Array<{ role: string; content: string }>,
  temperature: number = 0.7
) => {
  const { client } = createGeminiClient();
  
  // Convert OpenAI format to Gemini format
  const history = messages.slice(0, -1).map(msg => ({
    role: msg.role === "user" ? "user" : "model",
    parts: [{ text: msg.content }],
  }));
  
  const lastMessage = messages[messages.length - 1];
  
  const chat = client.chats.create({
    model: "gemini-2.5-flash",
    history,
  });

  const response = await chat.sendMessage({
    message: lastMessage.content,
  });
  
  return response.text || "";
};

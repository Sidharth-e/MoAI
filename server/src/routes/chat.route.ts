import express, { Request, Response } from "express";
import axios, { AxiosResponse } from "axios";
import { ChatMessage } from "../models/chatMessage";
import dotenv from "dotenv";
dotenv.config();
// Load environment variables
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT as string;
const AZURE_OPENAI_API_KEY = process.env.AZURE_OPENAI_API_KEY as string;
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT as string;

const router = express.Router();

// POST /chat
router.post("/", async (req: Request, res: Response) => {
  const { userMessage, threadId }: { userMessage: string; threadId: string } = req.body;

  if (!userMessage || typeof userMessage !== "string") {
    return res.status(400).json({ error: "Missing or invalid userMessage" });
  }

  try {
    // Fetch prior messages in order
    const history = await ChatMessage.find({ threadId }).sort({ createdAt: -1 }).limit(10);
    history.reverse();

    // If last message in history is the same as userMessage, remove it
    if (
      history.length > 0 &&
      history[history.length - 1].sender === "user" &&
      history[history.length - 1].text === userMessage
    ) {
      history.pop();
    }

    // Transform history into OpenAI chat format
    const chatHistory = history.map((msg) => ({
      role: msg.sender,
      content: msg.text,
    }));

    // Compose complete messages array
    const messages = [
      {
        role: "system",
        content: "You are a helpful assistant tasked with user query response. Always give response in markdown but not fully markdown",
      },
      ...chatHistory,
      {
        role: "user",
        content: userMessage,
      },
    ];

    const url = `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=2024-03-01-preview`;


    const azureRes: AxiosResponse<any> = await axios({
      method: "post",
      url,
      data: {
        messages,
        temperature: 0.7,
        stream: true,
      },
      headers: {
        "Content-Type": "application/json",
        "api-key": AZURE_OPENAI_API_KEY,
      },
      responseType: "stream",
    });

    res.setHeader("Content-Type", "text/event-stream");
    azureRes.data.pipe(res);

    azureRes.data.on("end", () => res.end());
    azureRes.data.on("error", (err: Error) => {
      console.error("Azure stream error:", err);
      res.end();
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error querying Azure OpenAI:", errorMessage);
    res.status(500).json({ error: "Model inference failed" });
  }
});

export default router;
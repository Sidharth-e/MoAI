import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { ChatMessage } from "../models/chatMessage";
import { createAzureOpenAIClient } from "../services/aoai";

dotenv.config();
const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  const { userMessage, threadId }: { userMessage: string; threadId: string } =
    req.body;

  if (!userMessage || typeof userMessage !== "string") {
    return res.status(400).json({ error: "Missing or invalid userMessage" });
  }

  try {
    // Fetch up to last 10 in chronological order directly
    const history = await ChatMessage.find({ threadId })
      .sort({ createdAt: 1 })
      .limit(10);

    // If the *last* stored user message equals the incoming one (duplicate resend), ignore it
    if (
      history.length > 0 &&
      history[history.length - 1].sender === "user" &&
      history[history.length - 1].text === userMessage
    ) {
      history.pop();
    }

    const chatHistory = history.map((msg) => ({
      role: msg.sender as "user" | "assistant" | "system",
      content: msg.text,
    }));

    const systemMessage = {
      role: "system" as const,
      content:
        "You are a helpful assistant tasked with user query response. Always respond in markdown (no full-document boilerplate).",
    };

    const messages = [
      systemMessage,
      ...chatHistory,
      { role: "user" as const, content: userMessage },
    ];

    const { client, deployment } = createAzureOpenAIClient();

    // Initiate streaming
    const stream = await client.chat.completions.create({
      model: deployment, // Azure deployment name
      messages,
      temperature: 0.7,
      stream: true,
    });

    // Set up SSE headers
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.(); // if using compression, ensure immediate flush

    try {
      for await (const chunk of stream) {
        if (chunk.choices?.length) {
          // Send the raw chunk so client can keep its existing parsing logic
          res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        }
      }
      // Signal completion
      res.write(`data: [DONE]\n\n`);
      res.end();
    } catch (streamErr) {
      console.error("Streaming error:", streamErr);
      if (!res.headersSent) {
        res.status(500).json({ error: "Streaming failed" });
      } else {
        res.end();
      }
    }
  } catch (error) {
    console.error("Error querying Azure OpenAI:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Model inference failed" });
    } else {
      res.end();
    }
  }
});

export default router;

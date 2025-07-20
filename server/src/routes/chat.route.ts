import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { ChatMessage } from "../models/chatMessage";
import { createAzureOpenAIClient } from "../services/aoai";
import { getWeather } from "../tools/getWeather";

// Load environment variables
dotenv.config();

const router = express.Router();
// POST /chat - Handle user messages and stream responses
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

    // Define MCP tools for function calling (OpenAI format)
    const mcpTools = [
      {
        type: "function",
        function: {
          name: getWeather.name,
          description: "Get the current (dummy) weather for a city.",
          parameters: {
            type: "object",
            properties: {
              city: { type: "string", description: "The city to get weather for." },
            },
            required: ["city"],
          },
        },
      },
    ] as const;

    const { client, deployment } = createAzureOpenAIClient();

    // Set up SSE headers
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.(); // if using compression, ensure immediate flush

    // Tool handler map
    const toolHandlers: Record<string, Function> = {
      [getWeather.name]: getWeather.handler,
    };

    // Helper to stream data to client
    function sendData(data: any) {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    }

    // Conversation state
    type ChatMessageParam =
      | { role: "user" | "assistant" | "system"; content: string }
      | { role: "tool"; content: string; tool_call_id: string };
    let currentMessages: ChatMessageParam[] = [...messages];
    let toolLoop = true;
    let lastResponse = null;

    while (toolLoop) {
      // Start streaming from OpenAI
      const stream = await client.chat.completions.create({
        model: deployment,
        messages: currentMessages,
        temperature: 0.7,
        stream: true,
        tools: [...mcpTools],
      });

      let toolCalls: any[] = [];
      let assistantMessage: any = { role: "assistant", content: "" };
      let toolCallDetected = false;

      for await (const chunk of stream) {
        if (chunk.choices?.length) {
          const choice = chunk.choices[0];
          // If tool_calls is present, collect tool calls
          if (choice.delta?.tool_calls) {
            toolCallDetected = true;
            for (const tc of choice.delta.tool_calls) {
              // Accumulate tool calls (arguments may be streamed in pieces)
              let existing = toolCalls.find((t) => t.index === tc.index);
              if (!existing) {
                toolCalls.push({ ...tc, arguments: tc.function?.arguments || "" });
              } else {
                // Append streamed arguments
                existing.function = existing.function || {};
                existing.function.arguments = (existing.function.arguments || "") + (tc.function?.arguments || "");
              }
            }
          }
          // If content is present, stream to client
          if (choice.delta?.content) {
            assistantMessage.content += choice.delta.content;
            sendData(chunk);
          }
        }
      }

      if (toolCallDetected && toolCalls.length > 0) {
        // Execute each tool call and build tool message(s)
        const toolMessages = [];
        for (const tc of toolCalls) {
          const toolName = tc.function?.name;
          const argsStr = tc.function?.arguments;
          let args = {};
          try {
            args = JSON.parse(argsStr);
          } catch (e) {
            args = {};
          }
          const handler = toolHandlers[toolName];
          let toolResult = "";
          if (handler) {
            try {
              const result = await handler(args);
              toolResult = typeof result === "string" ? result : JSON.stringify(result);
            } catch (e) {
              toolResult = `Error: ${e}`;
            }
          } else {
            toolResult = `No handler for tool: ${toolName}`;
          }
          const toolMsg: ChatMessageParam = {
            role: "tool",
            tool_call_id: String(tc.id),
            content: toolResult,
          };
          toolMessages.push(toolMsg);
        }
        // Add tool messages to conversation and continue loop
        currentMessages.push({ ...assistantMessage, content: undefined, tool_calls: toolCalls });
        currentMessages.push(...toolMessages);
      } else {
        // No tool call, finish streaming
        if (assistantMessage.content) {
          // Send final chunk if not already sent
          sendData({ choices: [{ delta: { content: "" } }] });
        }
        break;
      }
    }
    // Signal completion
    res.write(`data: [DONE]\n\n`);
    res.end();
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

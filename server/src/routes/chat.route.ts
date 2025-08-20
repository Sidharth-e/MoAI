import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { ChatMessage } from "../models/chatMessage";
import { AIService, AIModel } from "../services/ai-service";
import { createAzureOpenAIClient } from "../services/aoai";
import { getWeather } from "../tools/getWeather";
import { getSerperWebData } from "../tools/getSerperWebData";
import { getFirecrawlWebsiteDetails } from "../tools/getFirecrawlWebsiteDetails";

// Load environment variables
dotenv.config();

const router = express.Router();
// POST /chat - Handle user messages and stream responses
router.post("/", async (req: Request, res: Response) => {
  const { userMessage, threadId, model = "azure-openai" }: { 
    userMessage: string; 
    threadId: string;
    model?: AIModel;
  } = req.body;

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
      {
        type: "function",
        function: {
          name: getSerperWebData.name,
          description: "Get real-time web data using Serper API.",
          parameters: {
            type: "object",
            properties: {
              query: { type: "string", description: "The search query to get web data for." },
            },
            required: ["query"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: getFirecrawlWebsiteDetails.name,
          description: "Get full website details using Firecrawl API.",
          parameters: {
            type: "object",
            properties: {
              url: { type: "string", description: "The URL of the website to get details for." },
            },
            required: ["url"],
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
      [getSerperWebData.name]: getSerperWebData.handler,
      [getFirecrawlWebsiteDetails.name]: getFirecrawlWebsiteDetails.handler,
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

    // For now, we'll use Azure OpenAI for tool calls since other models don't support them
    // In the future, we can implement tool calling for other models
    if (model === "azure-openai") {
      const { client, deployment } = createAzureOpenAIClient();
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
                if (typeof result === "string") {
                  toolResult = result;
                } else if (result && Array.isArray(result.content) && result.content[0]?.text) {
                  toolResult = result.content[0].text;
                } else {
                  toolResult = JSON.stringify(result);
                }
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
    } else {
      // For other models (Gemini, Hugging Face), use the unified AI service
      try {
        const aiService = new AIService({ 
          model, 
          temperature: 0.7,
          maxTokens: 2048
        });
        await aiService.generateStreamingResponse(messages, (chunk: string) => {
          sendData({ choices: [{ delta: { content: chunk } }] });
        });
      } catch (error) {
        console.error(`Error with ${model} model:`, error);
        sendData({ choices: [{ delta: { content: `Error: Failed to generate response with ${model} model` } }] });
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

// POST /regenerate - Regenerate a specific assistant message
router.post("/regenerate", async (req: Request, res: Response) => {
  const { messageId, threadId }: { messageId: string; threadId: string } = req.body;

  console.log("Regenerate request:", { messageId, threadId });

  if (!messageId || !threadId) {
    return res.status(400).json({ error: "Missing messageId or threadId" });
  }

  try {
    // Find the message to regenerate
    const message = await ChatMessage.findById(messageId);
    console.log("Found message:", message ? { id: message._id, sender: message.sender, text: message.text?.substring(0, 100) } : "Not found");
    
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    if (message.sender !== "assistant") {
      return res.status(400).json({ error: "Only assistant messages can be regenerated" });
    }

    if (message.threadId.toString() !== threadId) {
      return res.status(400).json({ error: "Message does not belong to the specified thread" });
    }

    // Fetch conversation history up to this message
    const history = await ChatMessage.find({ 
      threadId, 
      createdAt: { $lt: message.createdAt } 
    }).sort({ createdAt: 1 });

    const chatHistory = history.map((msg) => ({
      role: msg.sender as "user" | "assistant" | "system",
      content: msg.text,
    }));

    const systemMessage = {
      role: "system" as const,
      content: "You are a helpful assistant tasked with user query response. Always respond in markdown (no full-document boilerplate).",
    };

    // Find the user message that prompted this assistant response
    const userMessage = history[history.length - 1];
    if (!userMessage || userMessage.sender !== "user") {
      return res.status(400).json({ error: "Cannot find user message to regenerate response for" });
    }

    const messages = [
      systemMessage,
      ...chatHistory.slice(0, -1), // Exclude the last user message
      { role: "user" as const, content: userMessage.text },
    ];

    // For regeneration, use the original model from the message to maintain consistency
    const originalModel = (message.model as AIModel) || "azure-openai"; // Fallback to azure-openai if no model stored
    
    try {
      const aiService = new AIService({ 
        model: originalModel, 
        temperature: 0.7,
        maxTokens: 2048
      });
      
      const newContent = await aiService.generateResponse(messages);
      
      if (!newContent) {
        return res.status(500).json({ error: "Failed to generate new response" });
      }

      // Update the message with new version
      if (!message.versions) {
        message.versions = [message.text];
      }
      
      message.versions.push(newContent);
      message.text = newContent;
      message.activeVersionIndex = message.versions.length - 1;
      
      await message.save();

      res.json({ 
        message: {
          _id: message._id,
          text: message.text,
          sender: message.sender,
          model: message.model,
          versions: message.versions,
          activeVersionIndex: message.activeVersionIndex,
          createdAt: message.createdAt
        }
      });
    } catch (error) {
      console.error("Error generating response with model:", originalModel, error);
      return res.status(500).json({ error: `Failed to generate response with ${originalModel} model` });
    }

  } catch (error) {
    console.error("Error regenerating message:", error);
    res.status(500).json({ error: "Failed to regenerate message" });
  }
});

export default router;

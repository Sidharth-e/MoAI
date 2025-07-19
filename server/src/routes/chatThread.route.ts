import express, {Response } from "express";
import { ChatThread, validate as validateThread } from "../models/chatThread";
import { ChatMessage } from "../models/chatMessage";
import { AzureOpenAIInstance } from "../services/aoai";
import { AuthenticatedRequest } from "../interface/authenticateMiddleware.interface";


const router = express.Router();

// Create a new chat thread
router.post("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { error } = validateThread(req.body);
    const userId = req.user?._id; // Ensure user ID is obtained from auth middleware

    if (error) {
      return res.status(400).send({ message: error.details[0].message });
    }

    if (!userId) {
      return res.status(403).send({ message: "User not authenticated" });
    }

    const thread = new ChatThread({ userId, ...req.body });
    await thread.save();
    res.status(201).send({ message: "Chat thread created", thread });
  } catch (err) {
    console.error("Error creating chat thread:", err instanceof Error ? err.message : err);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Get all chat threads for a user
router.get("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(403).send({ message: "User not authenticated" });
    }

    const threads = await ChatThread.find({ userId }).sort({ createdAt: -1 });
    res.status(200).send({ threads });
  } catch (err) {
    console.error("Error fetching chat threads:", err instanceof Error ? err.message : err);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Update chat thread
router.put("/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { error } = validateThread(req.body);

    if (error) {
      return res.status(400).send({ message: error.details[0].message });
    }

    const userId = req.user?._id;
    const threadId = req.params.id;

    if (!userId) {
      return res.status(403).send({ message: "User not authenticated" });
    }

    const updatedThread = await ChatThread.findOneAndUpdate(
      { _id: threadId, userId },
      req.body,
      { new: true }
    );

    if (!updatedThread) {
      return res.status(404).send({ message: "Chat thread not found" });
    }

    res.status(200).send({ message: "Chat thread updated", thread: updatedThread });
  } catch (err) {
    console.error("Error updating chat thread:", err instanceof Error ? err.message : err);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Delete chat thread
router.delete("/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const threadId = req.params.id;

    if (!userId) {
      return res.status(403).send({ message: "User not authenticated" });
    }

    const deletedThread = await ChatThread.findOneAndDelete({ _id: threadId, userId });

    if (!deletedThread) {
      return res.status(404).send({ message: "Chat thread not found" });
    }

    res.status(200).send({ message: "Chat thread deleted" });
  } catch (err) {
    console.error("Error deleting chat thread:", err instanceof Error ? err.message : err);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Update only the title of a chat thread
router.patch("/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const threadId = req.params.id;

    if (!userId) {
      return res.status(403).send({ message: "User not authenticated" });
    }

    const client = AzureOpenAIInstance();

    const history = await ChatMessage.find({ threadId }).sort({ createdAt: 1 }).limit(2);

    if (history.length < 2) {
      return res.status(400).send({ message: "Not enough chat history to generate title" });
    }

    const chatHistory = history.map((msg) => ({
      role: msg.sender,
      content: msg.text,
    }));

const messages: any = [
  {
    role: "system",
    content: `Generate a concise, compelling title that accurately reflects the core topic or main theme of the conversation. 
    Base the title on the user's initial message and AI's first response. Ensure the title should be exactly within 
    4-5 complete words, with no truncation or partial words. Avoid quotes, personal data, or sensitive content. Prioritize clarity and relevance.`,
  },
  {
    role: "user",
    content: `Conversation history:\n${JSON.stringify(chatHistory, null, 2)}`,
  },
];
    const response = await client.chat.completions.create({
      model: "gpt-4.1",
      messages,
      temperature: 1,
    });

    const title = response.choices?.[0]?.message?.content?.trim();

    if (!title) {
      return res.status(500).send({ message: "Failed to generate title" });
    }

    const updatedThread = await ChatThread.findOneAndUpdate(
      { _id: threadId, userId },
      { title },
      { new: true }
    );

    if (!updatedThread) {
      return res.status(404).send({ message: "Chat thread not found" });
    }

    res.status(200).send({
      message: "Chat thread title updated successfully",
      thread: updatedThread,
    });
  } catch (err) {
    console.error("Error updating thread title:", err instanceof Error ? err.message : err);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

export default router;
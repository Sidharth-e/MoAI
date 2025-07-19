import express, { Request, Response } from "express";
import { ChatMessage, validate } from "../models/chatMessage";
import { MessageRequestBody } from "../interface/chatMessage.interface";

const router = express.Router();


// Create a message in a thread
router.post("/:threadId", async (req: Request<{ threadId: string }, {}, MessageRequestBody>, res: Response) => {
  try {
    // Validate request body combined with URL parameter
    const { error } = validate({
      ...req.body,
      threadId: req.params.threadId,
    });

    if (error) {
      return res.status(400).send({ message: error.details[0].message });
    }

    // Create and save message
    const message = new ChatMessage({
      ...req.body,
      threadId: req.params.threadId,
    });
    await message.save();

    res.status(201).send({ message: "Message added", chatMessage: message });
  } catch (err) {
    console.error("Error creating message:", err instanceof Error ? err.message : err);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Get all messages for a thread
router.get("/:threadId", async (req: Request<{ threadId: string }>, res: Response) => {
  try {
    const messages = await ChatMessage.find({ threadId: req.params.threadId }).sort({ createdAt: 1 });
    res.status(200).send({ messages });
  } catch (err) {
    console.error("Error fetching messages:", err instanceof Error ? err.message : err);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

export default router;
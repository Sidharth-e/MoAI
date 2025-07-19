const router = require("express").Router();
const { ChatThread, validate } = require("../models/chatThread");
const { ChatMessage } = require("../models/chatMessage");
const { AzureOpenAIInstance } = require("../services/aoai");

// Create new chat thread
router.post("/", async (req, res) => {
  try {
    const { error } = validate(req.body);
    const userId = req.user._id; // adjust as per your authentication
    if (error) return res.status(400).send({ message: error.details[0].message })
    const thread = new ChatThread({ userId, ...req.body });
    await thread.save();
    res.status(201).send({ message: "Chat thread created", thread });
  } catch (err) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Get all chat threads for a user
router.get("/", async (req, res) => {
  try {
    const userId = req.user._id;
    const threads = await ChatThread.find({ userId }).sort({ createdAt: -1 });
    res.status(200).send({ threads });
  } catch (err) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// === UPDATE chat thread ===
router.put("/:id", async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error) return res.status(400).send({ message: error.details[0].message });

    const userId = req.user._id;
    const threadId = req.params.id;
    // Only allow updating threads the current user owns
    const updatedThread = await ChatThread.findOneAndUpdate(
      { _id: threadId, userId },
      req.body,
      { new: true }
    );
    if (!updatedThread) return res.status(404).send({ message: "Chat thread not found" });
    res.status(200).send({ message: "Chat thread updated", thread: updatedThread });
  } catch (err) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// === DELETE chat thread ===
router.delete("/:id", async (req, res) => {
  try {
    const userId = req.user._id;
    const threadId = req.params.id;
    // Only allow deleting threads the current user owns
    const deletedThread = await ChatThread.findOneAndDelete({ _id: threadId, userId });
    if (!deletedThread) return res.status(404).send({ message: "Chat thread not found" });
    res.status(200).send({ message: "Chat thread deleted" });
  } catch (err) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Update ONLY the title of a chat thread
router.patch("/:id", async (req, res) => {
  try {
    const userId = req.user._id;
    const threadId = req.params.id;
    console.log(threadId);
    
    const client = AzureOpenAIInstance();

    // Fetch the first two messages in chronological order
    const history = await ChatMessage.find({ threadId })
      .sort({ createdAt: 1 }) // ascending to get initial messages
      .limit(2);

    if (history.length < 2) {
      return res.status(400).send({ message: "Not enough chat history to generate title" });
    }

    // Format chat messages for OpenAI
    const chatHistory = history.map((msg) => ({
      role: msg.sender,
      content: msg.text,
    }));

    const messages = [
      {
        role: "system",
        content:
          "Generate a concise, compelling title that accurately reflects the core topic or main theme of the conversation. " +
          "Base the title on the user's initial message and AI's first response. Ensure the title should be exactly within 4-5 complete words, " +
          "with no truncation or partial words. Avoid quotes, personal data, or sensitive content. Prioritize clarity and relevance.",
      },
      {
        role: "user",
        content: `Conversation history:\n${JSON.stringify(chatHistory, null, 2)}`,
      },
    ];

    // Get title suggestion from OpenAI
    const response = await client.chat.completions.create({
      model: "gpt-4.1",
      messages,
      temperature: 1,
    });

    const title = response.choices?.[0]?.message?.content?.trim();
    console.log(title);

    if (!title) {
      return res.status(500).send({ message: "Failed to generate title" });
    }

    // Update thread with new title
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
    console.error("Error updating thread title:", err);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

module.exports = router;
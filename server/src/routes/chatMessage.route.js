const router = require("express").Router();
const { ChatMessage, validate } = require("../models/chatMessage");

// Create a message in a thread
router.post("/:threadId", async (req, res) => {
  try {
    const { error } = validate({ ...req.body, threadId: req.params.threadId });
    if (error) return res.status(400).send({ message: error.details[0].message });
    const message = new ChatMessage({
      ...req.body,
      threadId: req.params.threadId,
    });
    await message.save();
    res.status(201).send({ message: "Message added", chatMessage: message });
  } catch (err) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Get all messages for a thread
router.get("/:threadId", async (req, res) => {
  try {
    const messages = await ChatMessage.find({ threadId: req.params.threadId }).sort({ createdAt: 1 });
    res.status(200).send({ messages });
  } catch (err) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

module.exports = router;
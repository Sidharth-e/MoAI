const express = require("express");
const router = express.Router();
const axios = require("axios");
const { ChatMessage, validate } = require("../models/chatMessage");

// Load env vars
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const AZURE_OPENAI_API_KEY = process.env.AZURE_OPENAI_API_KEY;
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT;

// POST /chat
router.post("/", async (req, res) => {
  const { userMessage, threadId } = req.body;

  if (!userMessage || typeof userMessage !== "string") {
    return res.status(400).json({ error: "Missing or invalid userMessage" });
  }
  // Fetch prior messages in order
// Fetch prior messages in order
const history = await ChatMessage.find({ threadId })
  .sort({ createdAt: -1 })
  .limit(10);
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
      content:
        "You are a helpful assistant tasked with user query response. Always give response in markdown but not fully markdown",
    },
    ...chatHistory,
    {
      role: "user",
      content: userMessage,
    },
  ];


  const url = `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=2024-03-01-preview`;

  try {
    const azureRes = await axios({
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
    azureRes.data.on("error", (err) => {
      console.error("Azure stream error:", err);
      res.end();
    });
  } catch (error) {
    console.error(
      "Error querying Azure OpenAI:",
      error?.response?.data || error?.message || error
    );
    res.status(500).json({ error: "Model inference failed" });
  }
});

module.exports = router;

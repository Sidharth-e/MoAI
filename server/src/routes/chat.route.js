const express = require("express");
const router = express.Router();
const axios = require("axios");

// Load env vars
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const AZURE_OPENAI_API_KEY = process.env.AZURE_OPENAI_API_KEY;
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT;

// POST /azure
router.post("/", async (req, res) => {
    const { userMessage } = req.body;
    if (!userMessage || typeof userMessage !== "string") {
        return res.status(400).json({ error: "Missing or invalid userMessage" });
    }

    // Compose assistant system prompt and user message
    const messages = [
        {
            role: "system",
            content: "You are a helpful assistant tasked with user query response.Alway give response in markdown but not fully markdown"
        },
        {
            role: "user",
            content: userMessage,
        },
    ];

    const url =
        `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=2024-03-01-preview`;

    // Use stream mode for partial output
    try {
        const azureRes = await axios({
            method: "post",
            url,
            data: {
                messages,
                temperature: 0.7,
                stream: true
            },
            headers: {
                "Content-Type": "application/json",
                "api-key": AZURE_OPENAI_API_KEY,
            },
            responseType: "stream",
        });

        res.setHeader("Content-Type", "text/event-stream");
        azureRes.data.pipe(res);

        azureRes.data.on("end", () => {
            res.end();
        });
        azureRes.data.on("error", (err) => {
            console.error("Azure stream error:", err);
            res.end();
        });
    } catch (error) {
        console.error("Error querying Azure OpenAI:", error?.response?.data || error?.message || error);
        res.status(500).json({ error: "Model inference failed" });
    }
});

module.exports = router;
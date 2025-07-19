// routes/huggingFace.js
const express = require("express");
const router = express.Router();
const axios = require("axios");
const { InferenceClient } = require("@huggingface/inference");
// Load env vars
const HF_TOKEN = process.env.HUGGINGFACE_API_KEY; // Typically HF_TOKEN or HUGGINGFACE_API_KEY

// Adjust these as required
const PROVIDER = "fireworks-ai"; // e.g., "fireworks-ai"
const MODEL = "deepseek-ai/DeepSeek-R1"; // e.g., "deepseek-ai/DeepSeek-R1"
const client = new InferenceClient(HF_TOKEN);


router.post("/", async (req, res) => {
    const { html } = req.body;
    if (!html || typeof html !== "string") {
        return res.status(400).json({ error: "Invalid HTML input" });
    }

    const prompt = `
You are a helpful assistant 
**HTML Code**
${html}
`;

    try {
        const chatCompletion = await client.chatCompletion({
            provider: PROVIDER,
            model: MODEL,
            messages: [
                { role: "user", content: prompt },
            ],
        });
    // Remove <think>...</think> (including multi-line) if present
        // Also trims whitespace
        const output = chatCompletion.choices[0].message.content.replace(
            /<think>[\s\S]*?<\/think>/gi,
            ''
        ).trim();

        res.send(output);
    } catch (error) {
        console.error("Error querying Hugging Face:", error?.message || error);
        res.status(500).json({ error: "Model inference failed" });
    }
});

module.exports = router;
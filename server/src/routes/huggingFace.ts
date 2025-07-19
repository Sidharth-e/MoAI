import express, { Request, Response } from "express";
import { InferenceClient } from "@huggingface/inference";

// Load environment variables
const HF_TOKEN = process.env.HUGGINGFACE_API_KEY as string; // Cast to string
const PROVIDER = "fireworks-ai"; // e.g., "fireworks-ai"
const MODEL = "deepseek-ai/DeepSeek-R1"; // e.g., "deepseek-ai/DeepSeek-R1"

// Initialize inference client
const client = new InferenceClient(HF_TOKEN);

const router = express.Router();

// POST route for Hugging Face inference
router.post("/", async (req: Request, res: Response) => {
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
      messages: [{ role: "user", content: prompt }],
    });

    const messageContent = chatCompletion.choices?.[0]?.message?.content;

    if (messageContent) {
      // Remove <think>...</think> tags including multi-line and trim whitespace
      const output = messageContent
        .replace(/<think>[\s\S]*?<\/think>/gi, "")
        .trim();
      res.send(output);

      // Continue processing with `output`
    } else {
      console.error(
        "The message content is undefined. Check if the API response includes valid choices."
      );
      res
        .status(500)
        .json({
          error:
            "The message content is undefined. Check if the API response includes valid choices.",
        });
    }
  } catch (error) {
    console.error(
      "Error querying Hugging Face:",
      error instanceof Error ? error.message : error
    );
    res.status(500).json({ error: "Model inference failed" });
  }
});

export default router;

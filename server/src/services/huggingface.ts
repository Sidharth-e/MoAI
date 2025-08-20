import { HfInference } from "@huggingface/inference";

export const createHuggingFaceClient = () => {
  const apiKey = process.env.HUGGINGFACE_API_KEY!;
  
  if (!apiKey) {
    throw new Error("Missing HUGGINGFACE_API_KEY environment variable.");
  }

  const client = new HfInference(apiKey);
  
  return { client };
};

export const generateHuggingFaceResponse = async (
  messages: Array<{ role: string; content: string }>,
  model: string = "microsoft/DialoGPT-medium",
  temperature: number = 0.7
) => {
  const { client } = createHuggingFaceClient();
  
  // Convert conversation to a single prompt
  const prompt = messages
    .map(msg => `${msg.role}: ${msg.content}`)
    .join('\n');
  
  try {
    const response = await client.textGeneration({
      model,
      inputs: prompt,
      parameters: {
        max_new_tokens: 1000,
        temperature,
        do_sample: true,
        return_full_text: false
      }
    });
    
    return response.generated_text;
  } catch (error) {
    console.error("Hugging Face API error:", error);
    throw new Error("Failed to generate response from Hugging Face");
  }
};

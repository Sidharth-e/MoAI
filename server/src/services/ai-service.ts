import { createAzureOpenAIClient } from "./aoai";
import { createGeminiClient, generateGeminiResponse } from "./gemini";
import { createHuggingFaceClient, generateHuggingFaceResponse } from "./huggingface";

export type AIModel = "azure-openai" | "gemini" | "huggingface";

export interface AIModelConfig {
  model: AIModel;
  temperature?: number;
  maxTokens?: number;
  huggingFaceModel?: string; // For Hugging Face specific model selection
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export class AIService {
  private config: AIModelConfig;

  constructor(config: AIModelConfig) {
    this.config = config;
  }

  async generateResponse(messages: ChatMessage[]): Promise<string> {
    switch (this.config.model) {
      case "azure-openai":
        return this.generateAzureOpenAIResponse(messages);
      case "gemini":
        return this.generateGeminiResponse(messages);
      case "huggingface":
        return this.generateHuggingFaceResponse(messages);
      default:
        throw new Error(`Unsupported AI model: ${this.config.model}`);
    }
  }

  async generateStreamingResponse(
    messages: ChatMessage[],
    onDelta: (chunk: string) => void
  ): Promise<void> {
    switch (this.config.model) {
      case "azure-openai":
        return this.generateAzureOpenAIStreamingResponse(messages, onDelta);
      case "gemini":
        return this.generateGeminiStreamingResponse(messages, onDelta);
      case "huggingface":
        return this.generateHuggingFaceStreamingResponse(messages, onDelta);
      default:
        throw new Error(`Unsupported AI model: ${this.config.model}`);
    }
  }

  private async generateAzureOpenAIResponse(messages: ChatMessage[]): Promise<string> {
    const { client, deployment } = createAzureOpenAIClient();
    
    const response = await client.chat.completions.create({
      model: deployment,
      messages,
      temperature: this.config.temperature || 0.7,
      max_tokens: this.config.maxTokens || 2048,
    });

    return response.choices[0]?.message?.content || "";
  }

  private async generateAzureOpenAIStreamingResponse(
    messages: ChatMessage[],
    onDelta: (chunk: string) => void
  ): Promise<void> {
    const { client, deployment } = createAzureOpenAIClient();
    
    const stream = await client.chat.completions.create({
      model: deployment,
      messages,
      temperature: this.config.temperature || 0.7,
      max_tokens: this.config.maxTokens || 2048,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        onDelta(content);
      }
    }
  }

  private async generateGeminiResponse(messages: ChatMessage[]): Promise<string> {
    // Import the function to avoid naming conflict
    const { generateGeminiResponse: geminiResponse } = await import('./gemini');
    const temperature = this.config.temperature ?? 0.7;
    // Convert ChatMessage to the format expected by Gemini
    const geminiMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    return geminiResponse(geminiMessages, temperature);
  }

  private async generateGeminiStreamingResponse(
    messages: ChatMessage[],
    onDelta: (chunk: string) => void
  ): Promise<void> {
    const { client } = createGeminiClient();
    
    // Convert OpenAI format to Gemini format
    const history = messages.slice(0, -1).map(msg => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));
    
    const lastMessage = messages[messages.length - 1];
    
    const chat = client.chats.create({
      model: "gemini-2.5-flash",
      history,
    });

    const response = await chat.sendMessage({
      message: lastMessage.content,
    });
    
    // Since the new API doesn't support streaming directly, we'll simulate it
    const text = response.text || "";
    const chunkSize = 10;
    for (let i = 0; i < text.length; i += chunkSize) {
      const chunk = text.slice(i, i + chunkSize);
      onDelta(chunk);
      // Small delay to simulate streaming
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }

  private async generateHuggingFaceResponse(messages: ChatMessage[]): Promise<string> {
    const model = this.config.huggingFaceModel || "microsoft/DialoGPT-medium";
    return generateHuggingFaceResponse(messages, model, this.config.temperature);
  }

  private async generateHuggingFaceStreamingResponse(
    messages: ChatMessage[],
    onDelta: (chunk: string) => void
  ): Promise<void> {
    // Hugging Face doesn't support streaming in the same way, so we'll simulate it
    const response = await this.generateHuggingFaceResponse(messages);
    
    // Simulate streaming by sending chunks
    const chunkSize = 10;
    for (let i = 0; i < response.length; i += chunkSize) {
      const chunk = response.slice(i, i + chunkSize);
      onDelta(chunk);
      // Small delay to simulate streaming
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
}

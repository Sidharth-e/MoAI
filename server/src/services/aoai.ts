import { OpenAI } from "openai";

export const AzureOpenAIInstance = () => {
  const deploymentName=process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME;
  const llmEndpoint = `https://${process.env.AZURE_OPENAI_API_INSTANCE_NAME}.openai.azure.com/openai/deployments/${deploymentName}`;

  return new OpenAI({
    apiKey: process.env.AZURE_OPENAI_API_KEY,
    baseURL: llmEndpoint,
    defaultQuery: { "api-version": process.env.AZURE_OPENAI_API_VERSION },
    defaultHeaders: { "api-key": process.env.AZURE_OPENAI_API_KEY },
  });
};
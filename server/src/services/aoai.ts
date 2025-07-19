import { OpenAI } from "openai";

export const createAzureOpenAIClient = () => {
  const apiKey = process.env.AZURE_OPENAI_API_KEY!;
  const resource = process.env.AZURE_OPENAI_API_INSTANCE_NAME!;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION!;
  // This is the *deployment name* you created in Azure (e.g. gpt-4o-mini, gpt-4o, etc. but as your custom deployment name)
  const deployment = process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME!;

  if (!apiKey || !resource || !apiVersion || !deployment) {
    throw new Error("Missing one or more Azure OpenAI environment variables.");
  }
  const Endpoint = `https://${resource}.openai.azure.com/openai/deployments/${deployment}`;

  const client = new OpenAI({
    apiKey: process.env.AZURE_OPENAI_API_KEY,
    baseURL: Endpoint,
    defaultQuery: { "api-version": process.env.AZURE_OPENAI_API_VERSION },
    defaultHeaders: { "api-key": process.env.AZURE_OPENAI_API_KEY },
  });
  return { client, deployment };
};

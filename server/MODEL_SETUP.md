# AI Model Setup Guide

This guide explains how to set up the different AI models supported by the application.

## Required Environment Variables

Add these environment variables to your `.env` file:

### Azure OpenAI (Default)
```bash
AZURE_OPENAI_API_KEY=your_azure_openai_api_key_here
AZURE_OPENAI_API_INSTANCE_NAME=your_azure_openai_instance_name
AZURE_OPENAI_API_VERSION=2024-02-15-preview
AZURE_OPENAI_API_DEPLOYMENT_NAME=your_deployment_name
```

### Google Gemini
```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

### Hugging Face
```bash
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
```

## How to Get API Keys

### Azure OpenAI
1. Go to [Azure Portal](https://portal.azure.com)
2. Create or navigate to an Azure OpenAI resource
3. Go to "Keys and Endpoint" section
4. Copy the API key and endpoint details

### Google Gemini
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the generated key

### Hugging Face
1. Go to [Hugging Face](https://huggingface.co/settings/tokens)
2. Create a new access token
3. Copy the generated token

## Features by Model

### Azure OpenAI
- ✅ Full streaming support
- ✅ Tool calling (MCP tools)
- ✅ Advanced conversation handling
- ✅ Recommended for production use

### Google Gemini
- ✅ Full conversation support with gemini-2.5-flash model
- ✅ Good conversation handling with chat history
- ❌ No tool calling support
- ✅ Good for general chat and complex conversations

### Hugging Face
- ✅ Basic text generation
- ❌ Limited streaming (simulated)
- ❌ No tool calling support
- ✅ Good for experimentation

## Installation

After setting up the environment variables, install the required dependencies:

```bash
npm install
```

The application will automatically detect which models are available based on the environment variables you've set.

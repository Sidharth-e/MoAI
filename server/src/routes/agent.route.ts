import express from 'express';
import Agent from '../models/agent';
import { createAzureOpenAIClient } from '../services/aoai';

const router = express.Router();

// Create agent
router.post('/', async (req, res) => {
  try {
    const agent = new Agent(req.body);
    await agent.save();
    res.status(201).json(agent);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// Get all agents
router.get('/', async (req, res) => {
  try {
    const agents = await Agent.find();
    res.json(agents);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Get agent by ID
router.get('/:id', async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);
    if (!agent) return res.status(404).json({ error: 'Agent not found' });
    res.json(agent);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Update agent
router.put('/:id', async (req, res) => {
  try {
    const agent = await Agent.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!agent) return res.status(404).json({ error: 'Agent not found' });
    res.json(agent);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// Delete agent
router.delete('/:id', async (req, res) => {
  try {
    const agent = await Agent.findByIdAndDelete(req.params.id);
    if (!agent) return res.status(404).json({ error: 'Agent not found' });
    res.json({ message: 'Agent deleted' });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Send a message to an agent (Azure OpenAI)
router.post('/:id/message', async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id).populate('connections');
    if (!agent) return res.status(404).json({ error: 'Agent not found' });
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const { client, deployment } = createAzureOpenAIClient();
    const conversation = [];

    // Main agent responds to user
    const systemPrompt = agent.config?.systemPrompt || `You are agent ${agent.name}, a helpful assistant.`;
    const chatResponse = await client.chat.completions.create({
      model: deployment,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      temperature: 0.7,
    });
    const mainResponse = chatResponse.choices?.[0]?.message?.content?.trim() || '';
    conversation.push({ agent: agent.name, role: 'assistant', content: mainResponse });

    // Sequentially pass the response to each connected agent
    let prevMessage = mainResponse;
    for (const connAgent of agent.connections) {
      // Only process if connAgent is a valid ObjectId or document
      if (!connAgent || (typeof connAgent === 'object' && 'equals' in connAgent && connAgent == null)) continue;
      let connected: any = connAgent;
      // If it's just an ObjectId, fetch the full document
      if (typeof connAgent === 'object' && !('config' in connAgent) && typeof connAgent._id === 'undefined') {
        const found = await Agent.findById(connAgent as import('mongoose').Types.ObjectId);
        if (!found) continue;
        connected = found;
      }
      // Only proceed if connected is a valid document
      if (!connected || typeof connected !== 'object' || !('config' in connected)) continue;
      const connSystemPrompt = (connected as any).config?.systemPrompt || `You are agent ${(connected as any).name}, a helpful assistant.`;
      const connChatResponse = await client.chat.completions.create({
        model: deployment,
        messages: [
          { role: 'system', content: connSystemPrompt },
          { role: 'user', content: prevMessage },
        ],
        temperature: 0.7,
      });
      const connResponse = connChatResponse.choices?.[0]?.message?.content?.trim() || '';
      conversation.push({ agent: (connected as any).name, role: 'assistant', content: connResponse });
      prevMessage = connResponse;
    }

    res.json({ conversation });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Update agent connections
router.put('/:id/connections', async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);
    if (!agent) return res.status(404).json({ error: 'Agent not found' });
    const { connections } = req.body;
    if (!Array.isArray(connections)) return res.status(400).json({ error: 'Connections must be an array of agent IDs' });
    agent.connections = connections;
    await agent.save();
    res.json(agent);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router; 
export interface Agent {
  id: string;
  name: string;
  instructions: string;
  communicationLevel: 'low' | 'medium' | 'high';
  model: string;
}

export interface ChatConfig {
  agentId: string;
  concurrentConversations: number;
  model: string;
  userMessage: string;
}
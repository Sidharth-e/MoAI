const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

function buildHeaders(token: string | undefined) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Request failed (${res.status}): ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export interface AgentDTO {
  _id: string;
  name: string;
  description?: string;
  config: Record<string, any>;
  connections: string[];
}

export interface PipelineDTO {
  _id: string;
  name: string;
  description?: string;
  steps: string[];
}

export async function createAgent(jwtToken: string, agent: Omit<AgentDTO, '_id'>): Promise<AgentDTO> {
  const res = await fetch(`${API_BASE}/agents`, {
    method: 'POST',
    headers: buildHeaders(jwtToken),
    body: JSON.stringify(agent),
  });
  return handleJson<AgentDTO>(res);
}

export async function getAgents(jwtToken: string): Promise<AgentDTO[]> {
  const res = await fetch(`${API_BASE}/agents`, {
    headers: buildHeaders(jwtToken),
  });
  return handleJson<AgentDTO[]>(res);
}

export async function createPipeline(jwtToken: string, pipeline: Omit<PipelineDTO, '_id'>): Promise<PipelineDTO> {
  const res = await fetch(`${API_BASE}/pipelines`, {
    method: 'POST',
    headers: buildHeaders(jwtToken),
    body: JSON.stringify(pipeline),
  });
  return handleJson<PipelineDTO>(res);
}

export async function getPipelines(jwtToken: string): Promise<PipelineDTO[]> {
  const res = await fetch(`${API_BASE}/pipelines`, {
    headers: buildHeaders(jwtToken),
  });
  return handleJson<PipelineDTO[]>(res);
}

export async function sendMessageToAgent(jwtToken: string, agentId: string, message: string): Promise<{ response: string }> {
  const res = await fetch(`${API_BASE}/agents/${agentId}/message`, {
    method: 'POST',
    headers: buildHeaders(jwtToken),
    body: JSON.stringify({ message }),
  });
  return handleJson<{ response: string }>(res);
}

export async function updateAgentConnections(jwtToken: string, agentId: string, connections: string[]): Promise<AgentDTO> {
  const res = await fetch(`${API_BASE}/agents/${agentId}/connections`, {
    method: 'PUT',
    headers: buildHeaders(jwtToken),
    body: JSON.stringify({ connections }),
  });
  return handleJson<AgentDTO>(res);
}

export async function updateAgent(jwtToken: string, agentId: string, agent: Partial<Omit<AgentDTO, '_id'>>): Promise<AgentDTO> {
  const res = await fetch(`${API_BASE}/agents/${agentId}`, {
    method: 'PUT',
    headers: buildHeaders(jwtToken),
    body: JSON.stringify(agent),
  });
  return handleJson<AgentDTO>(res);
}

export async function deleteAgent(jwtToken: string, agentId: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/agents/${agentId}`, {
    method: 'DELETE',
    headers: buildHeaders(jwtToken),
  });
  return handleJson<{ message: string }>(res);
} 
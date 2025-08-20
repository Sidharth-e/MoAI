// utils/chatApi.ts
// Centralized chat/thread API helpers

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

export interface CreateChatThreadResponse {
  _id: string;
  title: string;
  createdAt: string;
  // add other fields your backend sends
}

export interface ChatMessageDTO {
  _id?: string;
  text: string;
  sender: "user" | "assistant";
  createdAt?: string;
  versions?: string[];
  activeVersionIndex?: number;
}

type AuthHeaders = { Authorization: string };

/* ---------- Helpers ---------- */
function authHeaders(token: string | undefined): AuthHeaders | {} {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Request failed (${res.status}): ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

/* ---------- Thread Functions ---------- */

/** Create a new chat thread */
export async function createChatThread(
  jwtToken: string,
  title: string = "New Chat"
): Promise<CreateChatThreadResponse> {
  const res = await fetch(`${API_BASE}/chat-threads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(jwtToken),
    },
    body: JSON.stringify({ title }),
  });
  const data = await handleJson<{ thread: CreateChatThreadResponse }>(res);
  return data.thread;
}

/**
 * Update / generate thread title (server decides new title).
 * If your API expects a payload (e.g., { title: "..." }), add it.
 */
export async function updateChatThreadTitle(
  threadId: string,
  jwtToken: string
): Promise<CreateChatThreadResponse> {
  const res = await fetch(`${API_BASE}/chat-threads/${threadId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(jwtToken),
    },
    // body: JSON.stringify({ title })  // uncomment if you send a custom title
  });
  const data = await handleJson<{ thread: CreateChatThreadResponse }>(res);
  return data.thread;
}

/* ---------- Message Functions ---------- */

/** Persist a single message */
export async function createChatMessage(
  threadId: string,
  jwtToken: string,
  message: Pick<ChatMessageDTO, "text" | "sender">
): Promise<ChatMessageDTO> {
  const res = await fetch(`${API_BASE}/chat-messages/${threadId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(jwtToken),
    },
    body: JSON.stringify(message),
  });
  const data = await handleJson<{ message: ChatMessageDTO }>(res);
  return data.message;
}

/** Fetch all messages for a thread */
export async function fetchChatMessages(
  threadId: string,
  jwtToken: string
): Promise<ChatMessageDTO[]> {
  const res = await fetch(`${API_BASE}/chat-messages/${threadId}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(jwtToken),
    },
  });
  const data = await handleJson<{ messages: ChatMessageDTO[] }>(res);
  return data.messages || [];
}

/** Regenerate a specific assistant message */
export async function regenerateMessage(
  messageId: string,
  threadId: string,
  jwtToken: string
): Promise<ChatMessageDTO> {
  const res = await fetch(`${API_BASE}/chat/regenerate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(jwtToken),
    },
    body: JSON.stringify({ messageId, threadId }),
  });
  const data = await handleJson<{ message: ChatMessageDTO }>(res);
  return data.message;
}

/** Update the active version index for a message */
export async function updateMessageVersion(
  messageId: string,
  activeVersionIndex: number,
  jwtToken: string
): Promise<ChatMessageDTO> {
  const res = await fetch(`${API_BASE}/chat-messages/${messageId}/version`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(jwtToken),
    },
    body: JSON.stringify({ activeVersionIndex }),
  });
  const data = await handleJson<{ chatMessage: ChatMessageDTO }>(res);
  return data.chatMessage;
}

/* ---------- (Optional) Streaming Helper ---------- */
/**
 * Stream assistant response. Calls onDelta for each text chunk.
 * Returns the full accumulated assistant message when done.
 */
export async function streamAssistantResponse(
  params: {
    prompt: string;
    threadId: string;
    jwtToken?: string;
    onDelta: (chunk: string) => void;
    onError?: (err: unknown) => void;
  }
): Promise<string> {
  const { prompt, threadId, jwtToken, onDelta, onError } = params;
  let full = "";

  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(jwtToken),
      },
      body: JSON.stringify({ userMessage: prompt, threadId }),
    });

    if (!res.body) throw new Error("No response body for stream");

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let done = false;

    while (!done) {
      const { value, done: isDone } = await reader.read();
      done = isDone;
      if (value) {
        buffer += decoder.decode(value, { stream: true });
        let lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (let raw of lines) {
          const line = raw.trim();
            if (!line.startsWith("data:")) continue;
          const data = line.slice("data:".length).trim();
          if (data === "[DONE]") break; 
          try {
            const json = JSON.parse(data);
            const delta: string | undefined =
              json.choices?.[0]?.delta?.content;
            if (delta) {
              full += delta;
              onDelta(delta);
            }
          } catch (e) {
            console.error("Stream parse error", e, data);
          }
        }
      }
    }
  } catch (err) {
    onError?.(err);
    throw err;
  }

  return full;
}

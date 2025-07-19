"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  AgentDTO,
  getAgents,
  getAgents as getAgentList,
  sendMessageToAgent,
  updateAgentConnections,
} from "@/services/agent-services";

const AgentChatPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [agents, setAgents] = useState<AgentDTO[]>([]);
  const [agent, setAgent] = useState<AgentDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [connEdits, setConnEdits] = useState<string[]>([]);
  const [connLoading, setConnLoading] = useState(false);

  // Fetch agents and current agent
  const fetchAgents = async () => {
    if (!session?.user?.jwtToken) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getAgentList(session.user.jwtToken);
      setAgents(data);
      const found = data.find((a) => a._id === id);
      setAgent(found || null);
      setConnEdits(found?.connections.map(String) || []);
    } catch (e: any) {
      setError(e.message || "Failed to fetch agents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") fetchAgents();
    // eslint-disable-next-line
  }, [status, session?.user?.jwtToken, id]);

  // Chat logic
  const handleSendChat = async () => {
    if (!session?.user?.jwtToken || !chatInput.trim() || !agent) return;
    setChatLoading(true);
    setChatHistory((prev) => [...prev, { role: "user", content: chatInput }]);
    try {
      const res = await sendMessageToAgent(session.user.jwtToken, agent._id, chatInput);
      setChatHistory((prev) => [...prev, { role: "assistant", content: res.response }]);
      setChatInput("");
    } catch (e: any) {
      setChatHistory((prev) => [...prev, { role: "assistant", content: e.message || "Error" }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Connection logic
  const handleConnEdit = (value: string[]) => {
    setConnEdits(value);
  };
  const handleSaveConnections = async () => {
    if (!session?.user?.jwtToken || !agent) return;
    setConnLoading(true);
    try {
      await updateAgentConnections(session.user.jwtToken, agent._id, connEdits);
      await fetchAgents();
    } catch (e: any) {
      setError(e.message || "Failed to update connections");
    } finally {
      setConnLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Agents</h2>
          <div className="flex flex-col gap-1">
            {agents.map((a) => (
              <button
                key={a._id}
                onClick={() => router.push(`/agents/${a._id}`)}
                className={`text-left px-3 py-2 rounded transition font-medium ${
                  a._id === id
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                    : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                {a.name}
              </button>
            ))}
          </div>
        </div>
        {/* Connections */}
        {agent && (
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Connections:</label>
            <select
              multiple
              value={connEdits}
              onChange={(e) => {
                const options = Array.from(e.target.selectedOptions).map((o) => o.value);
                handleConnEdit(options);
              }}
              className="w-full rounded border px-2 py-1 text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {agents.filter((a) => a._id !== agent._id).map((a) => (
                <option key={a._id} value={a._id}>
                  {a.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleSaveConnections}
              className="mt-2 w-full bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs disabled:opacity-60"
              disabled={connLoading}
            >
              Save Connections
            </button>
          </div>
        )}
      </aside>
      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col items-center justify-start py-10 px-4 sm:px-8">
        <div className="w-full max-w-2xl">
          {agent ? (
            <>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">{agent.name}</h1>
              <div className="text-slate-500 dark:text-slate-300 mb-4">{agent.description}</div>
              {/* Chat history */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-4 mb-4 h-80 overflow-y-auto flex flex-col gap-2">
                {chatHistory.length === 0 ? (
                  <div className="text-slate-400 italic">No conversation yet.</div>
                ) : (
                  chatHistory.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`px-3 py-2 rounded-lg max-w-[80%] ${
                        msg.role === "user"
                          ? "bg-blue-100 dark:bg-blue-900 self-end text-right"
                          : "bg-slate-100 dark:bg-slate-700 self-start"
                      }`}
                    >
                      <span className="block text-xs text-slate-500 mb-1">{msg.role === "user" ? "You" : agent.name}</span>
                      <span className="whitespace-pre-line">{msg.content}</span>
                    </div>
                  ))
                )}
              </div>
              {/* Chat input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendChat();
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 rounded border px-3 py-2 text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  disabled={chatLoading}
                  required
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded transition disabled:opacity-60"
                  disabled={chatLoading || !chatInput.trim()}
                >
                  {chatLoading ? "..." : "Send"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-slate-400 italic">Agent not found.</div>
          )}
          {error && <div className="text-red-500 text-sm mt-4">{error}</div>}
        </div>
      </main>
    </div>
  );
};

export default AgentChatPage; 
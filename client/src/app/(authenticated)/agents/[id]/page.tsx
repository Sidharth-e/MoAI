"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  AgentDTO,
  getAgents as getAgentList,
  sendMessageToAgent,
  updateAgentConnections,
} from "@/services/agent-services";
import AgentSideBar from "@/components/AgentSideBar";
import ChatMessage from "@/components/ChatMessage";
import { FiUsers } from "react-icons/fi";

const AgentChatPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [agents, setAgents] = useState<AgentDTO[]>([]);
  const [agent, setAgent] = useState<AgentDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  // Change chatHistory type to include agentName for assistant messages
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant'; content: string; agentName?: string }[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [connEdits, setConnEdits] = useState<string[]>([]);
  const [connLoading, setConnLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    setChatHistory((prev) => [...prev, { role: 'user', content: chatInput }]);
    try {
      const res = await sendMessageToAgent(session.user.jwtToken, agent._id, chatInput);
      // Append each agent's response in order, showing which agent said what
      setChatHistory((prev) => [
        ...prev,
        ...res.conversation.map((msg) => ({
          role: 'assistant' as const,
          content: msg.content,
          agentName: msg.agent,
        })),
      ]);
      setChatInput("");
    } catch (e: any) {
      setChatHistory((prev) => [...prev, { role: 'assistant', content: e.message || 'Error' }]);
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
    <div className="flex flex-grow min-h-screen bg-slate-50 dark:bg-slate-900 relative">
      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col items-center justify-start py-10 px-4 sm:px-8">
        <div className="w-full max-w-2xl">
          {/* Sidebar toggle button (only on mobile/small screens) */}
          <button
            className="fixed right-4 top-4 z-50 bg-blue-600 text-white rounded-full p-2 shadow-lg sm:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open agent sidebar"
          >
            <FiUsers size={24} />
          </button>
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
                    <ChatMessage
                      key={idx}
                      role={msg.role}
                      content={msg.content}
                      agentName={msg.agentName}
                    />
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
      {/* Agent Sidebar (right) */}
      <AgentSideBar
        agents={agents}
        currentAgentId={id as string}
        onSelectAgent={(aid) => {
          setSidebarOpen(false);
          router.push(`/agents/${aid}`);
        }}
        connEdits={connEdits}
        onConnEdit={handleConnEdit}
        onSaveConnections={handleSaveConnections}
        connLoading={connLoading}
        show={sidebarOpen || typeof window !== 'undefined' && window.innerWidth >= 640}
        onClose={() => setSidebarOpen(false)}
      />
      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30 sm:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar overlay"
        />
      )}
    </div>
  );
};

export default AgentChatPage; 
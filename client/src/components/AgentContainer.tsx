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
import { FiUsers, FiChevronRight, FiChevronLeft } from "react-icons/fi";

const AgentContainer = () => {
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
  const [sidebarOpen, setSidebarOpen] = useState(true); // default to open

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
    <div className="flex h-full flex-col bg-white dark:bg-gray-900">
      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="mx-auto max-w-4xl">
            {/* Remove the floating user icon button */}
            {agent ? (
              <>
                <div className="space-y-4 mb-6">
                  {chatHistory.length === 0 ? (
                    <div className="text-gray-500 dark:text-gray-400 text-center py-8">
                      No conversation yet.
                    </div>
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
                <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 py-4">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendChat();
                    }}
                    className="flex gap-3 max-w-4xl mx-auto"
                  >
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={chatLoading}
                      required
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={chatLoading || !chatInput.trim()}
                    >
                      {chatLoading ? "..." : "Send"}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="text-gray-500 dark:text-gray-400 text-center py-8">
                Agent not found.
              </div>
            )}
            {error && (
              <div className="text-red-500 dark:text-red-400 text-sm mt-4 text-center">
                {error}
              </div>
            )}
          </div>
        </div>
      </main>
      {/* Agent Sidebar (right) */}
      <AgentSideBar
        agents={agents}
        currentAgentId={id as string}
        onSelectAgent={(aid) => {
          setSidebarOpen(true);
          router.push(`/agents/${aid}`);
        }}
        connEdits={connEdits}
        onConnEdit={handleConnEdit}
        onSaveConnections={handleSaveConnections}
        connLoading={connLoading}
        show={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapse={() => setSidebarOpen((prev) => !prev)}
        collapsed={!sidebarOpen}
      />
    </div>
  );
};

export default AgentContainer;
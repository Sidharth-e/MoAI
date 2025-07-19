"use client"
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { AgentDTO, getAgents } from '@/services/agent-services';
import { useRouter } from 'next/navigation';

const AgentsPage = () => {
  const { data: session, status } = useSession();
  const [agents, setAgents] = useState<AgentDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchAgents = async () => {
    if (!session?.user?.jwtToken) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getAgents(session.user.jwtToken);
      setAgents(data);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch agents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') fetchAgents();
  }, [status, session?.user?.jwtToken]);

  // Placeholder handlers for edit/delete
  const handleEdit = (id: string) => {
    // TODO: Implement edit modal or page
    alert('Edit agent ' + id);
  };
  const handleDelete = (id: string) => {
    // TODO: Implement delete logic
    alert('Delete agent ' + id);
  };
  const handleStartChat = (id: string) => {
    router.push(`/agents/${id}`);
  };

  return (
    <div className="flex-grow min-h-screen bg-slate-50 dark:bg-slate-900 py-10 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-8">AI Agents</h1>
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        {loading ? (
          <div className="flex items-center justify-center text-slate-400 italic h-40">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-h-[70vh] overflow-y-auto pr-2">
            {agents.length === 0 ? (
              <div className="col-span-full flex items-center justify-center text-slate-400 italic">No agents yet.</div>
            ) : (
              agents.map(agent => (
                <div key={agent._id} className="bg-white dark:bg-slate-800 rounded-xl shadow p-5 flex flex-col h-full">
                  <div className="flex-1">
                    <div className="font-semibold text-lg text-slate-800 dark:text-slate-100 mb-1">{agent.name}</div>
                    <div className="text-slate-500 dark:text-slate-300 text-sm mb-2 line-clamp-3">{agent.description}</div>
                  </div>
                  <div className="mt-4 flex flex-col gap-2">
                    <button
                      onClick={() => handleStartChat(agent._id)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition"
                    >
                      Start Chatting
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(agent._id)}
                        className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold py-1 rounded text-xs"
                      >Edit</button>
                      <button
                        onClick={() => handleDelete(agent._id)}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-1 rounded text-xs"
                      >Delete</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentsPage; 
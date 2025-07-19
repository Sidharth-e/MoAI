"use client"
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { AgentDTO, getAgents, createAgent, updateAgent, deleteAgent } from '@/services/agent-services';
import { useRouter } from 'next/navigation';

const AgentsPage = () => {
  const { data: session, status } = useSession();
  const [agents, setAgents] = useState<AgentDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', config: '{"systemPrompt": "You are a helpful AI agent."}' });
  const [creating, setCreating] = useState(false);
  const [editModal, setEditModal] = useState<{ open: boolean; agent: AgentDTO | null }>({ open: false, agent: null });
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; agent: AgentDTO | null }>({ open: false, agent: null });
  const [editForm, setEditForm] = useState({ name: '', description: '', config: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
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

  // Agent creation logic
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.jwtToken) return;
    setCreating(true);
    setError(null);
    try {
      const configObj = JSON.parse(form.config || '{}');
      await createAgent(session.user.jwtToken, {
        name: form.name,
        description: form.description,
        config: configObj,
        connections: [],
      });
      setForm({ name: '', description: '', config: '{"systemPrompt": "You are a helpful AI agent."}' });
      await fetchAgents();
    } catch (e: any) {
      setError(e.message || 'Failed to create agent (check config JSON)');
    } finally {
      setCreating(false);
    }
  };

  // Placeholder handlers for edit/delete
  const handleEdit = (id: string) => {
    const agent = agents.find(a => a._id === id);
    if (!agent) return;
    setEditForm({
      name: agent.name,
      description: agent.description || '',
      config: JSON.stringify(agent.config, null, 2),
    });
    setEditModal({ open: true, agent });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.jwtToken || !editModal.agent) return;
    setEditLoading(true);
    setError(null);
    try {
      const configObj = JSON.parse(editForm.config || '{}');
      await updateAgent(session.user.jwtToken, editModal.agent._id, {
        name: editForm.name,
        description: editForm.description,
        config: configObj,
      });
      setEditModal({ open: false, agent: null });
      await fetchAgents();
    } catch (e: any) {
      setError(e.message || 'Failed to update agent (check config JSON)');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    const agent = agents.find(a => a._id === id);
    if (!agent) return;
    setDeleteConfirm({ open: true, agent });
  };

  const handleDeleteConfirm = async () => {
    if (!session?.user?.jwtToken || !deleteConfirm.agent) return;
    setDeleteLoading(true);
    setError(null);
    try {
      await deleteAgent(session.user.jwtToken, deleteConfirm.agent._id);
      setDeleteConfirm({ open: false, agent: null });
      await fetchAgents();
    } catch (e: any) {
      setError(e.message || 'Failed to delete agent');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ open: false, agent: null });
  };
  const handleStartChat = (id: string) => {
    router.push(`/agents/${id}`);
  };

  return (
    <div className="flex-grow min-h-screen bg-slate-50 dark:bg-slate-900 py-10 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-8">AI Agents</h1>
        {/* Agent creation form */}
        <form onSubmit={handleCreate} className="bg-white dark:bg-slate-800 rounded-xl shadow p-5 mb-8 flex flex-col gap-3 max-w-2xl mx-auto">
          <div className="flex flex-col gap-2">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Agent Name"
              className="rounded border px-3 py-2 text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Description"
              className="rounded border px-3 py-2 text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
              rows={2}
            />
            <textarea
              name="config"
              value={form.config}
              onChange={handleChange}
              placeholder='Config (JSON: { "systemPrompt": "You are a helpful AI agent." })'
              className="rounded border px-3 py-2 text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono"
              rows={2}
              required
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition disabled:opacity-60"
          >
            {creating ? 'Creating...' : 'Create Agent'}
          </button>
          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        </form>
        {/* Agent grid */}
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
      {/* Edit Agent Modal */}
      {editModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100">Edit Agent</h2>
            <form onSubmit={handleEditSubmit} className="flex flex-col gap-3">
              <input
                name="name"
                value={editForm.name}
                onChange={handleEditChange}
                placeholder="Agent Name"
                className="rounded border px-3 py-2 text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
              <textarea
                name="description"
                value={editForm.description}
                onChange={handleEditChange}
                placeholder="Description"
                className="rounded border px-3 py-2 text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                rows={2}
              />
              <textarea
                name="config"
                value={editForm.config}
                onChange={handleEditChange}
                placeholder='Config (JSON: { "systemPrompt": "You are a helpful AI agent." })'
                className="rounded border px-3 py-2 text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono"
                rows={2}
                required
              />
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setEditModal({ open: false, agent: null })}
                  className="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 py-2 rounded"
                  disabled={editLoading}
                >Cancel</button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition"
                  disabled={editLoading}
                >{editLoading ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Dialog */}
      {deleteConfirm.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold mb-4 text-slate-800 dark:text-slate-100">Delete Agent</h2>
            <p className="mb-4 text-slate-700 dark:text-slate-200">Are you sure you want to delete <span className="font-semibold">{deleteConfirm.agent?.name}</span>?</p>
            <div className="flex gap-2">
              <button
                onClick={handleDeleteCancel}
                className="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 py-2 rounded"
                disabled={deleteLoading}
              >Cancel</button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded transition"
                disabled={deleteLoading}
              >{deleteLoading ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentsPage; 
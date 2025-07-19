"use client";
import React from "react";

interface AgentDTO {
  _id: string;
  name: string;
  description?: string;
  connections: string[];
}

interface AgentSideBarProps {
  agents: AgentDTO[];
  currentAgentId: string;
  onSelectAgent: (id: string) => void;
  connEdits: string[];
  onConnEdit: (value: string[]) => void;
  onSaveConnections: () => void;
  connLoading: boolean;
  show: boolean;
  onClose: () => void;
}

const AgentSideBar: React.FC<AgentSideBarProps> = ({
  agents,
  currentAgentId,
  onSelectAgent,
  connEdits,
  onConnEdit,
  onSaveConnections,
  connLoading,
  show,
  onClose,
}) => {
  const currentAgent = agents.find((a) => a._id === currentAgentId);
  return (
    <aside
      className={`fixed top-0 right-0 h-full z-40 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 shadow-lg transition-transform duration-300 w-72 max-w-full flex flex-col ${
        show ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <button
        className="absolute left-2 top-2 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
        onClick={onClose}
        aria-label="Close sidebar"
      >
        ✕
      </button>
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Agents</h2>
        <div className="flex flex-col gap-1">
          {agents.map((a) => (
            <button
              key={a._id}
              onClick={() => onSelectAgent(a._id)}
              className={`text-left px-3 py-2 rounded transition font-medium ${
                a._id === currentAgentId
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
      {currentAgent && (
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Connections:</label>
          <select
            multiple
            value={connEdits}
            onChange={(e) => {
              const options = Array.from(e.target.selectedOptions).map((o) => o.value);
              onConnEdit(options);
            }}
            className="w-full rounded border px-2 py-1 text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {agents.filter((a) => a._id !== currentAgent._id).map((a) => (
              <option key={a._id} value={a._id}>
                {a.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={onSaveConnections}
            className="mt-2 w-full bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs disabled:opacity-60"
            disabled={connLoading}
          >
            Save Connections
          </button>
        </div>
      )}
    </aside>
  );
};

export default AgentSideBar; 
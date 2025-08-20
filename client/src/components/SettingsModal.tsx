"use client";
import React, { useState, useEffect } from "react";
import { X, Settings as SettingsIcon, Moon, Sun, Volume2, VolumeX, Palette, Globe, Shield, User, Bell, Bot, MessageSquare, Zap, Eye, EyeOff, Database, Smartphone, Monitor } from "lucide-react";
import { useModel } from "@/contexts/ModelContext";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SettingOption {
  id: string;
  label: string;
  description: string;
  type: "toggle" | "select" | "input" | "button" | "slider";
  value?: any;
  options?: { label: string; value: string }[];
  icon?: React.ReactNode;
  min?: number;
  max?: number;
  step?: number;
}

type SettingsTab = "general" | "ai" | "privacy" | "advanced";

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { selectedModel, setSelectedModel } = useModel();
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [settings, setSettings] = useState({
    // General settings
    theme: "system",
    language: "en",
    notifications: true,
    sound: true,
    autoSave: true,
    fontSize: "medium",
    
    // AI settings
    model: selectedModel,
    temperature: 0.7,
    maxTokens: "2048",
    conversationMemory: true,
    autoComplete: true,
    codeHighlighting: true,
    markdownRendering: true,
    
    // Privacy settings
    privacyMode: false,
    dataCollection: true,
    conversationHistory: true,
    shareAnalytics: false,
    
    // Advanced settings
    streaming: true,
    cacheResponses: true,
    debugMode: false,
    performanceMode: "balanced"
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Update global model context when model changes
    if (key === "model") {
      setSelectedModel(value);
    }
  };

  // Sync settings with global model context
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      model: selectedModel
    }));
  }, [selectedModel]);

  const generalSettings: SettingOption[] = [
    {
      id: "theme",
      label: "Theme",
      description: "Choose your preferred color scheme",
      type: "select",
      value: settings.theme,
      options: [
        { label: "System", value: "system" },
        { label: "Light", value: "light" },
        { label: "Dark", value: "dark" }
      ],
      icon: <Palette className="w-5 h-5" />
    },
    {
      id: "language",
      label: "Language",
      description: "Select your preferred language",
      type: "select",
      value: settings.language,
      options: [
        { label: "English", value: "en" },
        { label: "Spanish", value: "es" },
        { label: "French", value: "fr" },
        { label: "German", value: "de" },
        { label: "Chinese", value: "zh" },
        { label: "Japanese", value: "ja" }
      ],
      icon: <Globe className="w-5 h-5" />
    },
    {
      id: "fontSize",
      label: "Font Size",
      description: "Adjust the text size for better readability",
      type: "select",
      value: settings.fontSize,
      options: [
        { label: "Small", value: "small" },
        { label: "Medium", value: "medium" },
        { label: "Large", value: "large" },
        { label: "Extra Large", value: "xl" }
      ],
      icon: <User className="w-5 h-5" />
    },
    {
      id: "notifications",
      label: "Push Notifications",
      description: "Receive notifications for new messages",
      type: "toggle",
      value: settings.notifications,
      icon: <Bell className="w-5 h-5" />
    },
    {
      id: "sound",
      label: "Sound Effects",
      description: "Play sounds for notifications and actions",
      type: "toggle",
      value: settings.sound,
      icon: settings.sound ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />
    },
    {
      id: "autoSave",
      label: "Auto Save",
      description: "Automatically save your conversations",
      type: "toggle",
      value: settings.autoSave,
      icon: <Shield className="w-5 h-5" />
    }
  ];

  const aiSettings: SettingOption[] = [
    {
      id: "model",
      label: "AI Model",
      description: "Choose the AI model for your conversations",
      type: "select",
      value: settings.model,
      options: [
        { label: "Azure OpenAI (GPT-4)", value: "azure-openai" },
        { label: "Google Gemini 2.5 Flash", value: "gemini" },
        { label: "Hugging Face", value: "huggingface" }
      ],
      icon: <Bot className="w-5 h-5" />
    },
    {
      id: "temperature",
      label: "Creativity",
      description: "Control how creative or focused the AI responses are",
      type: "slider",
      value: settings.temperature,
      min: 0,
      max: 2,
      step: 0.1,
      icon: <Zap className="w-5 h-5" />
    },
    {
      id: "maxTokens",
      label: "Response Length",
      description: "Maximum length of AI responses",
      type: "select",
      value: settings.maxTokens,
      options: [
        { label: "Short (1024)", value: "1024" },
        { label: "Medium (2048)", value: "2048" },
        { label: "Long (4096)", value: "4096" },
        { label: "Very Long (8192)", value: "8192" }
      ],
      icon: <MessageSquare className="w-5 h-5" />
    },
    {
      id: "conversationMemory",
      label: "Conversation Memory",
      description: "AI remembers context from previous messages",
      type: "toggle",
      value: settings.conversationMemory,
      icon: <Database className="w-5 h-5" />
    },
    {
      id: "autoComplete",
      label: "Auto-complete",
      description: "AI suggests completions as you type",
      type: "toggle",
      value: settings.autoComplete,
      icon: <Zap className="w-5 h-5" />
    },
    {
      id: "codeHighlighting",
      label: "Code Highlighting",
      description: "Syntax highlighting for code blocks",
      type: "toggle",
      value: settings.codeHighlighting,
      icon: <Monitor className="w-5 h-5" />
    },
    {
      id: "markdownRendering",
      label: "Markdown Rendering",
      description: "Render markdown formatting in responses",
      type: "toggle",
      value: settings.markdownRendering,
      icon: <MessageSquare className="w-5 h-5" />
    }
  ];

  const privacySettings: SettingOption[] = [
    {
      id: "privacyMode",
      label: "Privacy Mode",
      description: "Hide sensitive information from screenshots",
      type: "toggle",
      value: settings.privacyMode,
      icon: settings.privacyMode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />
    },
    {
      id: "conversationHistory",
      label: "Save Conversation History",
      description: "Store your chat history locally",
      type: "toggle",
      value: settings.conversationHistory,
      icon: <Database className="w-5 h-5" />
    },
    {
      id: "dataCollection",
      label: "Usage Analytics",
      description: "Help improve the service with anonymous usage data",
      type: "toggle",
      value: settings.dataCollection,
      icon: <Shield className="w-5 h-5" />
    },
    {
      id: "shareAnalytics",
      label: "Share Analytics",
      description: "Share conversation data for research purposes",
      type: "toggle",
      value: settings.shareAnalytics,
      icon: <Database className="w-5 h-5" />
    }
  ];

  const advancedSettings: SettingOption[] = [
    {
      id: "streaming",
      label: "Streaming Responses",
      description: "Show AI responses as they're generated",
      type: "toggle",
      value: settings.streaming,
      icon: <Zap className="w-5 h-5" />
    },
    {
      id: "cacheResponses",
      label: "Cache Responses",
      description: "Store responses for faster access",
      type: "toggle",
      value: settings.cacheResponses,
      icon: <Database className="w-5 h-5" />
    },
    {
      id: "performanceMode",
      label: "Performance Mode",
      description: "Balance between speed and quality",
      type: "select",
      value: settings.performanceMode,
      options: [
        { label: "Speed", value: "speed" },
        { label: "Balanced", value: "balanced" },
        { label: "Quality", value: "quality" }
      ],
      icon: <Zap className="w-5 h-5" />
    },
    {
      id: "debugMode",
      label: "Debug Mode",
      description: "Show technical information and logs",
      type: "toggle",
      value: settings.debugMode,
      icon: <Monitor className="w-5 h-5" />
    }
  ];

  const renderSettingControl = (option: SettingOption) => {
    switch (option.type) {
      case "toggle":
        return (
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={option.value}
              onChange={(e) => handleSettingChange(option.id, e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        );
      
      case "select":
        return (
          <select
            value={option.value}
            onChange={(e) => handleSettingChange(option.id, e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            {option.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      
      case "slider":
        return (
          <div className="flex items-center space-x-3">
            <input
              type="range"
              min={option.min}
              max={option.max}
              step={option.step}
              value={option.value}
              onChange={(e) => handleSettingChange(option.id, parseFloat(e.target.value))}
              className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[3rem]">
              {option.value}
            </span>
          </div>
        );
      
      case "input":
        return (
          <input
            type="text"
            value={option.value || ""}
            onChange={(e) => handleSettingChange(option.id, e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Enter value..."
          />
        );
      
      case "button":
        return (
          <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
            Configure
          </button>
        );
      
      default:
        return null;
    }
  };

  const getCurrentSettings = () => {
    switch (activeTab) {
      case "general": return generalSettings;
      case "ai": return aiSettings;
      case "privacy": return privacySettings;
      case "advanced": return advancedSettings;
      default: return generalSettings;
    }
  };

  const getTabIcon = (tab: SettingsTab) => {
    switch (tab) {
      case "general": return <SettingsIcon className="w-4 h-4" />;
      case "ai": return <Bot className="w-4 h-4" />;
      case "privacy": return <Shield className="w-4 h-4" />;
      case "advanced": return <Zap className="w-4 h-4" />;
      default: return <SettingsIcon className="w-4 h-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <SettingsIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {(["general", "ai", "privacy", "advanced"] as SettingsTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              {getTabIcon(tab)}
              <span className="capitalize">{tab}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-6">
            {getCurrentSettings().map((option) => (
              <div key={option.id} className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="text-gray-500 dark:text-gray-400 mt-1">
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      {option.label}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {option.description}
                    </p>
                  </div>
                </div>
                <div className="ml-4">
                  {renderSettingControl(option)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Settings are automatically saved
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                // Reset to defaults logic would go here
                console.log("Settings reset to defaults");
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-gray-600 dark:text-white dark:border-gray-500 dark:hover:bg-gray-500"
            >
              Reset to Defaults
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;

"use client";
import React, { useState } from "react";
import { X, Settings as SettingsIcon, Moon, Sun, Volume2, VolumeX, Palette, Globe, Shield, User, Bell } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SettingOption {
  id: string;
  label: string;
  description: string;
  type: "toggle" | "select" | "input" | "button";
  value?: any;
  options?: { label: string; value: string }[];
  icon?: React.ReactNode;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState({
    theme: "system",
    language: "en",
    notifications: true,
    sound: true,
    autoSave: true,
    fontSize: "medium",
    privacyMode: false,
    dataCollection: true,
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const settingOptions: SettingOption[] = [
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
        { label: "German", value: "de" }
      ],
      icon: <Globe className="w-5 h-5" />
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
      id: "privacyMode",
      label: "Privacy Mode",
      description: "Hide sensitive information from screenshots",
      type: "toggle",
      value: settings.privacyMode,
      icon: <Shield className="w-5 h-5" />
    },
    {
      id: "dataCollection",
      label: "Data Collection",
      description: "Allow anonymous usage data collection",
      type: "toggle",
      value: settings.dataCollection,
      icon: <Shield className="w-5 h-5" />
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
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

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {settingOptions.map((option) => (
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
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-gray-600 dark:text-white dark:border-gray-500 dark:hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              // Save settings logic would go here
              console.log("Settings saved:", settings);
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;

import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { setApiBase, getApiBase } from '../api';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [apiUrl, setApiUrl] = useState(getApiBase());
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!apiUrl.trim()) {
      return;
    }

    setIsSaving(true);
    try {
      setApiBase(apiUrl.trim());
      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to save API settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setApiUrl(getApiBase()); // Reset to current value
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">API Settings</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Base URL
            </label>
            <input
              type="url"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://your-api-server.com"
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter the base URL for your API server
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !apiUrl.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-blue-400 transition-colors duration-200"
            >
              {isSaving ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-1 inline" />
                  Save
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
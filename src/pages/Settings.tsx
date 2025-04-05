// src/pages/Settings.tsx

import React from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { UserSettings } from '../types';

const Settings: React.FC = () => {
  const [settings, setSettings] = useLocalStorage<UserSettings>('emotion-tracker-settings', {
    notificationsEnabled: false,
    cameraPermission: true,
    emotionDetectionFrequency: 1000,
    storagePolicy: 'persistent',
    theme: 'light'
  });
  
  const handleToggleChange = (key: keyof UserSettings) => {
    if (typeof settings[key] === 'boolean') {
      setSettings({
        ...settings,
        [key]: !settings[key]
      });
    }
  };
  
  const handleFrequencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings({
      ...settings,
      emotionDetectionFrequency: parseInt(e.target.value)
    });
  };
  
  const handleStoragePolicyChange = (policy: 'session' | 'persistent') => {
    setSettings({
      ...settings,
      storagePolicy: policy
    });
  };
  
  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    setSettings({
      ...settings,
      theme
    });
  };
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 space-y-6">
          {/* Camera Settings */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Camera</h2>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Camera Access</h3>
                  <p className="text-sm text-gray-500">Allow the app to access your camera</p>
                </div>
                <div>
                  <label className="inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={settings.cameraPermission}
                      onChange={() => handleToggleChange('cameraPermission')}
                    />
                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Emotion Detection Frequency</h3>
                  <p className="text-sm text-gray-500">How often to check for emotions</p>
                </div>
                <div>
                  <select 
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2"
                    value={settings.emotionDetectionFrequency}
                    onChange={handleFrequencyChange}
                  >
                    <option value="500">Very Frequent (0.5s)</option>
                    <option value="1000">Frequent (1s)</option>
                    <option value="2000">Normal (2s)</option>
                    <option value="5000">Infrequent (5s)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          {/* Notification Settings */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Notifications</h2>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Enable Notifications</h3>
                <p className="text-sm text-gray-500">Receive reminders and suggestions</p>
              </div>
              <div>
                <label className="inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={settings.notificationsEnabled}
                    onChange={() => handleToggleChange('notificationsEnabled')}
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>
          </div>
          
          {/* Data Storage */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Data & Privacy</h2>
            
            <div className="space-y-3">
              <div>
                <h3 className="font-medium">Storage Policy</h3>
                <p className="text-sm text-gray-500">How to store your emotion data</p>
                
                <div className="mt-2 space-y-2">
                  <div className="flex items-center">
                    <input 
                      id="persistent-storage" 
                      type="radio" 
                      name="storage-policy"
                      checked={settings.storagePolicy === 'persistent'}
                      onChange={() => handleStoragePolicyChange('persistent')}
                      className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 focus:ring-indigo-500"
                    />
                    <label htmlFor="persistent-storage" className="ms-2 text-sm font-medium text-gray-900">
                      Persistent Storage (Keep history between sessions)
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      id="session-storage" 
                      type="radio" 
                      name="storage-policy"
                      checked={settings.storagePolicy === 'session'}
                      onChange={() => handleStoragePolicyChange('session')}
                      className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 focus:ring-indigo-500"
                    />
                    <label htmlFor="session-storage" className="ms-2 text-sm font-medium text-gray-900">
                      Session Only (Clear history when browser closes)
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="pt-2">
                <button 
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear all emotion data? This cannot be undone.')) {
                      localStorage.removeItem('emotion-tracker-history');
                      localStorage.removeItem('emotion-tracker-feedback');
                      window.location.reload();
                    }
                  }}
                >
                  Clear All Data
                </button>
              </div>
            </div>
          </div>
          
          {/* Theme Settings */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Appearance</h2>
            
            <div>
              <h3 className="font-medium">Theme</h3>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <button
                  className={`p-3 rounded-lg border ${settings.theme === 'light' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'}`}
                  onClick={() => handleThemeChange('light')}
                >
                  <div className="bg-white border border-gray-200 rounded-md p-2 mb-2"></div>
                  <span className="text-sm">Light</span>
                </button>
                
                <button
                  className={`p-3 rounded-lg border ${settings.theme === 'dark' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'}`}
                  onClick={() => handleThemeChange('dark')}
                >
                  <div className="bg-gray-800 border border-gray-700 rounded-md p-2 mb-2"></div>
                  <span className="text-sm">Dark</span>
                </button>
                
                <button
                  className={`p-3 rounded-lg border ${settings.theme === 'system' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'}`}
                  onClick={() => handleThemeChange('system')}
                >
                  <div className="bg-gradient-to-r from-white to-gray-800 border border-gray-200 rounded-md p-2 mb-2"></div>
                  <span className="text-sm">System</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
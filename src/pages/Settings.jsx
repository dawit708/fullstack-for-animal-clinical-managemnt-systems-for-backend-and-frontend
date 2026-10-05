import { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useTheme } from '../context/ThemeContext';
import { Bell, Globe, Moon, Sun, Save } from 'lucide-react';
import { toast } from 'react-toastify';

export default function Settings() {
  const { isDark, setDarkMode } = useTheme();
  const [settings, setSettings] = useState({
    email_notifications: true,
    push_notifications: true,
    sound_alerts: false,
    language: 'en',
    timezone: 'Africa/Addis_Ababa',
  });

  // Load saved settings
  useEffect(() => {
    const saved = localStorage.getItem('settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.log('Parse error');
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('settings', JSON.stringify(settings));
    toast.success('Settings saved ✅');
  };

  const handleDarkModeToggle = () => {
    const newValue = !isDark;
    setDarkMode(newValue);
    toast.success(newValue ? 'Dark mode enabled 🌙' : 'Light mode enabled ☀️');
  };

  return (
    <DashboardLayout title="Settings" subtitle="Customize your experience">
      <div className="max-w-3xl space-y-6">
        {/* Notifications */}
        <div className="card">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary-500" />
            Notifications
          </h3>
          <div className="space-y-3">
            <ToggleItem
              label="Email Notifications"
              description="Receive updates via email"
              checked={settings.email_notifications}
              onChange={(v) => setSettings({ ...settings, email_notifications: v })}
            />
            <ToggleItem
              label="Push Notifications"
              description="Browser push notifications"
              checked={settings.push_notifications}
              onChange={(v) => setSettings({ ...settings, push_notifications: v })}
            />
            <ToggleItem
              label="Sound Alerts"
              description="Play sound on new notifications"
              checked={settings.sound_alerts}
              onChange={(v) => setSettings({ ...settings, sound_alerts: v })}
            />
          </div>
        </div>

        {/* Appearance */}
        <div className="card">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            {isDark ? <Moon className="w-5 h-5 text-primary-500" /> : <Sun className="w-5 h-5 text-primary-500" />}
            Appearance
          </h3>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isDark ? 'Currently using dark theme' : 'Currently using light theme'}
              </p>
            </div>
            <button
              onClick={handleDarkModeToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isDark ? 'bg-primary-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isDark ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Language & Timezone */}
        <div className="card">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary-500" />
            Language & Region
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Language
              </label>
              <select
                className="input-field"
                value={settings.language}
                onChange={(e) => setSettings({ ...settings, language: e.target.value })}
              >
                <option value="en">English</option>
                <option value="am">አማርኛ</option>
                <option value="om">Afaan Oromo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Timezone
              </label>
              <select
                className="input-field"
                value={settings.timezone}
                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
              >
                <option value="Africa/Addis_Ababa">Addis Ababa (EAT)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end">
          <button onClick={handleSave} className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" /> Save Settings
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

function ToggleItem({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="font-medium text-gray-900 dark:text-white">{label}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-primary-500' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
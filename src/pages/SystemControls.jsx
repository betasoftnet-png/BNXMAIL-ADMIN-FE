import React, { useState, useEffect } from 'react';
import { Send, AlertOctagon, Loader2, ShieldAlert, Settings2, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import adminApi from '../api';

const SystemControls = () => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loadingBroadcast, setLoadingBroadcast] = useState(false);
  const [loadingLogout, setLoadingLogout] = useState(false);
  const [logoutEmail, setLogoutEmail] = useState('');
  const [broadcastStatus, setBroadcastStatus] = useState(null);

  const [settings, setSettings] = useState({
    registration_paused: 'false',
    maintenance_mode: 'false',
    default_free_storage_mb: '1024'
  });
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await adminApi.getSystemSettings();
      if (res.data?.data) {
        setSettings(prev => ({ ...prev, ...res.data.data }));
      }
    } catch (err) {
      console.error("Failed to fetch settings", err);
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await adminApi.updateSystemSettings(settings);
      alert("Settings saved successfully.");
    } catch (err) {
      console.error("Failed to save settings", err);
      alert("Failed to save settings.");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    if (!window.confirm("Are you sure you want to send this broadcast to ALL active users?")) return;

    setLoadingBroadcast(true);
    setBroadcastStatus(null);
    try {
      await adminApi.sendGlobalBroadcast(subject, message);
      setBroadcastStatus({ type: 'success', text: 'Broadcast sent successfully!' });
      setSubject('');
      setMessage('');
    } catch (err) {
      console.error("Broadcast failed:", err);
      setBroadcastStatus({ type: 'error', text: 'Failed to send broadcast.' });
    } finally {
      setLoadingBroadcast(false);
    }
  };

  const handleTargetedForceLogout = async (e) => {
    e.preventDefault();
    if (!logoutEmail.trim()) return;

    const confirm1 = window.confirm(`WARNING: This will instantly log out ${logoutEmail} from all devices. Proceed?`);
    if (!confirm1) return;

    setLoadingLogout(true);
    try {
      await adminApi.forceLogoutByEmail(logoutEmail);
      alert(`TARGETED LOGOUT EXECUTED. All active sessions for ${logoutEmail} have been destroyed.`);
      setLogoutEmail('');
    } catch (err) {
      console.error("Force logout failed:", err);
      alert(err.response?.data?.message || "Failed to execute targeted logout.");
    } finally {
      setLoadingLogout(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">System Controls</h1>
        <p className="text-slate-500 mt-1">Execute high-level administrative actions and global commands.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Global Broadcast Panel */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100 bg-blue-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Send className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Global Broadcast</h3>
            </div>
            <p className="text-sm text-slate-500 mt-2">Send an official email to all active users on the platform.</p>
          </div>
          
          <form onSubmit={handleBroadcast} className="p-6 space-y-4">
            {broadcastStatus && (
              <div className={`p-3 rounded-lg text-sm font-medium ${broadcastStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                {broadcastStatus.text}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
              <input 
                type="text" 
                required
                placeholder="Important Security Update"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Message Body</label>
              <textarea 
                required
                rows="6"
                placeholder="Dear users, ..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              ></textarea>
            </div>
            
            <button 
              type="submit"
              disabled={loadingBroadcast || !subject.trim() || !message.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium rounded-lg transition-colors"
            >
              {loadingBroadcast ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send Broadcast
            </button>
          </form>
        </motion.div>


        {/* Configuration Panel */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-200 text-slate-700 rounded-lg">
                <Settings2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Platform Settings</h3>
            </div>
            <p className="text-sm text-slate-500 mt-2">Manage registration, maintenance mode, and quotas.</p>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-slate-900">Pause New Signups</h4>
                <p className="text-sm text-slate-500">Temporarily prevent new users from registering.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" 
                  checked={settings.registration_paused === 'true'}
                  onChange={(e) => setSettings({...settings, registration_paused: e.target.checked ? 'true' : 'false'})}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-slate-900">Maintenance Mode</h4>
                <p className="text-sm text-slate-500">Block all user logins except for admins.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" 
                  checked={settings.maintenance_mode === 'true'}
                  onChange={(e) => setSettings({...settings, maintenance_mode: e.target.checked ? 'true' : 'false'})}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">Default Free Storage (MB)</label>
              <input 
                type="number" 
                value={settings.default_free_storage_mb}
                onChange={(e) => setSettings({...settings, default_free_storage_mb: e.target.value})}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <button 
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-500 text-white font-medium rounded-lg transition-colors"
            >
              {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Settings
            </button>
          </div>
        </motion.div>

        {/* Security Controls Panel */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-fit"
        >
          <div className="p-6 border-b border-slate-100 bg-rose-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Security Operations</h3>
            </div>
            <p className="text-sm text-slate-500 mt-2">Critical actions for platform security incidents.</p>
          </div>
          
          <div className="p-6">
            <div className="p-4 border border-rose-200 bg-rose-50 rounded-xl mb-6">
              <h4 className="font-semibold text-rose-800 flex items-center gap-2 mb-2">
                <AlertOctagon className="w-4 h-4" /> Targeted Force Logout
              </h4>
              <p className="text-sm text-rose-700 mb-4">
                Instantly destroy all active sessions for a specific user across all devices. They will be forced to re-authenticate.
              </p>
              
              <form onSubmit={handleTargetedForceLogout} className="space-y-3">
                <input 
                  type="text" 
                  required
                  placeholder="Enter username or email"
                  value={logoutEmail}
                  onChange={(e) => setLogoutEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-rose-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <button 
                  type="submit"
                  disabled={loadingLogout || !logoutEmail.trim()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-medium rounded-lg transition-colors shadow-sm"
                >
                  {loadingLogout ? <Loader2 className="w-5 h-5 animate-spin" /> : <AlertOctagon className="w-5 h-5" />}
                  EXECUTE TARGETED LOGOUT
                </button>
              </form>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default SystemControls;

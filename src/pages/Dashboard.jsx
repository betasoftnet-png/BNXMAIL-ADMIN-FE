import React, { useState, useEffect } from 'react';
import { Users, Server, Database, Activity, Building2, Briefcase, Globe, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import adminApi from '../api';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await adminApi.get('/metrics');
        setMetrics(response.data.data);
      } catch (err) {
        console.error("Failed to load metrics", err);
        setError("Failed to load live metrics.");
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  const formatStorage = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Platform Overview</h1>
        <p className="text-slate-500 mt-1">Live metrics and statistics from the BNX database.</p>
        {error && <p className="text-rose-600 mt-2 text-sm">{error}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Users" 
          value={metrics?.totalUsers?.toLocaleString() || "0"} 
          icon={Users} 
          colorClass="bg-blue-50 text-blue-600"
        />
        <StatCard 
          title="Active Mail Accounts" 
          value={metrics?.activeMailAccounts?.toLocaleString() || "0"} 
          icon={Server} 
          colorClass="bg-indigo-50 text-indigo-600"
        />
        <StatCard 
          title="Storage Used" 
          value={formatStorage(metrics?.totalStorageBytes || 0)} 
          icon={Database} 
          colorClass="bg-emerald-50 text-emerald-600"
        />
        <StatCard 
          title="Active Sessions" 
          value={metrics?.activeSessions?.toLocaleString() || "0"} 
          icon={Activity} 
          colorClass="bg-amber-50 text-amber-600"
        />
        <StatCard 
          title="Organizations" 
          value={metrics?.totalOrganizations?.toLocaleString() || "0"} 
          icon={Building2} 
          colorClass="bg-purple-50 text-purple-600"
        />
        <StatCard 
          title="Business Profiles" 
          value={metrics?.totalBusinessProfiles?.toLocaleString() || "0"} 
          icon={Briefcase} 
          colorClass="bg-pink-50 text-pink-600"
        />
        <StatCard 
          title="Custom Domains" 
          value={metrics?.totalDomains?.toLocaleString() || "0"} 
          icon={Globe} 
          colorClass="bg-sky-50 text-sky-600"
        />
      </div>

      {/* Real Activity Logs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Recent Global Activity</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 rounded-l-lg">User</th>
                <th scope="col" className="px-6 py-3">Activity</th>
                <th scope="col" className="px-6 py-3">IP Address</th>
                <th scope="col" className="px-6 py-3 rounded-r-lg">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {metrics?.recentLogs && metrics.recentLogs.length > 0 ? (
                metrics.recentLogs.map((log, index) => (
                  <tr key={index} className="bg-white border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{log.email}</td>
                    <td className="px-6 py-4">{log.activity}</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">{log.ipAddress || 'Unknown'}</td>
                    <td className="px-6 py-4">{new Date(log.timestamp).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-slate-400">
                    No recent activity found on the platform.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

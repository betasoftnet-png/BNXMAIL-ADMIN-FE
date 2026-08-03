import React, { useState, useEffect } from 'react';
import { Search, Loader2, ShieldAlert, Laptop, Globe } from 'lucide-react';
import adminApi from '../api';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getAuditLogs(query, page, 15);
      if (response.data?.data) {
        setLogs(response.data.data.content);
        setTotalPages(response.data.data.totalPages);
      }
    } catch (err) {
      console.error("Failed to fetch audit logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, query]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-indigo-600" />
            Audit Logs
          </h1>
          <p className="text-slate-500 mt-1">Track system events, security incidents, and administrative actions.</p>
        </div>
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search by action, email, or details..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(0); }}
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Activity</th>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4">Network Info</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    No logs found matching your criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        log.userEmail === 'System' ? 'bg-slate-100 text-slate-800' : 'bg-indigo-50 text-indigo-700'
                      }`}>
                        {log.userEmail}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {log.activity}
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate" title={log.details}>
                      {log.details || <span className="text-slate-400 italic">No additional details</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-xs text-slate-500">
                        {log.ipAddress && (
                          <div className="flex items-center gap-1">
                            <Globe className="w-3 h-3 text-slate-400" /> {log.ipAddress}
                          </div>
                        )}
                        {log.deviceName && (
                          <div className="flex items-center gap-1">
                            <Laptop className="w-3 h-3 text-slate-400" /> {log.deviceName}
                          </div>
                        )}
                        {!log.ipAddress && !log.deviceName && (
                          <span className="text-slate-400 italic">System Event</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
            <button 
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1 text-sm text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-slate-500 font-medium">
              Page {page + 1} of {totalPages}
            </span>
            <button 
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="px-3 py-1 text-sm text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;

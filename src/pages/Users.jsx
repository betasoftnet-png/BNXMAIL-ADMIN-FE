import React, { useState, useEffect } from 'react';
import { Search, Ban, LogOut, CheckCircle, XCircle, MoreVertical, Loader2, UserX, Scale, Key } from 'lucide-react';
import { motion } from 'framer-motion';
import adminApi from '../api';
import CaseReviewModal from '../components/CaseReviewModal';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);
  const [reviewUserId, setReviewUserId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminApi.searchUsers(query, page, 10);
      setUsers(response.data.data.content);
      setTotalPages(response.data.data.totalPages);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, query]);

  const handleToggleStatus = async (userId) => {
    setActionLoading(`status-${userId}`);
    try {
      await adminApi.toggleUserStatus(userId);
      fetchUsers(); // Refresh the list
    } catch (err) {
      console.error("Failed to toggle status", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleForceLogout = async (userId) => {
    if (!window.confirm("Are you sure you want to instantly destroy all active sessions for this user?")) return;
    
    setActionLoading(`logout-${userId}`);
    try {
      await adminApi.forceLogoutUser(userId);
      alert("User has been forcefully logged out of all devices.");
    } catch (err) {
      console.error("Failed to force logout", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetPassword = async (userId) => {
    const newPassword = window.prompt("Enter the new password for this user (minimum 6 characters):");
    if (!newPassword) return;
    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }

    if (!window.confirm("Are you sure? This will immediately log the user out of all sessions and require them to log in with the new password.")) return;

    setActionLoading(`reset-${userId}`);
    try {
      await adminApi.resetPasswordUser(userId, newPassword);
      alert("Password has been successfully reset.");
    } catch (err) {
      console.error("Failed to reset password", err);
      alert(err.response?.data?.error || "Failed to reset password.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-4 md:p-8">
      {/* Case Review Modal */}
      <CaseReviewModal 
        userId={reviewUserId} 
        isOpen={!!reviewUserId} 
        onClose={() => setReviewUserId(null)}
        onDecisionMade={fetchUsers}
      />

      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-500 mt-1">Search, suspend, and manage all BNX Mail users.</p>
        </div>
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search email or name..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <th className="px-6 py-4">Account</th>
                <th className="px-6 py-4">Email Address</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3">
                          {user.firstName ? user.firstName[0] : user.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{user.firstName} {user.lastName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-slate-600">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      {user.active ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          <CheckCircle className="w-3 h-3 mr-1" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                          <XCircle className="w-3 h-3 mr-1" /> Suspended
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 uppercase tracking-wide">
                        {user.accountType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {!user.active && (
                        <button 
                          onClick={() => setReviewUserId(user.id)}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
                        >
                          <Scale className="w-3 h-3 mr-1" />
                          Review Case
                        </button>
                      )}
                      
                      <button 
                        onClick={() => handleToggleStatus(user.id)}
                        disabled={actionLoading === `status-${user.id}`}
                        className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                          user.active 
                            ? 'text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200' 
                            : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                      >
                        {actionLoading === `status-${user.id}` ? (
                          <Loader2 className="w-3 h-3 animate-spin mr-1" />
                        ) : user.active ? (
                          <Ban className="w-3 h-3 mr-1" />
                        ) : (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        )}
                        {user.active ? 'Suspend' : 'Unban'}
                      </button>

                      <button 
                        onClick={() => handleForceLogout(user.id)}
                        disabled={actionLoading === `logout-${user.id}`}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
                      >
                        {actionLoading === `logout-${user.id}` ? (
                          <Loader2 className="w-3 h-3 animate-spin mr-1" />
                        ) : (
                          <UserX className="w-3 h-3 mr-1" />
                        )}
                        Force Logout
                      </button>

                      <button 
                        onClick={() => handleResetPassword(user.id)}
                        disabled={actionLoading === `reset-${user.id}`}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                      >
                        {actionLoading === `reset-${user.id}` ? (
                          <Loader2 className="w-3 h-3 animate-spin mr-1" />
                        ) : (
                          <Key className="w-3 h-3 mr-1" />
                        )}
                        Reset Password
                      </button>
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
            <span className="text-sm text-slate-500">
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

export default Users;

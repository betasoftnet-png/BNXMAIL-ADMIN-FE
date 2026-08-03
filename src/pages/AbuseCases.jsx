import React, { useState, useEffect } from 'react';
import { Search, Ban, LogOut, CheckCircle, XCircle, MoreVertical, Loader2, UserX, Scale, Key, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import adminApi from '../api';
import CaseReviewModal from '../components/CaseReviewModal';

const AbuseCases = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);
  const [reviewUserId, setReviewUserId] = useState(null);

  const fetchBannedUsers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getBannedUsers(page, 20);
      setUsers(res.data.data.content);
      setTotalPages(res.data.data.totalPages);
    } catch (err) {
      console.error("Failed to fetch banned users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBannedUsers();
  }, [page]);

  const handleToggleStatus = async (userId, currentStatus) => {
    setActionLoading(`toggle-${userId}`);
    try {
      await adminApi.toggleUserStatus(userId);
      setUsers(users.filter(u => u.id !== userId)); // Remove from list if unbanned
    } catch (err) {
      console.error("Failed to toggle status", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecisionComplete = () => {
    setReviewUserId(null);
    fetchBannedUsers(); // Refresh list after review
  };

  return (
    <div className="p-4 md:p-8">
      {/* Case Review Modal */}
      {reviewUserId && (
        <CaseReviewModal 
          userId={reviewUserId} 
          onClose={() => setReviewUserId(null)}
          onDecisionComplete={handleDecisionComplete}
        />
      )}

      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Abuse Cases & Banned Users</h1>
          <p className="text-gray-500 text-sm mt-1">Review accounts that have been suspended due to reports or manual action.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reports</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                    Loading cases...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    No banned users or abuse cases found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                          {user.firstName?.charAt(0) || user.email?.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.reportCount > 0 ? (
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-rose-600 mb-1">
                            {user.reportCount} Report{user.reportCount > 1 ? 's' : ''}
                          </span>
                          {user.reports && user.reports[0] && (
                            <div className="text-xs text-gray-500">
                              <span className="font-medium">Latest By:</span> {user.reports[0].reporterEmail} <br/>
                              <span className="font-medium">Subject:</span> "{user.reports[0].emailSubject || 'N/A'}" <br/>
                              <span className="font-medium">Reason:</span> {user.reports[0].reason}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">No reports</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircle className="w-3 h-3 mr-1" />
                        Suspended
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setReviewUserId(user.id)}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
                        >
                          <Scale className="w-3 h-3 mr-1" />
                          Review Case
                        </button>
                        
                        <button 
                          onClick={() => handleToggleStatus(user.id, user.active)}
                          disabled={actionLoading === `toggle-${user.id}`}
                          className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors text-green-700 bg-green-50 hover:bg-green-100 border border-green-200`}
                        >
                          {actionLoading === `toggle-${user.id}` ? (
                            <Loader2 className="w-3 h-3 animate-spin mr-1" />
                          ) : (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          )}
                          Unban
                        </button>
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
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
            <button 
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page + 1} of {totalPages}
            </span>
            <button 
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AbuseCases;

import React, { useState, useEffect } from 'react';
import { Flag, Loader2, Mail, ShieldAlert, CheckCircle, Scale } from 'lucide-react';
import adminApi from '../api';
import CaseReviewModal from '../components/CaseReviewModal';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [reviewUserId, setReviewUserId] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAllReports(page, 20);
      setReports(res.data.data.content);
      setTotalPages(res.data.data.totalPages);
    } catch (err) {
      console.error("Failed to fetch reports", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [page]);

  const handleDecisionComplete = () => {
    setReviewUserId(null);
    fetchReports();
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
          <h1 className="text-2xl font-bold text-gray-900">All System Reports</h1>
          <p className="text-gray-500 text-sm mt-1">Review all abuse reports submitted across the system.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/4">Reporter</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/4">Reported User</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Context & Reason</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                    Loading reports...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No reports found.
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50 transition-colors align-top">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {new Date(report.date).toLocaleDateString()}<br/>
                        <span className="text-xs text-gray-400">{new Date(report.date).toLocaleTimeString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          {report.reporterEmail.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3 break-all">
                          <div className="text-sm font-medium text-gray-900">{report.reporterEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-start">
                          <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                            {report.reportedUserEmail.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-3 break-all">
                            <div className="text-sm font-medium text-gray-900">{report.reportedUserEmail}</div>
                            {report.reportedUserActive ? (
                              <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-800">
                                Active Account
                              </span>
                            ) : (
                              <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-800">
                                Banned / Suspended
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        <span className="inline-flex items-center text-xs font-semibold text-rose-600 mb-1 uppercase tracking-wider">
                          <Flag className="w-3 h-3 mr-1" />
                          {report.reason}
                        </span>
                        <div className="text-sm text-gray-700 bg-gray-50 border border-gray-100 p-2 rounded-md italic">
                          <span className="text-gray-400 mr-1 not-italic font-medium">Subject:</span> 
                          "{report.emailSubject || 'N/A'}"
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => setReviewUserId(report.reportedUserId)}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
                      >
                        <Scale className="w-3 h-3 mr-1" />
                        Review Case
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

export default Reports;

import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, CheckCircle, Ban, AlertTriangle, FileText, Loader2, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import adminApi from '../api';

const CaseReviewModal = ({ userId, isOpen, onClose, onDecisionMade }) => {
  const [loading, setLoading] = useState(true);
  const [caseData, setCaseData] = useState({ reports: [], appeal: null });
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (isOpen && userId) {
      fetchCaseDetails();
    }
  }, [isOpen, userId]);

  const fetchCaseDetails = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getAbuseCase(userId);
      setCaseData(response.data.data);
    } catch (err) {
      console.error("Failed to fetch case details", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (decision) => {
    if (decision === 'BAN' && !window.confirm("Are you sure you want to permanently reject this appeal?")) return;
    if (decision === 'UNBAN' && !window.confirm("Are you sure you want to unban this user? Their reports will be cleared.")) return;

    setActionLoading(decision);
    try {
      await adminApi.decideAbuseCase(userId, decision);
      onDecisionMade();
      onClose();
    } catch (err) {
      console.error("Failed to submit decision", err);
      alert("Failed to submit decision. Check console for details.");
    } finally {
      setActionLoading(null);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Abuse Case Review</h2>
                {caseData.reportedUserEmail ? (
                  <p className="text-sm font-medium text-slate-600 mt-0.5">
                    User: <span className="text-blue-600">{caseData.reportedUserEmail}</span> 
                    <span className="text-slate-400 ml-2 text-xs">({caseData.reportedUserName})</span>
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 font-mono mt-0.5">User ID: {userId}</p>
                )}
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-auto p-6 bg-slate-50">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
                <p className="text-slate-500">Retrieving evidence and appeals...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Left Column: The Evidence (Reports) */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-800 flex items-center">
                      <AlertTriangle className="w-4 h-4 text-amber-500 mr-2" />
                      The Evidence ({caseData.reports.length} Reports)
                    </h3>
                  </div>
                  <div className="flex-1 overflow-auto p-4 space-y-4 max-h-[50vh]">
                    {caseData.reports.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-8">No reports found on file.</p>
                    ) : (
                      caseData.reports.map((report, idx) => (
                        <div key={idx} className="p-4 rounded-lg bg-slate-50 border border-slate-100 text-sm">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-slate-700">Report #{idx + 1}</span>
                            <span className="text-xs text-slate-400">{new Date(report.date).toLocaleDateString()}</span>
                          </div>
                          <div className="space-y-1">
                            <p><span className="text-slate-500">Reported By:</span> <span className="font-mono text-blue-600">{report.reporterEmail}</span></p>
                            <p><span className="text-slate-500">Reason:</span> <span className="font-medium text-rose-600">{report.reason}</span></p>
                            <p><span className="text-slate-500">Email Context:</span> "{report.emailSubject || 'N/A'}"</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Right Column: The Defense (Appeal) */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center">
                    <h3 className="font-semibold text-slate-800 flex items-center">
                      <MessageSquare className="w-4 h-4 text-blue-500 mr-2" />
                      The Defense (User Appeal)
                    </h3>
                  </div>
                  <div className="flex-1 overflow-auto p-6 max-h-[50vh]">
                    {caseData.appeal ? (
                      <div className="prose prose-sm max-w-none text-slate-600">
                        <div className="p-4 rounded-lg bg-blue-50/50 border border-blue-100 italic">
                          "{caseData.appeal}"
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center h-full">
                        <FileText className="w-12 h-12 text-slate-200 mb-3" />
                        <p className="text-slate-500 font-medium">No Appeal Submitted</p>
                        <p className="text-sm text-slate-400 mt-1">This user has not yet submitted a defense statement.</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-end space-x-3">
            <button 
              onClick={() => handleDecision('UNBAN')}
              disabled={actionLoading !== null}
              className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-sm font-medium transition-colors flex items-center"
            >
              {actionLoading === 'UNBAN' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
              Unban & Warn User
            </button>
            <button 
              onClick={() => handleDecision('BAN')}
              disabled={actionLoading !== null}
              className="px-4 py-2 bg-rose-600 text-white hover:bg-rose-700 rounded-lg text-sm font-medium transition-colors flex items-center shadow-sm"
            >
              {actionLoading === 'BAN' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Ban className="w-4 h-4 mr-2" />}
              Keep Permanent Ban
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CaseReviewModal;

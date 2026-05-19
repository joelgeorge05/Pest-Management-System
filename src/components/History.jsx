import React, { useState, useEffect } from 'react';
import { History as HistoryIcon, Clock, CheckCircle, Activity, Search } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function History({ user }) {
    const [history, setHistory] = useState([]);
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('all'); // 'all', 'scan', 'feedback', 'login', 'proposal'

    useEffect(() => {
        if (user?.id || user?._id) {
            fetchHistory();
            fetchProposals();
        }
    }, [user]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const uid = user.id || user._id; // Handle both id formats
            const res = await fetch(`${API_URL}/history/my?user_id=${uid}`);
            if (res.ok) {
                setHistory(await res.json());
            }
        } catch (error) {
            console.error("Error fetching history:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProposals = async () => {
        try {
            const uid = user.id || user._id;
            const res = await fetch(`${API_URL}/api/proposals/my?user_id=${uid}`);
            if (res.ok) {
                setProposals(await res.json());
            }
        } catch (error) {
            console.error("Error fetching proposals:", error);
        }
    };

    const getIcon = (action) => {
        if (action.includes('Scanned')) return <Search className="w-5 h-5 text-emerald-500" />;
        if (action.includes('Feedback')) return <CheckCircle className="w-5 h-5 text-purple-500" />;
        if (action.includes('Logged in')) return <Activity className="w-5 h-5 text-blue-500" />;
        return <Activity className="w-5 h-5 text-slate-600" />;
    };

    const filteredHistory = history.filter(item => {
        if (filter === 'all') return true;
        if (filter === 'scan') return item.action.includes('Scanned');
        if (filter === 'feedback') return item.action.includes('Feedback');
        if (filter === 'login') return item.action.includes('Logged in');
        return false;
    });

    return (
        <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto min-h-screen space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm font-bold border border-emerald-100 mb-3 shadow-sm">
                        <HistoryIcon className="w-4 h-4" />
                        <span>Activity Dashboard</span>
                    </div>
                    <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                        My <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">History</span> & Requests
                    </h2>
                    <p className="text-slate-700 font-medium max-w-sm mt-2">
                        Monitor your recent interactions, leaf scans, and expert consultations.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2 justify-start md:justify-end">
                    <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${filter === 'all' ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-900' : 'bg-white text-slate-800 border border-slate-200 hover:bg-slate-50'}`}>All Activity</button>
                    <button onClick={() => setFilter('scan')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${filter === 'scan' ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-900' : 'bg-white text-slate-800 border border-slate-200 hover:bg-slate-50'}`}>Scans</button>
                    <button onClick={() => setFilter('feedback')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${filter === 'feedback' ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-900' : 'bg-white text-slate-800 border border-slate-200 hover:bg-slate-50'}`}>Feedback</button>
                    <button onClick={() => setFilter('proposal')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${filter === 'proposal' ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-900' : 'bg-white text-slate-800 border border-slate-200 hover:bg-slate-50'}`}>My Proposals</button>
                </div>
            </div>

            <div className="bg-white backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-700">
                        <Activity className="w-8 h-8 animate-spin mb-4 text-emerald-500" />
                        <span className="font-semibold">Loading data...</span>
                    </div>
                ) : filter === 'proposal' ? (
                    <div className="p-6">
                        {proposals.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-60 text-slate-600">
                                <HistoryIcon className="w-12 h-12 mb-4 opacity-50" />
                                <p className="font-medium">No proposals submitted yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {proposals.map((prop, idx) => (
                                    <div key={idx} className="bg-white border border-slate-100 rounded-xl p-5 hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group">
                                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${prop.status === 'approved' ? 'bg-gradient-to-b from-emerald-400 to-emerald-600' :
                                            prop.status === 'rejected' ? 'bg-gradient-to-b from-red-400 to-red-600' : 'bg-gradient-to-b from-amber-400 to-amber-600'
                                            }`}></div>
                                        <div className="pl-4">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h4 className="font-bold text-slate-800 text-lg group-hover:text-emerald-700 transition-colors">{prop.name}</h4>
                                                    <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider mt-1">{prop.timestamp} • {prop.type}</p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-sm border ${prop.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                    prop.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                                                    }`}>
                                                    {prop.status}
                                                </span>
                                            </div>
                                            <div className="text-sm text-slate-800 mb-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                <span className="font-bold text-xs uppercase text-slate-600 block mb-1">Target Assessment</span>
                                                <span className="font-medium">{prop.plant}</span> - {prop.diseases}
                                            </div>

                                            {prop.status === 'rejected' && prop.rejection_reason && (
                                                <div className="mt-3 bg-red-50 p-4 rounded-xl border border-red-100 relative overflow-hidden">
                                                    <div className="absolute top-0 left-0 w-1 h-full bg-red-400" />
                                                    <p className="text-xs font-bold text-red-800 mb-1 leading-snug">Reason for Rejection:</p>
                                                    <p className="text-sm text-red-700 font-medium">{prop.rejection_reason}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : filteredHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-60 text-slate-600">
                        <HistoryIcon className="w-12 h-12 mb-4 opacity-50" />
                        <p className="font-medium">No activity found.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100/60 p-2">
                        {filteredHistory.map((item, idx) => (
                            <div key={idx} className="p-4 md:p-5 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center gap-4 group rounded-xl">
                                <div className="p-3 bg-white shadow-sm rounded-xl border border-slate-100 group-hover:scale-110 transition-transform shrink-0">
                                    {getIcon(item.action)}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-800 text-base">{item.action}</h4>
                                    <p className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5 uppercase tracking-wider mt-1">
                                        <Clock className="w-3.5 h-3.5" />
                                        {item.timestamp}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

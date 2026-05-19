import React from 'react';
import { History, Shield, Store, Pill, ScanLine, User, LogOut, Flag, FileInput, GraduationCap, MessageSquare, Sprout, Send, PieChart, Leaf } from 'lucide-react';

export default function AdminSidebar({ activeTab, setActiveTab, onLogout, onQuickMessage }) {
    const navItems = [
        { id: 'history', label: 'Activity Log', icon: History },
        { id: 'users', label: 'User Management', icon: User },
        { id: 'analytics', label: 'User Distribution', icon: PieChart },
        { id: 'shops', label: 'Manage Shops', icon: Store },
        { id: 'medicines', label: 'Medicines', icon: Pill },
        { id: 'subsidies', label: 'Manage Schemes', icon: Flag },
        { id: 'proposals', label: 'Review Proposals', icon: FileInput },
        { id: 'detection', label: 'Disease Detection', icon: ScanLine },
        { id: 'dataset', label: 'Dataset Manager', icon: FileInput },
        { id: 'knowledge', label: 'Knowledge Base', icon: Leaf },
        { id: 'announcements', label: 'Announcements', icon: MessageSquare },
        { id: 'forum', label: 'Manage Forum', icon: MessageSquare },
        { id: 'messages', label: 'Direct Messages', icon: Send },
        { id: 'feedback', label: 'Feedback Analysis', icon: MessageSquare },
    ];

    return (
        <div className="fixed left-4 top-4 bottom-4 z-50">
            <style>{`
                @keyframes slideInFloat {
                    0% { transform: translateX(-50px); opacity: 0; }
                    100% { transform: translateX(0); opacity: 1; }
                }
                @keyframes continuousFloat {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-8px); }
                }
                .hover-float {
                    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease;
                }
                .hover-float:hover {
                    transform: translateY(-5px) scale(1.02);
                    box-shadow: 0 15px 30px -10px rgba(16, 185, 129, 0.4);
                    z-index: 10;
                }
            `}</style>
            
            <div className="w-64 bg-white flex flex-col border border-emerald-200/50 shadow-2xl rounded-3xl h-[calc(100vh-32px)] overflow-hidden"
                 style={{ animation: 'slideInFloat 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards, continuousFloat 4s ease-in-out infinite 0.8s' }}>
                <div className="p-6 border-b border-slate-200/10 bg-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 backdrop-blur-md rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] border border-emerald-500/20 flex-shrink-0">
                            <img src="/logo.png" alt="Smart Pest Logo" className="w-8 h-8 object-contain drop-shadow-xl" />
                        </div>
                        <div className="flex flex-col justify-center">
                            <h1 className="font-extrabold text-[1.1rem] tracking-tight text-slate-800 leading-tight">Admin Portal</h1>
                            <p className="text-[8px] text-emerald-700 font-bold uppercase tracking-widest mt-0.5">Smart Pest Mgmt</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-3 space-y-2 overflow-y-auto dark-scrollbar pb-8 relative z-0">
                    <div className="text-[10px] font-bold text-teal-400/80 uppercase tracking-widest mb-4 mt-2 px-3">Main Menu</div>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-xl hover-float ${isActive
                                    ? 'bg-gradient-to-r from-emerald-100 to-teal-50 text-emerald-800 border border-emerald-200 shadow-sm ring-1 ring-emerald-500/20'
                                    : 'text-slate-800 bg-white border border-transparent hover:bg-emerald-100 hover:border-emerald-200 hover:text-emerald-700'
                                    }`}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-7 bg-emerald-400 rounded-r-full shadow-[0_0_15px_rgba(52,211,153,1)]" />
                                )}
                                <div className={`p-1.5 rounded-lg transition-colors z-10 ${isActive ? 'bg-emerald-500/30 shadow-inner shadow-emerald-500/30' : 'bg-slate-100 group-hover:bg-emerald-1000/20'}`}>
                                    <Icon className={`w-4.5 h-4.5 transition-transform duration-300 ${isActive ? 'scale-110 text-emerald-700' : 'text-slate-800 group-hover:text-emerald-700'}`} />
                                </div>
                                <span className={`font-semibold text-sm tracking-wide z-10 ${isActive ? 'text-emerald-900' : ''}`}>{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-emerald-900/50 bg-slate-100 backdrop-blur-md">
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 transition-all hover-float border border-red-200 hover:border-red-300"
                    >
                        <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-bold text-sm">Sign Out</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

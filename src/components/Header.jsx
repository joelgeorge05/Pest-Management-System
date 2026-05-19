import React from 'react';
import { Sprout } from 'lucide-react';

export default function Header({ user, onLogout, onNavigate, currentView, profileComplete, adminView }) {
    const navItemStyle = (view) => `relative px-4 py-2 text-sm font-bold transition-all duration-300 whitespace-nowrap rounded-full ${currentView === view ? 'bg-emerald-500/10 text-emerald-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] border border-emerald-500/20' : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-50 border border-transparent hover:border-slate-200'}`;

    return (
        <header className={`fixed top-4 z-50 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-none`}>
            <div className="bg-white/70 backdrop-blur-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-[2rem] px-4 sm:px-6 lg:px-6 relative overflow-hidden group">
                <div className="absolute top-0 bottom-0 w-[400px] bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent animate-shimmer-slide pointer-events-none z-0"></div>
                <div className="flex items-center justify-between h-16 relative z-10">
                    {/* Logo/Title Section */}
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onNavigate && onNavigate('home')}>
                        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-2.5 shadow-[0_0_20px_rgba(16,185,129,0.3)] group-hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] transition-all duration-500 group-hover:scale-105 border border-white/20">
                            <Sprout className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex flex-col justify-center">
                            <span className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-1.5 whitespace-nowrap leading-none pt-1">
                                Smart <span className="text-gradient">Pest</span>
                            </span>
                            <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5">
                                Management System
                            </span>
                        </div>
                    </div>

                    <nav className="hidden md:flex flex-1 items-center justify-end overflow-hidden ml-4">
                        {user && user.role === 'farmer' && profileComplete && (
                            <div className="flex items-center gap-1 bg-slate-50/50 p-1.5 rounded-full border border-slate-200/50 shadow-inner mr-2 overflow-x-auto scrollbar-hide max-w-[60vw]">
                                <button onClick={() => onNavigate('home')} className={navItemStyle('home')}>Home</button>
                                <button onClick={() => onNavigate('shops')} className={navItemStyle('shops')}>Shops</button>
                                <button onClick={() => onNavigate('subsidies')} className={navItemStyle('subsidies')}>Schemes</button>
                                <button onClick={() => onNavigate('consultations')} className={navItemStyle('consultations')}>Consultations</button>
                                <button onClick={() => onNavigate('messaging')} className={navItemStyle('messaging')}>Messages</button>
                                <button onClick={() => onNavigate('forum')} className={navItemStyle('forum')}>Forum</button>
                                <button onClick={() => onNavigate('proposal')} className={navItemStyle('proposal')}>Community Meds</button>
                                <button onClick={() => onNavigate('history')} className={navItemStyle('history')}>History</button>
                                <button onClick={() => onNavigate('announcements')} className={navItemStyle('announcements')}>Announcements</button>
                            </div>
                        )}
                        {user && user.role === 'expert' && (
                            <div className="flex-1 flex items-center gap-1 bg-slate-50/50 p-1.5 rounded-full border border-slate-200/50 shadow-inner mr-4 overflow-x-auto scrollbar-hide">
                                <button onClick={() => onNavigate('consultations')} className={navItemStyle('consultations')}>Active Requests</button>
                                <button onClick={() => onNavigate('history')} className={navItemStyle('history')}>My History</button>
                                <button onClick={() => onNavigate('medicines')} className={navItemStyle('medicines')}>Medicines</button>
                                <button onClick={() => onNavigate('feedback')} className={navItemStyle('feedback')}>App Feedback</button>
                                <button onClick={() => onNavigate('propose')} className={navItemStyle('propose')}>Propose Medicine</button>
                                <button onClick={() => onNavigate('announcements')} className={navItemStyle('announcements')}>Announcements</button>
                                <button onClick={() => onNavigate('messages')} className={navItemStyle('messages')}>Direct Messages</button>
                            </div>
                        )}

                        {user && user.role === 'admin' && (
                            <div className="flex-1 flex items-center gap-1 bg-slate-50/50 p-1.5 rounded-full border border-slate-200/50 shadow-inner mr-4 overflow-x-auto scrollbar-hide">
                                <button onClick={() => onNavigate('users')} className={navItemStyle('users')}>Users & Activity</button>
                                <button onClick={() => onNavigate('analytics')} className={navItemStyle('analytics')}>Demographics</button>
                                <button onClick={() => onNavigate('shops')} className={navItemStyle('shops')}>Shops</button>
                                <button onClick={() => onNavigate('medicines')} className={navItemStyle('medicines')}>Medicines</button>
                                <button onClick={() => onNavigate('subsidies')} className={navItemStyle('subsidies')}>Schemes</button>
                                <button onClick={() => onNavigate('proposals')} className={navItemStyle('proposals')}>Proposals</button>
                                <button onClick={() => onNavigate('detection')} className={navItemStyle('detection')}>AI Logs</button>
                                <button onClick={() => onNavigate('dataset')} className={navItemStyle('dataset')}>Dataset</button>
                                <button onClick={() => onNavigate('knowledge')} className={navItemStyle('knowledge')}>Knowledge Base</button>
                                <button onClick={() => onNavigate('announcements')} className={navItemStyle('announcements')}>Notices</button>
                                <button onClick={() => onNavigate('forum')} className={navItemStyle('forum')}>Forum Mod</button>
                                <button onClick={() => onNavigate('messages')} className={navItemStyle('messages')}>Comms</button>
                                <button onClick={() => onNavigate('feedback')} className={navItemStyle('feedback')}>Feedback</button>
                            </div>
                        )}

                        {user ? (
                            <div className="flex items-center gap-3 pl-2 border-l border-slate-300/50 shrink-0">
                                <div className="hidden lg:flex flex-col items-end mr-1">
                                    <span className="text-sm font-black text-slate-800 leading-tight">
                                        Hi, {user.username}
                                    </span>
                                    <span className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">{user.role}</span>
                                </div>
                                <button
                                    onClick={onLogout}
                                    className="px-4 py-2 rounded-full text-xs font-bold bg-white text-slate-700 hover:bg-red-50 hover:text-red-600 transition-all border border-slate-200 shadow-sm hover:shadow-md hover:border-red-200"
                                >
                                    Log Out
                                </button>
                                {!adminView && (
                                    <button
                                        onClick={() => onNavigate && onNavigate('profile')}
                                        className="btn-primary !px-5 !py-2 !text-sm !rounded-full"
                                    >
                                        Profile
                                    </button>
                                )}
                            </div>
                        ) : (
                            <button className="btn-primary !px-6 !py-2.5 !text-sm shadow-emerald-500/20 !rounded-full">
                                Get Started
                            </button>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
}

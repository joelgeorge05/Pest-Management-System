import React from 'react';
import { Users, ShoppingBag, Pill, Activity } from 'lucide-react';

export default function DashboardStats({ counts }) {
    const stats = [
        { label: 'Total Users', value: counts.users || 0, icon: Users, color: 'blue' },
        { label: 'Active Shops', value: counts.shops || 0, icon: ShoppingBag, color: 'emerald' },
        { label: 'Medicines', value: counts.medicines || 0, icon: Pill, color: 'purple' },
        { label: 'Activity Today', value: counts.activity || 0, icon: Activity, color: 'orange' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-2 animate-fade-in-up">
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                const colorClasses = {
                    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]',
                    emerald: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]',
                    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]',
                    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.15)]'
                };

                return (
                    <div key={index} className="bg-white backdrop-blur-xl rounded-[2rem] p-6 relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/10 border border-slate-200/80 hover:border-emerald-500/30">
                        {/* Soft Glow Background */}
                        <div className={`absolute top-0 right-0 p-16 opacity-[0.05] rounded-full transform translate-x-1/3 -translate-y-1/3 transition-transform duration-700 group-hover:scale-[2] ${stat.color === 'blue' ? 'bg-blue-500' : stat.color === 'emerald' ? 'bg-emerald-500' : stat.color === 'purple' ? 'bg-purple-500' : 'bg-orange-500'}`}></div>

                        <div className="relative z-10 flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-widest">{stat.label}</p>
                                <h3 className="text-4xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
                            </div>
                            <div className={`p-3.5 rounded-2xl border backdrop-blur-md ${colorClasses[stat.color]}`}>
                                <Icon className="w-6 h-6" />
                            </div>
                        </div>

                        <div className="mt-5 flex items-center text-[11px] font-bold tracking-wide text-slate-700 uppercase">
                            <span className="text-emerald-700 flex items-center gap-1.5 mr-2 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 shadow-sm shadow-emerald-500/10">
                                <Activity className="w-3 h-3" /> +12%
                            </span>
                            <span>from last week</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

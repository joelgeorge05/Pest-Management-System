import React, { useMemo, useState, useEffect } from 'react';
import { Users, Shield, Sprout, GraduationCap, MessageSquare, FileInput, Activity, BarChart2, TrendingUp, AlertCircle } from 'lucide-react';

export default function UserAnalysis({ users }) {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/admin/analytics/usage');
            if (res.ok) {
                setAnalytics(await res.json());
            }
        } catch (error) {
            console.error("Failed to fetch analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    const userStats = useMemo(() => {
        const total = users.length;
        if (total === 0) return { admins: 0, experts: 0, farmers: 0, total: 0 };

        const admins = users.filter(u => u.role === 'admin').length;
        const experts = users.filter(u => u.role === 'expert').length;
        const farmers = users.filter(u => u.role === 'user' || u.role === 'farmer').length;

        return {
            admins, experts, farmers, total,
            adminPct: (admins / total) * 100,
            expertPct: (experts / total) * 100,
            farmerPct: (farmers / total) * 100,
        };
    }, [users]);

    if (userStats.total === 0) return null;

    // Feature Adoption Bar Chart Component
    const FeatureBar = ({ label, count, icon: Icon, color }) => {
        // Calculate max for scale (simple scaling)
        const max = userStats.total || 1;
        const pct = Math.min((count / max) * 100, 100);

        return (
            <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <Icon className={`w-4 h-4 ${color}`} /> {label}
                    </div>
                    <span className="text-xs font-bold text-slate-900">{count} Users ({pct.toFixed(1)}%)</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                        style={{ width: `${pct}%` }}
                        className={`h-full rounded-full ${color.replace('text-', 'bg-')} transition-all duration-1000`}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8 animate-fade-in-up">

            {/* 1. User Role Distribution (Existing) */}
            <div className="bg-white backdrop-blur-xl border-emerald-500/20 p-6 rounded-2xl shadow-sm border border-slate-200/80">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Users className="w-5 h-5 text-nature-600" />
                    System User Distribution
                </h2>

                <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner mb-6">
                    <div style={{ width: `${userStats.farmerPct}%` }} className="h-full bg-emerald-500" />
                    <div style={{ width: `${userStats.expertPct}%` }} className="h-full bg-blue-500" />
                    <div style={{ width: `${userStats.adminPct}%` }} className="h-full bg-purple-500" />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                        <div className="text-emerald-800 font-bold text-2xl">{userStats.farmers}</div>
                        <div className="text-xs text-emerald-600 font-medium uppercase tracking-wide">Farmers</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="text-blue-800 font-bold text-2xl">{userStats.experts}</div>
                        <div className="text-xs text-blue-600 font-medium uppercase tracking-wide">Experts</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-xl border border-purple-100">
                        <div className="text-purple-800 font-bold text-2xl">{userStats.admins}</div>
                        <div className="text-xs text-purple-600 font-medium uppercase tracking-wide">Admins</div>
                    </div>
                </div>
            </div>

            {/* 2. Disease Insights (Last 30 Days) */}
            <div className="bg-white backdrop-blur-xl border-emerald-500/20 p-6 rounded-2xl shadow-sm border border-slate-200/80">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-rose-600" />
                    Disease Trends (Last 30 Days)
                </h2>

                {analytics && analytics.insights ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-5 bg-rose-50 rounded-xl border border-rose-100 flex items-start gap-4">
                            <div className="p-3 bg-white backdrop-blur-xl border-emerald-500/20 rounded-lg shadow-sm">
                                <AlertCircle className="w-6 h-6 text-rose-500" />
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-rose-500 uppercase tracking-wide mb-1">Most Detected Disease</h3>
                                <p className="text-lg font-bold text-slate-900">{analytics.insights.top_disease || "N/A"}</p>
                                <p className="text-xs text-rose-700 mt-1">
                                    Highest frequency in recent scans.
                                </p>
                            </div>
                        </div>

                        <div className="p-5 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-4">
                            <div className="p-3 bg-white backdrop-blur-xl border-emerald-500/20 rounded-lg shadow-sm">
                                <Sprout className="w-6 h-6 text-amber-500" />
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-1">Most Affected Crop</h3>
                                <p className="text-lg font-bold text-slate-900">{analytics.insights.most_affected_plant || "N/A"}</p>
                                <p className="text-xs text-amber-700 mt-1">
                                    Crop with the most scan activity.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-slate-700 py-4">Loading insights...</div>
                )}
            </div>

            {/* 3. Feature Adoption Analysis */}
            <div className="bg-white backdrop-blur-xl border-emerald-500/20 p-6 rounded-2xl shadow-sm border border-slate-200/80">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-indigo-600" />
                    Feature Usage Analysis
                </h2>

                {analytics ? (
                    <div className="space-y-2">
                        <FeatureBar
                            label="Disease Detection Scans"
                            count={analytics.usage.detection_users}
                            icon={Activity}
                            color="text-rose-500"
                        />
                        <FeatureBar
                            label="Forum Contributors"
                            count={analytics.usage.forum_users}
                            icon={MessageSquare}
                            color="text-blue-500"
                        />
                        <FeatureBar
                            label="Messaging System Users"
                            count={analytics.usage.messaging_users}
                            icon={MessageSquare}
                            color="text-indigo-500"
                        />
                        <FeatureBar
                            label="Expert Consultations"
                            count={analytics.usage.expert_users}
                            icon={GraduationCap}
                            color="text-purple-500"
                        />
                        <FeatureBar
                            label="Proposal Contributors"
                            count={analytics.usage.proposal_users}
                            icon={FileInput}
                            color="text-amber-500"
                        />
                    </div>
                ) : (
                    <div className="text-center text-slate-700 py-4">Loading usage stats...</div>
                )}
            </div>
        </div>
    );
}

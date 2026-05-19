import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Reply, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function FeedbackAnalysis() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [replyingTo, setReplyingTo] = useState(null); // Feedback ID

    useEffect(() => {
        fetchFeedback();
    }, []);

    const fetchFeedback = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/admin/feedback`);
            if (response.ok) {
                setFeedbacks(await response.json());
            }
        } catch (error) {
            console.error("Error fetching feedback:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (id) => {
        if (!replyText.trim()) return;

        try {
            const response = await fetch(`${API_URL}/admin/feedback/${id}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reply: replyText })
            });

            if (response.ok) {
                setReplyingTo(null);
                setReplyText('');
                fetchFeedback(); // Refresh
                alert("Reply sent!");
            } else {
                alert("Failed to send reply");
            }
        } catch (error) {
            console.error("Error replying:", error);
        }
    };

    const calculateAverageRating = () => {
        if (feedbacks.length === 0) return 0;
        const sum = feedbacks.reduce((acc, curr) => acc + curr.rating, 0);
        return (sum / feedbacks.length).toFixed(1);
    };

    const getRatingDistribution = () => {
        const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        feedbacks.forEach(f => {
            if (f.rating >= 1 && f.rating <= 5) {
                dist[f.rating]++;
            }
        });
        return [
            { name: '1 Star', rating: 1, count: dist[1] },
            { name: '2 Stars', rating: 2, count: dist[2] },
            { name: '3 Stars', rating: 3, count: dist[3] },
            { name: '4 Stars', rating: 4, count: dist[4] },
            { name: '5 Stars', rating: 5, count: dist[5] }
        ];
    };

    const COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white backdrop-blur-xl border-emerald-500/20 p-6 rounded-2xl shadow-sm border border-emerald-900/30 flex flex-col items-center justify-center">
                    <h3 className="text-lg font-semibold text-nature-600 mb-2">Average Rating</h3>
                    <div className="flex items-center gap-2">
                        <span className="text-4xl font-bold text-nature-900">{calculateAverageRating()}</span>
                        <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                    </div>
                </div>
                <div className="bg-white backdrop-blur-xl border-emerald-500/20 p-6 rounded-2xl shadow-sm border border-emerald-900/30 flex flex-col items-center justify-center">
                    <h3 className="text-lg font-semibold text-nature-600 mb-2">Total Reviews</h3>
                    <span className="text-4xl font-bold text-nature-900">{feedbacks.length}</span>
                </div>
                <div className="bg-white backdrop-blur-xl border-emerald-500/20 p-6 rounded-2xl shadow-sm border border-emerald-900/30 flex flex-col items-center justify-center">
                    <h3 className="text-lg font-semibold text-nature-600 mb-2">Pending Replies</h3>
                    <span className="text-4xl font-bold text-nature-900">{feedbacks.filter(f => !f.admin_reply).length}</span>
                </div>
            </div>

            {/* Analytics Graph */}
            {!loading && feedbacks.length > 0 && (
                <div className="bg-white backdrop-blur-xl border-emerald-500/20 p-6 rounded-2xl shadow-sm border border-emerald-900/30 flex flex-col">
                    <h2 className="text-xl font-bold text-nature-900 mb-6 flex items-center gap-2">
                        <BarChart2 className="w-6 h-6 text-nature-600" /> Rating Distribution
                    </h2>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={getRatingDistribution()} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                <Tooltip
                                    cursor={{ fill: '#F3F4F6' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={60}>
                                    {getRatingDistribution().map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            <div className="bg-white backdrop-blur-xl border-emerald-500/20 rounded-2xl shadow-sm border border-emerald-900/30 overflow-hidden">
                <div className="p-6 border-b border-emerald-900/30">
                    <h2 className="text-xl font-bold text-nature-900 flex items-center gap-2">
                        <MessageSquare className="w-6 h-6" /> User Feedback
                    </h2>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-nature-500">Loading feedback...</div>
                ) : feedbacks.length === 0 ? (
                    <div className="p-8 text-center text-nature-500">No feedback available.</div>
                ) : (
                    <div className="divide-y divide-nature-100">
                        {feedbacks.map((item) => (
                            <div key={item._id} className="p-6 hover:bg-nature-50/50 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${item.role === 'expert' ? 'bg-purple-500' : 'bg-nature-500'}`}>
                                            {item.username.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-nature-900">{item.username}</h3>
                                            <p className="text-xs text-nature-500 capitalize">{item.role}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="flex gap-1 mb-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-4 h-4 ${i < item.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-xs text-nature-400">{item.timestamp}</span>
                                    </div>
                                </div>

                                <p className="text-nature-800 mb-4 ml-13 pl-13">{item.feedback}</p>

                                {item.admin_reply ? (
                                    <div className="bg-gray-50 p-4 rounded-lg ml-12 border-l-4 border-nature-500">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Reply className="w-4 h-4 text-nature-500" />
                                            <span className="font-bold text-nature-700 text-sm">Replied on {item.reply_timestamp}</span>
                                        </div>
                                        <p className="text-nature-600 text-sm">{item.admin_reply}</p>
                                    </div>
                                ) : (
                                    <div className="ml-12">
                                        {replyingTo === item._id ? (
                                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 animate-fade-in">
                                                <textarea
                                                    className="w-full p-2 border rounded-lg mb-2 text-sm"
                                                    rows="3"
                                                    placeholder="Write your reply..."
                                                    value={replyText}
                                                    onChange={e => setReplyText(e.target.value)}
                                                />
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={() => setReplyingTo(null)}
                                                        className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => handleReply(item._id)}
                                                        className="px-3 py-1 text-sm bg-nature-600 text-slate-900 rounded-md hover:bg-nature-700"
                                                    >
                                                        Send Reply
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => { setReplyingTo(item._id); setReplyText(''); }}
                                                className="text-sm text-nature-600 hover:text-nature-800 flex items-center gap-2 font-medium"
                                            >
                                                <Reply className="w-4 h-4" /> Reply
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

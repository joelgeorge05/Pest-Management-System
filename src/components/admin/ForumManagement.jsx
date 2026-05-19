import React, { useState, useEffect } from 'react';
import { MessageSquare, Trash2, Eye, EyeOff, User, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

export default function ForumManagement() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/admin/forum/posts');
            if (res.ok) {
                setPosts(await res.json());
            }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching admin forum posts:", error);
            setLoading(false);
        }
    };

    const handleToggleHidden = async (id, currentStatus) => {
        try {
            const res = await fetch(`http://localhost:5000/api/admin/forum/posts/${id}/toggle-hidden`, {
                method: 'PUT'
            });
            if (res.ok) {
                const data = await res.json();
                setPosts(posts.map(p => p._id === id ? { ...p, is_hidden: data.is_hidden } : p));
            }
        } catch (error) {
            console.error("Error toggling hidden status:", error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to PERMANENTLY delete this post? This cannot be undone.")) return;

        try {
            const res = await fetch(`http://localhost:5000/api/admin/forum/posts/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setPosts(posts.filter(p => p._id !== id));
            }
        } catch (error) {
            console.error("Error deleting post:", error);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-700">Loading forum posts...</div>;

    return (
        <div className="space-y-6">
            <div className="bg-white backdrop-blur-xl border-emerald-500/20 p-6 rounded-2xl shadow-sm border border-slate-200/80">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <MessageSquare className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Forum Moderation</h2>
                        <p className="text-slate-700 text-sm">Manage farmer questions and community discussions.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {posts.length === 0 ? (
                        <div className="text-center py-8 text-slate-700 italic">No forum posts found.</div>
                    ) : (
                        posts.map(post => (
                            <div key={post._id} className={`bg-white backdrop-blur-xl border-emerald-500/20 rounded-xl border ${post.is_hidden ? 'border-red-200 bg-red-900/30/30' : 'border-slate-200/80'} p-4 transition-all hover:shadow-md`}>
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            {post.is_hidden && (
                                                <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-300 flex items-center gap-1">
                                                    <EyeOff className="w-3 h-3" /> HIDDEN
                                                </span>
                                            )}
                                            <span className="text-xs font-medium text-slate-700 flex items-center gap-1">
                                                <User className="w-3 h-3" /> {post.author}
                                            </span>
                                            <span className="text-xs text-slate-800 flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {post.timestamp}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-900 mb-1">{post.question}</h3>
                                        {post.description && (
                                            <p className="text-slate-800 text-sm mb-3 bg-slate-50/90 p-2 rounded border border-slate-200">{post.description}</p>
                                        )}

                                        <div className="text-xs text-slate-700">
                                            {post.answers && post.answers.length > 0 ? (
                                                <span className="text-emerald-600 font-medium">{post.answers.length} Answers</span>
                                            ) : (
                                                <span className="italic">No answers yet</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => handleToggleHidden(post._id, post.is_hidden)}
                                            className={`p-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium ${post.is_hidden
                                                    ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                                    : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                                                }`}
                                            title={post.is_hidden ? "Unhide Post" : "Hide Post"}
                                        >
                                            {post.is_hidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                            {post.is_hidden ? 'Unhide' : 'Hide'}
                                        </button>

                                        <button
                                            onClick={() => handleDelete(post._id)}
                                            className="p-2 rounded-lg bg-red-900/30 text-red-600 hover:bg-red-100 transition-colors flex items-center gap-2 text-sm font-medium"
                                            title="Permanently Delete"
                                        >
                                            <Trash2 className="w-4 h-4" /> Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import { MessageSquare, User, Send, Clock, PlusCircle, X } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

const Forum = ({ user }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newQuestion, setNewQuestion] = useState('');
    const [description, setDescription] = useState('');
    const [replyText, setReplyText] = useState({}); // Map of post_id -> text
    const [showForm, setShowForm] = useState(false);

    const fetchPosts = async () => {
        try {
            const res = await fetch('http://localhost:5000/forum/posts');
            const data = await res.json();
            if (Array.isArray(data)) {
                setPosts(data.filter(p => !p.is_hidden));
            } else {
                setPosts([]);
            }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching posts:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line
        fetchPosts();
    }, []);

    const handlePostSubmit = async (e) => {
        e.preventDefault();
        if (!user) return alert("Please login to post");

        try {
            const res = await fetch('http://localhost:5000/forum/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: newQuestion,
                    description: description,
                    author: user.username || 'Farmer'
                })
            });
            if (res.ok) {
                setNewQuestion('');
                setDescription('');
                setShowForm(false);
                fetchPosts();
            }
        } catch (error) {
            console.error("Error creating post:", error);
        }
    };

    const handleReplySubmit = async (postId) => {
        if (!user) return alert("Please login to reply");
        if (!replyText[postId]) return;

        try {
            const res = await fetch(`http://localhost:5000/forum/posts/${postId}/answers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    answer: replyText[postId],
                    author: user.username || 'Farmer'
                })
            });
            if (res.ok) {
                setReplyText(prev => ({ ...prev, [postId]: '' }));
                fetchPosts();
            }
        } catch (error) {
            console.error("Error replying:", error);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4" />
            <p className="text-emerald-700 font-medium animate-pulse">Loading forum discussions...</p>
        </div>
    );

    return (
        <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto min-h-screen relative">
            {/* Soft background glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 relative z-10">
                <div>
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-sm text-blue-700 text-sm font-bold border border-blue-200/50 mb-4 shadow-sm"
                    >
                        <MessageSquare className="w-4 h-4 text-blue-600" />
                        <span>Community Help</span>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight"
                    >
                        Farmer's <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">Forum</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-500 font-medium max-w-lg mt-3 text-lg"
                    >
                        Ask questions, find solutions, and share advice with fellow farmers and agricultural experts.
                    </motion.p>
                </div>

                <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3.5 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-1"
                >
                    {showForm ? <X className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
                    {showForm ? 'Cancel' : 'Ask Question'}
                </motion.button>
            </div>

            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, mb: 0 }}
                        animate={{ opacity: 1, height: 'auto', mb: 40 }}
                        exit={{ opacity: 0, height: 0, mb: 0 }}
                        className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-blue-900/5 border border-white overflow-hidden"
                    >
                        <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                            <h3 className="text-2xl font-bold text-slate-800">Post a New Question</h3>
                            <p className="text-slate-500 font-medium">Be specific and imagine you're asking a question to another person.</p>
                        </div>
                        <form onSubmit={handlePostSubmit} className="p-8 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Question Title</label>
                                <input
                                    type="text"
                                    value={newQuestion}
                                    onChange={(e) => setNewQuestion(e.target.value)}
                                    placeholder="e.g., Which tractor is best for clay soil?"
                                    className="w-full px-5 py-3.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-slate-800 placeholder-slate-400"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Details (Optional)</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Provide more context, details, and what you've tried so far..."
                                    className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-slate-800 placeholder-slate-400 h-32 resize-none"
                                />
                            </div>
                            <div className="flex justify-end pt-4">
                                <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20">
                                    Post Question
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="space-y-6 relative z-10"
            >
                {posts.length === 0 ? (
                    <div className="text-center py-16 bg-white/60 backdrop-blur-md rounded-3xl border border-white shadow-sm">
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <MessageSquare className="w-10 h-10 text-blue-300" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">No questions yet</h3>
                        <p className="text-slate-500 text-lg max-w-sm mx-auto">Be the first to start a discussion by asking a question above!</p>
                    </div>
                ) : (
                    posts.map((post, index) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            key={post._id}
                            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg shadow-slate-200/40 border border-white overflow-hidden hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 group"
                        >
                            <div className="p-6 md:p-8 md:pb-6">
                                <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6 mb-2">
                                    <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-50 rounded-2xl flex items-center justify-center text-blue-700 font-bold text-2xl shadow-inner border border-blue-200/50 shrink-0">
                                        {post.author[0]?.toUpperCase()}
                                    </div>
                                    <div className="flex-1 w-full">
                                        <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 leading-tight group-hover:text-blue-700 transition-colors">{post.question}</h3>
                                        <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100/80 rounded-lg text-slate-600"><User className="w-4 h-4" /> {post.author}</span>
                                            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100/80 rounded-lg text-slate-600"><Clock className="w-4 h-4" /> {post.timestamp}</span>
                                        </div>
                                    </div>
                                </div>

                                {post.description && (
                                    <div className="mt-6 md:pl-20 text-slate-600 bg-slate-50/80 p-5 rounded-2xl border border-slate-100 text-lg leading-relaxed">
                                        {post.description}
                                    </div>
                                )}
                            </div>

                            <div className="px-6 md:px-8 pb-6 md:pb-8 pt-4 bg-slate-50/30 border-t border-slate-100 relative">
                                <div className="md:pl-20 space-y-6">
                                    {post.answers.length > 0 && (
                                        <div className="space-y-4">
                                            <h4 className="text-sm font-bold text-slate-400 flex items-center gap-3">
                                                <div className="flex-1 h-px bg-slate-200" />
                                                {post.answers.length} {post.answers.length === 1 ? 'Answer' : 'Answers'}
                                                <div className="flex-1 h-px bg-slate-200" />
                                            </h4>
                                            <div className="space-y-4">
                                                {post.answers.map((ans, idx) => (
                                                    <div key={idx} className="bg-white p-5 md:p-6 rounded-2xl border border-emerald-100 shadow-sm relative group/answer">
                                                        <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-400 rounded-l-2xl" />
                                                        <p className="text-slate-800 mb-4 text-base leading-relaxed pl-2">{ans.answer}</p>
                                                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 pl-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                                                                    {ans.author[0]?.toUpperCase()}
                                                                </div>
                                                                <span className="text-emerald-700">{ans.author}</span>
                                                            </div>
                                                            <span className="uppercase tracking-wider opacity-60">{ans.timestamp}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {user ? (
                                        <div className="flex gap-4 items-center bg-white p-2 pl-4 pr-2 rounded-2xl border border-slate-200 shadow-sm focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all mt-4">
                                            <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-teal-50 rounded-full flex items-center justify-center text-emerald-700 font-bold text-sm shadow-inner shrink-0 hidden sm:flex">
                                                {user.username[0]?.toUpperCase()}
                                            </div>
                                            <input
                                                type="text"
                                                value={replyText[post._id] || ''}
                                                onChange={(e) => setReplyText(prev => ({ ...prev, [post._id]: e.target.value }))}
                                                placeholder="Write a helpful answer..."
                                                className="w-full bg-transparent py-3 outline-none text-slate-700 font-medium placeholder-slate-400"
                                            />
                                            <button
                                                onClick={() => handleReplySubmit(post._id)}
                                                className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed group-hover:scale-105"
                                                disabled={!replyText[post._id]?.trim()}
                                            >
                                                <Send className="w-5 h-5 ml-[2px]" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="bg-slate-100/50 rounded-xl p-4 text-center border border-slate-200 border-dashed mt-4">
                                            <p className="text-sm text-slate-500 font-bold">Please <span className="text-blue-600">log in</span> to answer this question.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </motion.div>
        </div>
    );
};

export default Forum;

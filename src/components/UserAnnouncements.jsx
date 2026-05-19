import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { BellRing, Calendar, ChevronRight, Loader2, AlertCircle, Info } from 'lucide-react';

const UserAnnouncements = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/announcements');
                const data = await response.json();
                setAnnouncements(data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching announcements:", err);
                setError('Failed to fetch announcements');
                setLoading(false);
            }
        };

        fetchAnnouncements();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-teal-200/20 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md text-emerald-800 text-sm font-bold border border-emerald-200/50 mb-6 shadow-sm"
                    >
                        <BellRing className="w-4 h-4 text-emerald-600" />
                        <span>System Updates & News</span>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4"
                    >
                        Latest <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Announcements</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-500 font-medium max-w-xl mx-auto text-lg"
                    >
                        Stay informed with the latest updates, essential alerts, and new features directly from our team.
                    </motion.p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
                        <p className="text-emerald-700 font-medium animate-pulse">Loading updates...</p>
                    </div>
                ) : error ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-red-50/80 backdrop-blur-md border border-red-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-lg"
                    >
                        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                        <h3 className="text-xl font-bold text-red-800 mb-2">Oops! Something went wrong</h3>
                        <p className="text-red-600">{error}</p>
                    </motion.div>
                ) : announcements.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white/60 backdrop-blur-xl rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-lg border border-white"
                    >
                        <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mb-6 shadow-inner">
                            <Info className="w-10 h-10 text-slate-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-3">No Announcements</h3>
                        <p className="text-slate-500 max-w-sm text-lg">
                            You're all caught up! Check back later for new updates and information.
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="space-y-6"
                    >
                        {announcements.map((announcement) => (
                            <motion.div
                                key={announcement._id}
                                variants={itemVariants}
                                className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-lg shadow-emerald-900/5 border border-white hover:shadow-xl hover:shadow-emerald-900/10 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
                            >
                                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-emerald-400 to-teal-500 transform origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-300 ease-out" />

                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-5">
                                    <h3 className="text-2xl font-bold text-slate-800 group-hover:text-emerald-700 transition-colors leading-tight">
                                        {announcement.title}
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm font-bold text-emerald-700 bg-emerald-100/50 px-4 py-2 rounded-xl whitespace-nowrap border border-emerald-200/50 shadow-sm shrink-0">
                                        <Calendar className="w-4 h-4 text-emerald-600" />
                                        {announcement.date}
                                    </div>
                                </div>
                                <div className="text-slate-600 whitespace-pre-wrap leading-relaxed text-lg">
                                    {announcement.content}
                                </div>
                                <div className="mt-8 pt-5 border-t border-slate-200/60 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-sm font-bold text-white shadow-sm">
                                            A
                                        </div>
                                        <span className="text-sm font-bold text-slate-600">Posted by Admin</span>
                                    </div>
                                    <button className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0 duration-300 bg-emerald-50 px-4 py-2 rounded-lg">
                                        Read more <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default UserAnnouncements;

import React, { useState, useEffect } from 'react';

const AdminAnnouncements = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/announcements');
            const data = await response.json();
            setAnnouncements(data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch announcements');
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!newTitle.trim() || !newContent.trim()) {
            setError('Title and content are required');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/admin/announcements', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: newTitle,
                    content: newContent
                }),
            });

            if (response.ok) {
                setSuccess('Announcement created successfully!');
                setNewTitle('');
                setNewContent('');
                fetchAnnouncements();
            } else {
                setError('Failed to create announcement');
            }
        } catch (err) {
            setError('Error creating announcement');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this announcement?')) return;

        try {
            const response = await fetch(`http://localhost:5000/api/admin/announcements/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchAnnouncements();
            } else {
                setError('Failed to delete announcement');
            }
        } catch (err) {
            setError('Error deleting announcement');
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Manage Announcements</h2>
                    <p className="text-slate-700">Broadcast updates to all users</p>
                </div>
            </div>

            {/* Create Announcement Form */}
            <div className="bg-white backdrop-blur-xl border-emerald-500/20 rounded-2xl shadow-sm border border-slate-200/80 p-6 mb-8">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Post New Announcement</h3>

                {error && <div className="bg-red-900/30 text-red-600 p-4 rounded-xl mb-6 border border-red-100 flex items-center gap-2">⚠️ {error}</div>}
                {success && <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl mb-6 border border-emerald-100 flex items-center gap-2">✅ {success}</div>}

                <form onSubmit={handleCreate} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Title</label>
                        <input
                            type="text"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900 bg-white backdrop-blur-xl border-emerald-500/20"
                            placeholder="e.g., System Maintenance Update"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Content</label>
                        <textarea
                            value={newContent}
                            onChange={(e) => setNewContent(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all h-32 text-slate-900 bg-white backdrop-blur-xl border-emerald-500/20"
                            placeholder="Write your announcement details here..."
                        />
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                        >
                            <span>Post Announcement</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </div>
                </form>
            </div>

            {/* List Announcements */}
            <h3 className="text-xl font-bold text-slate-900 mb-6">Active Announcements</h3>
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-12 bg-white backdrop-blur-xl border-emerald-500/20 rounded-2xl border border-slate-200/80">
                        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-slate-700">Loading announcements...</p>
                    </div>
                ) : announcements.length === 0 ? (
                    <div className="text-center py-12 bg-white backdrop-blur-xl border-emerald-500/20 rounded-2xl border border-slate-200/80 dashed border-2">
                        <p className="text-slate-800 font-medium">No announcements found.</p>
                    </div>
                ) : (
                    announcements.map((announcement) => (
                        <div key={announcement._id} className="bg-white backdrop-blur-xl border-emerald-500/20 rounded-xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h4 className="text-lg font-bold text-slate-900">{announcement.title}</h4>
                                        <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200/80">
                                            {announcement.date}
                                        </span>
                                    </div>
                                    <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">{announcement.content}</p>
                                </div>
                                <button
                                    onClick={() => handleDelete(announcement._id)}
                                    className="p-2 text-slate-800 hover:text-red-600 hover:bg-red-900/30 rounded-lg transition-colors"
                                    title="Delete Announcement"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminAnnouncements;

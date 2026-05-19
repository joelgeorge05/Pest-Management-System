import React, { useState } from 'react';
import { Search, MoreVertical, Shield, ShieldAlert, Trash2, CheckCircle, XCircle, Eye, EyeOff, Lock, Plus, GraduationCap, MessageSquare, User, History } from 'lucide-react';

export default function UserManagement({ users, logs = [], onSuspend, onDelete, onCreateUser, onMessage }) {
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({ username: '', name: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [showCreateUser, setShowCreateUser] = useState(false);
    const [viewingHistory, setViewingHistory] = useState(null);
    const [newUser, setNewUser] = useState({ username: '', password: '', name: '', role: 'farmer', specialization: '', phone: '', profile_image: null });

    const handleEditClick = (user) => {
        setEditingUser(user);
        setEditForm({
            username: user.username,
            name: user.name || '',
            password: user.password || ''
        });
        setShowPassword(false);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();

        // Remove password from payload if it wasn't modified
        const payload = { ...editForm };
        if (!payload.password || payload.password.trim() === '') {
            delete payload.password;
        }

        try {
            const res = await fetch(`http://localhost:5000/admin/users/${editingUser._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert("User updated successfully");
                setEditingUser(null);
                window.location.reload();
            } else {
                const data = await res.json();
                alert(data.error || "Update failed");
            }
        } catch (error) {
            console.error(error);
            alert("Error updating user");
        }
    };

    const handleCreateUserSubmit = async (e) => {
        e.preventDefault();
        await onCreateUser(newUser);
        setNewUser({ username: '', password: '', name: '', role: 'farmer', specialization: '', phone: '', profile_image: null });
        setShowCreateUser(false);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header & Controls */}
            <div className="bg-white backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border border-slate-200/80 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                    <User className="w-32 h-32 transform rotate-12" />
                </div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 relative z-10">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/10 rounded-xl">
                                <User className="w-6 h-6 text-indigo-600" />
                            </div>
                            User Management
                        </h2>
                        <p className="text-sm font-bold text-slate-700 mt-2 uppercase tracking-widest pl-1">Manage system access & roles</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowCreateUser(!showCreateUser)}
                            className={`px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all duration-300 ${showCreateUser
                                ? 'bg-white text-slate-800 hover:bg-white border border-slate-200/80'
                                : 'bg-gradient-to-r from-indigo-500 to-blue-600 text-slate-900 hover:from-indigo-400 hover:to-blue-500 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 border border-slate-200/50'
                                }`}
                        >
                            {showCreateUser ? <><XCircle className="w-4 h-4" /> Cancel Creation</> : <><Plus className="w-4 h-4" /> Add New User</>}
                        </button>
                    </div>
                </div>

                {/* Create User Form */}
                {showCreateUser && (
                    <div className="mb-8 bg-indigo-900/30/50 backdrop-blur-md rounded-2xl border border-indigo-100 p-8 animate-slide-down shadow-sm">
                        <h3 className="text-lg font-black text-indigo-100 mb-6 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-indigo-500" /> Create Account Profile
                        </h3>
                        <form onSubmit={handleCreateUserSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-1.5 ml-1">Username</label>
                                <input
                                    type="text"
                                    value={newUser.username}
                                    onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200/80 bg-white focus:bg-white backdrop-blur-xl border-emerald-500/20 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium text-sm text-slate-800 shadow-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-1.5 ml-1">Password</label>
                                <input
                                    type="password"
                                    value={newUser.password}
                                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200/80 bg-white focus:bg-white backdrop-blur-xl border-emerald-500/20 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium text-sm text-slate-800 shadow-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-1.5 ml-1">Role</label>
                                <select
                                    value={newUser.role}
                                    onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200/80 bg-white focus:bg-white backdrop-blur-xl border-emerald-500/20 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-bold text-sm text-slate-700 shadow-sm"
                                >
                                    <option value="farmer">Farmer (Standard User)</option>
                                    <option value="expert">Agricultural Expert</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                                <input
                                    type="text"
                                    value={newUser.name}
                                    onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200/80 bg-white focus:bg-white backdrop-blur-xl border-emerald-500/20 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium text-sm text-slate-800 shadow-sm"
                                />
                            </div>
                            {newUser.role === 'expert' && (
                                <div>
                                    <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-1.5 ml-1">Specialization</label>
                                    <input
                                        type="text"
                                        value={newUser.specialization}
                                        onChange={e => setNewUser({ ...newUser, specialization: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200/80 bg-white focus:bg-white backdrop-blur-xl border-emerald-500/20 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium text-sm text-slate-800 shadow-sm"
                                        placeholder="e.g. Plant Pathology"
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-1.5 ml-1">Phone</label>
                                <input
                                    type="tel"
                                    value={newUser.phone}
                                    onChange={e => setNewUser({ ...newUser, phone: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200/80 bg-white focus:bg-white backdrop-blur-xl border-emerald-500/20 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-mono text-sm text-slate-800 shadow-sm"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-1.5 ml-1">Profile Photo (Optional)</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={e => setNewUser({ ...newUser, profile_image: e.target.files[0] })}
                                        className="hidden"
                                        id="profile-upload"
                                    />
                                    <label htmlFor="profile-upload" className="cursor-pointer px-4 py-2 border-2 border-dashed border-indigo-200 rounded-xl text-indigo-600 bg-indigo-900/30 hover:bg-indigo-100 hover:border-indigo-300 font-bold text-sm transition-all flex items-center gap-2">
                                        <Plus className="w-4 h-4" /> Choose File
                                    </label>
                                    <span className="text-xs font-medium text-slate-700">
                                        {newUser.profile_image ? newUser.profile_image.name : 'No file selected'}
                                    </span>
                                </div>
                            </div>
                            <div className="md:col-span-2 flex justify-end mt-4 pt-4 border-t border-indigo-100">
                                <button type="submit" className="bg-indigo-600 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all">
                                    Create {newUser.role === 'expert' ? 'Expert Account' : 'User Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

            </div>

            {/* Editing Modal Overlay */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white backdrop-blur-xl border-emerald-500/20 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
                        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-900">Edit User</h3>
                            <button onClick={() => setEditingUser(null)} className="text-slate-800 hover:text-slate-800"><XCircle className="w-6 h-6" /></button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                            <div className="flex justify-center mb-2">
                                {editingUser.profile_image ? (
                                    <img
                                        src={`http://localhost:5000/uploads/${editingUser.profile_image}`}
                                        alt={editingUser.username}
                                        className="w-24 h-24 rounded-full object-cover border-4 border-slate-200 shadow-md"
                                    />
                                ) : (
                                    <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-md ${editingUser.role === 'expert' ? 'bg-indigo-500' : 'bg-nature-500'}`}>
                                        {(editingUser.name || editingUser.username).charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Username</label>
                                <input
                                    type="text"
                                    value={editForm.username}
                                    onChange={e => setEditForm({ ...editForm, username: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200/80 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200/80 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">New Password (Optional)</label>
                                <input
                                    type="text"
                                    value={editForm.password}
                                    onChange={e => setEditForm({ ...editForm, password: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200/80 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                    placeholder="Leave blank to keep current"
                                />
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 text-slate-800 font-bold hover:bg-slate-50/90 rounded-lg">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Users Table */}
            <div className="bg-white backdrop-blur-xl rounded-[2rem] shadow-2xl border border-slate-200/80 overflow-hidden">
                <div className="overflow-x-auto bg-white backdrop-blur-sm">
                    <table className="min-w-full divide-y divide-slate-200/50">
                        <thead className="bg-slate-50/90 backdrop-blur-md sticky top-0">
                            <tr>
                                <th className="px-8 py-5 text-left text-[11px] font-black text-slate-700 uppercase tracking-widest">User Identity</th>
                                <th className="px-8 py-5 text-left text-[11px] font-black text-slate-700 uppercase tracking-widest">Contact Information</th>
                                <th className="px-8 py-5 text-left text-[11px] font-black text-slate-700 uppercase tracking-widest">Access Role</th>
                                <th className="px-8 py-5 text-left text-[11px] font-black text-slate-700 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-right text-[11px] font-black text-slate-700 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-16 text-center text-slate-700">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-white border border-slate-200/80 shadow-sm rounded-full flex items-center justify-center mb-4">
                                                <User className="w-8 h-8 text-slate-700" />
                                            </div>
                                            <p className="font-bold text-slate-800">No users found.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user._id} className="hover:bg-white transition-colors group cursor-default">
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {user.profile_image ? (
                                                    <img
                                                        src={`http://localhost:5000/uploads/${user.profile_image}`}
                                                        alt={user.username}
                                                        className="h-12 w-12 rounded-full object-cover border-2 border-slate-200 shadow-sm transition-transform group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-black text-xl shadow-sm border-2 border-slate-200 transition-transform group-hover:scale-105 ${user.role === 'expert' ? 'bg-indigo-500' : 'bg-emerald-500'}`}>
                                                        {(user.name || user.username).charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="ml-5">
                                                    <div className="text-sm font-black text-slate-800">{user.name || 'N/A'}</div>
                                                    <div className="text-xs font-bold text-slate-800 mt-0.5 group-hover:text-indigo-600 transition-colors">@{user.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="text-sm font-bold text-slate-700">{user.email || 'N/A'}</div>
                                            <div className="text-xs font-mono text-slate-700 mt-1">{user.phone || 'N/A'}</div>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-sm ${user.role === 'admin' ? 'bg-purple-100 text-purple-700 border-purple-200 shadow-purple-500/10' :
                                                user.role === 'expert' ? 'bg-indigo-100 text-indigo-700 border-indigo-200 shadow-indigo-500/10' : 'bg-emerald-100 text-emerald-700 border-emerald-200 shadow-emerald-500/10'
                                                }`}>
                                                {(user.role === 'user' || user.role === 'farmer') ? 'Farmer' : user.role}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="flex items-center gap-4">
                                                <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-sm ${user.is_suspended
                                                    ? 'bg-red-100 text-red-700 border-red-300 shadow-red-500/10'
                                                    : 'bg-emerald-100 text-emerald-700 border-emerald-300 shadow-emerald-500/10'
                                                    }`}>
                                                    {user.is_suspended ? (
                                                        <><ShieldAlert className="w-3.5 h-3.5 mr-1.5" /> Suspended</>
                                                    ) : (
                                                        <><CheckCircle className="w-3.5 h-3.5 mr-1.5 text-green-500" /> Active</>
                                                    )}
                                                </span>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); setViewingHistory(user); }} 
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[10px] uppercase tracking-widest rounded-lg transition-all hover:shadow-md border border-emerald-200"
                                                    title="View Activity History"
                                                >
                                                    <History className="w-3.5 h-3.5" />
                                                    View Logs
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-medium">
                                            {user.role !== 'admin' && (
                                                <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleEditClick(user)}
                                                        className="p-3 rounded-xl text-slate-800 hover:text-indigo-600 hover:bg-indigo-100 border border-transparent hover:border-indigo-300 transition-all bg-white backdrop-blur-sm"
                                                        title="Edit User"
                                                    >
                                                        <MoreVertical className="w-6 h-6" />
                                                    </button>
                                                    <button
                                                        onClick={() => onSuspend(user._id, user.is_suspended)}
                                                        className={`flex items-center justify-center p-3 rounded-xl transition-all border shadow-sm bg-white backdrop-blur-sm hover:-translate-y-0.5 ${user.is_suspended
                                                            ? 'text-green-600 hover:text-emerald-700 hover:bg-emerald-100 border-green-200/50'
                                                            : 'text-orange-600 hover:text-orange-700 hover:bg-orange-100 border-orange-200/50'
                                                            }`}
                                                        title={user.is_suspended ? "Activate User" : "Suspend User"}
                                                    >
                                                        {user.is_suspended ? <CheckCircle className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
                                                    </button>

                                                    <button
                                                        onClick={() => onDelete(user._id)}
                                                        className="flex items-center justify-center p-3 rounded-xl transition-all border border-red-300 text-red-600 hover:text-red-700 hover:bg-red-100 shadow-sm bg-white backdrop-blur-sm hover:-translate-y-0.5"
                                                        title="Delete User"
                                                    >
                                                        <Trash2 className="w-6 h-6" />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View History Modal */}
            {viewingHistory && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white backdrop-blur-xl border-emerald-500/20 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] flex flex-col overflow-hidden">
                        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/20 shadow-sm rounded-xl">
                                    <History className="w-5 h-5 text-emerald-700" />
                                </div>
                                Activity History: {viewingHistory.username}
                            </h3>
                            <button onClick={() => setViewingHistory(null)} className="text-slate-800 hover:text-slate-900 bg-slate-200/50 hover:bg-slate-200 rounded-full p-1 transition-colors"><XCircle className="w-6 h-6" /></button>
                        </div>
                        <div className="overflow-y-auto p-0 flex-1 bg-white">
                            <table className="min-w-full divide-y divide-slate-100">
                                <thead className="bg-white backdrop-blur-md sticky top-0 shadow-sm">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-black text-slate-800 uppercase tracking-widest w-48 bg-slate-50/90">Timestamp</th>
                                        <th className="px-6 py-4 text-left text-xs font-black text-slate-800 uppercase tracking-widest bg-slate-50/90">Logged Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {logs.filter(log => log.username === viewingHistory.username).length === 0 ? (
                                        <tr>
                                            <td colSpan="2" className="px-6 py-12 text-center text-slate-500 font-medium">No activity logs found for this user.</td>
                                        </tr>
                                    ) : (
                                        logs.filter(log => log.username === viewingHistory.username).map((log, index) => (
                                            <tr key={index} className="hover:bg-slate-50 transition-colors group cursor-default">
                                                <td className="px-6 py-4 text-xs text-slate-600 font-mono group-hover:text-emerald-700 transition-colors">{log.timestamp}</td>
                                                <td className="px-6 py-4 text-sm text-slate-800 font-medium group-hover:text-slate-900 transition-colors">{log.action}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

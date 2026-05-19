import React, { useEffect, useState } from 'react';
import { Search, History, Shield, LogOut, Store, Pill, List, Trash2, Edit, ScanLine, User, Flag, FileInput, CheckCircle, XCircle, Plus, GraduationCap, FlaskConical, Sprout, Home, Map as MapIcon, MapPin, Phone, MessageSquare, Send, TreePine, AlertCircle, ArrowRight } from 'lucide-react';
import AdminSidebar from './admin/AdminSidebar';
import DashboardStats from './admin/DashboardStats';
import UserManagement from './admin/UserManagement';
import DatasetManager from './admin/DatasetManager';
import FeedbackAnalysis from './admin/FeedbackAnalysis';
import ShopForm from './ShopForm';
import MedicineForm from './MedicineForm';
import ResultsDisplay from './ResultsDisplay';
import UploadAnalyzer from './UploadAnalyzer';

import KnowledgeBase from './admin/KnowledgeBase';
import RetrainPanel from './admin/RetrainPanel';
import AdminAnnouncements from './admin/AdminAnnouncements';
import ForumManagement from './admin/ForumManagement';

import Messaging from './Messaging';
import UserAnalysis from './admin/UserAnalysis';

export default function AdminDashboard({ user, onLogout, activeTab, setActiveTab }) {
    const [logs, setLogs] = useState([]);
    const [shops, setShops] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [subsidies, setSubsidies] = useState([]);
    const [proposals, setProposals] = useState([]);
    const [users, setUsers] = useState([]);
    const [globalSearch, setGlobalSearch] = useState('');
    const [globalRole, setGlobalRole] = useState('all');
    const [analysisResult, setAnalysisResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editingShop, setEditingShop] = useState(null);
    const [editingMedicine, setEditingMedicine] = useState(null);
    const [medicineFilter, setMedicineFilter] = useState('All');

    const [newSubsidy, setNewSubsidy] = useState({ title: '', description: '', link: '', image: null });
    const [newExpert, setNewExpert] = useState({ username: '', password: '', name: '', specialization: '', phone: '' });
    const [diseaseData, setDiseaseData] = useState(null);
    const [messageTarget, setMessageTarget] = useState(null);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        await Promise.all([
            fetchHistory(),
            fetchShops(),
            fetchMedicines(),
            fetchUsers(),
            fetchSubsidies(),
            fetchProposals(),
            fetchTreatments()
        ]);
        setLoading(false);
    };

    const fetchHistory = async () => {
        try {
            const response = await fetch('http://localhost:5000/admin/history');
            if (response.ok) setLogs(await response.json());
        } catch (error) { console.error("History fetch error", error); }
    };

    const fetchShops = async () => {
        try {
            const response = await fetch('http://localhost:5000/shops');
            if (response.ok) setShops(await response.json());
        } catch (error) { console.error("Shops fetch error", error); }
    };

    const fetchMedicines = async () => {
        try {
            const response = await fetch('http://localhost:5000/medicines');
            if (response.ok) setMedicines(await response.json());
        } catch (error) { console.error("Medicines fetch error", error); }
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:5000/admin/users');
            if (response.ok) setUsers(await response.json());
        } catch (error) { console.error("Users fetch error", error); }
    };

    const fetchSubsidies = async () => {
        try {
            const response = await fetch('http://localhost:5000/subsidies');
            if (response.ok) setSubsidies(await response.json());
        } catch (error) { console.error("Subsidies fetch error", error); }
    };

    const fetchProposals = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/admin/proposals');
            if (response.ok) setProposals(await response.json());
        } catch (error) { console.error("Proposals fetch error", error); }
    };

    const fetchTreatments = async () => {
        try {
            const response = await fetch('http://localhost:5000/treatments');
            if (response.ok) setDiseaseData(await response.json());
        } catch (error) { console.error("Treatments fetch error", error); }
    };

    const handleAddSubsidy = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('title', newSubsidy.title);
            formData.append('description', newSubsidy.description);
            formData.append('link', newSubsidy.link);
            if (newSubsidy.image) {
                formData.append('image', newSubsidy.image);
            }
            if (newSubsidy.brochure) {
                formData.append('brochure', newSubsidy.brochure);
            }

            const res = await fetch('http://localhost:5000/admin/subsidies', {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                setNewSubsidy({ title: '', description: '', link: '', image: null });
                fetchSubsidies();
                alert("Scheme added successfully!");
            } else {
                alert("Failed to add scheme");
            }
        } catch (e) {
            console.error(e);
            alert("Error submitting scheme");
        }
    };

    const handleDeleteSubsidy = async (id) => {
        if (!confirm('Delete this scheme?')) return;
        try {
            await fetch(`http://localhost:5000/admin/subsidies/${id}`, { method: 'DELETE' });
            fetchSubsidies();
        } catch (e) { console.error(e); }
    };

    const handleProposalAction = async (id, action) => {
        let reason = '';
        if (action === 'reject') {
            reason = prompt("Please provide a reason for rejection:");
            if (reason === null) return; // Cancelled
        } else {
            if (!confirm(`Approve this proposal?`)) return;
        }

        try {
            const res = await fetch(`http://localhost:5000/api/admin/proposals/${id}/${action}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason })
            });
            if (res.ok) {
                fetchProposals();
                fetchTreatments();
                alert(`Proposal ${action}ed successfully`);
            } else {
                alert("Action failed");
            }
        } catch (e) { console.error(e); }
    };

    const handleDeleteShop = async (id) => {
        if (!confirm('Are you sure you want to delete this shop?')) return;
        try {
            const res = await fetch(`http://localhost:5000/admin/shops/${id}`, { method: 'DELETE' });
            if (res.ok) fetchShops();
        } catch (e) { console.error(e); }
    };

    const handleDeleteMedicine = async (id) => {
        if (!confirm('Are you sure you want to delete this medicine?')) return;
        try {
            const res = await fetch(`http://localhost:5000/admin/medicines/${id}`, { method: 'DELETE' });
            if (res.ok) fetchMedicines();
        } catch (e) { console.error(e); }
    };

    const handleSuspendUser = async (id, currentStatus) => {
        const action = currentStatus ? 'Activate' : 'Suspend';
        if (!confirm(`Are you sure you want to ${action} this user? (ID: ${id})`)) return;
        try {
            const res = await fetch(`http://localhost:5000/admin/users/${id}/suspend`, { method: 'PUT' });
            if (res.ok) {
                alert("User status updated successfully!");
                fetchUsers();
            } else {
                alert("Failed to update user status");
            }
        } catch (e) {
            alert("Error: " + e.message);
            console.error(e);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!confirm(`Are you sure you want to delete this user? (ID: ${id})`)) return;
        try {
            const res = await fetch(`http://localhost:5000/admin/users/${id}`, { method: 'DELETE' });
            if (res.ok) {
                alert("User deleted successfully!");
                fetchUsers();
            } else {
                alert("Failed to delete user");
            }
        } catch (e) {
            alert("Error: " + e.message);
            console.error(e);
        }
    };

    const handleCreateUser = async (userData) => {
        if (!userData.username || !userData.password) return alert("Username and Password are required");

        try {
            const formData = new FormData();
            formData.append('username', userData.username);
            formData.append('password', userData.password);
            formData.append('name', userData.name);
            formData.append('role', userData.role);
            formData.append('phone', userData.phone);

            if (userData.role === 'expert') {
                formData.append('specialization', userData.specialization);
            }

            if (userData.profile_image) {
                formData.append('profile_image', userData.profile_image);
            }

            const res = await fetch('http://localhost:5000/admin/users/create', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();
            if (res.ok) {
                alert(`${userData.role === 'expert' ? 'Expert' : 'User'} account created successfully!`);
                fetchUsers();
            } else {
                alert(data.error || "Failed to create user");
            }
        } catch (error) {
            console.error("Error creating user:", error);
            alert("Server connection error");
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = (user.name?.toLowerCase() || '').includes(globalSearch.toLowerCase()) ||
            (user.username?.toLowerCase() || '').includes(globalSearch.toLowerCase()) ||
            (user.email?.toLowerCase() || '').includes(globalSearch.toLowerCase());

        const matchesRole = globalRole === 'all'
            ? true
            : globalRole === 'expert'
                ? user.role === 'expert'
                : (user.role === 'user' || user.role === 'farmer');

        return matchesSearch && matchesRole;
    });

    const handleAnalyze = (result) => {
        setAnalysisResult(result);
    };

    const handleReset = () => {
        setAnalysisResult(null);
    };

    if (user.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md border border-red-100">
                    <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-800">Access Denied</h2>
                    <p className="text-slate-700 mt-2 mb-6">Restricted area. Administrator privileges required.</p>
                    <button
                        onClick={onLogout}
                        className="bg-red-50 text-red-600 px-6 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        );
    }

    const stats = {
        users: users.length,
        shops: shops.length,
        medicines: medicines.length,
        activity: logs.length
    };

    return (
        <div className="flex w-full min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/50 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full animate-pulse-slow pointer-events-none z-0" />
            
            <div className="flex-1 w-full overflow-x-hidden overflow-y-auto relative z-10 custom-scrollbar p-8 pt-36 text-slate-900 min-h-screen">
                {/* Subtle animated background elements */}
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-emerald-900/30 to-transparent pointer-events-none" />
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full pointer-events-none" />
                <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] bg-teal-600/10 rounded-full pointer-events-none" />

                <div className="w-full mx-auto space-y-10 animate-fade-in-up relative z-10 transition-all duration-500">

                    <DashboardStats counts={stats} />





                    <div className="transition-all duration-500 ease-in-out">
                        {activeTab === 'users' && (
                            <div className="space-y-10">
                                {/* Global Unified Search & Filter Bar */}
                                <div className="flex flex-col lg:flex-row gap-4 justify-between items-center relative z-10 bg-white/80 p-3 rounded-2xl border border-slate-200/80 backdrop-blur-xl shadow-xl">
                                    <div className="flex w-full lg:w-auto bg-slate-100 p-1.5 rounded-[1.1rem]">
                                        {['all', 'user', 'expert'].map(role => (
                                            <button
                                                key={role}
                                                onClick={() => setGlobalRole(role)}
                                                className={`flex-1 lg:flex-none px-6 py-2.5 rounded-xl text-sm font-bold capitalize transition-all duration-300 ${globalRole === role
                                                    ? 'bg-white backdrop-blur-xl border-emerald-500/20 text-indigo-800 shadow-md transform scale-[1.02]'
                                                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                                                    }`}
                                            >
                                                {role === 'user' ? 'Farmers' : role === 'all' ? 'All Users' : 'Experts'}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="relative w-full lg:w-96">
                                        <input
                                            type="text"
                                            placeholder="Search logs and users..."
                                            className="pl-12 pr-4 py-3 bg-white backdrop-blur border border-slate-200/80 focus:border-indigo-500 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 w-full font-medium text-slate-700 placeholder-slate-400 shadow-sm transition-all"
                                            value={globalSearch}
                                            onChange={(e) => setGlobalSearch(e.target.value)}
                                        />
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1 bg-indigo-50/50 rounded-lg">
                                            <Search className="w-5 h-5 text-indigo-400" />
                                        </div>
                                    </div>
                                </div>

                                <UserManagement
                                    users={filteredUsers}
                                    logs={logs}
                                    onSuspend={handleSuspendUser}
                                    onDelete={handleDeleteUser}
                                    onCreateUser={handleCreateUser}
                                    onMessage={(target) => {
                                        setMessageTarget(target);
                                        setActiveTab('messages');
                                    }}
                                />
                            </div>
                        )}

                        {activeTab === 'analytics' && <UserAnalysis users={users} />}



                        {activeTab === 'dataset' && <DatasetManager />}

                        {activeTab === 'announcements' && <AdminAnnouncements />}

                        {activeTab === 'forum' && <ForumManagement />}

                        {activeTab === 'messages' && <Messaging user={user} initialContact={messageTarget} />}

                        {activeTab === 'shops' && (
                            <div className="space-y-8">
                                <div className="bg-white backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border border-emerald-500/10 hover-lift">
                                    <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                                        <div className="p-2 bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.3)] rounded-xl">
                                            <Store className="w-6 h-6 text-emerald-700" />
                                        </div>
                                        Store Management
                                    </h2>
                                    <ShopForm
                                        initialData={editingShop}
                                        onSuccess={() => { fetchShops(); setEditingShop(null); }}
                                        onCancel={() => setEditingShop(null)}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {shops.map(shop => (
                                        <div key={shop._id} className="bg-white backdrop-blur-xl rounded-[2rem] shadow-xl border border-emerald-500/10 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] hover:border-emerald-500/30 transition-all duration-300 flex flex-col overflow-hidden group hover:-translate-y-2">
                                            <div className="h-56 overflow-hidden bg-slate-100 relative">
                                                {shop.photo ? (
                                                    <img
                                                        src={shop.photo}
                                                        alt={shop.name}
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center w-full h-full text-slate-700 bg-slate-100">
                                                        <Store className="w-16 h-16" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                                                    <a
                                                        href={shop.map_link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-slate-900 text-sm font-bold flex items-center gap-2 hover:text-emerald-700 transition-colors drop-shadow-md"
                                                    >
                                                        <MapPin className="w-4 h-4" /> View Map Location
                                                    </a>
                                                </div>
                                            </div>
                                            <div className="p-8 flex-1 bg-white relative">
                                                <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
                                                    <Store className="w-24 h-24 transform rotate-12 text-emerald-500" />
                                                </div>
                                                <div className="flex items-start justify-between gap-2 mb-6">
                                                    <div>
                                                        <h3 className="font-black text-slate-900 text-xl leading-tight group-hover:text-emerald-700 transition-colors">{shop.name}</h3>
                                                        <p className="text-sm text-emerald-500 font-bold mt-1.5 uppercase tracking-widest">{shop.location || 'Location N/A'}</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-4 text-sm text-slate-800 font-medium">
                                                    <p className="flex items-start gap-4">
                                                        <div className="p-1.5 bg-slate-100 rounded-lg">
                                                            <MapPin className="w-4 h-4 text-slate-700" />
                                                        </div>
                                                        <span className="flex-1 mt-1 leading-relaxed text-slate-700">{shop.address}</span>
                                                    </p>
                                                    <p className="flex items-center gap-4">
                                                        <div className="p-1.5 bg-slate-100 rounded-lg">
                                                            <Phone className="w-4 h-4 text-slate-700" />
                                                        </div>
                                                        <span className="font-mono text-slate-700">{shop.contact}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="px-6 py-5 bg-white border-t border-slate-800 flex gap-4">
                                                <button
                                                    onClick={() => {
                                                        setEditingShop(shop);
                                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                                    }}
                                                    className="flex-1 px-4 py-3 rounded-xl text-sm font-bold bg-slate-100 border border-slate-200 text-slate-700 hover:bg-emerald-900/40 hover:text-emerald-700 hover:border-emerald-500/50 transition-all flex items-center justify-center gap-2 shadow-sm"
                                                >
                                                    <Edit className="w-4 h-4" /> Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteShop(shop._id)}
                                                    className="flex-1 px-4 py-3 rounded-xl text-sm font-bold bg-slate-100 border border-slate-200 text-red-400 hover:bg-red-900/40 hover:text-red-400 hover:border-red-500/50 transition-all flex items-center justify-center gap-2 shadow-sm"
                                                >
                                                    <Trash2 className="w-4 h-4" /> Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'medicines' && (
                            <div className="space-y-8">
                                <div className="bg-white backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border border-emerald-500/10 hover-lift">
                                    <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                                        <div className="p-2 bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.3)] rounded-xl">
                                            <Pill className="w-6 h-6 text-emerald-700" />
                                        </div>
                                        Medicine Registry
                                    </h2>
                                    <MedicineForm
                                        initialData={editingMedicine}
                                        onSuccess={() => { fetchMedicines(); setEditingMedicine(null); }}
                                        onCancel={() => setEditingMedicine(null)}
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row justify-between items-center bg-white backdrop-blur-xl p-4 px-6 rounded-2xl shadow-xl border border-emerald-500/10 hover:border-emerald-500/30 gap-4 transition-colors">
                                    <div className="flex items-center gap-3 text-slate-700">
                                        <div className="p-1.5 bg-emerald-500/20 rounded-lg">
                                            <Pill className="w-5 h-5 text-emerald-700" />
                                        </div>
                                        <span className="font-black tracking-wide text-slate-900">Filter Inventory:</span>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {['All', 'Organic', 'Inorganic', 'Homemade'].map(type => {
                                            const isActive = medicineFilter === type;
                                            let count = 0;
                                            if (type === 'All') count = medicines.length;
                                            else if (type === 'Inorganic') {
                                                count = medicines.filter(m => m.type === 'Inorganic').length;
                                            }
                                            else count = medicines.filter(m => m.type === type).length;

                                            let activeClass = 'bg-slate-200 text-slate-900 border-slate-600 shadow-slate-900/50';
                                            let inactiveClass = 'bg-slate-100 backdrop-blur-sm text-slate-800 border-slate-200/80 hover:bg-slate-100 hover:text-slate-800';

                                            if (type === 'Organic') {
                                                activeClass = 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-500/30';
                                                inactiveClass = 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200 hover:border-emerald-400';
                                            } else if (type === 'Inorganic') {
                                                activeClass = 'bg-orange-600 text-white border-orange-500 shadow-orange-500/30';
                                                inactiveClass = 'bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-200 hover:border-orange-400';
                                            } else if (type === 'Homemade') {
                                                activeClass = 'bg-purple-600 text-white border-purple-500 shadow-purple-500/30';
                                                inactiveClass = 'bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200 hover:border-purple-400';
                                            }

                                            return (
                                                <button
                                                    key={type}
                                                    onClick={() => setMedicineFilter(type)}
                                                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 border shadow-md flex items-center gap-2.5 ${isActive
                                                        ? `${activeClass} shadow-[0_0_20px_rgba(0,0,0,0.3)] transform scale-105`
                                                        : `${inactiveClass}`
                                                        }`}
                                                >
                                                    {type}
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest ${isActive ? 'bg-white text-slate-900' : 'bg-white text-slate-700'}`}>
                                                        {count}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {medicines
                                        .filter(med => {
                                            if (medicineFilter === 'All') return true;
                                            if (medicineFilter === 'Inorganic') {
                                                return med.type === 'Inorganic';
                                            }
                                            return med.type === medicineFilter;
                                        })
                                        .map(med => (
                                            <div key={med._id} className="bg-white backdrop-blur-xl p-8 rounded-[2rem] shadow-xl border border-emerald-500/10 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] hover:border-emerald-500/30 transition-all duration-300 group relative overflow-hidden flex flex-col hover:-translate-y-2">
                                                {/* Ambient Background Glow based on type */}
                                                <div className={`absolute -right-20 -top-20 w-48 h-48 rounded-full blur-[80px] pointer-events-none opacity-20 transition-opacity duration-500 group-hover:opacity-40
                                                    ${med.type === 'Organic' ? 'bg-emerald-500' : med.type === 'Inorganic' ? 'bg-orange-500' : med.type === 'Homemade' ? 'bg-purple-500' : 'bg-blue-500'}`} />

                                                <div className="absolute top-6 right-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                                                    <button onClick={() => { setEditingMedicine(med); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="p-2.5 bg-slate-50/90 backdrop-blur border border-slate-200 text-slate-800 hover:text-emerald-700 hover:border-emerald-500/50 hover:bg-emerald-900/40 rounded-xl shadow-md transition-colors"><Edit className="w-4 h-4" /></button>
                                                    <button onClick={() => handleDeleteMedicine(med._id)} className="p-2.5 bg-slate-50/90 backdrop-blur border border-slate-200 text-slate-800 hover:text-red-400 hover:border-red-500/50 hover:bg-red-900/40 rounded-xl shadow-md transition-colors"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                                <div className="flex justify-between items-start mb-6 relative z-10">
                                                    <div>
                                                        <h3 className="font-black text-xl text-slate-900 pr-24 group-hover:text-emerald-700 transition-colors">{med.name}</h3>
                                                        <span className={`inline-flex px-3 py-1 rounded-[0.5rem] text-[10px] font-black uppercase tracking-widest mt-3 border shadow-sm
                                                            ${med.type === 'Organic' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                                                                med.type === 'Inorganic' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                                                                    med.type === 'Homemade' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                                                                        'bg-slate-100 text-slate-800 border-slate-300'}`}>
                                                            {med.type}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="space-y-5 relative z-10 flex-1">
                                                    <div className="text-sm">
                                                        <p className="text-slate-700 text-[11px] uppercase tracking-widest font-black mb-2 flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-200" /> Target
                                                        </p>
                                                        <p className="text-slate-800 font-medium">
                                                            <span className="font-bold text-slate-800">{med.plant}</span> - {med.diseases}
                                                        </p>
                                                    </div>
                                                    <div className="text-sm flex-1">
                                                        <p className="text-slate-700 text-[11px] uppercase tracking-widest font-black mb-2 flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-200" /> Usage
                                                        </p>
                                                        <p className="text-slate-700 font-medium leading-relaxed bg-slate-50/50 backdrop-blur-sm p-4 rounded-xl border border-slate-800 shadow-inner h-full">
                                                            {med.usage}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'detection' && (
                            <div className="space-y-6">
                                {/* Model Management Section */}
                                <div className="bg-white backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border border-emerald-500/10 hover-lift">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-900 mb-2">AI Model Management</h2>
                                            <p className="text-slate-800 text-sm font-medium">Update the detection model with latest data.</p>
                                        </div>
                                        <RetrainPanel />
                                    </div>
                                </div>

                                <div className="bg-white backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border border-emerald-500/10 hover-lift relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-bl-full opacity-30 pointer-events-none" />
                                    <div className="max-w-3xl mx-auto relative z-10">
                                        <h2 className="text-2xl font-black text-slate-900 text-center mb-8 flex items-center justify-center gap-3">
                                            <div className="p-2 bg-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.3)] rounded-xl">
                                                <ScanLine className="w-6 h-6 text-indigo-700" />
                                            </div>
                                            Disease Detection Test
                                        </h2>
                                        {!analysisResult ? (
                                            <UploadAnalyzer onAnalyze={handleAnalyze} />
                                        ) : (
                                            <ResultsDisplay result={analysisResult} onReset={handleReset} />
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'subsidies' && (
                            <div className="space-y-6">
                                <div className="bg-white backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border border-emerald-500/10 hover-lift relative overflow-hidden group/form">
                                    <div className="absolute -inset-1 bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10 rounded-[3rem] blur-2xl opacity-50 group-hover/form:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                                    <div className="relative z-10">
                                        <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                                            <div className="p-2 bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.3)] rounded-xl">
                                                <Flag className="w-6 h-6 text-emerald-700" />
                                            </div>
                                            Post New Scheme
                                        </h2>
                                        <form onSubmit={handleAddSubsidy} className="space-y-6">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black tracking-widest text-slate-800 uppercase ml-1">Scheme Title</label>
                                                <input
                                                    type="text"
                                                    placeholder="Enter brief, clear title"
                                                    value={newSubsidy.title}
                                                    onChange={(e) => setNewSubsidy({ ...newSubsidy, title: e.target.value })}
                                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/90 px-4 py-3 text-slate-800 placeholder-slate-500 font-medium shadow-sm hover:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white focus:outline-none transition-all"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black tracking-widest text-slate-800 uppercase ml-1">Description & Eligibility</label>
                                                <textarea
                                                    placeholder="Describe the scheme benefits and who is eligible..."
                                                    value={newSubsidy.description}
                                                    onChange={(e) => setNewSubsidy({ ...newSubsidy, description: e.target.value })}
                                                    className="w-full min-h-[120px] rounded-xl border border-slate-200 bg-slate-50/90 px-4 py-3 text-slate-800 placeholder-slate-500 font-medium shadow-sm hover:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white focus:outline-none transition-all resize-y"
                                                    required
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black tracking-widest text-slate-800 uppercase ml-1">Official Link</label>
                                                    <input
                                                        type="url"
                                                        placeholder="https://..."
                                                        value={newSubsidy.link}
                                                        onChange={(e) => setNewSubsidy({ ...newSubsidy, link: e.target.value })}
                                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/90 px-4 py-3 text-slate-800 placeholder-slate-500 font-medium shadow-sm hover:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white focus:outline-none transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-1 bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex flex-col justify-center">
                                                    <div className="relative">
                                                        <label className="text-[10px] font-black tracking-widest text-slate-800 uppercase mb-2 block">Cover Image</label>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => setNewSubsidy({ ...newSubsidy, image: e.target.files[0] })}
                                                            className="w-full text-sm text-slate-800 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-emerald-500/30 file:text-xs file:font-bold file:bg-emerald-900/20 file:text-emerald-700 hover:file:bg-emerald-900/40 cursor-pointer"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                type="submit"
                                                className="w-full bg-emerald-600/90 hover:bg-emerald-1000 hover:-translate-y-1 text-white py-4 rounded-xl font-bold shadow-sm hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-2 mt-4"
                                            >
                                                <CheckCircle className="w-5 h-5" /> Publish New Scheme
                                            </button>
                                        </form>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {subsidies.map(sub => (
                                        <div key={sub._id} className="bg-white backdrop-blur-md p-6 rounded-2xl shadow-xl border border-slate-800 flex justify-between items-start transition-all hover:border-emerald-500/30 group">
                                            <div className="flex flex-col sm:flex-row gap-6 w-full">
                                                {sub.image && (
                                                    <img
                                                        src={`http://localhost:5000/uploads/${sub.image}`}
                                                        alt={sub.title}
                                                        className="w-full sm:w-32 h-40 sm:h-32 object-cover rounded-xl border border-slate-200 shadow-md group-hover:border-emerald-500/40 transition-colors"
                                                    />
                                                )}
                                                <div className="flex-1">
                                                    <h3 className="font-extrabold text-xl text-slate-900 group-hover:text-emerald-700 transition-colors">{sub.title}</h3>
                                                    <p className="text-slate-800 mt-2 text-sm leading-relaxed whitespace-pre-line bg-slate-100/50 p-3 rounded-xl border border-slate-200/80">{sub.description}</p>
                                                    <div className="flex flex-wrap items-center justify-between mt-4">
                                                        <div className="flex items-center gap-4">
                                                            {sub.link && (
                                                                <a href={sub.link} target="_blank" rel="noreferrer" className="text-emerald-700 text-sm font-bold hover:text-emerald-700 hover:underline flex items-center gap-1 bg-emerald-900/20 px-3 py-1.5 rounded-lg border border-emerald-900/40">
                                                                    Visit Official Platform <ArrowRight className="w-3.5 h-3.5" />
                                                                </a>
                                                            )}
                                                        </div>
                                                        <div className="text-[10px] text-slate-700 font-mono font-bold tracking-widest uppercase bg-white px-3 py-1.5 rounded-lg border border-slate-800">
                                                            PSTD: {sub.date_posted}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteSubsidy(sub._id)}
                                                className="p-2 ml-4 text-slate-700 hover:text-red-400 hover:bg-red-950/30 rounded-xl border border-transparent hover:border-red-900/50 transition-all shrink-0"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'proposals' && (
                            <div className="space-y-8">
                                <h2 className="text-2xl font-bold text-slate-900 mb-6">Review Proposals</h2>

                                {/* DERIVED STATE */}
                                {(() => {
                                    const pendingProposals = proposals.filter(p => !p.status || p.status === 'pending');
                                    const historyProposals = proposals.filter(p => p.status === 'accepted' || p.status === 'rejected');

                                    return (
                                        <>
                                            {pendingProposals.length === 0 ? (
                                                <div className="text-center p-12 bg-white backdrop-blur-xl rounded-[2rem] shadow-2xl border border-emerald-500/10 text-slate-800">
                                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                                                        <CheckCircle className="w-8 h-8 text-emerald-500" />
                                                    </div>
                                                    <p className="text-lg font-medium text-slate-700">No pending proposals</p>
                                                    <p className="text-sm">All caught up!</p>
                                                </div>
                                            ) : (
                                                <>
                                                    {/* SECTION 1: New Remedy Suggestions (Community/Farmer) */}
                                                    {pendingProposals.filter(p => !p.changes).length > 0 && (
                                                        <div>
                                                            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                                                <div className="p-1.5 bg-orange-500/20 text-orange-400 rounded-lg shadow-[0_0_15px_rgba(249,115,22,0.2)]">
                                                                    <Pill className="w-4 h-4" />
                                                                </div>
                                                                New Remedy Suggestions
                                                            </h3>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                                                                {pendingProposals.filter(p => !p.changes).map(prop => (
                                                                    <div key={prop._id} className="bg-white backdrop-blur-xl rounded-[2rem] shadow-xl border border-orange-500/20 overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-2 group hover:shadow-[0_0_30px_rgba(249,115,22,0.15)] relative">
                                                                        <div className="p-6 md:p-8 flex-1 relative z-10">
                                                                            {/* Decorative Background Element */}
                                                                            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-orange-500/20 to-transparent rounded-bl-full opacity-30 pointer-events-none" />
                                                                            
                                                                            <div className="flex justify-between items-start mb-6 relative z-10">
                                                                                <div className="flex-1 pr-4">
                                                                                    <div className="flex items-center gap-3 mb-2">
                                                                                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-orange-100/80 text-orange-700 border border-orange-200 uppercase tracking-wide">
                                                                                            {prop.type || 'Homemade'}
                                                                                        </span>
                                                                                        <span className="text-xs text-slate-800 font-medium flex items-center gap-1">
                                                                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                                                                                            {new Date(prop.timestamp).toLocaleDateString()}
                                                                                        </span>
                                                                                    </div>
                                                                                    <h4 className="text-2xl font-extrabold text-slate-900 leading-tight group-hover:text-orange-600 transition-colors">{prop.name}</h4>
                                                                                </div>
                                                                                
                                                                                {/* User Profile */}
                                                                                <div className="flex flex-col items-center gap-1 shrink-0 bg-slate-100 p-2 rounded-xl border border-slate-200 shadow-md">
                                                                                    {prop.user_image ? (
                                                                                        <img src={`http://localhost:5000/uploads/${prop.user_image}`} alt={prop.submitted_by} className="w-12 h-12 rounded-full object-cover shadow-sm ring-2 ring-slate-700" />
                                                                                    ) : (
                                                                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-slate-800 shadow-inner ring-2 ring-slate-700">
                                                                                            <User className="w-6 h-6" />
                                                                                        </div>
                                                                                    )}
                                                                                    <span className="text-[10px] font-bold text-slate-800 max-w-[60px] truncate text-center" title={prop.submitted_by}>
                                                                                        {prop.submitted_by}
                                                                                    </span>
                                                                                </div>
                                                                            </div>

                                                                            <div className="space-y-4 text-sm relative z-10">
                                                                                <div className="flex gap-4 p-4 bg-white rounded-xl border border-slate-800">
                                                                                    <div className="flex-1">
                                                                                        <span className="text-[10px] font-black tracking-wider text-slate-700 uppercase mb-1 flex items-center gap-1">
                                                                                            <TreePine className="w-3 h-3 text-emerald-500" /> Target Plant
                                                                                        </span>
                                                                                        <p className="font-bold text-slate-800">{prop.plant}</p>
                                                                                    </div>
                                                                                    <div className="w-px bg-slate-100" />
                                                                                    <div className="flex-1">
                                                                                        <span className="text-[10px] font-black tracking-wider text-slate-700 uppercase mb-1 flex items-center gap-1">
                                                                                            <AlertCircle className="w-3 h-3 text-red-400" /> Target Disease
                                                                                        </span>
                                                                                        <p className="font-bold text-slate-800">{prop.diseases}</p>
                                                                                    </div>
                                                                                </div>
                                                                                
                                                                                <div>
                                                                                    <span className="text-[10px] font-black tracking-wider text-slate-700 uppercase mb-1.5 block">Symptoms Treated</span>
                                                                                    <p className="text-slate-700 bg-white p-3 rounded-xl border border-slate-800 leading-relaxed italic border-l-2 border-l-slate-600">"{prop.symptoms}"</p>
                                                                                </div>
                                                                                
                                                                                <div>
                                                                                    <span className="text-[10px] font-black tracking-wider text-orange-500 uppercase mb-1.5 block">Preparation & Usage</span>
                                                                                    <p className="text-slate-800 bg-orange-50/80 p-4 rounded-xl border border-orange-200 leading-relaxed font-medium shadow-inner">
                                                                                        {prop.usage}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        
                                                                        <div className="px-6 py-4 bg-white border-t border-slate-100 flex gap-4 relative z-10">
                                                                            <button
                                                                                onClick={() => handleProposalAction(prop._id, 'approve')}
                                                                                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 outline-none focus:ring-4 focus:ring-emerald-500/20 text-white px-4 py-3.5 rounded-xl hover:bg-emerald-500 text-sm font-bold shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] transition-all group/btn"
                                                                            >
                                                                                <CheckCircle className="w-5 h-5 group-hover/btn:scale-110 transition-transform drop-shadow-sm" /> Approve
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleProposalAction(prop._id, 'reject')}
                                                                                className="flex-[0.4] flex items-center justify-center gap-2 bg-white text-rose-500 px-4 py-3.5 rounded-xl hover:bg-rose-50 hover:text-rose-600 border-2 border-slate-100 hover:border-rose-200 outline-none focus:ring-4 focus:ring-rose-500/20 text-sm font-bold transition-all group shadow-sm"
                                                                                title="Reject Proposal"
                                                                            >
                                                                                <XCircle className="w-5 h-5 group-hover:scale-110 transition-transform text-rose-500" />
                                                                                Reject
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* SECTION 2: Disease Data Updates (Scientific/Expert) */}
                                                    {pendingProposals.filter(p => p.changes).length > 0 && (
                                                        <div>
                                                            <h3 className="text-lg font-bold text-slate-900 mb-6 mt-12 flex items-center gap-2">
                                                                <div className="p-1.5 bg-indigo-500/20 text-indigo-700 rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                                                                    <GraduationCap className="w-4 h-4" />
                                                                </div>
                                                                Disease Data Updates
                                                            </h3>
                                                            <div className="space-y-6">
                                                                {pendingProposals.filter(p => p.changes).map(prop => (
                                                                    <div key={prop._id} className="bg-white backdrop-blur-xl rounded-[2rem] shadow-xl border border-indigo-500/20 overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-2 group hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] relative">
                                                                        {/* Header */}
                                                                        <div className="p-6 md:p-8 flex justify-between items-start bg-white border-b border-slate-800 relative z-10">
                                                                            {/* Decorative Background Element */}
                                                                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-bl-[100px] opacity-20 pointer-events-none" />
                                                                            <div>
                                                                                <div className="flex items-center gap-3 mb-2">
                                                                                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-100/80 text-indigo-700 border border-indigo-200 uppercase tracking-wide">
                                                                                        Scientific Update
                                                                                    </span>
                                                                                    <span className="text-xs font-mono bg-slate-100 px-3 py-1 rounded-lg text-slate-800 border border-slate-200 shadow-sm">ID: {prop.disease_id}</span>
                                                                                </div>
                                                                                <h4 className="text-2xl font-extrabold text-slate-900 leading-tight mb-2 group-hover:text-indigo-700 transition-colors">{prop.disease_name}</h4>
                                                                                <p className="text-sm text-slate-800 flex items-center gap-1.5">
                                                                                    By <span className="font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded border border-slate-200 shadow-sm">{prop.expert}</span> on {new Date(prop.timestamp).toLocaleString()}
                                                                                </p>
                                                                            </div>
                                                                        </div>

                                                                        {/* Changes Content */}
                                                                        <div className="p-6 md:p-8 space-y-6 relative z-10 bg-slate-50/20">
                                                                            {/* Description Change */}
                                                                            {prop.changes.description && (
                                                                                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                                                                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                                                                                        <span className="text-[10px] font-black tracking-wider text-slate-800 uppercase">Updated Description</span>
                                                                                    </div>
                                                                                    <div className="p-4 text-sm text-slate-700 leading-relaxed bg-blue-50/80 border-l-4 border-l-blue-400">
                                                                                        {prop.changes.description}
                                                                                    </div>
                                                                                </div>
                                                                            )}

                                                                            {/* Symptoms Change */}
                                                                            {prop.changes.symptoms && prop.changes.symptoms.length > 0 && (
                                                                                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm mt-6">
                                                                                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                                                                                        <span className="text-[10px] font-black tracking-wider text-slate-800 uppercase">Updated Symptoms</span>
                                                                                    </div>
                                                                                    <ul className="p-4 text-sm text-slate-700 space-y-2 bg-rose-50/80 border-l-4 border-l-rose-400">
                                                                                        {Array.isArray(prop.changes.symptoms) ? (
                                                                                            prop.changes.symptoms.map((sym, i) => (
                                                                                                <li key={i} className="flex items-start gap-2">
                                                                                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                                                                                                    <span className="leading-snug">{sym}</span>
                                                                                                </li>
                                                                                            ))
                                                                                        ) : (
                                                                                            <span className="leading-snug">{prop.changes.symptoms}</span>
                                                                                        )}
                                                                                    </ul>
                                                                                </div>
                                                                            )}

                                                                            {/* Treatments Change */}
                                                                            {prop.changes.treatments && (
                                                                                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm mt-6 mb-2">
                                                                                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                                                                                        <span className="text-[10px] font-black tracking-wider text-slate-800 uppercase">Updated Protocol</span>
                                                                                    </div>
                                                                                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 bg-emerald-50/80 border-l-4 border-l-emerald-400">
                                                                                        {['organic', 'inorganic', 'homemade'].map(type => (
                                                                                            prop.changes.treatments[type] && prop.changes.treatments[type].length > 0 && (
                                                                                                <div key={type} className="bg-white border border-emerald-200 p-4 rounded-xl shadow-sm">
                                                                                                    <h5 className="font-bold text-xs uppercase tracking-wider text-emerald-600 mb-3 border-b border-emerald-100 pb-2">{type} Options</h5>
                                                                                                    <ul className="space-y-2">
                                                                                                        {prop.changes.treatments[type].map((t, idx) => (
                                                                                                            <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                                                                                                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                                                                                                <span className="leading-tight">{typeof t === 'string' ? t : t.name}</span>
                                                                                                            </li>
                                                                                                        ))}
                                                                                                    </ul>
                                                                                                </div>
                                                                                            )
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        {/* Action Bar */}
                                                                        <div className="px-6 py-4 bg-white border-t border-slate-100 flex gap-4 mt-auto relative z-10">
                                                                            <button
                                                                                onClick={() => handleProposalAction(prop._id, 'approve')}
                                                                                className="flex flex-1 items-center justify-center gap-2 bg-indigo-600 outline-none focus:ring-4 focus:ring-indigo-500/20 text-white px-4 py-3.5 rounded-xl hover:bg-indigo-500 text-sm font-bold shadow-[0_4px_15px_rgba(99,102,241,0.3)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.4)] transition-all group/btn"
                                                                            >
                                                                                <CheckCircle className="w-5 h-5 group-hover/btn:scale-110 transition-transform drop-shadow-sm" /> Merge Update
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleProposalAction(prop._id, 'reject')}
                                                                                className="flex-[0.4] flex items-center justify-center gap-2 bg-white text-rose-500 px-4 py-3.5 rounded-xl hover:bg-rose-50 hover:text-rose-600 border-2 border-slate-100 hover:border-rose-200 outline-none focus:ring-4 focus:ring-rose-500/20 text-sm font-bold transition-all group shadow-sm"
                                                                                title="Reject Update"
                                                                            >
                                                                                <XCircle className="w-5 h-5 group-hover:scale-110 transition-transform text-rose-500" />
                                                                                Reject
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}

                                            {/* SECTION 3: Proposal History */}
                                            {historyProposals.length > 0 && (
                                                <div className="mt-16">
                                                    <div className="flex items-center gap-4 mb-8">
                                                        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-800"></div>
                                                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest bg-white border border-slate-800 px-4 py-2 rounded-full shadow-sm">Proposal History</h3>
                                                        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-800"></div>
                                                    </div>

                                                    <div className="bg-white backdrop-blur-xl rounded-[2rem] shadow-2xl border border-emerald-500/10 overflow-hidden hover-lift">
                                                        <div className="overflow-x-auto">
                                                            <table className="min-w-full divide-y divide-slate-100">
                                                                <thead className="bg-white sticky top-0 backdrop-blur-md">
                                                                    <tr>
                                                                        <th className="px-8 py-5 text-left text-xs font-black text-slate-800 uppercase tracking-widest">Date</th>
                                                                        <th className="px-8 py-5 text-left text-xs font-black text-slate-800 uppercase tracking-widest">Proposal Details</th>
                                                                        <th className="px-8 py-5 text-left text-xs font-black text-slate-800 uppercase tracking-widest">Submitted By</th>
                                                                        <th className="px-8 py-5 text-left text-xs font-black text-slate-800 uppercase tracking-widest">Type</th>
                                                                        <th className="px-8 py-5 text-left text-xs font-black text-slate-800 uppercase tracking-widest">Status / Outcome</th>
                                                                        <th className="px-8 py-5 text-left text-xs font-black text-slate-800 uppercase tracking-widest">Reviewed Date</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-slate-100">
                                                                    {historyProposals.map((prop) => (
                                                                        <tr key={prop._id} className="hover:bg-slate-100 transition-colors group">
                                                                            <td className="px-8 py-5 text-sm text-slate-800 font-mono group-hover:text-amber-400 transition-colors">
                                                                                {new Date(prop.timestamp).toLocaleDateString()}
                                                                            </td>
                                                                            <td className="px-8 py-5 max-w-xs">
                                                                                <div className="font-bold text-slate-800 truncate">{prop.name || prop.disease_name}</div>
                                                                                <div className="text-xs text-slate-700 truncate mt-1">
                                                                                    {prop.changes ? 'Disease Data Update' : (prop.plant ? `${prop.plant} - ${prop.diseases}` : '')}
                                                                                </div>
                                                                            </td>
                                                                            <td className="px-8 py-5">
                                                                                <div className="flex items-center gap-3">
                                                                                    {prop.user_image ? (
                                                                                        <img src={`http://localhost:5000/uploads/${prop.user_image}`} alt={prop.submitted_by || prop.expert} className="w-10 h-10 rounded-full object-cover border-2 border-slate-200 shadow-sm" />
                                                                                    ) : (
                                                                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 border-2 border-slate-200 shadow-sm">
                                                                                            <User className="w-5 h-5" />
                                                                                        </div>
                                                                                    )}
                                                                                    <span className="text-sm font-bold text-slate-700 group-hover:text-slate-800">{prop.submitted_by || prop.expert}</span>
                                                                                </div>
                                                                            </td>
                                                                            <td className="px-8 py-5">
                                                                                <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-sm ${prop.changes
                                                                                    ? 'bg-indigo-100 text-indigo-700 border-indigo-300 shadow-indigo-500/10'
                                                                                    : 'bg-orange-100 text-orange-800 border-orange-300 shadow-orange-500/10'}`}>
                                                                                    {prop.changes ? 'Expert Update' : (prop.type || 'Remedy')}
                                                                                </span>
                                                                            </td>
                                                                            <td className="px-8 py-5">
                                                                                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${prop.status === 'accepted'
                                                                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                                                                    : 'bg-red-100 text-red-700 border-red-300'
                                                                                    }`}>
                                                                                    {prop.status === 'accepted' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                                                                    {prop.status === 'accepted' ? 'Approved' : 'Rejected'}
                                                                                </span>
                                                                                {prop.rejection_reason && (
                                                                                    <div className="text-[10px] text-red-700 mt-2 max-w-[150px] leading-tight bg-red-50 p-2 rounded-lg border border-red-200">
                                                                                        Reason: {prop.rejection_reason}
                                                                                    </div>
                                                                                )}
                                                                            </td>
                                                                            <td className="px-8 py-5 text-xs text-slate-700 font-mono">
                                                                                {prop.reviewed_at ? new Date(prop.reviewed_at).toLocaleDateString() : '-'}
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        )}

                        {
                            activeTab === 'knowledge' && (
                                <div>
                                    <div className="mb-6 flex justify-end">
                                        <RetrainPanel />
                                    </div>
                                    {diseaseData ? (
                                        <KnowledgeBase
                                            diseaseData={diseaseData}
                                            canEdit={true}
                                            isExpert={false}
                                            onUpdate={fetchTreatments}
                                        />
                                    ) : (
                                        <div className="p-12 text-center">
                                            <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                                            <p className="text-slate-700">Loading knowledge base...</p>
                                        </div>
                                    )}
                                </div>
                            )
                        }

                        {activeTab === 'feedback' && <FeedbackAnalysis />}

                    </div>
                </div>
            </div>
            
            {/* Embedded CSS for animations */}
            <style jsx>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-30px) rotate(5deg); }
                }
                .animate-blob {
                    animation: blob 10s infinite cubic-bezier(0.4, 0, 0.2, 1);
                }
                .animate-float {
                    animation: float 8s infinite ease-in-out;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </div>
    );
}

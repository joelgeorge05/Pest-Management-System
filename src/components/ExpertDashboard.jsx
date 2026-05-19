import React, { useState, useEffect } from 'react';

import { Microscope, MessageSquare, Send, CheckCircle, Clock, Star, Pill, History, Plus, User, FileText, ImageIcon, Stethoscope, Leaf, TreePine, Sprout } from 'lucide-react';
import Feedback from './Feedback';
import KnowledgeBase from './admin/KnowledgeBase';
import MedicineProposal from './MedicineProposal';
import Profile from './Profile';
import UserAnnouncements from './UserAnnouncements';
import Messaging from './Messaging';

export default function ExpertDashboard({ user, activeTab, setActiveTab }) {
    const [consultations, setConsultations] = useState([]);

    const [selectedConsultation, setSelectedConsultation] = useState(null);
    const [reply, setReply] = useState('');
    const [loading, setLoading] = useState(false);

    const [diseaseData, setDiseaseData] = useState(null);
    const [messageTarget, setMessageTarget] = useState(null);

    const fetchConsultations = async () => {
        try {
            const res = await fetch('http://localhost:5000/consultations');
            const data = await res.json();
            setConsultations(data);

            setSelectedConsultation(prev => {
                if (!prev) return null;
                const updated = data.find(c => c._id === prev._id);
                return updated || prev;
            });
        } catch (error) {
            console.error("Error fetching consultations:", error);
        }
    };

    useEffect(() => {
        fetchConsultations();
        fetchTreatments();
        const intervalId = setInterval(fetchConsultations, 5000);
        return () => clearInterval(intervalId);
    }, []);

    const fetchTreatments = async () => {
        try {
            const response = await fetch('http://localhost:5000/treatments');
            if (response.ok) setDiseaseData(await response.json());
        } catch (error) { console.error("Treatments fetch error", error); }
    };

    const handleReply = async (e) => {
        e.preventDefault();
        if (!reply.trim()) return;

        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/consultations/${selectedConsultation._id}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    expert: user.username,
                    message: reply
                })
            });

            if (res.ok) {
                setReply('');
                fetchConsultations(); // Refresh list
                setSelectedConsultation(null); // Close or update view
                alert("Reply sent successfully!");
            } else {
                alert("Failed to send reply");
            }
        } catch (error) {
            console.error("Error sending reply:", error);
        } finally {
            setLoading(false);
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'feedback':
                return <Feedback user={user} />;
            case 'medicines':
                return diseaseData ? (
                    <KnowledgeBase diseaseData={diseaseData} canEdit={true} onUpdate={fetchTreatments} isExpert={true} expertName={user.username} />
                ) : <div className="text-center py-8">Loading knowledge base...</div>;
            case 'propose':
                return <MedicineProposal user={user} />;
            case 'profile':
                return <Profile user={user} onUpdateUser={(u) => console.log(u)} />;
            case 'announcements':
                return <UserAnnouncements />;
            case 'messages':
                return <Messaging user={user} initialContact={messageTarget} />;
            case 'history':
            case 'consultations':
            default:
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Consultation List - Filter based on tab */}
                        <div className="lg:col-span-1 space-y-4">
                            <h2 className="text-xl font-bold tracking-tight text-slate-800 mb-4 flex items-center gap-2">
                                <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
                                    <MessageSquare className="w-5 h-5"/>
                                </div>
                                {activeTab === 'history' ? 'Replied History' : 'Active Requests'}
                            </h2>
                            <div className="space-y-3 h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                {consultations
                                    .filter(c => {
                                        const hasReplied = c.replies && c.replies.some(r => r.expert === user.username);
                                        if (activeTab === 'history') return hasReplied;
                                        return !hasReplied;
                                    })
                                    .map(consultation => (
                                        <div
                                            key={consultation._id}
                                            onClick={() => setSelectedConsultation(consultation)}
                                            className={`p-5 rounded-[1.5rem] border cursor-pointer hover-lift transition-all duration-300 relative overflow-hidden group ${selectedConsultation?._id === consultation._id ? 'border-indigo-500 bg-white ring-4 ring-indigo-500/10 shadow-xl shadow-indigo-900/5' : 'border-slate-200 bg-white/80 backdrop-blur-md hover:bg-gradient-to-br hover:from-white hover:to-indigo-50/50 hover:border-indigo-300 hover:shadow-lg shadow-sm'}`}
                                        >
                                            {/* Hover Glow Effect */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                                            <div className="flex justify-between items-start mb-3">
                                                <span className={`px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-sm border ${consultation.status === 'replied' || consultation.status === 'responded' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50' : 'bg-amber-50 text-amber-700 border-amber-200/50'}`}>
                                                    {consultation.status === 'replied' || consultation.status === 'responded' ? 'Resolved' : 'Action Required'}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">{new Date(consultation.timestamp).toLocaleDateString()}</span>
                                            </div>
                                            <h3 className="font-extrabold text-slate-900 text-lg group-hover:text-indigo-700 transition-colors">
                                                {consultation.crop && !consultation.crop.toLowerCase().includes('unknown') ? `${consultation.crop} - ` : ''}
                                                {consultation.disease}
                                            </h3>
                                            <div className="flex gap-4 mt-3">
                                                {consultation.image && (
                                                    <img src={consultation.image.startsWith('http') || consultation.image.startsWith('data:') ? consultation.image : `http://localhost:5000${consultation.image.startsWith('/') ? '' : '/'}${consultation.image}`} alt="Crop" className="w-20 h-20 rounded-xl object-cover border-2 border-slate-100 shadow-sm shrink-0" />
                                                )}
                                                <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                                    <p className="text-sm font-medium text-slate-600 truncate flex items-center gap-1.5">
                                                        <User className="w-4 h-4 text-slate-400" />
                                                        {consultation.farmer_name || consultation.farmer}
                                                    </p>
                                                    <div className="flex justify-start mt-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setMessageTarget({ username: consultation.farmer, role: 'user' });
                                                                setActiveTab('messages');
                                                            }}
                                                            className="px-3 py-1.5 bg-indigo-50 font-bold text-xs text-indigo-700 rounded-lg hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100 flex items-center gap-1.5 shadow-sm"
                                                            title="Direct Message"
                                                        >
                                                            <MessageSquare className="w-3.5 h-3.5" /> Message
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        {/* Detail View */}
                        <div className="lg:col-span-2">
                            {selectedConsultation ? (
                                <div className="glass rounded-[2rem] shadow-2xl shadow-indigo-900/5 border border-white/60 overflow-hidden h-[660px] flex flex-col animate-fade-in-up relative">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-bl-full pointer-events-none" />
                                    
                                    <div className="bg-white/90 backdrop-blur-xl p-8 border-b border-indigo-100/50 relative z-10">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
                                                    {selectedConsultation.crop && !selectedConsultation.crop.toLowerCase().includes('unknown') ? <span className="text-indigo-600 mr-2">{selectedConsultation.crop}</span> : ''}
                                                    {selectedConsultation.disease}
                                                </h2>
                                                <div className="flex items-center gap-4 text-sm font-medium mt-4">
                                                    <span className="flex items-center justify-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
                                                        <User className="w-4 h-4 text-indigo-500" />
                                                        <span className="text-slate-700">{selectedConsultation.farmer_name || selectedConsultation.farmer}</span>
                                                    </span>
                                                    <button
                                                        onClick={() => {
                                                            setMessageTarget({ username: selectedConsultation.farmer, role: 'user' });
                                                            setActiveTab('messages');
                                                        }}
                                                        className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100 flex items-center gap-2 shadow-sm font-bold"
                                                    >
                                                        <MessageSquare className="w-4 h-4" /> Message Direct
                                                    </button>
                                                    <span className="text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200">{new Date(selectedConsultation.timestamp).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-8 flex-1 overflow-y-auto bg-slate-50/50 custom-scrollbar">
                                        <div className="mb-8">
                                            <h4 className="flex items-center gap-2 text-[11px] font-black text-indigo-600 uppercase tracking-widest mb-3">
                                                <FileText className="w-4 h-4" /> Description
                                            </h4>
                                            <p className="text-slate-700 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm leading-relaxed text-[15px]">
                                                {selectedConsultation.description}
                                            </p>
                                        </div>

                                        {selectedConsultation.image && (
                                            <div className="mb-10">
                                                <h4 className="flex items-center gap-2 text-[11px] font-black text-indigo-600 uppercase tracking-widest mb-3">
                                                    <ImageIcon className="w-4 h-4" /> Uploaded Image
                                                </h4>
                                                <div className="bg-white p-2 rounded-3xl shadow-sm border border-slate-200 inline-block">
                                                    <img src={selectedConsultation.image.startsWith('http') || selectedConsultation.image.startsWith('data:') ? selectedConsultation.image : `http://localhost:5000${selectedConsultation.image.startsWith('/') ? '' : '/'}${selectedConsultation.image}`} alt="Crop Issue" className="rounded-2xl max-h-96 object-contain" />
                                                </div>
                                            </div>
                                        )}

                                        <div className="pt-2">
                                            <h4 className="flex items-center gap-2 text-[11px] font-black text-indigo-600 uppercase tracking-widest mb-5">
                                                <Stethoscope className="w-4 h-4" /> Clinical Responses
                                            </h4>

                                            {selectedConsultation.replies && selectedConsultation.replies.length > 0 ? (
                                                <div className="space-y-5">
                                                    {selectedConsultation.replies.map((reply, idx) => (
                                                        <div key={idx} className="flex gap-4 animate-fade-in-up" style={{animationDelay: `${idx * 0.1}s`}}>
                                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/30">
                                                                <Microscope className="w-6 h-6 text-white" />
                                                            </div>
                                                            <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-2xl rounded-tl-sm flex-1 relative">
                                                                <div className="flex justify-between items-center mb-3">
                                                                    <span className="font-extrabold text-indigo-900 text-lg">{reply.expert}</span>
                                                                    <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">{new Date(reply.timestamp).toLocaleString()}</span>
                                                                </div>
                                                                <p className="text-slate-600 leading-relaxed">{reply.message}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
                                                    <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <Stethoscope className="w-8 h-8 text-slate-400" />
                                                    </div>
                                                    <h3 className="text-lg font-bold text-slate-700">No Responses Yet</h3>
                                                    <p className="text-slate-500 text-sm mt-1">Provide your expert clinical advice below.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-6 bg-white border-t border-slate-200 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] z-20">
                                        <form onSubmit={handleReply}>
                                            <label className="block text-sm font-black text-slate-800 mb-2 uppercase tracking-wide">Write Clinical Advice</label>
                                            <div className="relative group">
                                                <textarea
                                                    value={reply}
                                                    onChange={e => setReply(e.target.value)}
                                                    placeholder="Detail your diagnosis and prescribe recommendations..."
                                                    className="w-full pl-5 pr-16 py-4 rounded-[1.5rem] border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 resize-none h-32 transition-all font-medium text-slate-700 placeholder-slate-400 bg-slate-50 focus:bg-white shadow-inner"
                                                    required
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="absolute bottom-4 right-4 p-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center"
                                                >
                                                    {loading ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div> : <Send className="w-5 h-5 ml-0.5" />}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-[660px] flex flex-col items-center justify-center text-slate-400 bg-white/40 backdrop-blur-xl border-2 border-dashed border-indigo-200 rounded-[2rem] shadow-sm relative overflow-hidden">
                                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                                    <div className="w-24 h-24 bg-white rounded-full shadow-lg shadow-indigo-500/10 border border-indigo-100 flex items-center justify-center mb-6 relative z-10">
                                        <Microscope className="w-12 h-12 text-indigo-400" />
                                    </div>
                                    <p className="text-xl font-extrabold tracking-tight text-slate-500 relative z-10">Select a consultation request to view clinical details</p>
                                </div>
                            )}
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-amber-50/40 selection:bg-amber-200 selection:text-amber-900 font-sans relative overflow-hidden">
            {/* Background Blobs for Vibrant Earth Theme */}
            <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-orange-200/40 rounded-full mix-blend-multiply filter blur-[100px] animate-blob pointer-events-none z-0" />
            <div className="absolute top-[20%] right-[-10%] w-[35rem] h-[35rem] bg-emerald-200/40 rounded-full mix-blend-multiply filter blur-[100px] animate-blob pointer-events-none z-0" style={{ animationDelay: '2s' }} />
            <div className="absolute bottom-[-20%] left-[20%] w-[45rem] h-[45rem] bg-amber-200/40 rounded-full mix-blend-multiply filter blur-[100px] animate-blob pointer-events-none z-0" style={{ animationDelay: '4s' }} />

            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-8 relative z-10 animate-fade-in-up">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                    <Microscope className="w-8 h-8 text-nature-600" />
                    Expert Dashboard
                </h1>
                <p className="text-slate-600 mt-2">Manage consultation requests from farmers.</p>
            </div>

            {renderContent()}
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

import React, { useState, useEffect } from 'react';
import { Microscope, Clock, MessageSquare, Plus } from 'lucide-react';

export default function Consultations({ user }) {
    const [consultations, setConsultations] = useState([]);
    const [selectedConsultation, setSelectedConsultation] = useState(null);

    const fetchConsultations = async () => {
        try {
            const res = await fetch('http://localhost:5000/consultations');
            const data = await res.json();
            // Filter by farmer username
            const myConsultations = data.filter(c => c.farmer === user.username);

            // Sort to put newest first based on timestamp
            myConsultations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            setConsultations(myConsultations);

            setSelectedConsultation(prev => {
                if (!prev) return null;
                const updated = myConsultations.find(c => c._id === prev._id);
                return updated || prev;
            });
        } catch (error) {
            console.error("Error fetching consultations:", error);
        }
    };

    useEffect(() => {
        fetchConsultations();
        const intervalId = setInterval(fetchConsultations, 5000);
        return () => clearInterval(intervalId);
    }, [user.username]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
            <div className="mb-10">
                <h1 className="text-4xl font-black text-slate-900 flex items-center gap-4 tracking-tight">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/40 to-orange-400/20 flex items-center justify-center text-amber-500 border border-amber-500/30 shadow-inner">
                        <Microscope className="w-8 h-8" />
                    </div>
                    My Consultations
                </h1>
                <p className="text-slate-600 mt-3 font-medium text-lg max-w-2xl">View your consultation history and expert guidance on crop health.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Consultation List */}
                <div className="lg:col-span-1 space-y-5">
                    <h2 className="text-2xl font-black text-slate-800 mb-5 tracking-tight">
                        Request History
                    </h2>
                    <div className="space-y-4 h-[650px] overflow-y-auto pr-3 custom-scrollbar list-none">
                        {consultations.length > 0 ? (
                            consultations.map((consultation, index) => (
                                <div
                                    key={consultation._id}
                                    onClick={() => setSelectedConsultation(consultation)}
                                    className={`glass-card p-5 cursor-pointer animate-fade-in-up transition-all duration-300 ${selectedConsultation?._id === consultation._id ? 'border-amber-400 bg-amber-50/60 ring-4 ring-amber-400/20 shadow-lg transform scale-[1.02]' : 'border-white/60 hover:border-amber-300 hover:shadow-md'}`}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm border ${consultation.status === 'replied' || consultation.status === 'responded' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-amber-100 text-amber-800 border-amber-200'}`}>
                                            {consultation.status === 'replied' || consultation.status === 'responded' ? 'Replied' : 'Pending'}
                                        </span>
                                        <span className="text-xs font-bold text-slate-400 bg-slate-100/50 px-2 py-1 rounded">{new Date(consultation.timestamp).toLocaleDateString()}</span>
                                    </div>
                                    <h3 className="font-bold text-slate-900 line-clamp-1">
                                        {consultation.crop && !consultation.crop.toLowerCase().includes('unknown') ? `${consultation.crop} - ` : ''}
                                        {consultation.disease}
                                    </h3>
                                    <div className="flex gap-3 mt-2">
                                        {consultation.image && (
                                            <img src={consultation.image.startsWith('http') || consultation.image.startsWith('data:') ? consultation.image : `http://localhost:5000${consultation.image.startsWith('/') ? '' : '/'}${consultation.image}`} alt="Crop" className="w-16 h-16 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-100" />
                                        )}
                                        <p className="text-sm text-slate-600 line-clamp-2">{consultation.description}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                You have not submitted any consultation requests yet.
                            </div>
                        )}
                    </div>
                </div>

                {/* Detail View */}
                <div className="lg:col-span-2">
                    {selectedConsultation ? (
                        <div className="glass-card shadow-2xl border border-white/60 overflow-hidden h-full flex flex-col animate-fade-in relative z-10">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/10 to-transparent rounded-bl-[100px] pointer-events-none" />
                            <div className="bg-white/40 backdrop-blur-md p-8 border-b border-white/60 relative z-10">
                                <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight drop-shadow-sm">
                                    {selectedConsultation.crop && !selectedConsultation.crop.toLowerCase().includes('unknown') ? <span className="text-emerald-700">{selectedConsultation.crop}</span> : ''}
                                    {selectedConsultation.crop && !selectedConsultation.crop.toLowerCase().includes('unknown') ? <span className="mx-2 text-slate-300">•</span> : ''}
                                    {selectedConsultation.disease}
                                </h2>
                                <p className="text-slate-500 font-bold text-sm flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-amber-500" />
                                    <span>Submitted on {new Date(selectedConsultation.timestamp).toLocaleString()}</span>
                                </p>
                            </div>

                            <div className="p-8 flex-1 overflow-y-auto relative z-10 custom-scrollbar">
                                <div className="mb-8">
                                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">My Description</h4>
                                    <p className="text-slate-700 font-medium bg-white/60 p-5 rounded-2xl border border-white leading-relaxed whitespace-pre-wrap shadow-inner">
                                        {selectedConsultation.description}
                                    </p>
                                </div>

                                {selectedConsultation.image && (
                                    <div className="mb-8">
                                        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-2">Uploaded Image</h4>
                                        <img src={selectedConsultation.image.startsWith('http') || selectedConsultation.image.startsWith('data:') ? selectedConsultation.image : `http://localhost:5000${selectedConsultation.image.startsWith('/') ? '' : '/'}${selectedConsultation.image}`} alt="Crop Issue" className="rounded-xl max-h-80 border border-slate-200 shadow-sm object-contain bg-slate-100" />
                                    </div>
                                )}

                                <div className="border-t border-white/60 mt-8 pt-8">
                                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6 ml-1">Expert Responses</h4>

                                    {selectedConsultation.replies && selectedConsultation.replies.length > 0 ? (
                                        <div className="space-y-6">
                                            {selectedConsultation.replies.map((reply, idx) => (
                                                <div key={idx} className="flex gap-4 animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
                                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/30">
                                                        <Microscope className="w-6 h-6" />
                                                    </div>
                                                    <div className="bg-amber-50/80 backdrop-blur-sm border border-amber-100 p-6 rounded-2xl rounded-tl-none flex-1 shadow-sm">
                                                        <div className="flex justify-between items-end mb-3 pb-3 border-b border-amber-200/50">
                                                            <span className="font-black text-amber-900 text-lg">{reply.expert}</span>
                                                            <span className="text-xs font-bold text-amber-600/70 tracking-wide uppercase">{new Date(reply.timestamp).toLocaleString()}</span>
                                                        </div>
                                                        <p className="text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">{reply.message}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : selectedConsultation.reply ? (
                                        <div className="space-y-6">
                                            <div className="flex gap-4 animate-fade-in">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/30">
                                                    <Microscope className="w-6 h-6" />
                                                </div>
                                                <div className="bg-amber-50/80 backdrop-blur-sm border border-amber-100 p-6 rounded-2xl rounded-tl-none flex-1 shadow-sm">
                                                    <div className="flex justify-between items-end mb-3 pb-3 border-b border-amber-200/50">
                                                        <span className="font-black text-amber-900 text-lg">{selectedConsultation.replied_by || 'Expert'}</span>
                                                        <span className="text-xs font-bold text-amber-600/70 tracking-wide uppercase">{selectedConsultation.replied_at ? new Date(selectedConsultation.replied_at).toLocaleString() : ''}</span>
                                                    </div>
                                                    <p className="text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">{selectedConsultation.reply}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-10 bg-white/40 backdrop-blur-sm rounded-2xl border border-dashed border-slate-300">
                                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Clock className="w-8 h-8 text-slate-400" />
                                            </div>
                                            <p className="text-slate-600 font-bold text-lg mb-1">Awaiting Expert Review</p>
                                            <p className="text-slate-500 text-sm font-medium">An expert will respond to your request soon.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 p-10 glass-card min-h-[500px]">
                            <div className="w-24 h-24 bg-white/50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-white">
                                <MessageSquare className="w-12 h-12 text-slate-300" />
                            </div>
                            <p className="text-2xl font-black text-slate-700 mb-2 tracking-tight">Select a Request</p>
                            <p className="text-lg font-medium text-slate-500">Choose an item from history to view details & replies</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

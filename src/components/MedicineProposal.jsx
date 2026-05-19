
import React, { useState } from 'react';
import { FlaskConical, Send, CheckCircle, History } from 'lucide-react';

const MedicineProposal = ({ user }) => {
    const isExpert = user?.role === 'expert';

    const [formData, setFormData] = useState({
        name: '',
        plant: '',
        diseases: '',
        symptoms: '',
        usage: '',
        type: isExpert ? 'Organic' : 'Homemade'
    });
    const [submitted, setSubmitted] = useState(false);
    const [myProposals, setMyProposals] = useState([]);

    // Fetch user's proposals on mount or when user changes
    React.useEffect(() => {
        if (user && (user.id || user._id)) {
            const userId = user.id || user._id;
            fetch(`http://localhost:5000/api/proposals/my?user_id=${userId}`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setMyProposals(data);
                    }
                })
                .catch(err => console.error("Error fetching proposals:", err));
        }
    }, [user, submitted]); // Re-fetch when submitted changes to show new proposal

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return alert("Please login to submit");

        try {
            const res = await fetch('http://localhost:5000/medicines/propose', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    submitted_by: user.username,
                    user_id: user.id || user._id
                })
            });
            if (res.ok) {
                setSubmitted(true);
                setFormData({ name: '', plant: '', diseases: '', symptoms: '', usage: '', type: isExpert ? 'Organic' : 'Homemade' });
            } else {
                alert("Failed to submit proposal");
            }
        } catch (error) {
            console.error("Error submitting proposal:", error);
        }
    };

    if (submitted) {
        return (
            <div className="max-w-2xl mx-auto p-8 text-center bg-white rounded-xl shadow-sm border border-emerald-100 my-8">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Submission Received!</h3>
                <p className="text-gray-600 mb-6">Thank you for contributing. Your {isExpert ? 'proposal' : 'home remedy'} has been sent to the administrators for review.</p>
                <button
                    onClick={() => setSubmitted(false)}
                    className="text-emerald-600 font-medium hover:text-emerald-700 hover:underline"
                >
                    Submit another remedy
                </button>
            </div>
        );
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800 border-green-200';
            case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className={`flex items-center gap-4 mb-10`}>
                <div className={`p-4 rounded-2xl shadow-inner border ${isExpert ? 'bg-indigo-50 border-indigo-100' : 'bg-emerald-50 border-emerald-100'}`}>
                    <FlaskConical className={`w-8 h-8 ${isExpert ? 'text-indigo-600' : 'text-emerald-600'}`} />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">{isExpert ? 'Propose Medicine' : 'Submit Homemade Remedy'}</h2>
                    <p className="text-slate-500 font-medium mt-1">{isExpert ? 'Suggest a new treatment for the clinical registry' : 'Share your traditional knowledge with the community'}</p>
                </div>
            </div>

            <div className={`bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-xl border overflow-hidden mb-12 hover:-translate-y-1 transition-all duration-300 relative ${isExpert ? 'shadow-indigo-900/5 border-indigo-100/50' : 'shadow-emerald-900/5 border-emerald-100/50'}`}>
                <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br to-transparent rounded-bl-full pointer-events-none ${isExpert ? 'from-indigo-500/10' : 'from-emerald-500/10'}`} />
                <form onSubmit={handleSubmit} className="p-8 sm:p-10 space-y-8 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-xs font-black tracking-widest text-slate-700 uppercase mb-2 ml-1">Remedy Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Garlic & Chilli Spray"
                                className={`w-full px-5 py-4 rounded-xl border-2 bg-white outline-none transition-all font-bold text-slate-900 placeholder-slate-500 ${isExpert ? 'focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 border-slate-200' : 'focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 border-slate-200 hover:border-emerald-300'}`}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black tracking-widest text-slate-700 uppercase mb-2 ml-1">Target Plant</label>
                            <input
                                type="text"
                                value={formData.plant}
                                onChange={(e) => setFormData({ ...formData, plant: e.target.value })}
                                placeholder="e.g., Tomato, Potato"
                                className={`w-full px-5 py-4 rounded-xl border-2 bg-white outline-none transition-all font-bold text-slate-900 placeholder-slate-500 ${isExpert ? 'focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 border-slate-200' : 'focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 border-slate-200 hover:border-emerald-300'}`}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black tracking-widest text-slate-700 uppercase mb-2 ml-1">Target Diseases</label>
                            <input
                                type="text"
                                value={formData.diseases}
                                onChange={(e) => setFormData({ ...formData, diseases: e.target.value })}
                                placeholder="e.g., Aphids, Whiteflies"
                                className={`w-full px-5 py-4 rounded-xl border-2 bg-white outline-none transition-all font-bold text-slate-900 placeholder-slate-500 ${isExpert ? 'focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 border-slate-200' : 'focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 border-slate-200 hover:border-emerald-300'}`}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black tracking-widest text-slate-700 uppercase mb-2 ml-1">Symptoms It Treats</label>
                            <input
                                type="text"
                                value={formData.symptoms}
                                onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                                placeholder="e.g., Yellowing leaves"
                                className={`w-full px-5 py-4 rounded-xl border-2 bg-white outline-none transition-all font-bold text-slate-900 placeholder-slate-500 ${isExpert ? 'focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 border-slate-200' : 'focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 border-slate-200 hover:border-emerald-300'}`}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black tracking-widest text-slate-700 uppercase mb-2 ml-1">Medicine Type</label>
                            {isExpert ? (
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className={`w-full px-5 py-4 rounded-xl border-2 bg-white outline-none transition-all font-bold text-slate-900 border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500`}
                                    required
                                >
                                    <option value="Organic">Organic</option>
                                    <option value="Chemical">Chemical</option>
                                    <option value="Homemade">Homemade</option>
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    value="Homemade"
                                    disabled
                                    className="w-full px-5 py-4 rounded-xl border-2 border-slate-200 bg-slate-100 text-emerald-800 cursor-not-allowed outline-none font-bold shadow-inner"
                                />
                            )}
                        </div>

                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-xs font-black tracking-widest text-slate-700 uppercase mb-2 ml-1">Preparation & Usage</label>
                            <textarea
                                value={formData.usage}
                                onChange={(e) => setFormData({ ...formData, usage: e.target.value })}
                                placeholder="Describe how to make and apply this remedy in detail..."
                                className={`w-full px-5 py-4 rounded-xl border-2 bg-white outline-none transition-all font-bold text-slate-900 placeholder-slate-500 h-40 resize-none ${isExpert ? 'focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 border-slate-200' : 'focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 border-slate-200 hover:border-emerald-300'}`}
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-200 flex justify-end">
                        <button
                            type="submit"
                            className={`flex items-center justify-center gap-2 text-white px-10 py-4 rounded-xl font-bold transform hover:-translate-y-1 transition-all shadow-lg w-full sm:w-auto ${isExpert ? 'bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-500/30' : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 hover:shadow-emerald-500/30 border border-white/10 relative overflow-hidden group'}`}
                        >
                            <Send className="w-5 h-5 ml-1" />
                            {isExpert ? 'Submit Clinical Proposal' : 'Submit Community Remedy'}
                            {!isExpert && <div className="absolute top-0 left-[-100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-[20deg] transition-all duration-700 ease-in-out group-hover:left-[200%] pointer-events-none" />}
                        </button>
                    </div>
                </form>
                <div className={`px-8 py-5 border-t ${isExpert ? 'bg-indigo-50/50 border-indigo-100' : 'bg-emerald-50/50 border-emerald-100'}`}>
                    <p className={`text-xs font-bold text-center uppercase tracking-widest ${isExpert ? 'text-indigo-800' : 'text-emerald-800'}`}>
                        All submissions are formally reviewed by administrators before being published.
                    </p>
                </div>
            </div>

            {/* User History Section */}
            {myProposals.length > 0 && (
                <div className="mt-16 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                    <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                        <History className={`w-5 h-5 ${isExpert ? 'text-indigo-500' : 'text-emerald-500'}`}/> 
                        Your Past Submissions
                    </h3>
                    <div className="grid gap-5">
                        {myProposals.map((proposal) => (
                            <div key={proposal._id} className={`bg-white/90 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${isExpert ? 'hover:border-indigo-300' : 'hover:border-emerald-300'}`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-xl text-slate-800">{proposal.name}</h4>
                                        <p className="text-xs font-bold text-slate-400 mt-1 mb-3 bg-slate-50 px-2 py-1 inline-block rounded border border-slate-100 tracking-wide">TARGET: {proposal.plant} <span className="mx-2">•</span> {new Date(proposal.timestamp).toLocaleDateString()}</p>
                                        <p className="text-slate-600 text-sm leading-relaxed line-clamp-2 bg-slate-50/50 p-3 rounded-xl border border-slate-100">{proposal.usage}</p>
                                    </div>
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${getStatusColor(proposal.status)}`}>
                                        {proposal.status ? proposal.status : 'PENDING'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MedicineProposal;

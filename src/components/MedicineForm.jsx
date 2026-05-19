import React, { useState } from 'react';
import { Pill, Activity, Sprout, Save, X, Image as ImageIcon } from 'lucide-react';

export default function MedicineForm({ initialData, onSuccess, onCancel }) {
    const [formData, setFormData] = useState(initialData || {
        name: '',
        plant: '',
        diseases: '',
        symptoms: '',
        usage: '',
        type: 'Organic'
    });

    React.useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                name: '',
                plant: '',
                diseases: '',
                symptoms: '',
                usage: '',
                type: 'Organic'
            });
            setSelectedFile(null);
        }
    }, [initialData]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const url = initialData
                ? `${API_URL}/admin/medicines/${initialData._id}`
                : `${API_URL}/admin/medicines`;

            const method = initialData ? 'PUT' : 'POST';

            const formDataToSend = new FormData();
            Object.keys(formData).forEach(key => formDataToSend.append(key, formData[key]));
            if (selectedFile) {
                formDataToSend.append('image', selectedFile);
            }

            const response = await fetch(url, {
                method: method,
                body: formDataToSend
            });

            if (response.ok) {
                setMessage(initialData ? 'Medicine updated successfully!' : 'Medicine added successfully!');
                if (!initialData) setFormData({ name: '', plant: '', diseases: '', symptoms: '', usage: '', type: 'Organic' });
                if (onSuccess) onSuccess();
            } else {
                setMessage(initialData ? 'Failed to update medicine.' : 'Failed to add medicine.');
            }
        } catch (error) {
            setMessage('Error connecting to server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border border-emerald-500/20 hover-lift relative overflow-hidden group/form">
            {/* Ambient background glow */}
            <div className="absolute -inset-1 bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10 rounded-[3rem] blur-2xl opacity-50 group-hover/form:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

            <div className="relative z-10">
                <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.3)] rounded-xl">
                        <Pill className="w-6 h-6 text-emerald-700" />
                    </div>
                    {initialData ? 'Edit Medicine Entry' : 'Register New Medicine'}
                </h3>

                {message && (
                    <div className={`mb-6 p-4 rounded-xl text-sm font-bold flex items-center gap-2 border ${message.includes('success') ? 'bg-emerald-900/40 text-emerald-700 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-red-900/40 text-red-400 border-red-500/30'}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black tracking-widest text-slate-800 uppercase ml-1">Medicine Name</label>
                            <input
                                type="text"
                                required
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/90 px-4 py-3 text-slate-800 placeholder-slate-500 font-medium shadow-sm hover:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white focus:outline-none transition-all"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black tracking-widest text-slate-800 uppercase ml-1">Type</label>
                            <select
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/90 px-4 py-3 text-slate-800 placeholder-slate-500 font-medium shadow-sm hover:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white focus:outline-none transition-all appearance-none"
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option className="bg-slate-100 text-slate-800">Organic</option>
                                <option className="bg-slate-100 text-slate-800">Inorganic</option>
                                <option className="bg-slate-100 text-slate-800">Homemade</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black tracking-widest text-slate-800 uppercase ml-1">Target Plant</label>
                            <input
                                type="text"
                                required
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/90 px-4 py-3 text-slate-800 placeholder-slate-500 font-medium shadow-sm hover:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white focus:outline-none transition-all"
                                placeholder="e.g., Tomato, Potato"
                                value={formData.plant}
                                onChange={e => setFormData({ ...formData, plant: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black tracking-widest text-slate-800 uppercase ml-1">Target Diseases</label>
                            <input
                                type="text"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/90 px-4 py-3 text-slate-800 placeholder-slate-500 font-medium shadow-sm hover:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white focus:outline-none transition-all"
                                placeholder="e.g., Leaf Blight, Rot"
                                value={formData.diseases}
                                onChange={e => setFormData({ ...formData, diseases: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black tracking-widest text-slate-800 uppercase ml-1">Symptoms to Treat</label>
                        <textarea
                            className="w-full min-h-[100px] rounded-xl border border-slate-200 bg-slate-50/90 px-4 py-3 text-slate-800 placeholder-slate-500 font-medium shadow-sm hover:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white focus:outline-none transition-all resize-y"
                            placeholder="Yellowing leaves, spots..."
                            value={formData.symptoms}
                            onChange={e => setFormData({ ...formData, symptoms: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black tracking-widest text-slate-800 uppercase ml-1">Usage Instructions</label>
                        <textarea
                            required
                            className="w-full min-h-[100px] rounded-xl border border-slate-200 bg-slate-50/90 px-4 py-3 text-slate-800 placeholder-slate-500 font-medium shadow-sm hover:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white focus:outline-none transition-all resize-y"
                            placeholder="How and when to apply..."
                            value={formData.usage}
                            onChange={e => setFormData({ ...formData, usage: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1 bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
                        <label className="text-[10px] font-black tracking-widest text-slate-800 uppercase flex items-center gap-2 mb-3">
                            <ImageIcon className="w-3.5 h-3.5 text-emerald-500" /> Medicine Image (Optional)
                        </label>
                        <div className="flex gap-4 items-center">
                            <input
                                type="file"
                                accept="image/*"
                                className="w-full text-sm text-slate-800 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border file:border-emerald-500/30 file:text-sm file:font-bold file:bg-emerald-900/20 file:text-emerald-700 hover:file:bg-emerald-900/40 hover:file:shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all cursor-pointer"
                                onChange={e => setSelectedFile(e.target.files[0])}
                            />
                        </div>
                        {initialData && initialData.image && !selectedFile && (
                            <p className="text-[10px] text-slate-700 mt-3 font-mono bg-white p-2 rounded-lg inline-block border border-slate-800">Current image: {initialData.image}</p>
                        )}
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-slate-800/80">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-emerald-600/90 text-white font-bold py-4 px-6 rounded-xl hover:bg-emerald-1000 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:-translate-y-1 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-slate-200/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    {initialData ? 'Update Medicine Info' : 'Add Medicine to Registry'}
                                </>
                            )}
                        </button>
                        {initialData && (
                            <button
                                type="button"
                                onClick={onCancel}
                                className="bg-slate-100 text-slate-700 font-bold py-4 px-6 rounded-xl border border-slate-200 hover:bg-slate-200 hover:text-slate-900 hover:border-slate-500 transition-all flex items-center gap-2"
                            >
                                <X className="w-5 h-5" /> Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}

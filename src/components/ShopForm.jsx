import React, { useState } from 'react';
import { Store, MapPin, Phone, Image as ImageIcon, Save, X } from 'lucide-react';

export default function ShopForm({ initialData, onSuccess, onCancel }) {
    const [formData, setFormData] = useState(initialData || {
        name: '',
        address: '',
        contact: '',
        location: '',
        map_link: '',
        photo: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);

    // Update formData if initialData changes
    React.useEffect(() => {
        if (initialData) {
            setFormData(initialData);
            setSelectedFile(null);
        } else {
            setFormData({
                name: '',
                address: '',
                contact: '',
                location: '',
                map_link: '',
                photo: ''
            });
            setSelectedFile(null);
        }
    }, [initialData]);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const url = initialData
                ? `http://localhost:5000/admin/shops/${initialData._id}`
                : 'http://localhost:5000/admin/shops';

            const method = initialData ? 'PUT' : 'POST';

            // Create FormData
            const formPayload = new FormData();
            formPayload.append('name', formData.name);
            formPayload.append('address', formData.address);
            formPayload.append('contact', formData.contact);
            formPayload.append('location', formData.location || '');
            formPayload.append('map_link', formData.map_link || '');

            // Append file if selected, otherwise keep existing photo URL if not changing
            if (selectedFile) {
                formPayload.append('image', selectedFile);
            } else if (formData.photo) {
                formPayload.append('photo', formData.photo);
            }

            const response = await fetch(url, {
                method: method,
                // Content-Type not set for FormData
                body: formPayload
            });

            if (response.ok) {
                setMessage(initialData ? 'Shop updated successfully!' : 'Shop added successfully!');
                if (!initialData) {
                    setFormData({ name: '', address: '', contact: '', location: '', map_link: '', photo: '' });
                    setSelectedFile(null);
                }
                if (onSuccess) onSuccess();
            } else {
                setMessage(initialData ? 'Failed to update shop.' : 'Failed to add shop.');
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
                        <Store className="w-6 h-6 text-emerald-700" />
                    </div>
                    {initialData ? 'Edit Store Profile' : 'Register New Store'}
                </h3>

                {message && (
                    <div className={`mb-6 p-4 rounded-xl text-sm font-bold flex items-center gap-2 border ${message.includes('success') ? 'bg-emerald-900/40 text-emerald-700 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-red-900/40 text-red-400 border-red-500/30'}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black tracking-widest text-slate-800 uppercase ml-1">Store Name</label>
                            <input
                                type="text"
                                required
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/90 px-4 py-3 text-slate-800 placeholder-slate-500 font-medium shadow-sm hover:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white focus:outline-none transition-all"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black tracking-widest text-slate-800 uppercase ml-1">Contact Number</label>
                            <input
                                type="text"
                                required
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/90 px-4 py-3 text-slate-800 placeholder-slate-500 font-medium shadow-sm hover:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white focus:outline-none transition-all"
                                value={formData.contact}
                                onChange={e => setFormData({ ...formData, contact: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black tracking-widest text-slate-800 uppercase ml-1">Street Address</label>
                        <input
                            type="text"
                            required
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/90 px-4 py-3 text-slate-800 placeholder-slate-500 font-medium shadow-sm hover:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white focus:outline-none transition-all"
                            value={formData.address}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black tracking-widest text-slate-800 uppercase ml-1">Location / Coordinates</label>
                            <input
                                type="text"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/90 px-4 py-3 text-slate-800 placeholder-slate-500 font-medium shadow-sm hover:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white focus:outline-none transition-all"
                                placeholder="City, Area, Coordinates"
                                value={formData.location}
                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black tracking-widest text-slate-800 uppercase ml-1">Google Maps Link</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                                <input
                                    type="url"
                                    className="w-full rounded-xl border border-slate-200 pl-11 pr-4 py-3 bg-slate-50/90 text-slate-800 placeholder-slate-500 font-medium shadow-sm hover:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white focus:outline-none transition-all"
                                    placeholder="https://maps.google.com/..."
                                    value={formData.map_link || ''}
                                    onChange={e => setFormData({ ...formData, map_link: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1 bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
                        <label className="text-[10px] font-black tracking-widest text-slate-800 uppercase flex items-center gap-2 mb-3">
                            <ImageIcon className="w-3.5 h-3.5 text-emerald-500" /> Storefront Photo
                        </label>
                        <div className="flex gap-4 items-center">
                            <input
                                type="file"
                                accept="image/*"
                                className="w-full text-sm text-slate-800 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border file:border-emerald-500/30 file:text-sm file:font-bold file:bg-emerald-900/20 file:text-emerald-700 hover:file:bg-emerald-900/40 hover:file:shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all cursor-pointer"
                                onChange={e => setSelectedFile(e.target.files[0])}
                            />
                        </div>
                        <p className="text-[10px] text-slate-700 mt-2 italic flex items-center gap-1.5 ml-1">Upload a clear exterior photo for easy identification</p>
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
                                    {initialData ? 'Update Store Data' : 'Establish New Store'}
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

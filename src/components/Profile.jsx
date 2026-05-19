import React, { useState, useEffect } from 'react';
import { User, MapPin, Phone, Mail, Save, Edit2 } from 'lucide-react';

export default function Profile({ user, onUpdateUser }) {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user.name || '',
        email: user.email || '',
        address: user.address || '',
        pincode: user.pincode || '',
        phone: user.phone || '',
        specialization: user.specialization || ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [previewImage, setPreviewImage] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                address: user.address || '',
                pincode: user.pincode || '',
                phone: user.phone || '',
                specialization: user.specialization || ''
            });
            if (user.profile_image) {
                setPreviewImage(`${API_URL}/uploads/${user.profile_image}`);
            }
        }
    }, [user]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('username', user.username);
            Object.keys(formData).forEach(key => formDataToSend.append(key, formData[key]));
            if (selectedFile) {
                formDataToSend.append('profile_image', selectedFile);
            }

            const res = await fetch(`${API_URL}/auth/me`, {
                method: 'PUT',
                body: formDataToSend
            });

            const data = await res.json();

            if (res.ok) {
                setMessage('Profile updated successfully!');
                setIsEditing(false);
                if (onUpdateUser) onUpdateUser(data.user);
            } else {
                setMessage(data.error || 'Update failed');
            }
        } catch (error) {
            setMessage('Error connecting to server');
            setMessage({ text: 'Error connecting to server', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 overflow-hidden">
                <div className="bg-gradient-to-r from-nature-600 to-nature-500 p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/5 rounded-full -ml-24 -mb-24 blur-2xl"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full border-4 border-white/30 shadow-2xl overflow-hidden bg-white">
                                {previewImage ? (
                                    <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                                        <User className="w-16 h-16" />
                                    </div>
                                )}
                            </div>
                            {isEditing && (
                                <label className="absolute bottom-0 right-0 p-2 bg-white text-nature-600 rounded-full shadow-lg cursor-pointer hover:bg-slate-50 transition-transform hover:scale-105 active:scale-95">
                                    <Edit2 className="w-5 h-5" />
                                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                </label>
                            )}
                        </div>

                        <div className="text-center md:text-left flex-1">
                            <h1 className="text-3xl font-bold mb-2">{user.username}</h1>
                            <p className="text-nature-100 font-medium mb-4 flex items-center justify-center md:justify-start gap-2">
                                <span className="uppercase tracking-wider text-xs bg-white/20 px-3 py-1 rounded-full">{user.role}</span>
                                {user.specialization && <span>• {user.specialization}</span>}
                            </p>
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="bg-white text-nature-700 px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-black/5 hover:bg-nature-50 hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm flex items-center gap-2 mx-auto md:mx-0"
                                >
                                    <Edit2 className="w-4 h-4" /> Edit Profile
                                </button>
                            ) : (
                                <div className="flex gap-3 justify-center md:justify-start">
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="bg-white text-nature-700 px-6 py-2.5 rounded-xl font-bold shadow-lg hover:bg-nature-50 transition-all flex items-center gap-2"
                                    >
                                        <Save className="w-4 h-4" /> Save Changes
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="bg-white/20 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-white/30 transition-all backdrop-blur-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    {message && (
                        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${typeof message === 'object' && message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                            {typeof message === 'object' && message.type === 'error' ? <div className="w-5 h-5 bg-red-400 rounded-full" /> : <div className="w-5 h-5 bg-green-400 rounded-full" />}
                            {typeof message === 'object' ? message.text : message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">Personal Details</h3>

                                <div className="group">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-nature-500 transition-colors" />
                                        <input
                                            type="text"
                                            disabled={!isEditing}
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-nature-100 focus:border-nature-500 transition-all disabled:cursor-not-allowed outline-none font-bold text-slate-800"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-nature-500 transition-colors" />
                                        <input
                                            type="email"
                                            disabled={!isEditing}
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-nature-100 focus:border-nature-500 transition-all disabled:cursor-not-allowed outline-none font-bold text-slate-800"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-nature-500 transition-colors" />
                                        <input
                                            type="tel"
                                            disabled={!isEditing}
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-nature-100 focus:border-nature-500 transition-all disabled:cursor-not-allowed outline-none font-bold text-slate-800"
                                            placeholder="+91 98765 43210"
                                        />
                                    </div>
                                </div>

                                {user.role === 'expert' && (
                                    <div className="group">
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Specialization</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-nature-500 transition-colors" />
                                            <input
                                                type="text"
                                                disabled={!isEditing}
                                                value={formData.specialization}
                                                onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-nature-100 focus:border-nature-500 transition-all disabled:cursor-not-allowed outline-none font-bold text-slate-800"
                                                placeholder="e.g. Plant Pathology"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">Location Details</h3>

                                <div className="group">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Full Address</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-nature-500 transition-colors" />
                                        <textarea
                                            disabled={!isEditing}
                                            value={formData.address}
                                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-nature-100 focus:border-nature-500 transition-all disabled:cursor-not-allowed outline-none font-bold text-slate-800 resize-none h-32"
                                            placeholder="Full address here..."
                                        />
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Pincode</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-nature-500 transition-colors" />
                                        <input
                                            type="text"
                                            disabled={!isEditing}
                                            value={formData.pincode}
                                            onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-nature-100 focus:border-nature-500 transition-all disabled:cursor-not-allowed outline-none font-bold text-slate-800"
                                            placeholder="123456"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        {isEditing && (
                            <div className="mt-8 flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-2 rounded-lg font-medium transition-all shadow-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center gap-2 bg-nature-600 hover:bg-nature-700 text-white px-6 py-2 rounded-lg font-medium transition-all shadow-md"
                                >
                                    <Save className="w-5 h-5" />
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}

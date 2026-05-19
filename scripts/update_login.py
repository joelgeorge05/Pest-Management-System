import os

target = r"c:\Users\Acer\OneDrive\Videos\Pictures\Documents\Desktop\pest\src\components\Login.jsx"

code = """import React, { useState } from 'react';
import { User, Lock, ShieldCheck, Microscope, Stethoscope, Leaf, TreePine, Settings, Database, Activity } from 'lucide-react';

export default function Login({ onLogin, onBack }) {
    const [isRegistering, setIsRegistering] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        name: '',
        email: '',
        address: '',
        pincode: '',
        phone: ''
    });
    const [role, setRole] = useState('expert'); // default to expert based on user request focus
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const API_URL = '';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (isRegistering) {
            const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\\d)[a-zA-Z\\d]{6,}$/;
            if (!passwordRegex.test(formData.password)) {
                setError("Password must be alphanumeric and at least 6 characters long.");
                setLoading(false);
                return;
            }
            if (role === 'farmer') {
                const phoneRegex = /^\\d{10}$/;
                if (!phoneRegex.test(formData.phone)) {
                    setError("Mobile number must be exactly 10 digits.");
                    setLoading(false);
                    return;
                }
            }
        }

        const endpoint = isRegistering ? '/auth/register' : '/auth/login';
        const payload = isRegistering ? { ...formData, role } : formData;

        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            if (isRegistering) {
                setIsRegistering(false);
                setError("Registration successful! Please login.");
            } else {
                onLogin(data.user);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getTheme = () => {
        switch(role) {
            case 'expert': return {
                bg: 'from-indigo-50 via-blue-50 to-slate-100',
                blob1: 'bg-indigo-300', blob2: 'bg-blue-300',
                btn: 'from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-indigo-500/25',
                focus: 'focus:border-indigo-500 focus:ring-indigo-500/20 group-focus-within:text-indigo-600',
                iconBg: 'from-indigo-600 to-blue-500 shadow-indigo-500/30'
            };
            case 'admin': return {
                bg: 'from-slate-100 via-slate-50 to-emerald-50',
                blob1: 'bg-slate-300', blob2: 'bg-emerald-200',
                btn: 'from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 shadow-slate-900/25',
                focus: 'focus:border-slate-800 focus:ring-slate-500/20 group-focus-within:text-slate-800',
                iconBg: 'from-slate-800 to-slate-700 shadow-slate-900/30'
            };
            default: return { // farmer
                bg: 'from-emerald-50 via-teal-50 to-cyan-50',
                blob1: 'bg-emerald-300', blob2: 'bg-teal-300',
                btn: 'from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-emerald-500/25',
                focus: 'focus:border-emerald-500 focus:ring-emerald-500/20 group-focus-within:text-emerald-600',
                iconBg: 'from-emerald-500 to-teal-600 shadow-emerald-500/30'
            };
        }
    };

    const theme = getTheme();

    return (
        <div className={`min-h-screen pt-20 pb-12 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br ${theme.bg} relative overflow-hidden transition-colors duration-1000`} >
            {/* Animated Floating Background Objects based on Role */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className={`absolute top-[-10%] left-[-5%] w-96 h-96 ${theme.blob1} rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob transition-colors duration-1000`}></div>
                <div className={`absolute bottom-[20%] right-[-10%] w-72 h-72 ${theme.blob2} rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 transition-colors duration-1000`}></div>
                
                {role === 'expert' && (
                    <>
                        <Microscope className="absolute top-[15%] left-[10%] w-64 h-64 text-indigo-500/10 animate-float drop-shadow-2xl" />
                        <Activity className="absolute bottom-[10%] right-[15%] w-72 h-72 text-blue-500/10 animate-float animation-delay-2000 drop-shadow-xl" />
                        <Stethoscope className="absolute top-[60%] left-[-5%] w-48 h-48 text-indigo-600/5 animate-float animation-delay-4000 drop-shadow-xl" />
                    </>
                )}
                {role === 'admin' && (
                    <>
                        <ShieldCheck className="absolute top-[15%] left-[10%] w-64 h-64 text-slate-500/10 animate-float drop-shadow-2xl" />
                        <Database className="absolute bottom-[10%] right-[15%] w-72 h-72 text-emerald-500/10 animate-float animation-delay-2000 drop-shadow-xl" />
                        <Settings className="absolute top-[60%] left-[-5%] w-48 h-48 text-slate-600/5 animate-float animation-delay-4000 drop-shadow-xl" />
                    </>
                )}
                {role === 'farmer' && (
                    <>
                        <Leaf className="absolute top-[15%] left-[10%] w-64 h-64 text-emerald-500/10 animate-float drop-shadow-2xl" />
                        <TreePine className="absolute bottom-[10%] right-[15%] w-72 h-72 text-teal-500/10 animate-float animation-delay-2000 drop-shadow-xl" />
                    </>
                )}

                <div className="absolute inset-0 bg-grid-slate-200/[0.04] bg-[bottom_1px_center] text-slate-900/5"></div>
            </div>

            <div className="relative z-10 max-w-md w-full space-y-6 glass p-8 sm:p-10 rounded-[2.5rem] animate-fade-in-up border border-white/60 shadow-2xl">
                
                {/* Role Selector Tabs */}
                <div className="flex bg-slate-200/50 backdrop-blur-md p-1.5 rounded-2xl shadow-inner mb-2 border border-slate-200/50">
                    <button onClick={() => {setRole('farmer'); setError(null)}} className={`flex-1 py-2.5 text-xs sm:text-sm font-black uppercase tracking-wider rounded-xl transition-all duration-300 ${role === 'farmer' ? 'bg-white shadow-md text-emerald-600 transform scale-100' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'}`}>Farmer</button>
                    <button onClick={() => {setRole('expert'); setError(null)}} className={`flex-1 py-2.5 text-xs sm:text-sm font-black uppercase tracking-wider rounded-xl transition-all duration-300 ${role === 'expert' ? 'bg-white shadow-md text-indigo-600 transform scale-100' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'}`}>Expert</button>
                    <button onClick={() => {setRole('admin'); setError(null)}} className={`flex-1 py-2.5 text-xs sm:text-sm font-black uppercase tracking-wider rounded-xl transition-all duration-300 ${role === 'admin' ? 'bg-white shadow-md text-slate-800 transform scale-100' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'}`}>Admin</button>
                </div>

                <div className="text-center relative">
                    <button
                        onClick={onBack}
                        className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-slate-100/80 transition-colors text-slate-400 hover:text-slate-700 border border-transparent hover:border-slate-200"
                        title="Back to Home"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    </button>
                    <div className={`mx-auto h-20 w-20 bg-gradient-to-br ${theme.iconBg} rounded-[1.5rem] flex items-center justify-center mb-6 shadow-lg transform hover:scale-105 hover:rotate-3 transition-all duration-500 cursor-default ring-4 ring-white`}>
                        {role === 'expert' && <Microscope className="h-10 w-10 text-white" />}
                        {role === 'admin' && <ShieldCheck className="h-10 w-10 text-white" />}
                        {role === 'farmer' && <User className="h-10 w-10 text-white" />}
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                        {isRegistering ? 'Create Account' : `Welcome Base`}
                    </h2>
                    <p className="mt-2 text-sm text-slate-500 font-bold">
                        {isRegistering ? 'Join the Smart Pest Management System' : `Sign in to access your ${role} dashboard`}
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-3 backdrop-blur-md animate-fade-in-up ${error.includes("success")
                            ? 'bg-green-50/80 text-green-700 border border-green-200 shadow-sm shadow-green-100'
                            : 'bg-red-50/80 text-red-700 border border-red-200 shadow-sm shadow-red-100'
                            }`}>
                            {error}
                        </div>
                    )}

                    <div className="space-y-5">
                        <div className="relative group">
                            <label className="text-xs font-black tracking-widest text-slate-600 mb-2 block ml-1 uppercase">Username</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-20">
                                    <User className={`h-5 w-5 text-slate-400 transition-colors ${theme.focus.split(' ')[2]}`} />
                                </div>
                                <input
                                    type="text"
                                    required
                                    className={`appearance-none rounded-2xl relative block w-full pl-12 px-4 py-4 border-2 border-slate-100 bg-slate-50/50 backdrop-blur-md placeholder-slate-400 text-slate-900 focus:outline-none focus:bg-white transition-all sm:text-sm font-bold shadow-inner ${theme.focus} hover:border-slate-300`}
                                    placeholder="Enter username"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="relative group">
                            <label className="text-xs font-black tracking-widest text-slate-600 mb-2 block ml-1 uppercase">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-20">
                                    <Lock className={`h-5 w-5 text-slate-400 transition-colors ${theme.focus.split(' ')[2]}`} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    className={`appearance-none rounded-2xl relative block w-full pl-12 px-4 py-4 border-2 border-slate-100 bg-slate-50/50 backdrop-blur-md placeholder-slate-400 text-slate-900 focus:outline-none focus:bg-white transition-all sm:text-sm font-bold shadow-inner ${theme.focus} hover:border-slate-300`}
                                    placeholder="Enter password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {isRegistering && (
                        <div className="space-y-4 bg-white/50 backdrop-blur-sm p-6 rounded-[2rem] border border-white shadow-sm animate-fade-in-up">
                            <h3 className="text-sm font-black text-slate-800 mb-4">{role.charAt(0).toUpperCase() + role.slice(1)} Registration Details</h3>
                            {[
                                { label: 'Full Name', type: 'text', key: 'name', ph: 'John Doe', show: true },
                                { label: 'Email', type: 'email', key: 'email', ph: 'john@example.com', show: true },
                                { label: 'Address / Lab', type: 'text', key: 'address', ph: role === 'expert' ? 'Laboratory Address' : 'Farm Location', show: true },
                                { label: 'Phone', type: 'tel', key: 'phone', ph: '10-digit number', show: true },
                                { label: 'Pincode', type: 'text', key: 'pincode', ph: 'Postal Code', show: role === 'farmer' },
                            ].filter(f => f.show).map((field) => (
                                <div className="relative" key={field.key}>
                                    <label className="text-[10px] font-black tracking-widest text-slate-500 mb-1.5 block ml-1 uppercase">{field.label}</label>
                                    <input
                                        type={field.type}
                                        required={isRegistering}
                                        className={`appearance-none rounded-xl relative block w-full px-4 py-3 border-2 border-slate-100 bg-white/80 placeholder-slate-300 text-slate-800 focus:outline-none transition-all sm:text-sm shadow-sm font-bold ${theme.focus} hover:border-slate-200`}
                                        placeholder={field.ph}
                                        value={formData[field.key]}
                                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                                    />
                                </div>
                            ))}
                        </div>
                    )}



                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex justify-center items-center py-4.5 rounded-[1.5rem] text-[15px] font-black text-white hover:-translate-y-1 transition-all duration-300 shadow-xl overflow-hidden relative group/btn disabled:opacity-70 disabled:hover:translate-y-0 bg-gradient-to-r ${theme.btn}`}
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
                            <span className="relative z-10 flex items-center gap-2">
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Processing...
                                    </>
                                ) : (
                                    isRegistering ? `Register as ${role.charAt(0).toUpperCase() + role.slice(1)}` : `Sign In securely`
                                )}
                            </span>
                        </button>
                    </div>
                </form>

                <div className="text-center mt-8">
                    <button
                        onClick={() => {
                            setIsRegistering(!isRegistering);
                            setError(null);
                        }}
                        className={`text-sm font-black transition-colors inline-block pb-1 border-b-2 hover:border-current text-slate-500 ${role === 'expert' ? 'hover:text-indigo-600' : role === 'admin' ? 'hover:text-slate-800' : 'hover:text-emerald-600'} border-transparent`}
                    >
                        {isRegistering
                            ? 'Already have an account? Sign In'
                            : "Don't have an account? Register"}
                    </button>
                </div>
            </div>

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
        </div >
    );
}
"""

with open(target, 'w', encoding='utf-8') as f:
    f.write(code)

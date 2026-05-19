import React, { useState } from 'react';
import { User, Lock, Sprout, ArrowRight } from 'lucide-react';

export default function Login({ onLogin, onBack }) {
    const [isRegistering, setIsRegistering] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        name: '',
        email: '',
        address: '',
        phone: ''
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const API_URL = '';
    const role = 'farmer'; // default role since filter is removed

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (isRegistering) {
            const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{6,}$/;
            if (!passwordRegex.test(formData.password)) {
                setError("Password must be alphanumeric and at least 6 characters long.");
                setLoading(false);
                return;
            }
            const phoneRegex = /^\d{10}$/;
            if (!phoneRegex.test(formData.phone)) {
                setError("Mobile number must be exactly 10 digits.");
                setLoading(false);
                return;
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

    return (
        <div className="min-h-screen pt-20 pb-12 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 bg-slate-50 relative overflow-hidden font-sans text-slate-800 transition-colors duration-1000">
            {/* Animated Floating Background Objects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-emerald-400 rounded-full mix-blend-multiply filter blur-[120px] opacity-30 animate-blob"></div>
                <div className="absolute bottom-[20%] right-[-10%] w-[400px] h-[400px] bg-teal-400 rounded-full mix-blend-multiply filter blur-[120px] opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute top-[40%] left-[20%] w-[300px] h-[300px] bg-cyan-400 rounded-full mix-blend-multiply filter blur-[120px] opacity-20 animate-blob animation-delay-4000"></div>
                
                {/* Premium Grid Pattern (Light) */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CiAgPHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPgogIDxwYXRoIGQ9Ik0wIDM5LjVMMCA0MGg0MHYtLjVIMHptMzkuNSAwVjBIMzkuNVpNMCAuNUwwIDBoNDB2LjVIMHptLjUgMGgtdjQwaC41VjB6IiBmaWxsPSJyZ2JhKDAsIDAsIDAsIDAuMDMpIi8+Cjwvc3ZnPg==')] opacity-80"></div>
            </div>

            <div className="relative z-10 max-w-md w-full space-y-8 bg-white/80 backdrop-blur-2xl p-8 sm:p-10 rounded-[2.5rem] animate-fade-in-up border border-white shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
                
                <div className="text-center relative">
                    <button
                        onClick={onBack}
                        className="absolute -left-2 top-1/2 -translate-y-1/2 p-2.5 rounded-2xl hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-700"
                        title="Back to Home"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    </button>
                    
                    <div className="mx-auto h-20 w-20 bg-emerald-50 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-sm border border-emerald-100 transform hover:scale-105 transition-all duration-500 cursor-default">
                        <Sprout className="h-10 w-10 text-emerald-600 drop-shadow-sm" />
                    </div>
                    
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                        {isRegistering ? 'Create Account' : 'Welcome Back'}
                    </h2>
                    <p className="mt-2 text-sm text-slate-500 font-bold">
                        {isRegistering ? 'Join the Smart Pest Management System' : 'Sign in to access your dashboard'}
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className={`p-4 rounded-2xl text-sm font-bold flex items-center gap-3 backdrop-blur-md animate-fade-in-up ${error.includes("successful")
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm shadow-emerald-100'
                            : 'bg-red-50 text-red-700 border border-red-200 shadow-sm shadow-red-100'
                            }`}>
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="relative group">
                            <label className="text-[10px] font-black tracking-widest text-slate-500 mb-1.5 block ml-1 uppercase">Username</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-20">
                                    <User className="h-5 w-5 text-slate-400 transition-colors group-focus-within:text-emerald-500" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    className="appearance-none rounded-2xl relative block w-full pl-12 px-4 py-3.5 border-2 border-slate-100 bg-slate-50/50 backdrop-blur-md placeholder-slate-400 text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all sm:text-sm font-bold shadow-inner hover:border-slate-200"
                                    placeholder="Enter username"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="relative group">
                            <label className="text-[10px] font-black tracking-widest text-slate-500 mb-1.5 block ml-1 uppercase">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-20">
                                    <Lock className="h-5 w-5 text-slate-400 transition-colors group-focus-within:text-emerald-500" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="appearance-none rounded-2xl relative block w-full pl-12 px-4 py-3.5 border-2 border-slate-100 bg-slate-50/50 backdrop-blur-md placeholder-slate-400 text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all sm:text-sm font-bold shadow-inner hover:border-slate-200"
                                    placeholder="Enter password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {isRegistering && (
                        <div className="space-y-4 bg-slate-50/50 backdrop-blur-sm p-6 rounded-[2rem] border border-slate-100 shadow-inner animate-fade-in-up">
                            <h3 className="text-sm font-black text-slate-800 mb-4">Personal Details</h3>
                            {[
                                { label: 'Full Name', type: 'text', key: 'name', ph: 'John Doe' },
                                { label: 'Email', type: 'email', key: 'email', ph: 'john@example.com' },
                                { label: 'Address / Location', type: 'text', key: 'address', ph: 'Farm or Lab Location' },
                                { label: 'Phone Number', type: 'tel', key: 'phone', ph: '10-digit number' },
                            ].map((field) => (
                                <div className="relative" key={field.key}>
                                    <label className="text-[10px] font-black tracking-widest text-slate-500 mb-1.5 block ml-1 uppercase">{field.label}</label>
                                    <input
                                        type={field.type}
                                        required={isRegistering}
                                        className="appearance-none rounded-xl relative block w-full px-4 py-3 border-2 border-slate-100 bg-white placeholder-slate-300 text-slate-800 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all sm:text-sm shadow-sm font-bold hover:border-slate-200"
                                        placeholder={field.ph}
                                        value={formData[field.key]}
                                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center py-4 rounded-2xl text-[15px] font-black text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 hover:-translate-y-1 transition-all duration-300 shadow-[0_8px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_12px_25px_rgba(16,185,129,0.4)] overflow-hidden relative group/btn disabled:opacity-70 disabled:hover:translate-y-0"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
                            <span className="relative z-10 flex items-center gap-2">
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        {isRegistering ? 'Create Account' : 'Sign In Securely'}
                                        {!isRegistering && <ArrowRight className="w-4 h-4" />}
                                    </>
                                )}
                            </span>
                        </button>
                    </div>
                </form>

                <div className="text-center mt-6">
                    <button
                        onClick={() => {
                            setIsRegistering(!isRegistering);
                            setError(null);
                        }}
                        className="text-sm font-black transition-colors inline-block pb-0.5 border-b-2 hover:border-emerald-600 text-slate-500 hover:text-emerald-700 border-transparent"
                    >
                        {isRegistering
                            ? 'Already have an account? Sign In'
                            : "Don't have an account? Register now"}
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
                .animate-blob {
                    animation: blob 10s infinite alternate cubic-bezier(0.4, 0, 0.2, 1);
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

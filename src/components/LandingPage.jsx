import React, { useState } from 'react';
import { Sprout, Sun, CloudRain, Thermometer, User, ArrowRight, Activity, Play, X, Zap, Cloud, Award } from 'lucide-react';
import WeatherWidget from './WeatherWidget';

export default function LandingPage({ onNavigateToLogin }) {
    const [showDemo, setShowDemo] = useState(false);

    return (
        <div className="min-h-screen bg-amber-50/40 font-sans overflow-hidden flex flex-col relative selection:bg-amber-200 selection:text-amber-900">
            
            {/* Immersive Breathtaking Background for Vibrant Earth Theme */}
            <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-orange-300/30 rounded-full mix-blend-multiply filter blur-[100px] pointer-events-none animate-pulse-slow"></div>
            <div className="absolute top-[20%] right-[-10%] w-[35rem] h-[35rem] bg-emerald-300/30 rounded-full mix-blend-multiply filter blur-[100px] pointer-events-none animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
            <div className="absolute bottom-[-20%] left-[20%] w-[45rem] h-[45rem] bg-amber-300/30 rounded-full mix-blend-multiply filter blur-[100px] pointer-events-none animate-pulse-slow" style={{ animationDelay: '4s' }}></div>

            {/* Container mapping to max-width to keep content readable but background full */}
            <div className="flex-grow flex flex-col max-w-[90rem] mx-auto w-full px-6 py-6 lg:px-16 lg:py-10">
                
                {/* Navbar */}
                <nav className="relative z-10 flex justify-between items-center mb-8 lg:mb-12">
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <div className="bg-emerald-500 rounded-xl p-2.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                            <Sprout className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-slate-800 tracking-tight">
                            Smart Pest <span className="text-emerald-500 font-semibold ml-1">Management System</span>
                        </span>
                    </div>
                    <button
                        onClick={onNavigateToLogin}
                        className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0"
                    >
                        <User className="w-4 h-4 text-emerald-600" />
                        Login / Register
                    </button>
                </nav>

                {/* Main Two-Column Content */}
                <main className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 flex-grow items-start pt-4 lg:pt-8">
                    
                    {/* Left Column */}
                    <div className="col-span-1 lg:col-span-5 flex flex-col justify-start space-y-10 animate-fade-in-up pr-4">
                        <div>
                            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-700 text-xs font-bold tracking-widest uppercase mb-8 backdrop-blur-sm shadow-sm hover:scale-105 transition-transform cursor-default">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                AI-Powered Protection
                            </div>
                            <h1 className="text-6xl lg:text-[5.5rem] font-black text-slate-800 leading-[1.05] tracking-tighter drop-shadow-sm">
                                Start Farming <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">
                                    Smarter, Not <br className="hidden sm:block" /> Harder
                                </span>
                            </h1>
                        </div>

                        <p className="text-slate-600 text-lg max-w-lg leading-relaxed font-medium">
                            Protect your crops with our advanced AI diagnosis system. Identify pests instantly, get expert treatment plans, and maximize your yield like never before.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-5 pt-2">
                            <button
                                onClick={onNavigateToLogin}
                                className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-8 py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 hover:from-teal-600 hover:to-emerald-600 transition-all shadow-xl shadow-emerald-500/25 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/30 group"
                            >
                                Get Started Free
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={() => setShowDemo(true)}
                                className="bg-white/80 backdrop-blur-sm text-slate-700 px-8 py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 border border-slate-200 hover:bg-white transition-all shadow-sm hover:shadow hover:-translate-y-1 group"
                            >
                                <div className="bg-teal-50 w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                                    <Play className="w-4 h-4 text-teal-600 fill-teal-600 ml-0.5" />
                                </div>
                                View Demo
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Cards Grid */}
                    <div className="col-span-1 lg:col-span-7 flex flex-col gap-6 relative z-10 w-full animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        {/* Decorative background behind cards */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/40 to-white/10 rounded-[4rem] -z-10 blur-xl"></div>
                        
                        {/* Weather Widget prominent */}
                        <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 hover:-translate-y-1 transition-transform w-full flex flex-col sm:flex-row items-center gap-6 lg:gap-8">
                            <div className="flex-1 px-2">
                                <h3 className="text-sm font-bold tracking-widest text-emerald-600 uppercase mb-4 flex items-center gap-2">
                                    <Thermometer className="w-5 h-5 text-orange-400 animate-pulse" />
                                    Live Field Conditions
                                </h3>
                                <p className="text-slate-500 text-sm leading-relaxed mb-4">
                                    Get real-time, hyper-local weather insights integrated directly into your diagnostic workflow. Optimize your planting and spraying schedules with precision accuracy tailored to your exact location.
                                </p>
                            </div>
                            <div className="flex-shrink-0 w-full sm:w-auto flex justify-center">
                                <WeatherWidget />
                            </div>
                        </div>

                        {/* Cards Grid beneath */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
                            {/* Card 1 */}
                            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:-translate-y-2 transition-all duration-300 flex flex-col items-center text-center group">
                                <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 mb-4 group-hover:scale-110 transition-transform group-hover:bg-blue-100">
                                    <Activity className="w-6 h-6" />
                                </div>
                                <h4 className="font-bold text-base text-slate-800 mb-2">Instant Analysis</h4>
                                <p className="text-xs text-slate-500 leading-relaxed font-medium">99% accuracy in diagnosing crop disease.</p>
                            </div>
                            
                            {/* Card 2 */}
                            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:-translate-y-2 transition-all duration-300 flex flex-col items-center text-center group sm:-mt-4">
                                <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 mb-4 group-hover:scale-110 transition-transform group-hover:bg-indigo-100">
                                    <Cloud className="w-6 h-6" />
                                </div>
                                <h4 className="font-bold text-base text-slate-800 mb-2">Smart Weather</h4>
                                <p className="text-xs text-slate-500 leading-relaxed font-medium">Hyper-local forecasts for schedules.</p>
                            </div>

                            {/* Card 3 */}
                            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:-translate-y-2 transition-all duration-300 flex flex-col items-center text-center group">
                                <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 mb-4 group-hover:scale-110 transition-transform group-hover:bg-amber-100">
                                    <Sun className="w-6 h-6" />
                                </div>
                                <h4 className="font-bold text-base text-slate-800 mb-2">Expert Care</h4>
                                <p className="text-xs text-slate-500 leading-relaxed font-medium">Get verified organic & chemical advice.</p>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Footer / Tech Stack */}
                <div className="relative z-10 text-center mt-16 pt-8 pb-4 border-t border-slate-200/60">
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">Powered by Neural Networks</h2>
                    <p className="text-slate-500 text-sm mt-2 font-medium">
                        We combine agricultural expertise with cutting-edge computer vision.
                    </p>
                    <p className="text-emerald-600 text-xs mt-3 font-semibold tracking-wider uppercase">
                        Developed by joelgeorge05
                    </p>
                </div>
            </div>

            {/* Video Modal */}
            {showDemo && (
                <div className="fixed inset-0 flex flex-col items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl animate-fade-in-up" style={{ zIndex: 9998 }}>
                    <button
                        onClick={() => setShowDemo(false)}
                        style={{ zIndex: 9999 }}
                        className="fixed top-4 right-4 md:top-8 md:right-8 bg-white hover:bg-slate-100 text-slate-900 rounded-full p-3 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] cursor-pointer hover:scale-105 active:scale-95 flex items-center gap-2 group"
                    >
                        <span className="pl-3 font-bold text-sm hidden sm:block tracking-wide">CLOSE</span>
                        <X className="w-6 h-6" />
                    </button>

                    <div className="relative w-full max-w-5xl bg-black rounded-[2rem] overflow-hidden shadow-[0_0_100px_rgba(16,185,129,0.15)] ring-1 ring-white/10" style={{ zIndex: 9998 }}>
                        <div className="absolute inset-0 bg-emerald-500/20 blur-[100px] -z-10"></div>
                        <div className="aspect-video w-full bg-black flex items-center justify-center relative">
                            <video
                                src="/videos/demo.mp4"
                                className="w-full h-full object-contain relative z-10"
                                controls
                                autoPlay
                                playsInline
                            >
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .animate-fade-in-up {
                    animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .animate-pulse-slow {
                    animation: pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                @keyframes fade-in-up {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: .7; transform: scale(1.05); }
                }
            `}</style>
        </div>
    );
}

import React from 'react';
import { ArrowRight, Activity, ShieldCheck, Sprout } from 'lucide-react';
import WeatherWidget from './WeatherWidget';

export default function Hero() {
    return (
        <div className="relative min-h-[90vh] flex items-center overflow-hidden">
            {/* Dynamic Background with Sweeping Gradient */}
            <div className="absolute inset-0 z-0 bg-slate-900">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(6,78,59,0.95),rgba(20,83,45,0.8),rgba(120,53,15,0.6))] bg-[length:200%_200%] animate-gradient-x z-10 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-r from-nature-900/95 via-nature-900/70 to-transparent z-10" />
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    poster="https://images.unsplash.com/photo-1625246333195-5519a180fff7?q=80&w=2070"
                    className="w-full h-full object-cover scale-105 animate-slow-pan"
                >
                    {/* Using a high-quality free stock farming video */}
                    <source src="https://cdn.coverr.co/videos/coverr-drone-shot-of-a-combine-harvester-working-in-a-field-2696/1080p.mp4" type="video/mp4" />
                </video>
            </div>

            <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center pt-20">
                <div className="space-y-8 animate-fade-in-up">
                    <div className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-fade-in-up hover:scale-105 transition-transform cursor-default" style={{ backgroundColor: '#d1fae5', border: '1px solid #6ee7b7' }}>
                        <Activity className="w-5 h-5 animate-pulse" style={{ color: '#059669' }} />
                        <span className="tracking-widest uppercase translate-y-[-1px] text-sm font-extrabold" style={{ color: '#064e3b' }}>AI-Powered Disease Detection</span>
                    </div>

                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] animate-fade-in-up tracking-tight" style={{ animationDelay: '100ms' }}>
                        Cultivate Success, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-amber-400 to-orange-400 filter drop-shadow hover:scale-[1.02] transition-transform inline-block mt-3 bg-[length:200%_auto] animate-text-shimmer">
                            Abundant Harvests
                        </span>
                    </h1>

                    <p className="text-xl text-gray-200/90 max-w-xl leading-relaxed font-medium animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                        Instant crop disease identification using advanced AI.
                        Protect your yield with real-time analysis and expert treatment planning right at your fingertips.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 pt-6 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                        <button
                            onClick={() => document.getElementById('analyze').scrollIntoView({ behavior: 'smooth' })}
                            className="relative overflow-hidden flex items-center justify-center gap-2 px-8 py-4 text-lg font-bold text-white rounded-full bg-gradient-to-r from-amber-500 to-orange-600 shadow-[0_0_30px_rgba(245,158,11,0.4)] group hover:shadow-[0_0_40px_rgba(245,158,11,0.6)] transform hover:-translate-y-1 transition-all duration-300 shrink-0"
                        >
                            <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] skew-x-12" />
                            <span className="relative z-10 flex items-center gap-2">
                                Start Analysis
                                <ArrowRight className="w-6 h-6 group-hover:translate-x-1.5 transition-transform" />
                            </span>
                        </button>

                        <div className="flex items-center gap-4 px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-xl hover:bg-white/20 transition-all shrink-0">
                            <div className="flex -space-x-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-12 h-12 rounded-full border-2 border-nature-900 bg-slate-800 overflow-hidden shadow-lg hover:z-10 hover:scale-110 transition-transform">
                                        <img src={`https://i.pravatar.cc/100?img=${i + 60}`} alt="Farmer" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                            <div className="text-sm text-amber-50 leading-tight">
                                <span className="font-extrabold text-white block text-lg">10,000+</span>
                                Farmers Trusted
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-6 items-center lg:items-end animate-fade-in-right delay-200 mt-12 lg:mt-0 relative group perspective-1000">
                    <div className="relative transform transition-all duration-500 hover:scale-105 hover:-rotate-1">
                        <WeatherWidget />
                    </div>

                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-[2rem] max-w-sm w-full text-white shadow-2xl hover:bg-white/15 hover:border-amber-400/50 transition-all duration-300 cursor-default transform hover:-translate-y-2">
                        <div className="flex items-center gap-4 mb-5">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/40 to-orange-400/20 flex items-center justify-center text-amber-300 border border-amber-500/30 shadow-inner">
                                <Sprout className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="font-black text-xl tracking-tight text-white">Growth Vitals</h3>
                                <p className="text-sm text-amber-100/70 font-bold uppercase tracking-widest mt-0.5">Optimal conditions</p>
                            </div>
                        </div>
                        <div className="h-4 bg-black/40 rounded-full overflow-hidden border border-white/10 relative p-0.5">
                            <div className="h-full w-[85%] bg-gradient-to-r from-amber-500 via-orange-400 to-rose-400 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.6)] animate-pulse" />
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-[2rem] max-w-sm w-full text-white shadow-2xl hover:bg-white/15 hover:border-emerald-400/50 transition-all duration-300 cursor-default transform hover:-translate-y-2 animate-float" style={{ animationDelay: '1s' }}>
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/40 to-green-400/20 flex items-center justify-center text-emerald-300 border border-emerald-500/30 shadow-inner">
                                <ShieldCheck className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="font-black text-xl tracking-tight text-white">Crop Health</h3>
                                <p className="text-sm font-black text-emerald-300 mt-1 bg-emerald-900/40 px-3 py-1 rounded border border-emerald-500/30 inline-block uppercase tracking-wider">99% Disease Free</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-white/50">
                <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-1">
                    <div className="w-1 h-3 bg-white/50 rounded-full" />
                </div>
            </div>
        </div>
    );
}

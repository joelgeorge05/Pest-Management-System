import React from 'react';
import { Calendar, CloudSun, Sprout } from 'lucide-react';
import { seasonalAdvice } from '../data/diseases';

export default function SeasonalAdvice() {
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    // Find advice for current/next month or default
    const advice = seasonalAdvice.find(a => a.month === currentMonth) || seasonalAdvice[1];

    return (
        <div id="prevention" className="py-24 bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-900 text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-50"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-16">
                    <div className="flex-1">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-800/80 backdrop-blur-sm border border-emerald-600/50 text-amber-300 text-[11px] font-black tracking-widest uppercase mb-8 shadow-lg shadow-emerald-900/50">
                            <Calendar className="w-4 h-4 text-orange-400" />
                            <span>Seasonal Advisory: {currentMonth}</span>
                        </div>

                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight leading-[1.1]">
                            Proactive Prevention for <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-400 filter drop-shadow">Current Season</span>
                        </h2>

                        <p className="text-emerald-100/90 text-lg md:text-xl font-medium leading-relaxed mb-10 max-w-xl">
                            Stay ahead of diseases before they strike. Based on current weather patterns and crop cycles, here is what you should watch out for.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {advice.crops.map((crop, idx) => (
                                <div key={idx} className="flex items-center gap-4 bg-white/5 hover:bg-white/10 p-5 rounded-2xl backdrop-blur-md border border-white/10 transition-colors shadow-inner">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-amber-500/20 flex items-center justify-center border border-emerald-500/30 shadow-inner">
                                        <Sprout className="w-6 h-6 text-amber-400" />
                                    </div>
                                    <span className="font-bold text-emerald-50 text-lg tracking-wide">{crop}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 bg-white/5 backdrop-blur-xl p-10 md:p-12 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden group hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 w-full lg:max-w-lg mx-auto">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full pointer-events-none" />
                        <div className="absolute top-8 right-8 text-emerald-400/10 group-hover:text-amber-400/20 transition-colors duration-700 group-hover:scale-110 group-hover:rotate-12 transform">
                            <CloudSun className="w-32 h-32" />
                        </div>
                        <h3 className="text-3xl font-black mb-6 relative z-10 text-emerald-50 tracking-tight">Monthly Forecast</h3>
                        <p className="text-emerald-100/80 text-xl font-medium leading-relaxed mb-10 relative z-10 italic">
                            "{advice.advice}"
                        </p>
                        <button className="text-xs font-black text-amber-400 hover:text-amber-300 uppercase tracking-widest flex items-center gap-2 group/btn relative z-10 bg-amber-500/10 hover:bg-amber-500/20 px-6 py-3 rounded-xl transition-colors border border-amber-500/20 inline-flex">
                            View Full Calendar <span className="group-hover/btn:translate-x-2 transition-transform">→</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

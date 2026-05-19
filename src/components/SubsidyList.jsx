
import React, { useState, useEffect } from 'react';
import { Flag, Calendar, ExternalLink } from 'lucide-react';

const SubsidyList = () => {
    const [subsidies, setSubsidies] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSubsidies = async () => {
        try {
            const res = await fetch('http://localhost:5000/subsidies');
            const data = await res.json();
            if (Array.isArray(data)) {
                setSubsidies(data);
            } else {
                setSubsidies([]);
            }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching subsidies:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubsidies();
    }, []);

    if (loading) return <div className="text-center p-8 text-emerald-600">Loading schemes...</div>;

    return (
        <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm font-bold border border-emerald-100 mb-3 shadow-sm">
                        <Flag className="w-4 h-4" />
                        <span>Government Support</span>
                    </div>
                    <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                        Schemes & <span className="text-gradient">Subsidies</span>
                    </h2>
                </div>
                <p className="text-slate-500 font-medium max-w-sm">
                    Stay updated on the latest financial support and agricultural funds provided by the government.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {subsidies.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                        <p className="text-gray-500 text-lg">No active schemes posted at the moment.</p>
                    </div>
                ) : (
                    subsidies.map((subsidy) => (
                        <div key={subsidy._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group flex flex-col">
                            {subsidy.image && (
                                <div className="h-56 overflow-hidden relative bg-slate-100">
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent z-10" />
                                    <img src={`http://localhost:5000/uploads/${subsidy.image}`} alt={subsidy.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                </div>
                            )}
                            <div className="p-6 flex flex-col flex-1">
                                <div className="flex justify-between items-start mb-4 gap-4">
                                    <h3 className="text-xl font-bold text-slate-900 leading-tight group-hover:text-emerald-700 transition-colors uppercase tracking-wide">{subsidy.title}</h3>
                                    <span className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {subsidy.date_posted}
                                    </span>
                                </div>

                                <p className="text-slate-600 leading-relaxed whitespace-pre-line mb-6 flex-1 text-sm">
                                    {subsidy.description}
                                </p>

                                <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-3">
                                    {subsidy.link && (
                                        <a
                                            href={subsidy.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 hover:text-emerald-800 transition-colors py-2.5 px-4 rounded-xl text-sm"
                                        >
                                            Official Details <ExternalLink className="w-4 h-4" />
                                        </a>
                                    )}

                                    {subsidy.brochure && (
                                        <a
                                            href={`http://localhost:5000/uploads/${subsidy.brochure}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 hover:text-blue-800 transition-colors py-2.5 px-4 rounded-xl text-sm"
                                        >
                                            Brochure <ExternalLink className="w-4 h-4" />
                                        </a>
                                    )}
                                </div>
                            </div>
                            <div className="bg-gradient-to-r from-emerald-400 to-teal-500 h-1.5 w-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default SubsidyList;

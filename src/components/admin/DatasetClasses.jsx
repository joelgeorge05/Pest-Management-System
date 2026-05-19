import React, { useState, useEffect } from 'react';
import { Search, Bug, Leaf, Info, Sprout } from 'lucide-react';

const DatasetClasses = ({ onNavigateToGuide }) => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all'); // all, diseases, pests

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const response = await fetch('http://localhost:5000/classes');
            if (response.ok) {
                const data = await response.json();
                setClasses(data);
            } else {
                console.error('Failed to fetch classes');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredClasses = classes.filter(item => {
        const matchesSearch = item.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.original_name.toLowerCase().includes(searchTerm.toLowerCase());

        if (filter === 'all') return matchesSearch;
        if (filter === 'diseases') return matchesSearch && item.category.includes('Disease');
        if (filter === 'pests') return matchesSearch && item.category.includes('Pest');
        return matchesSearch;
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Detected Species & Diseases</h2>
                <div className="flex gap-2">
                    <div className="bg-blue-50 text-blue-800 px-3 py-1.5 rounded-full text-xs font-bold border border-blue-100 flex items-center gap-1.5">
                        <span>Total:</span> {classes.length}
                    </div>
                    <div className="bg-emerald-900/30 text-green-800 px-3 py-1.5 rounded-full text-xs font-bold border border-green-100 flex items-center gap-1.5">
                        <Sprout className="w-3.5 h-3.5" />
                        <span>Diseases:</span> {classes.filter(c => c.category.includes('Disease')).length}
                    </div>
                    <div className="bg-amber-50 text-amber-800 px-3 py-1.5 rounded-full text-xs font-bold border border-amber-100 flex items-center gap-1.5">
                        <Bug className="w-3.5 h-3.5" />
                        <span>Pests:</span> {classes.filter(c => c.category.includes('Pest')).length}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 bg-white backdrop-blur-xl border-emerald-500/20 p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Search species, diseases..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all'
                            ? 'bg-gray-800 text-slate-900'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('diseases')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${filter === 'diseases'
                            ? 'bg-green-600 text-white'
                            : 'bg-emerald-900/30 text-emerald-800 hover:bg-green-100'
                            }`}
                    >
                        <Leaf className="h-4 w-4" />
                        Diseases
                    </button>
                    <button
                        onClick={() => setFilter('pests')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${filter === 'pests'
                            ? 'bg-amber-600 text-white'
                            : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                            }`}
                    >
                        <Bug className="h-4 w-4" />
                        Pests
                    </button>
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                    <p className="mt-4 text-gray-500">Loading detection classes...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClasses.map((item) => (
                        <div key={item.id} className="bg-white backdrop-blur-xl rounded-3xl p-6 relative overflow-hidden group hover:shadow-2xl transition-all duration-300 border border-slate-200/80 hover:border-emerald-500/30 hover:-translate-y-1">
                            {/* Decorative Gradient Blob */}
                            <div className={`absolute -right-12 -top-12 w-32 h-32 rounded-full opacity-10 blur-2xl transition-all duration-500 group-hover:scale-150 ${item.category.includes('Pest') ? 'bg-amber-500' : 'bg-green-500'}`}></div>

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase ${item.category.includes('Pest') ? 'bg-amber-100/80 text-amber-800' : 'bg-green-100/80 text-green-800'}`}>
                                        {item.category}
                                    </span>
                                    {item.category.includes('Pest') ? <Bug className="w-5 h-5 text-amber-500" /> : <Sprout className="w-5 h-5 text-green-600" />}
                                </div>

                                <h3 className="text-xl font-extrabold text-slate-800 mb-1 leading-tight group-hover:text-emerald-700 transition-colors">
                                    {item.display_name}
                                </h3>
                                <p className="text-xs font-mono text-slate-800 mb-4 truncate opacity-70 group-hover:opacity-100 transition-opacity">
                                    ID: {item.original_name}
                                </p>

                                <p className="text-sm text-slate-800 mb-6 bg-white p-3 rounded-xl border border-slate-200 backdrop-blur-sm min-h-[60px]">
                                    {item.description || "No description available for this species."}
                                </p>

                                <div className="space-y-3 mb-6">
                                    {item.symptoms && (
                                        <div className="bg-red-900/30/50 p-3 rounded-xl border border-red-100/50 group-hover:bg-red-900/30 transition-colors">
                                            <div className="flex items-center gap-2 text-red-300 font-bold text-xs mb-1 uppercase tracking-wide">
                                                <Info className="w-3 h-3" /> Symptoms
                                            </div>
                                            <p className="text-xs text-slate-700 leading-relaxed">
                                                {item.symptoms}
                                            </p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-3">
                                        {(item.treatment_organic || item.prevention) && (
                                            <>
                                                <div className="bg-emerald-900/30/50 p-3 rounded-xl border border-green-100/50">
                                                    <span className="text-[10px] font-bold text-emerald-800 uppercase block mb-1">Treatment</span>
                                                    <p className="text-xs text-slate-700 line-clamp-2">{item.treatment_organic ? item.treatment_organic.split(';')[0] : "N/A"}</p>
                                                </div>
                                                <div className="bg-blue-900/30 p-3 rounded-xl border border-blue-900/50">
                                                    <span className="text-[10px] font-bold text-blue-700 uppercase block mb-1">Prevention</span>
                                                    <p className="text-xs text-slate-700 line-clamp-2">{item.prevention ? item.prevention.split('.')[0] : "N/A"}</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        if (onNavigateToGuide) onNavigateToGuide();
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className="w-full py-3 rounded-xl border border-slate-200/80 text-slate-800 font-bold text-sm hover:bg-emerald-900/30 hover:text-emerald-700 hover:border-green-200 transition-all flex items-center justify-center gap-2 group/btn shadow-sm"
                                >
                                    <Sprout className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
                                    Manage Medicines
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DatasetClasses;

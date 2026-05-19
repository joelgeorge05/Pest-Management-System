import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, Bug, Leaf, Info, Sprout, Edit, Save, X, Plus, Beaker, Home, ScanLine, Send, Filter, Upload } from 'lucide-react';

export default function KnowledgeBase({ diseaseData, canEdit, onUpdate, isExpert, expertName }) {
    // Shared State
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all'); // all, diseases, pests
    const [plantFilter, setPlantFilter] = useState('all');

    // DiseaseGuide Editing State
    const [editingItem, setEditingItem] = useState(null); // The item currently open in the modal
    const [editForm, setEditForm] = useState({ name: '', organic: [], inorganic: [], homemade: [], description: '', symptoms: [] });
    const [localInputs, setLocalInputs] = useState({ symptoms: '', organic: '', inorganic: '', homemade: '' });

    // Fetch classes on mount
    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const response = await fetch('http://localhost:5000/classes');
            if (response.ok) {
                const data = await response.json();
                setClasses(data);
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
        } finally {
            setLoading(false);
        }
    };

    const csvData = diseaseData?.csv_data || {};

    // Helper to get plant name
    const getPlantName = (id) => {
        if (!id) return 'Unknown';
        const strId = String(id);
        if (strId.includes('___')) return strId.split('___')[0];
        return strId.split('_')[0];
    };

    // Derived unique plants from AI classes AND csvData (to be safe)
    const allPlants = [...new Set([
        ...classes.map(c => getPlantName(c?.original_name)),
        ...Object.values(csvData || {}).map(d => getPlantName(d?.id))
    ])].filter(Boolean).sort();

    // Data merging & filtering
    const combinedData = [];
    
    // First, add all AI classes
    (classes || []).forEach(c => {
        if (!c) return;
        const matchingCsv = csvData[c.original_name] || {};
        combinedData.push({
            id: c.original_name || `ai-${Math.random()}`,
            source: 'ai',
            display_name: c.display_name || c.original_name || 'Unknown Disease',
            original_name: c.original_name || '',
            category: c.category || 'Disease',
            description: matchingCsv.description || c.description || '',
            symptoms: matchingCsv.symptoms || (c.symptoms ? String(c.symptoms).split(';') : []),
            treatments: matchingCsv.treatments || {
                organic: c.treatment_organic ? String(c.treatment_organic).split(';') : [],
                inorganic: [],
                homemade: []
            },
            prevention: c.prevention || matchingCsv.prevention || ''
        });
    });

    // Second, add any custom entries from csvData that are NOT in AI classes
    Object.entries(csvData || {}).forEach(([csvId, csvItem]) => {
        if (!csvItem) return;
        if (!combinedData.some(c => c.id === csvId)) {
            combinedData.push({
                id: csvId,
                source: 'custom',
                display_name: csvItem.name || csvId || 'Unknown Disease',
                original_name: csvId,
                category: (csvItem.name?.toLowerCase() || '').includes('pest') ? 'Pest' : 'Disease',
                description: csvItem.description || '',
                symptoms: csvItem.symptoms || [],
                treatments: csvItem.treatments || { organic: [], inorganic: [], homemade: [] },
                prevention: csvItem.prevention || ''
            });
        }
    });

    const filteredData = combinedData.filter(item => {
        const searchStr = `${item.display_name} ${item.original_name} ${item.description}`.toLowerCase();
        const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
        
        let matchesCategory = true;
        const cat = item.category || '';
        if (filterCategory === 'diseases') matchesCategory = cat.includes('Disease');
        if (filterCategory === 'pests') matchesCategory = cat.includes('Pest');

        let matchesPlant = true;
        if (plantFilter !== 'all') {
            matchesPlant = getPlantName(item.id) === plantFilter;
        }

        return matchesSearch && matchesCategory && matchesPlant;
    });

    // --- Guide Editing Logic ---

    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('http://localhost:5000/api/admin/import/treatments', {
                method: 'POST', body: formData
            });
            const data = await res.json();
            if (res.ok) {
                alert(`Imported ${data.imported}, Updated ${data.updated}.`);
                if (onUpdate) onUpdate();
            } else {
                alert(`Import Failed: ${data.error}`);
            }
        } catch (err) {
            console.error(err);
            alert("Error uploading file.");
        } finally {
            e.target.value = null;
        }
    };

    const handleAddNew = () => {
        const id = prompt("Enter unique Disease ID (e.g. 'Tomato___New_Virus'):");
        if (!id) return;
        const name = prompt("Enter Display Name:");
        if (!name) return;

        const newDisease = {
            id: id,
            name: name,
            description: '',
            symptoms: [],
            treatments: { organic: [], inorganic: [], homemade: [] }
        };
        startEditing(newDisease);
    };

    const startEditing = (item) => {
        setEditingItem(item);
        setEditForm({
            id: item.id,
            name: item.display_name || item.name || '',
            description: item.description || '',
            symptoms: Array.isArray(item.symptoms) ? [...item.symptoms] : (typeof item.symptoms === 'string' ? item.symptoms.split(';').map(s=>s.trim()).filter(Boolean) : []),
            organic: [...(item.treatments?.organic || [])],
            inorganic: [...(item.treatments?.inorganic || [])],
            homemade: [...(item.treatments?.homemade || [])]
        });
        setLocalInputs({ symptoms: '', organic: '', inorganic: '', homemade: '' });
    };

    const cancelEditing = () => {
        setEditingItem(null);
    };

    const handleSave = async () => {
        if (!editingItem) return;
        try {
            const body = {
                id: editForm.id,
                name: editForm.name,
                description: editForm.description,
                symptoms: editForm.symptoms,
                treatments: {
                    organic: editForm.organic,
                    inorganic: editForm.inorganic,
                    homemade: editForm.homemade
                }
            };

            if (isExpert) {
                body.expert = expertName;
                const res = await fetch(`http://localhost:5000/api/expert/proposals`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
                });
                if (res.ok) {
                    setEditingItem(null);
                    alert("Proposal submitted successfully! An admin will review your changes.");
                } else alert("Failed to submit proposal.");
            } else {
                const res = await fetch(`http://localhost:5000/api/admin/disease/update`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
                });
                if (res.ok) {
                    if (onUpdate) onUpdate();
                    setEditingItem(null);
                    alert("Knowledge Base updated successfully!");
                } else alert("Failed to update Knowledge Base.");
            }
        } catch (e) {
            console.error(e);
            alert("Error saving data.");
        }
    };

    const handleAddInput = (category) => {
        const val = localInputs[category];
        if (val && val.trim()) {
            setEditForm(prev => ({ ...prev, [category]: [...prev[category], val.trim()] }));
            setLocalInputs(prev => ({ ...prev, [category]: '' }));
        }
    };

    const handleKeyPress = (e, category) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddInput(category);
        }
    };

    const removeItem = (category, index) => {
        setEditForm(prev => ({ ...prev, [category]: prev[category].filter((_, i) => i !== index) }));
    };

    // Render Editable Section for Modal
    const renderEditableSection = (title, category, icon, colorClass, borderClass, bgClass) => (
        <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
                <span className={`text-xs font-bold ${colorClass || 'text-slate-700'} uppercase flex items-center gap-1`}>
                    {icon} {title}
                </span>
            </div>
            <div className="flex gap-2 mb-3">
                <input
                    type="text"
                    value={localInputs[category]}
                    onChange={e => setLocalInputs(prev => ({ ...prev, [category]: e.target.value }))}
                    onKeyDown={e => handleKeyPress(e, category)}
                    placeholder={`Type new ${title.toLowerCase()} here...`}
                    className={`flex-1 text-sm px-3 py-2 border ${borderClass} rounded-lg focus:outline-none focus:ring-2 bg-white`}
                />
                <button
                    onClick={() => handleAddInput(category)}
                    disabled={!localInputs[category].trim()}
                    className={`px-4 py-2 rounded-lg text-sm font-bold text-white transition-colors ${!localInputs[category].trim() ? 'bg-slate-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 shadow-sm'}`}
                >
                    Add
                </button>
            </div>
            <ul className="space-y-2">
                {editForm[category] && editForm[category].map((item, i) => (
                    <li key={i} className={`flex justify-between items-center bg-white px-3 py-2 rounded border ${borderClass} text-sm shadow-sm`}>
                        <span className="break-words max-w-[85%]">{typeof item === 'object' ? item.name : item}</span>
                        <button onClick={() => removeItem(category, i)} className="text-slate-800 hover:text-red-500 p-1 rounded-full hover:bg-red-50">
                            <X className="w-4 h-4" />
                        </button>
                    </li>
                ))}
                {(!editForm[category] || editForm[category].length === 0) && <span className="text-xs text-slate-500 italic block">No items added yet.</span>}
            </ul>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header and Controls */}
            <div className="bg-white backdrop-blur-xl rounded-3xl p-6 border border-slate-200/80 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                            <Leaf className="w-6 h-6 text-emerald-600" /> Knowledge Base
                        </h2>
                        <div className="flex gap-2 ml-4">
                            <span className="bg-emerald-900/10 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold border border-green-200 flex items-center gap-1.5">
                                <Sprout className="w-3.5 h-3.5" />
                                {combinedData.filter(d => (d.category || '').includes('Disease')).length} Diseases
                            </span>
                            <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-bold border border-amber-200 flex items-center gap-1.5">
                                <Bug className="w-3.5 h-3.5" />
                                {combinedData.filter(d => (d.category || '').includes('Pest')).length} Pests
                            </span>
                        </div>
                    </div>

                    {canEdit && (
                        <div className="flex gap-3">
                            {!isExpert && (
                                <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold shadow-sm flex items-center gap-2 transition-all">
                                    <Upload className="w-4 h-4" /> Import CSV
                                    <input type="file" accept=".csv" className="hidden" onChange={handleImport} />
                                </label>
                            )}
                            <button
                                onClick={handleAddNew}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-indigo-700 flex items-center gap-2 transition-all"
                            >
                                <Plus className="w-4 h-4" /> {isExpert ? 'Propose New' : 'Add Custom'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Search species, diseases, symptoms..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="relative min-w-[180px]">
                        <select
                            value={plantFilter}
                            onChange={e => setPlantFilter(e.target.value)}
                            className="w-full px-4 py-2.5 pl-10 border border-slate-200 bg-slate-50 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none appearance-none cursor-pointer"
                        >
                            <option value="all">All Plants</option>
                            {allPlants.map(plant => (
                                <option key={plant} value={plant} className="capitalize">{plant.replace(/_/g, ' ')}</option>
                            ))}
                        </select>
                        <Leaf className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <div className="flex gap-2">
                        <button onClick={() => setFilterCategory('all')} className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${filterCategory === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>All</button>
                        <button onClick={() => setFilterCategory('diseases')} className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-1.5 ${filterCategory === 'diseases' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}><Sprout className="w-4 h-4" /> Diseases</button>
                        <button onClick={() => setFilterCategory('pests')} className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-1.5 ${filterCategory === 'pests' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'}`}><Bug className="w-4 h-4" /> Pests</button>
                    </div>
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
                    <p className="mt-4 text-gray-500 font-medium">Loading knowledge base...</p>
                </div>
            ) : filteredData.length === 0 ? (
                <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-200 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-slate-100">
                        <Search className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 mb-2">No Results Found</h3>
                    <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
                        We couldn't find any {filterCategory === 'diseases' ? 'diseases' : filterCategory === 'pests' ? 'pests' : 'diseases or pests'} matching <strong>"{searchTerm}"</strong> for the selected criteria.
                        Try adjusting your search terms or plant filters.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredData.map((item) => (
                        <div key={item.id} className="bg-white rounded-3xl p-6 relative overflow-hidden group hover:shadow-2xl transition-all duration-300 border border-slate-200 hover:border-emerald-500/50 hover:-translate-y-1 flex flex-col">
                            {/* Decorative Background */}
                            <div className={`absolute -right-12 -top-12 w-32 h-32 rounded-full opacity-10 transition-all duration-500 group-hover:scale-150 ${(item.category || '').includes('Pest') ? 'bg-amber-500' : 'bg-green-500'}`}></div>

                            <div className="relative z-10 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex gap-2">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${(item.category || '').includes('Pest') ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                            {item.category || 'General'}
                                        </span>
                                        {item.source === 'custom' && (
                                            <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-indigo-100 text-indigo-800">Custom</span>
                                        )}
                                    </div>
                                    {(item.category || '').includes('Pest') ? <Bug className="w-5 h-5 text-amber-500" /> : <Sprout className="w-5 h-5 text-emerald-600" />}
                                </div>

                                <h3 className="text-xl font-black text-slate-800 mb-1 leading-tight group-hover:text-emerald-700 transition-colors capitalize">
                                    {(item.display_name || '').replace(/_/g, ' ')}
                                </h3>
                                <p className="text-[10px] font-mono font-bold text-slate-500 mb-4 truncate uppercase tracking-widest">
                                    {item.id}
                                </p>

                                <div className="text-sm text-slate-700 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100 min-h-[80px] flex-1">
                                    {item.description ? (
                                        <p className="line-clamp-3">{item.description}</p>
                                    ) : (
                                        <p className="italic text-slate-400">No description provided...</p>
                                    )}
                                </div>

                                <div className="flex gap-2 mb-6">
                                    <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                                        <span className="block text-xl font-black text-slate-800">{item.symptoms?.length || 0}</span>
                                        <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Symptoms</span>
                                    </div>
                                    <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                                        <span className="block text-xl font-black text-slate-800">
                                            {(item.treatments?.organic?.length || 0) + (item.treatments?.inorganic?.length || 0) + (item.treatments?.homemade?.length || 0)}
                                        </span>
                                        <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Treatments</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => startEditing(item)}
                                    className="w-full py-3.5 rounded-xl border-2 border-slate-100 text-slate-700 font-bold text-sm hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all flex items-center justify-center gap-2 group/btn shadow-sm"
                                >
                                    <Edit className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                                    {isExpert ? 'Propose Treatments' : 'Manage Guidelines'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit / Detail Modal Overlay */}
            {editingItem && createPortal(
                <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6" style={{ zIndex: 99999 }}>
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={cancelEditing}></div>
                    <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2rem] shadow-2xl relative z-10 flex flex-col overflow-hidden border border-slate-200">
                        
                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/80 flex justify-between items-center backdrop-blur-md sticky top-0 z-20">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                    {isExpert ? 'Propose Updates: ' : 'Edit Guidelines: '} 
                                    <span className="text-emerald-700">{(editForm.name || '').replace(/_/g, ' ')}</span>
                                </h3>
                                <p className="text-xs font-mono font-bold text-slate-500 mt-1 uppercase tracking-widest">{editForm.id}</p>
                            </div>
                            <button onClick={cancelEditing} className="p-2 bg-white rounded-full hover:bg-red-50 hover:text-red-500 shadow-sm border border-slate-200 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white">
                            <div className="space-y-8">
                                
                                {/* Description */}
                                <div>
                                    <label className="block text-[11px] font-black text-slate-700 tracking-widest uppercase mb-2">Description</label>
                                    <textarea
                                        value={editForm.description}
                                        onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                        className="w-full text-sm p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none shadow-sm transition-all resize-y"
                                        rows={3}
                                        placeholder="Detailed description of the disease or pest..."
                                    />
                                </div>

                                <hr className="border-slate-100" />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                        {renderEditableSection('Symptoms', 'symptoms', <ScanLine className="w-4 h-4" />, 'text-slate-800', 'border-slate-200', 'focus:ring-slate-400')}
                                    </div>
                                    <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100/50">
                                        {renderEditableSection('Organic Treatments', 'organic', <Sprout className="w-4 h-4" />, 'text-emerald-800', 'border-emerald-200/60', 'focus:ring-emerald-500')}
                                    </div>
                                    <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100/50">
                                        {renderEditableSection('Chemical Treatments', 'inorganic', <Beaker className="w-4 h-4" />, 'text-blue-800', 'border-blue-200/60', 'focus:ring-blue-500')}
                                    </div>
                                    <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100/50">
                                        {renderEditableSection('Homemade Remedies', 'homemade', <Home className="w-4 h-4" />, 'text-amber-800', 'border-amber-200/60', 'focus:ring-amber-500')}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-8 py-5 border-t border-slate-100 bg-white flex justify-end gap-4">
                            <button onClick={cancelEditing} className="px-6 py-2.5 text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl text-sm font-bold transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleSave} className={`px-6 py-2.5 ${isExpert ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm shadow-emerald-500/20 hover:shadow-lg transition-all`}>
                                {isExpert ? <Send className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                                {isExpert ? "Submit Proposal" : "Save Guidelines"}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}

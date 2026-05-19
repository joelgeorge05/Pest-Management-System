import React, { useState, useEffect } from 'react';
import { Edit, Save, X, Plus, Trash2, Sprout, Beaker, Home, ScanLine, Send, Filter, Upload, Bug, Leaf } from 'lucide-react';

export default function DiseaseGuide({ diseaseData, canEdit, onUpdate, isExpert, expertName }) {
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ organic: [], inorganic: [], homemade: [], description: '', symptoms: [] });
    // const [newItem, setNewItem] = useState({ category: '', value: '' }); // REMOVED DUPLICATE

    // 1. Guard Clause: If data is missing or loading, show a safe loading state
    if (!diseaseData) {
        return (
            <div className="p-12 text-center text-slate-700 bg-white backdrop-blur-xl border-emerald-500/20 rounded-xl border border-dashed border-slate-200/80">
                <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                Loading disease guide...
            </div>
        );
    }

    // 2. Safe Fallback: Ensure csv_data exists
    const csvData = diseaseData.csv_data || {};

    // Group diseases by plant
    const grouped = new Map();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all'); // all, missing_organic, missing_chemical, missing_homemade
    const [plantFilter, setPlantFilter] = useState('all');
    const [categories, setCategories] = useState({});

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('http://localhost:5000/classes');
                if (res.ok) {
                    const data = await res.json();
                    const map = {};
                    data.forEach(item => {
                        map[item.original_name] = item.category;
                    });
                    setCategories(map);
                    console.log("Categories loaded:", Object.keys(map).length, map);
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        fetchCategories();
    }, []);



    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('http://localhost:5000/api/admin/import/treatments', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (res.ok) {
                let msg = `Import Report:\n- Imported New: ${data.imported}\n- Updated Existing: ${data.updated}\n- Errors: ${data.errors.length}`;

                if (data.errors.length > 0) {
                    msg += `\n\nTop Errors:\n${data.errors.slice(0, 5).join('\n')}`;
                    if (data.errors.length > 5) msg += `\n...and ${data.errors.length - 5} more.`;
                }

                if (data.imported === 0 && data.updated === 0 && data.errors.length === 0) {
                    msg += "\n\nWarning: No records were processed. Please check your CSV headers.";
                    if (data.debug_headers) msg += `\nFound Headers: ${data.debug_headers.join(', ')}`;
                }

                alert(msg);
                onUpdate(); // Refresh data
            } else {
                alert(`Import Failed: ${data.error}`);
            }
        } catch (err) {
            console.error(err);
            alert("Error uploading file. Please check your connection.");
        } finally {
            e.target.value = null; // Reset input
        }
    };

    const handleAddNew = () => {
        const id = prompt("Enter unique Disease ID (e.g. 'Tomato___New_Virus'):");
        if (!id) return;
        const name = prompt("Enter Display Name:");
        if (!name) return;

        // Create temp object to edit
        const newDisease = {
            id: id,
            name: name,
            description: '',
            symptoms: [],
            treatments: { organic: [], inorganic: [], homemade: [] }
        };
        startEditing(newDisease);
    };

    const startEditing = (disease) => {
        setEditingId(disease.id);
        setEditForm({
            ...disease, // Spread the entire disease object
            // Ensure treatments are correctly structured for the form
            organic: [...(disease.treatments?.organic || [])],
            inorganic: [...(disease.treatments?.inorganic || [])],
            homemade: [...(disease.treatments?.homemade || [])],
            // Ensure symptoms are an array
            symptoms: Array.isArray(disease.symptoms)
                ? disease.symptoms
                : (typeof disease.symptoms === 'string' ? disease.symptoms.split(';').map(s => s.trim()).filter(s => s) : [])
        });
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditForm({ organic: [], inorganic: [], homemade: [], description: '', symptoms: [] });
    };

    const handleSave = async (id) => {
        try {
            // Check Mode: Expert Proposal vs Admin Direct Update
            if (isExpert) {
                const body = {
                    id: id,
                    name: editForm.name,
                    expert: expertName,
                    description: editForm.description,
                    symptoms: editForm.symptoms,
                    treatments: {
                        organic: editForm.organic,
                        inorganic: editForm.inorganic,
                        homemade: editForm.homemade
                    }
                };

                const res = await fetch(`http://localhost:5000/api/expert/proposals`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });

                if (res.ok) {
                    setEditingId(null);
                    alert("Proposal submitted successfully! An admin will review your changes.");
                } else {
                    alert("Failed to submit proposal.");
                }
                return;
            }

            // Admin Mode (Direct Update)
            const body = {
                id: id,
                ...editForm
            };
            const res = await fetch(`http://localhost:5000/api/admin/disease/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (res.ok) {
                const updated = await res.json();
                onUpdate(); // Trigger parent refresh
                setEditingId(null);
                alert("Treatments updated successfully!");
            } else {
                alert("Failed to update treatments.");
            }
        } catch (e) {
            console.error(e);
            alert("Error saving data.");
        }
    };

    // State for managing local inputs for each category
    const [localInputs, setLocalInputs] = useState({
        symptoms: '',
        organic: '',
        inorganic: '',
        homemade: ''
    });

    const handleAddInput = (category) => {
        const val = localInputs[category];
        if (val && val.trim()) {
            setEditForm(prev => ({
                ...prev,
                [category]: [...prev[category], val.trim()]
            }));
            // Clear input
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
        setEditForm(prev => ({
            ...prev,
            [category]: prev[category].filter((_, i) => i !== index)
        }));
    };

    // Helper to extract clean plant name
    const getPlantName = (id) => {
        if (!id) return 'Unknown';
        // Try standard PlantVillage format first (Plant___Disease)
        if (id.includes('___')) {
            return id.split('___')[0];
        }
        // Fallback for custom format (Plant_Disease) - take first word
        return id.split('_')[0];
    };

    // Safe accessor for disease values
    const getDiseaseValues = () => {
        // csvData is already safely derived above
        if (!csvData) return [];
        try {
            console.log("Disease Data Keys:", Object.keys(csvData).length);
            return Object.values(csvData).filter(d => d && typeof d === 'object');
        } catch (e) {
            console.error("Error extracting disease data:", e);
            return [];
        }
    };

    const diseaseValues = getDiseaseValues();

    // Extract all unique plant names for the dropdown
    const allPlants = Array.isArray(diseaseValues) ? [...new Set(diseaseValues.map(d => getPlantName(d.id || 'Unknown')))].sort() : [];

    // Filter logic
    const filteredDiseaseData = diseaseValues.filter(d => {
        // 1. Text Search
        let matchesSearch = true;
        if (searchTerm) {
            const lowSearch = String(searchTerm).toLowerCase();
            const getStr = (val) => typeof val === 'object' && val !== null ? String(val.name || '') : String(val);
            matchesSearch = (d.name && String(d.name).toLowerCase().includes(lowSearch)) ||
                (d.id && String(d.id).toLowerCase().includes(lowSearch)) ||
                (d.description && String(d.description).toLowerCase().includes(lowSearch)) ||
                (d.symptoms && Array.isArray(d.symptoms) && d.symptoms.some(s => s && getStr(s).toLowerCase().includes(lowSearch))) ||
                (d.treatments?.organic && Array.isArray(d.treatments.organic) && d.treatments.organic.some(t => t && getStr(t).toLowerCase().includes(lowSearch))) ||
                (d.treatments?.inorganic && Array.isArray(d.treatments.inorganic) && d.treatments.inorganic.some(t => t && getStr(t).toLowerCase().includes(lowSearch))) ||
                (d.treatments?.homemade && Array.isArray(d.treatments.homemade) && d.treatments.homemade.some(t => t && getStr(t).toLowerCase().includes(lowSearch)));
        }

        // 2. Type Filter (Missing Treatments)
        let matchesFilter = true;
        if (filterType === 'missing_organic') {
            matchesFilter = !d.treatments?.organic || !Array.isArray(d.treatments.organic) || d.treatments.organic.length === 0;
        } else if (filterType === 'missing_chemical') {
            matchesFilter = !d.treatments?.inorganic || !Array.isArray(d.treatments.inorganic) || d.treatments.inorganic.length === 0;
        } else if (filterType === 'missing_homemade') {
            matchesFilter = !d.treatments?.homemade || !Array.isArray(d.treatments.homemade) || d.treatments.homemade.length === 0;
        } else if (filterType === 'missing_all') {
            const noOrganic = !d.treatments?.organic || !Array.isArray(d.treatments.organic) || d.treatments.organic.length === 0;
            const noChemical = !d.treatments?.inorganic || !Array.isArray(d.treatments.inorganic) || d.treatments.inorganic.length === 0;
            const noHomemade = !d.treatments?.homemade || !Array.isArray(d.treatments.homemade) || d.treatments.homemade.length === 0;
            matchesFilter = noOrganic && noChemical && noHomemade;
        }

        // 3. Plant Filter
        let matchesPlant = true;
        if (plantFilter !== 'all') {
            const plant = getPlantName(d.id || 'Unknown');
            matchesPlant = plant === plantFilter;
        }

        return matchesSearch && matchesFilter && matchesPlant;
    });

    const groupedData = filteredDiseaseData.reduce((acc, curr) => {
        const plant = getPlantName(curr.id || 'Unknown');
        if (!acc[plant]) acc[plant] = [];
        acc[plant].push(curr);
        return acc;
    }, {});

    // Determine if we are editing a NEW item (not in list)
    const isNewItem = editingId && !csvData[editingId];

    // Helper to render an editable list section
    const renderEditableSection = (title, category, icon, colorClass, borderClass, bgClass) => (
        <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
                <span className={`text-xs font-bold ${colorClass || 'text-slate-700'} uppercase flex items-center gap-1`}>
                    {icon} {title}
                </span>
            </div>

            {/* Input at the top for immediate access */}
            <div className="flex gap-2 mb-3">
                <input
                    type="text"
                    value={localInputs[category]}
                    onChange={e => setLocalInputs(prev => ({ ...prev, [category]: e.target.value }))}
                    onKeyDown={e => handleKeyPress(e, category)}
                    placeholder={`Type new ${title.toLowerCase()} here...`}
                    className={`flex-1 text-sm px-3 py-2 border ${borderClass || 'border-slate-200/80'} rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 ${bgClass ? bgClass.replace('bg-', 'focus:ring-') : 'focus:ring-slate-500'}`}
                    autoFocus={category === 'symptoms'} // Autofocus if it's the symptoms section? Maybe too aggressive but let's try to be helpful
                />
                <button
                    onClick={() => handleAddInput(category)}
                    disabled={!localInputs[category].trim()}
                    className={`px-4 py-2 rounded-lg text-sm font-bold text-white transition-colors ${!localInputs[category].trim() ? 'bg-slate-300 cursor-not-allowed text-slate-500' : 'bg-green-600 hover:bg-green-700 shadow-sm'}`}
                >
                    Add
                </button>
            </div>

            <ul className="space-y-2">
                {editForm[category] && Array.isArray(editForm[category]) && editForm[category].map((item, i) => (
                    <li key={i} className={`flex justify-between items-center bg-white backdrop-blur-xl border-emerald-500/20 px-3 py-2 rounded border ${borderClass || 'border-slate-200/80'} text-sm shadow-sm`}>
                        <span className="break-words max-w-[85%]">{typeof item === 'object' && item !== null ? item.name : item}</span>
                        <button onClick={() => removeItem(category, i)} className="text-slate-800 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-900/30" title="Remove">
                            <X className="w-3 h-3" />
                        </button>
                    </li>
                ))}
                {editForm[category].length === 0 && <span className="text-xs text-slate-800 italic block">No items added yet.</span>}
            </ul>
        </div>
    );

    const renderEditForm = (id) => (
        <div className={`p-4 rounded-xl border space-y-4 ${isNewItem ? '' : 'bg-blue-50/50 border-blue-100'}`}>
            <h5 className="font-bold text-blue-800 text-sm mb-4">Editing Symptoms & Treatments</h5>

            {/* Description */}
            <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                    value={editForm.description}
                    onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full text-sm p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                    rows={3}
                    placeholder="Enter disease description..."
                />
            </div>

            <hr className="border-blue-100/50" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderEditableSection('Symptoms', 'symptoms', null, 'text-slate-800', 'border-slate-200/80', 'focus:ring-slate-400')}
                {renderEditableSection('Organic', 'organic', <Sprout className="w-3 h-3" />, 'text-emerald-700', 'border-emerald-100', 'focus:ring-emerald-400')}
                {renderEditableSection('Chemical', 'inorganic', <Beaker className="w-3 h-3" />, 'text-blue-700', 'border-blue-100', 'focus:ring-blue-400')}
                {renderEditableSection('Homemade', 'homemade', <Home className="w-3 h-3" />, 'text-amber-700', 'border-amber-100', 'focus:ring-amber-400')}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-blue-100/50">
                <button onClick={cancelEditing} className="px-4 py-2 text-slate-800 hover:bg-slate-100 rounded-lg text-sm font-medium">Cancel</button>
                <button onClick={() => handleSave(id)} className={`px-5 py-2 ${isExpert ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'} rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition-all hover:shadow-md`}>
                    {isExpert ? <Send className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    {isExpert ? "Submit Proposal" : "Save Changes"}
                </button>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="bg-white backdrop-blur-xl rounded-3xl p-8 relative overflow-hidden border border-slate-200/80">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-slate-900">Disease Guide</h2>
                        <div className="flex gap-2">
                            {Object.keys(categories).length === 0 ? (
                                <span className="text-xs text-slate-800 font-medium">Loading counts...</span>
                            ) : (
                                <>
                                    <span className="bg-emerald-900/30 text-emerald-800 px-2.5 py-0.5 rounded-full text-sm font-bold border border-green-200 flex items-center gap-1" title="Diseases">
                                        <Sprout className="w-3 h-3" />
                                        {filteredDiseaseData.filter(d => {
                                            const cat = categories[d.id] || categories[d.original_name] || '';
                                            return cat.includes('Disease') || (!cat.includes('Pest'));
                                        }).length}
                                    </span>
                                    <span className="bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full text-sm font-bold border border-amber-200 flex items-center gap-1" title="Pests">
                                        <Bug className="w-3 h-3" />
                                        {filteredDiseaseData.filter(d => {
                                            const cat = categories[d.id] || categories[d.original_name] || '';
                                            return cat.includes('Pest');
                                        }).length}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <div className="relative">
                            <select
                                value={plantFilter}
                                onChange={e => setPlantFilter(e.target.value)}
                                className="px-3 py-1.5 pl-9 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white backdrop-blur-xl border-emerald-500/20 appearance-none cursor-pointer"
                            >
                                <option value="all">All Plants</option>
                                {Array.isArray(allPlants) && allPlants.map(plant => (
                                    <option key={plant} value={plant}>{plant.replace(/_/g, ' ')}</option>
                                ))}
                            </select>
                            <Leaf className="w-4 h-4 text-slate-700 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        <div className="relative">
                            <select
                                value={filterType}
                                onChange={e => setFilterType(e.target.value)}
                                className="px-3 py-1.5 pl-9 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white backdrop-blur-xl border-emerald-500/20 appearance-none cursor-pointer"
                            >
                                <option value="all">Show All Diseases</option>
                                <option value="missing_organic">Missing Organic Remedies</option>
                                <option value="missing_chemical">Missing Chemical Remedies</option>
                                <option value="missing_homemade">Missing Homemade Remedies</option>
                                <option value="missing_all">Missing All Treatments</option>
                            </select>
                            <Filter className="w-4 h-4 text-slate-700 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search diseases..."
                            className="px-3 py-1.5 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        {/* Only allow adding NEW items if Admin? Or Experts suggest? For now let's assume experts edit existing. 
                            If Expert adds new, ID handling is tricky. Let's keep logic simple: Expert edits existing for now or suggests new via same form if logic permits. 
                            The current existing code allows "Add New". Let's support it for Expert too.
                        */}
                        {canEdit && (
                            <div className="flex gap-2">
                                <button
                                    onClick={handleAddNew}
                                    className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-700 flex items-center gap-1 transition-all"
                                >
                                    <Plus className="w-4 h-4" /> {isExpert ? 'Propose New' : 'Add New'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {isNewItem && (
                    <div className="mb-8 border-2 border-green-500 rounded-xl p-1 bg-emerald-900/30">
                        <div className="bg-white backdrop-blur-xl border-emerald-500/20 rounded-lg p-4">
                            <h4 className="font-bold text-green-800 mb-4 text-lg border-b border-green-100 pb-2">
                                {isExpert ? 'Proposing New Disease: ' : 'Creating New Disease: '}{editForm.name}
                            </h4>
                            {renderEditForm(editingId)}
                        </div>
                    </div>
                )}

                {!isNewItem && <p className="text-slate-700 mb-6">Comprehensive reference. {canEdit && (isExpert ? "Click 'Edit' to propose changes." : "Click 'Edit' to add symptoms or treatments.")}</p>}

                <div className="space-y-8">
                    {Object.entries(groupedData).map(([plant, diseases]) => (
                        <div key={plant} className="border border-slate-200 rounded-3xl overflow-hidden glass shadow-lg">
                            <div className="bg-emerald-50/50 backdrop-blur-sm px-6 py-4 border-b border-slate-200 flex items-center gap-2">
                                <div className="w-2 h-6 bg-green-500 rounded-full"></div>
                                <h3 className="font-bold text-lg text-slate-800 capitalize">{plant.replace(/_/g, ' ')}</h3>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {diseases && Array.isArray(diseases) && diseases.map(d => (
                                    <div key={d.id} className="p-6 transition-colors hover:bg-slate-50/90">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                                                    {d.name}
                                                    {editingId === d.id && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{isExpert ? 'Drafting Proposal' : 'Editing'}</span>}
                                                </h4>
                                                <span className="text-xs text-slate-800 font-mono bg-slate-100 px-1.5 py-0.5 rounded">{d.id}</span>
                                            </div>
                                            {canEdit && editingId !== d.id && !isNewItem && (
                                                <button
                                                    onClick={() => startEditing(d)}
                                                    className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-lg flex items-center gap-1 text-sm font-medium transition-all"
                                                >
                                                    <Edit className="w-4 h-4" /> {isExpert ? 'Propose Edit' : 'Edit'}
                                                </button>
                                            )}
                                        </div>

                                        {editingId === d.id ? renderEditForm(d.id) : (
                                            <>
                                                <p className="text-slate-800 mb-5 text-sm leading-relaxed">{d.description}</p>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <div className="bg-slate-50/90 p-4 rounded-xl border border-slate-200 relative group">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                                                <ScanLine className="w-3 h-3" /> Symptoms
                                                            </h5>
                                                            {canEdit && (
                                                                <button
                                                                    onClick={() => startEditing(d)}
                                                                    className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 font-bold flex items-center gap-1.5 shadow-sm transition-all"
                                                                >
                                                                    <Plus className="w-3 h-3" /> {isExpert ? 'Propose Symptom' : 'Add Symptom'}
                                                                </button>
                                                            )}
                                                        </div>
                                                        <ul className="list-disc list-inside text-sm text-slate-700 space-y-1.5 ml-1">
                                                            {d.symptoms && Array.isArray(d.symptoms) && d.symptoms.map((s, i) => <li key={i} className="pl-1">{s}</li>)}
                                                            {(!d.symptoms || d.symptoms.length === 0) && <li className="text-slate-800 italic list-none">No symptoms listed</li>}
                                                        </ul>
                                                    </div>
                                                    <div className="relative group">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                                                <Beaker className="w-3 h-3" /> Recommended Treatments
                                                            </h5>
                                                            {canEdit && (
                                                                <button
                                                                    onClick={() => startEditing(d)}
                                                                    className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 font-bold flex items-center gap-1.5 shadow-sm transition-all"
                                                                >
                                                                    <Plus className="w-3 h-3" /> {isExpert ? 'Propose Treatment' : 'Add Treatment'}
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="space-y-3">
                                                            {d.treatments?.organic && Array.isArray(d.treatments.organic) && d.treatments.organic.length > 0 && (
                                                                <div className="flex items-start gap-2">
                                                                    <span className="shrink-0 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 uppercase w-20 text-center">Organic</span>
                                                                    <span className="text-sm text-slate-800 py-0.5">{d.treatments.organic.map(t => typeof t === 'object' && t !== null ? t.name : t).join(', ')}</span>
                                                                </div>
                                                            )}
                                                            {d.treatments?.inorganic && Array.isArray(d.treatments.inorganic) && d.treatments.inorganic.length > 0 && (
                                                                <div className="flex items-start gap-2">
                                                                    <span className="shrink-0 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100 uppercase w-20 text-center">Chemical</span>
                                                                    <span className="text-sm text-slate-800 py-0.5">{d.treatments.inorganic.map(t => typeof t === 'object' && t !== null ? t.name : t).join(', ')}</span>
                                                                </div>
                                                            )}
                                                            {d.treatments?.homemade && Array.isArray(d.treatments.homemade) && d.treatments.homemade.length > 0 && (
                                                                <div className="flex items-start gap-2">
                                                                    <span className="shrink-0 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100 uppercase w-20 text-center">Home</span>
                                                                    <span className="text-sm text-slate-800 py-0.5">{d.treatments.homemade.map(t => typeof t === 'object' && t !== null ? t.name : t).join(', ')}</span>
                                                                </div>
                                                            )}
                                                            {(!d.treatments?.organic?.length && !d.treatments?.inorganic?.length && !d.treatments?.homemade?.length) && (
                                                                <span className="text-sm text-slate-800 italic">No treatments listed.</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

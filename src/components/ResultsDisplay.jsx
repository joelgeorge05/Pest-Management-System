
import React from 'react';
import { AlertTriangle, Sprout, FlaskConical, Home, CheckCircle2, Leaf, Bot, Smartphone, Calculator } from 'lucide-react';
import DosageCalculator from './DosageCalculator';

export default function ResultsDisplay({ result, onReset }) {
    if (!result) return null;

    const isGemini = result.source === "Gemini Advanced AI";
    const [showCalculator, setShowCalculator] = React.useState(false);
    const [calculatorData, setCalculatorData] = React.useState(null);

    // Helper to parse usage string into { amount, unit, baseAmount, baseUnit }
    const parseDosage = (usageText) => {
        if (!usageText) return null;

        // Normalize text
        const text = usageText.toLowerCase();

        // Regex for "Amount Unit" (e.g., 10ml, 5g, 2.5 kg)
        // Matches: number (float/int) + optional space + unit
        const amountMatch = text.match(/(\d+(\.\d+)?)\s*(ml|g|kg|gm|l)/);

        // Regex for Base (e.g., in 1 litre, /L, per 10 liters, per plant, per acre)
        const baseMatch = text.match(/(?:in|per|\/)\s*(\d+(\.\d+)?)?\s*(l|liter|litre|water|plant|acre|hectare|cents?)/);

        let data = {};

        if (amountMatch) {
            data.amount = parseFloat(amountMatch[1]);
            let unit = amountMatch[3];
            if (unit === 'gm') unit = 'g';
            if (unit === 'liter' || unit === 'litre') unit = 'L';
            data.unit = unit;
        }

        if (baseMatch) {
            data.baseAmount = baseMatch[1] ? parseFloat(baseMatch[1]) : 1;
            let bUnit = baseMatch[3];
            if (bUnit === 'liter' || bUnit === 'litre' || bUnit === 'water') bUnit = 'L';
            if (bUnit === 'cent') bUnit = 'cents';
            data.baseUnit = bUnit;
        } else {
            // Default base if liquid
            if (data.unit === 'ml' || data.unit === 'L') {
                data.baseAmount = 1;
                data.baseUnit = 'L';
            } else if (data.unit) {
                data.baseAmount = 1;
                data.baseUnit = 'applications';
            }
        }

        return Object.keys(data).length > 0 ? data : null;
    };

    const handleOpenCalculator = (item) => {
        let usage = "";
        if (typeof item === 'string') {
            usage = item;
        } else if (item.usage) {
            usage = item.usage;
        }

        const metadata = parseDosage(usage) || {};
        if (result.landArea) {
            metadata.landArea = result.landArea;
        }
        setCalculatorData(metadata);
        setShowCalculator(true);
    };

    const [showProposalModal, setShowProposalModal] = React.useState(false);
    const [proposalData, setProposalData] = React.useState({
        name: '', plant: '', diseases: '', symptoms: '', usage: '', type: 'Homemade'
    });

    const handleOpenProposalModal = () => {
        setProposalData({
            name: '',
            plant: result?.crop || '',
            diseases: result?.name || '',
            symptoms: result?.symptoms ? result.symptoms.join(', ') : '',
            usage: '',
            type: 'Homemade'
        });
        setShowProposalModal(true);
    };

    const handleSubmitProposal = async (e) => {
        if (e) e.preventDefault();
        if (!proposalData.name.trim() || !proposalData.usage.trim()) return alert("Please enter remedy name and usage details.");

        try {
            const userStr = sessionStorage.getItem('pest_user');
            if (!userStr) return alert("Please login to suggest remedies.");
            const user = JSON.parse(userStr);

            const res = await fetch('http://localhost:5000/medicines/propose', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...proposalData,
                    submitted_by: user.username,
                    user_id: user.id || user._id
                })
            });

            if (res.ok) {
                alert("Thank you! Your remedy has been proposed for review.");
                setProposalData({ name: '', plant: '', diseases: '', symptoms: '', usage: '', type: 'Homemade' });
                setShowProposalModal(false);
            } else {
                alert("Failed to submit proposal.");
            }
        } catch (e) {
            console.error(e);
            alert("Error submitting proposal.");
        }
    };

    return (
        <div className="py-12 bg-nature-50 min-h-screen">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <button
                    onClick={onReset}
                    className="mb-8 text-nature-700 font-medium hover:text-nature-900 flex items-center gap-2 group"
                >
                    <span className="group-hover:-translate-x-1 transition-transform">←</span> Analyze Another Crop
                </button>

                {/* Diagnosis Header */}
                <div className="bg-white backdrop-blur-xl border-emerald-500/20 rounded-3xl p-8 shadow-xl border border-emerald-900/30 mb-8 relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-nature-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50" />

                    <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                        <div className="w-full md:w-1/3">
                            <div className="relative group">
                                <img
                                    src={result.image}
                                    alt={result.name}
                                    className="w-full h-80 object-cover rounded-2xl shadow-lg ring-4 ring-white"
                                />
                                <div className="absolute top-4 left-4 bg-white backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-slate-700 shadow-sm flex items-center gap-1.5">
                                    {isGemini ? <Bot className="w-3.5 h-3.5 text-blue-500" /> : <Smartphone className="w-3.5 h-3.5 text-green-500" />}
                                    {result.source || "AI Analysis"}
                                </div>
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="flex flex-wrap gap-2 mb-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-900/30 text-red-600 text-sm font-bold border border-red-100 shadow-sm">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span>Diagnosis: {result.confidence ? `${(result.confidence * 100).toFixed(0)}% Match` : 'Detected'}</span>
                                </div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-nature-50 text-nature-700 text-sm font-bold border border-emerald-900/30 shadow-sm">
                                    <Leaf className="w-4 h-4" />
                                    <span>{result.crop}</span>
                                </div>
                            </div>

                            <h2 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">{result.name}</h2>
                            <p className="text-lg text-slate-800 leading-relaxed mb-6 border-l-4 border-nature-300 pl-4 bg-nature-50/30 py-2 rounded-r-lg">
                                {result.description}
                            </p>

                            <div className="bg-slate-50/90 rounded-2xl p-6 border border-slate-200">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-red-500" /> Key Symptoms
                                    </h4>
                                    <button
                                        onClick={() => {
                                            const confirm = window.confirm("Send this report to an Agricultural Expert for review?");
                                            if (confirm) {
                                                fetch('http://localhost:5000/consultations', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({
                                                        farmer: JSON.parse(sessionStorage.getItem('pest_user')).username,
                                                        crop: result.crop,
                                                        disease: result.name,
                                                        description: `Auto-generated report from AI analysis.\nSymptoms: ${result.symptoms.join(', ')}`,
                                                        image: result.image
                                                    })
                                                })
                                                    .then(res => {
                                                        if (res.ok) alert("Report sent to experts!");
                                                        else alert("Failed to send report");
                                                    })
                                                    .catch(err => alert("Error sending report"));
                                            }
                                        }}
                                        className="text-xs bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full font-bold hover:bg-indigo-200 transition-colors"
                                    >
                                        Ask an Expert
                                    </button>
                                </div>
                                <ul className="flex flex-col gap-3">
                                    {result.symptoms.map((symptom, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-slate-700 text-sm bg-white backdrop-blur-xl border-emerald-500/20 px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
                                            <span className="mt-0.5">•</span>
                                            <span className="leading-snug">{symptom}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Treatment Protocol - Vertical Layout */}
                <div className="bg-white backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/60 overflow-hidden mb-12 ring-1 ring-slate-900/5">
                    <div className="bg-gradient-to-r from-slate-50 to-white px-8 py-6 flex justify-between items-center border-b border-slate-200">
                        <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-3">
                            <div className="h-6 w-1.5 bg-gradient-to-b from-emerald-400 to-teal-600 rounded-full shadow-sm" />
                            Treatment Protocol
                        </h3>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 uppercase tracking-widest border border-slate-200/80 shadow-sm">
                            Step-by-Step
                        </span>
                    </div>

                    <div className="divide-y divide-slate-100/50 p-4 space-y-4">
                        {/* 1. Organic (Preferred) */}
                        <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 bg-white backdrop-blur-xl border-emerald-500/20 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group/card">
                            <div className="shrink-0">
                                <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner border border-green-200/50 group-hover/card:scale-110 transition-transform duration-500">
                                    <Sprout className="w-7 h-7" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-3">
                                    <h4 className="text-lg font-bold text-slate-900">Organic Control</h4>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-emerald-800 uppercase tracking-wide border border-green-200">
                                        First Line
                                    </span>
                                </div>
                                <ul className="space-y-4">
                                    {result.treatments.organic && result.treatments.organic.length > 0 ? (
                                        result.treatments.organic.map((item, idx) => (
                                            <li key={idx} className="flex flex-col sm:flex-row sm:items-start gap-3 text-sm text-slate-800 group">
                                                <div className="flex items-start gap-3 flex-1">
                                                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                                                    <span className="leading-snug">
                                                        {typeof item === 'string' ? item : <><span className="font-bold text-slate-800">{item.name}:</span> {item.usage}</>}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 ml-8 sm:ml-0">
                                                    <button
                                                        onClick={() => handleOpenCalculator(item)}
                                                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-200 transition-colors border border-indigo-300 shadow-sm"
                                                        title="Calculate Dosage"
                                                    >
                                                        <Calculator className="w-3.5 h-3.5" />
                                                        Calculate
                                                    </button>
                                                    {typeof item === 'object' && item.image && (
                                                        <img src={`http://localhost:5000/uploads/${item.image}`} alt={item.name} className="w-10 h-10 object-cover rounded-lg border border-slate-200/80" />
                                                    )}
                                                </div>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="text-slate-800 italic text-sm pl-8">No specific organic advice available.</li>
                                    )}
                                </ul>
                            </div>
                        </div>

                        {/* 2. Homemade (Community) */}
                        <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 bg-white backdrop-blur-xl border-emerald-500/20 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group/card">
                            <div className="shrink-0">
                                <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-amber-50 text-orange-600 rounded-2xl flex items-center justify-center shadow-inner border border-orange-200/50 group-hover/card:scale-110 transition-transform duration-500">
                                    <Home className="w-7 h-7" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-lg font-bold text-slate-900">Homemade Remedies</h4>
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-orange-700 uppercase tracking-wide border border-orange-100">
                                            Community
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleOpenProposalModal}
                                        className="text-orange-600 text-xs font-bold hover:underline"
                                    >
                                        + Suggest New
                                    </button>
                                </div>
                                <ul className="space-y-4">
                                    {result.treatments.homemade && result.treatments.homemade.length > 0 ? (
                                        result.treatments.homemade.map((item, idx) => (
                                            <li key={idx} className="flex flex-col sm:flex-row sm:items-start gap-3 text-sm text-slate-800 group">
                                                <div className="flex items-start gap-3 flex-1">
                                                    <CheckCircle2 className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
                                                    <span className="leading-snug">
                                                        {typeof item === 'string' ? item : <><span className="font-bold text-slate-800">{item.name}:</span> {item.usage}</>}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 ml-8 sm:ml-0">
                                                    <button
                                                        onClick={() => handleOpenCalculator(item)}
                                                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-900/30 text-indigo-800 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors border border-indigo-100/50 shadow-sm"
                                                        title="Calculate Dosage"
                                                    >
                                                        <Calculator className="w-3.5 h-3.5" />
                                                        Calculate
                                                    </button>
                                                    {typeof item === 'object' && item.image && (
                                                        <img src={`http://localhost:5000/uploads/${item.image}`} alt={item.name} className="w-10 h-10 object-cover rounded-lg border border-slate-200/80" />
                                                    )}
                                                </div>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="text-slate-800 italic text-sm pl-8">No community remedies available.</li>
                                    )}
                                </ul>
                            </div>
                        </div>

                        {/* 3. Synthetic (Caution) */}
                        <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 bg-slate-50/90 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group/card">
                            <div className="shrink-0">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-sky-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner border border-blue-200/50 group-hover/card:scale-110 transition-transform duration-500">
                                    <FlaskConical className="w-7 h-7" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-3">
                                    <h4 className="text-lg font-bold text-slate-900">Chemical Control</h4>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 uppercase tracking-wide border border-slate-200/80">
                                        Use with Caution
                                    </span>
                                </div>
                                <ul className="space-y-4">
                                    {result.treatments.inorganic && result.treatments.inorganic.length > 0 ? (
                                        result.treatments.inorganic.map((item, idx) => (
                                            <li key={idx} className="flex flex-col sm:flex-row sm:items-start gap-3 text-sm text-slate-800 group">
                                                <div className="flex items-start gap-3 flex-1">
                                                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                                                    <span className="leading-snug">
                                                        {typeof item === 'string' ? item : <><span className="font-bold text-slate-800">{item.name}:</span> {item.usage}</>}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 ml-5 sm:ml-0">
                                                    <button
                                                        onClick={() => handleOpenCalculator(item)}
                                                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-900/30 text-indigo-800 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors border border-indigo-100/50 shadow-sm"
                                                        title="Calculate Dosage"
                                                    >
                                                        <Calculator className="w-3.5 h-3.5" />
                                                        Calculate
                                                    </button>
                                                    {typeof item === 'object' && item.image && (
                                                        <img src={`http://localhost:5000/uploads/${item.image}`} alt={item.name} className="w-10 h-10 object-cover rounded-lg border border-slate-200/80" />
                                                    )}
                                                </div>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="text-slate-800 italic text-sm pl-5">No specific chemical advise.</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>


                {/* Prevention */}
                <div className="bg-gradient-to-br from-nature-800 to-nature-900 text-white rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-10" />
                    <div className="relative z-10">
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <Leaf className="w-6 h-6 text-green-400" /> Future Prevention
                        </h3>
                        <p className="text-nature-100 text-lg leading-relaxed max-w-4xl font-light">
                            {result.prevention}
                        </p>
                    </div>
                </div>
            </div>

            {/* Calculators Modals */}
            <DosageCalculator
                isOpen={showCalculator}
                onClose={() => setShowCalculator(false)}
                initialMetadata={calculatorData}
            />

            {/* Proposal Modal */}
            {showProposalModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white backdrop-blur-xl border-emerald-500/20 rounded-2xl shadow-xl w-full max-w-2xl p-6 m-auto">
                        <h3 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                            <Home className="w-6 h-6 text-orange-500" /> Suggest Homemade Remedy
                        </h3>
                        <p className="text-sm text-slate-700 mb-6">
                            Share your traditional knowledge with the community. All submissions are reviewed by administrators.
                        </p>
                        
                        <form onSubmit={handleSubmitProposal} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Remedy Name</label>
                                    <input required type="text" value={proposalData.name} onChange={e => setProposalData({...proposalData, name: e.target.value})} placeholder="e.g., Neem Oil Spray" className="w-full px-3 py-2 rounded-lg border border-slate-600 focus:ring-2 focus:ring-orange-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Target Plant</label>
                                    <input required type="text" value={proposalData.plant} onChange={e => setProposalData({...proposalData, plant: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-600 focus:ring-2 focus:ring-orange-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Target Diseases</label>
                                    <input required type="text" value={proposalData.diseases} onChange={e => setProposalData({...proposalData, diseases: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-600 focus:ring-2 focus:ring-orange-500 outline-none" />
                                </div>
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Symptoms It Treats</label>
                                    <input required type="text" value={proposalData.symptoms} onChange={e => setProposalData({...proposalData, symptoms: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-600 focus:ring-2 focus:ring-orange-500 outline-none" />
                                </div>
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Preparation & Usage</label>
                                    <textarea required value={proposalData.usage} onChange={e => setProposalData({...proposalData, usage: e.target.value})} placeholder="Describe how to make and apply this remedy..." className="w-full px-3 py-2 rounded-lg border border-slate-600 focus:ring-2 focus:ring-orange-500 outline-none h-24 resize-none" />
                                </div>
                            </div>
                            
                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
                                <button type="button" onClick={() => setShowProposalModal(false)} className="px-5 py-2.5 text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-bold transition-colors">Cancel</button>
                                <button type="submit" className="px-5 py-2.5 bg-orange-600 text-white rounded-lg text-sm font-bold hover:bg-orange-700 transition-colors shadow-sm">Submit Proposal</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div >
    );
}

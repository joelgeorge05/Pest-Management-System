
import React, { useState, useEffect } from 'react';
import { Upload, Search, Image as ImageIcon, Loader2, Info, ChevronDown, ChevronUp, Leaf, X, Sparkles, Scan, Smartphone } from 'lucide-react';

export default function UploadAnalyzer({ onAnalyze, user }) {
    const [diseaseData, setDiseaseData] = useState({});
    const [diagnosisType, setDiagnosisType] = useState('disease'); // 'disease' | 'pest'
    const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'text'
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [preview, setPreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [textInput, setTextInput] = useState('');
    const [cropName, setCropName] = useState('');
    const [diseaseName, setDiseaseName] = useState('');
    const [symptoms, setSymptoms] = useState('');
    const [error, setError] = useState(null);

    const SUPPORTED_DATA = {
        "Apple": ["Apple Scab", "Black Rot", "Cedar Apple Rust", "Healthy"],
        "Blueberry": ["Healthy"],
        "Cherry": ["Powdery Mildew", "Healthy"],
        "Grape": ["Black Rot", "Esca (Black Measles)", "Leaf Blight", "Healthy"],
        "Orange": ["Haunglongbing (Citrus Greening)"],
        "Peach": ["Bacterial Spot", "Healthy"],
        "Pepper": ["Bacterial Spot", "Healthy"],
        "Potato": ["Early Blight", "Late Blight", "Healthy"],
        "Raspberry": ["Healthy"],
        "Soybean": ["Healthy"],
        "Squash": ["Powdery Mildew"],
        "Strawberry": ["Leaf Scorch", "Healthy"],
        "Tomato": ["Bacterial Spot", "Early Blight", "Late Blight", "Leaf Mold", "Septoria Leaf Spot", "Spider Mites", "Target Spot", "Mosaic Virus", "Yellow Leaf Curl Virus", "Healthy"]
    };



    useEffect(() => {
        fetch('http://127.0.0.1:5000/treatments')
            .then(res => res.json())
            .then(data => {
                setDiseaseData(data);
            })
            .catch(err => console.error("Failed to load disease data:", err));
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const url = URL.createObjectURL(file);
            setPreview(url);
            setError(null);
        }
    };

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        setError(null);

        try {
            let result = null;

            if (activeTab === 'upload') {
                console.log("Using Local Model...");
                if (!imageFile) throw new Error("Please upload an image for local analysis.");

                // Validate Mandatory Fields - REMOVED per user request
                // if (diagnosisType === 'disease' && !cropName.trim()) throw new Error("Please enter the Crop Name to ensure accurate diagnosis.");
                // if (diagnosisType === 'disease' && !symptoms.trim()) throw new Error("Please enter the Symptoms to help identifying the problem.");

                const formData = new FormData();
                formData.append('image', imageFile);
                formData.append('crop_name', cropName);
                formData.append('disease_name', diseaseName);
                formData.append('symptoms', symptoms);

                if (user) {
                    formData.append('user_id', user.id || user._id);
                    formData.append('username', user.username);
                }


                const localResponse = await fetch('http://127.0.0.1:5000/predict', {
                    method: 'POST',
                    body: formData
                });

                if (!localResponse.ok) throw new Error("Local analysis failed. Check server.");
                const localData = await localResponse.json();

                // Use backend-provided treatment info if available (Preferred)
                let info = localData.treatment;

                if (!info) {
                    // Fallback: Enrich Local Data with CSV/DB Data (Legacy/Offline flow)
                    const csvData = diseaseData.csv_data || {};
                    const dbData = diseaseData.db_data || [];
                    const detectedClass = localData.class;
                    const baseInfo = csvData[detectedClass];

                    info = baseInfo ? JSON.parse(JSON.stringify(baseInfo)) : {
                        name: detectedClass.replace(/_/g, ' '),
                        description: `Detected as ${detectedClass}.`,
                        symptoms: [],
                        treatments: { organic: [], inorganic: [], homemade: [] },
                        prevention: "Keep crop environment clean and monitor regularly."
                    };

                    // Merge dynamic DB treatments (Client-side fallback)
                    const diseaseName = detectedClass.split('___')[1]?.replace(/_/g, ' ') || detectedClass;

                    dbData.forEach(med => {
                        const plantMatch = !med.plant || (cropName && med.plant.toLowerCase().includes(cropName.toLowerCase())) || detectedClass.toLowerCase().includes(med.plant.toLowerCase());
                        const diseaseMatch = med.diseases.toLowerCase().includes(diseaseName.toLowerCase());

                        if (plantMatch && diseaseMatch) {
                            const type = med.type.toLowerCase();
                            const entry = {
                                name: med.name,
                                usage: med.usage,
                                image: med.image || null,
                                _id: med._id
                            };

                            if (type === 'homemade') {
                                if (!info.treatments.homemade) info.treatments.homemade = [];
                                info.treatments.homemade.push(entry);
                            } else if (info.treatments[type]) {
                                info.treatments[type].push(entry);
                            }
                        }
                    });
                }

                result = {
                    name: info.name,
                    crop: cropName || "Unknown Crop",
                    confidence: localData.confidence,
                    description: info.description,
                    symptoms: Array.isArray(info.symptoms)
                        ? info.symptoms
                        : (info.symptoms ? info.symptoms.split(';').map(s => s.trim()).filter(s => s) : []),
                    treatments: info.treatments,
                    prevention: info.prevention,
                    source: "Local AI Model"
                };
            } else {
                console.log("Using Local Model Text Analysis...");
                const formData = new FormData();
                formData.append('crop_name', cropName);
                formData.append('disease_name', diseaseName);
                // Combine symptoms and textInput
                formData.append('symptoms', symptoms + " " + textInput);

                if (user) {
                    formData.append('user_id', user.id || user._id);
                    formData.append('username', user.username);
                }

                const localResponse = await fetch('http://127.0.0.1:5000/predict', {
                    method: 'POST',
                    body: formData
                });

                if (!localResponse.ok) {
                    const errData = await localResponse.json();
                    throw new Error(errData.error || "Please search with a valid disease, crop or symptom keyword.");
                }
                const localData = await localResponse.json();

                let info = localData.treatment;

                result = {
                    name: localData.class.replace(/___/g, ' ').replace(/_/g, ' '),
                    crop: cropName || "Unknown Crop",
                    confidence: localData.confidence,
                    description: info?.description || "No description available.",
                    symptoms: Array.isArray(info?.symptoms)
                        ? info.symptoms
                        : (info?.symptoms ? info.symptoms.split(';').map(s => s.trim()).filter(s => s) : []),
                    treatments: info?.treatments || { organic: [], inorganic: [], homemade: [] },
                    prevention: info?.prevention || "",
                    source: localData.model || "Local Fast Path"
                };
            }
            // Final Result Formatting
            if (activeTab === 'upload' && imageFile) {
                const getBase64 = (file) => new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = error => reject(error);
                    reader.readAsDataURL(file);
                });
                result.image = await getBase64(imageFile);
            } else {
                result.image = "https://images.unsplash.com/photo-1591857177580-dc82b9e4e1aa?auto=format&fit=crop&q=80&w=1000";
            }
            onAnalyze(result);

        } catch (err) {
            console.error("Analysis Error:", err);
            setError(err.message || "Something went wrong. Please check your settings or try again.");
        } finally {
            setIsAnalyzing(false);
        }
    };


    return (

        <div id="analyze" className="py-8 relative overflow-hidden flex items-center rounded-3xl">
            {/* Background Decorations */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
            <div className="absolute top-20 right-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-1000 pointer-events-none" />
            <div className="absolute bottom-20 left-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse pointer-events-none" />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white backdrop-blur-md border border-emerald-500/30 rounded-full text-xs font-bold text-emerald-700 mb-6 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-500" /> AI-Powered Analysis
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 mb-2 tracking-tight leading-tight">
                        Instant <span className="text-gradient">Plant Doctor</span>
                    </h2>
                    <p className="text-base text-slate-800 max-w-2xl mx-auto font-medium leading-relaxed">
                        Diagnose crop diseases in seconds. Upload a photo or describe the symptoms to get expert advice instantly.
                    </p>
                </div>

                <div className="bg-white backdrop-blur-xl rounded-[2.5rem] p-2 shadow-2xl relative overflow-hidden ring-1 ring-slate-700/50">

                    {/* Glass Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-white/5 pointer-events-none" />

                    <div className="p-4 sm:p-6 relative">
                        {/* Tabs */}
                        <div className="flex justify-center mb-6">
                            <div className="bg-slate-50/90 p-1.5 rounded-2xl inline-flex shadow-inner">
                                <button
                                    onClick={() => setActiveTab('upload')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === 'upload' ? 'bg-white backdrop-blur-xl border-emerald-500/20 text-nature-700 shadow-lg scale-100' : 'text-slate-700 hover:text-slate-700 hover:bg-slate-200/50'}`}
                                >
                                    <ImageIcon className="w-4 h-4" /> Upload Photo
                                </button>
                                <button
                                    onClick={() => setActiveTab('text')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === 'text' ? 'bg-white backdrop-blur-xl border-emerald-500/20 text-nature-700 shadow-lg scale-100' : 'text-slate-700 hover:text-slate-700 hover:bg-slate-200/50'}`}
                                >
                                    <Search className="w-4 h-4" /> Describe Symptoms
                                </button>
                            </div>
                        </div>

                        {/* Upload Interface */}
                        {activeTab === 'upload' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 animate-in fade-in zoom-in-95 duration-300">
                                {/* Left Column: Upload Zone */}
                                <div className="flex flex-col h-full">
                                    <div className={`relative group border-2 border-dashed rounded-3xl p-6 text-center transition-all duration-500 flex flex-col justify-center items-center h-full min-h-[250px] ${preview ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 hover:border-emerald-500 hover:bg-slate-50 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] bg-white backdrop-blur-sm'}`}>

                                        {/* Scanning Effect */}
                                        {isAnalyzing && preview && (
                                            <div className="absolute inset-0 overflow-hidden rounded-3xl z-10 pointer-events-none">
                                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_20px_rgba(52,211,153,0.8)] animate-scan border-b border-emerald-300"></div>
                                            </div>
                                        )}

                                        {preview ? (
                                            <div className="relative inline-block group/preview w-full h-full flex items-center justify-center">
                                                <div className="absolute -inset-4 bg-gradient-to-r from-nature-600 to-blue-600 rounded-2xl opacity-20 group-hover/preview:opacity-40 blur-xl transition duration-500"></div>
                                                <img src={preview} alt="Preview" className="relative max-h-full max-w-full rounded-2xl shadow-xl transform transition duration-500 group-hover/preview:scale-[1.02] object-contain" />
                                                <button
                                                    onClick={() => { setPreview(null); setImageFile(null); }}
                                                    className="absolute top-2 right-2 bg-white backdrop-blur-xl border-emerald-500/20 text-red-500 rounded-full p-2 shadow-lg hover:bg-red-900/30 hover:scale-110 transition-all z-20 border border-slate-200"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500 shadow-sm border border-slate-200 shrink-0">
                                                    <Upload className="w-6 h-6 text-emerald-500 opacity-80" />
                                                </div>
                                                <h3 className="text-xl font-bold text-slate-800 mb-1">Drag & Drop Plant Photo</h3>
                                                <p className="text-slate-700">or click to browse your files</p>
                                                <div className="mt-6 flex justify-center gap-2">
                                                    <span className="px-3 py-1 bg-white backdrop-blur-xl border-emerald-500/20 border border-slate-200/80 rounded-full text-[10px] font-bold text-slate-800 uppercase tracking-widest">JPG</span>
                                                    <span className="px-3 py-1 bg-white backdrop-blur-xl border-emerald-500/20 border border-slate-200/80 rounded-full text-[10px] font-bold text-slate-800 uppercase tracking-widest">PNG</span>
                                                </div>
                                                <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Right Column: Options & Controls */}
                                <div className="flex flex-col justify-between space-y-6">
                                    <div className="space-y-6">
                                        <div className="bg-slate-50/90 p-4 rounded-3xl border border-slate-200 space-y-4">
                                            <div>
                                                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 block">Detection Mode</label>
                                                <div className="bg-white backdrop-blur-xl border-emerald-500/20 p-1 rounded-xl inline-flex w-full shadow-sm border border-slate-200/80">
                                                    <button
                                                        onClick={() => setDiagnosisType('disease')}
                                                        className={`flex-1 px-4 py-3 rounded-lg text-sm font-bold transition-all ${diagnosisType === 'disease' ? 'bg-slate-200 text-emerald-700 shadow-sm border border-emerald-500/30' : 'text-slate-700 hover:text-slate-700'}`}
                                                    >
                                                        Disease Detection
                                                    </button>
                                                    <button
                                                        onClick={() => setDiagnosisType('pest')}
                                                        className={`flex-1 px-4 py-3 rounded-lg text-sm font-bold transition-all ${diagnosisType === 'pest' ? 'bg-slate-200 text-emerald-700 shadow-sm border border-emerald-500/30' : 'text-slate-700 hover:text-slate-700'}`}
                                                    >
                                                        Pest Detection
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider ml-1">Crop Name <span className="text-slate-700 font-normal">(Optional)</span></label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Tomato, Potato..."
                                                    className="w-full p-3 bg-white backdrop-blur-xl border-emerald-500/20 border border-slate-200/80 rounded-2xl focus:border-nature-500 focus:ring-4 focus:ring-nature-500/10 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-800 text-sm"
                                                    value={cropName}
                                                    onChange={e => setCropName(e.target.value)}
                                                />
                                            </div>

                                            <div className="space-y-2 animate-in slide-in-from-left-2 transition-all">
                                                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider ml-1">{diagnosisType === 'disease' ? 'Disease Name' : 'Pest Name'} <span className="text-slate-700 font-normal">(Optional)</span></label>
                                                <input
                                                    type="text"
                                                    placeholder={diagnosisType === 'disease' ? "e.g. Early Blight, Leaf Mold..." : "e.g. Aphids, Spider Mites..."}
                                                    className="w-full p-3 bg-white backdrop-blur-xl border-emerald-500/20 border border-slate-200/80 rounded-2xl focus:border-nature-500 focus:ring-4 focus:ring-nature-500/10 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-800 text-sm"
                                                    value={diseaseName}
                                                    onChange={e => setDiseaseName(e.target.value)}
                                                />
                                            </div>

                                            <div className="space-y-2 animate-in slide-in-from-left-2 transition-all">
                                                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider ml-1">Symptoms <span className="text-slate-700 font-normal">(Recommended)</span></label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Yellow spots, Wilting..."
                                                    className="w-full p-3 bg-white backdrop-blur-xl border-emerald-500/20 border border-slate-200/80 rounded-2xl focus:border-nature-500 focus:ring-4 focus:ring-nature-500/10 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-800 text-sm"
                                                    value={symptoms}
                                                    onChange={e => setSymptoms(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        {error && (
                                            <div className="mb-4 p-4 bg-red-900/30/80 backdrop-blur border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 animate-in shake">
                                                <div className="p-2 bg-red-100 rounded-full shrink-0">
                                                    <Info className="w-5 h-5 text-red-600" />
                                                </div>
                                                <p className="text-sm font-bold">{error}</p>
                                            </div>
                                        )}

                                        <button
                                            onClick={handleAnalyze}
                                            disabled={isAnalyzing || (activeTab === 'upload' && !preview)}
                                            className={`w-full py-4 rounded-2xl font-black text-lg shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-3 transform group relative overflow-hidden
                                                ${isAnalyzing
                                                    ? 'bg-slate-100 text-slate-800 cursor-not-allowed'
                                                    : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-900 hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:-translate-y-1'
                                                }`}
                                        >
                                            <div className="absolute inset-0 bg-white translate-y-full group-hover:-translate-y-0 transition-transform duration-500 rotate-12 blur-md" />
                                            <div className="relative flex items-center gap-3 z-10">
                                                {isAnalyzing ? (
                                                    <> <Loader2 className="w-6 h-6 animate-spin" /> Analyzing Crop... </>
                                                ) : (
                                                    <> <Sparkles className="w-6 h-6" /> Diagnose Disease </>
                                                )}
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'text' && (
                            <div className="animate-in fade-in zoom-in-95 duration-300 max-w-2xl mx-auto space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/90 p-6 rounded-3xl border border-slate-200/80 shadow-inner">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Crop Name <span className="text-slate-800 font-normal">(Optional)</span></label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Tomato, Potato..."
                                            className="w-full p-3 bg-white backdrop-blur-xl border-emerald-500/20 border border-slate-200/80 rounded-xl focus:border-nature-500 focus:ring-2 focus:ring-nature-500/20 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-800 text-sm"
                                            value={cropName}
                                            onChange={e => setCropName(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Disease Name <span className="text-slate-800 font-normal">(Optional)</span></label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Early Blight..."
                                            className="w-full p-3 bg-white backdrop-blur-xl border-emerald-500/20 border border-slate-200/80 rounded-xl focus:border-nature-500 focus:ring-2 focus:ring-nature-500/20 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-800 text-sm"
                                            value={diseaseName}
                                            onChange={e => setDiseaseName(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Symptoms <span className="text-slate-800 font-normal">(Optional)</span></label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Yellow spots, Wilting..."
                                            className="w-full p-3 bg-white backdrop-blur-xl border-emerald-500/20 border border-slate-200/80 rounded-xl focus:border-nature-500 focus:ring-2 focus:ring-nature-500/20 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-800 text-sm"
                                            value={symptoms}
                                            onChange={e => setSymptoms(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-700 ml-1 mb-2 block uppercase tracking-wider">Describe the Problem in Detail</label>
                                    <textarea
                                        placeholder="Describe the plant problem in detail..."
                                        className="w-full h-48 p-6 bg-slate-50/90 border border-slate-200/80 rounded-3xl focus:border-nature-500 focus:bg-white backdrop-blur-xl border-emerald-500/20 focus:ring-4 focus:ring-nature-500/10 outline-none resize-none transition-all font-medium text-slate-700 placeholder:text-slate-800 text-base leading-relaxed shadow-inner block"
                                        value={textInput}
                                        onChange={e => setTextInput(e.target.value)}
                                    />
                                </div>
                                <button
                                    onClick={handleAnalyze}
                                    disabled={isAnalyzing || !textInput.trim()}
                                    className={`mt-8 w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-3 transform
                                    ${isAnalyzing
                                            ? 'bg-slate-100 text-slate-800 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-nature-600 to-nature-500 text-slate-900 hover:shadow-nature-500/30 hover:-translate-y-1'
                                        }`}
                                >
                                    {isAnalyzing ? (
                                        <> <Loader2 className="w-6 h-6 animate-spin" /> Analyzing... </>
                                    ) : (
                                        <> <Sparkles className="w-5 h-5" /> Diagnose Disease </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes scan {
                    0% { top: 0%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
                .animate-scan {
                    animation: scan 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                }
            `}</style>
        </div>
    );
}

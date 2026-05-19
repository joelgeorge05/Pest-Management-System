import React, { useState, useEffect } from 'react';
import { RefreshCw, Activity, CheckCircle, AlertCircle, Terminal, X, ChevronRight } from 'lucide-react';

export default function RetrainPanel() {
    const [status, setStatus] = useState({ is_training: false, logs: [] });
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [wasTraining, setWasTraining] = useState(false);

    // Upload State
    const [uploadTab, setUploadTab] = useState('bulk'); // 'bulk' | 'single'
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [className, setClassName] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(null);

    useEffect(() => {
        // Poll status every 2 seconds if active or just starting
        const interval = setInterval(checkStatus, 2000);
        checkStatus(); // Initial check
        return () => clearInterval(interval);
    }, []);

    // Effect to handle state transitions for notifications
    useEffect(() => {
        if (status.is_training) {
            setWasTraining(true);
            setShowModal(true); // Auto-open modal when training starts/is running
        } else if (wasTraining && !status.is_training) {
            // Training just finished
            setWasTraining(false);
            // Verify success by checking the last log or just assuming success if no error flag (simplified)
            // Ideally backend sends a 'status' field like 'failed' or 'completed'
            if (status.last_completed) {
                alert("TRAINING COMPLETED SUCCESSFULLY!\n\nThe AI model has been updated with the latest data.");
            } else {
                alert("TRAINING STOPPED.\n\nPlease check the logs for errors.");
            }
        }
    }, [status.is_training, wasTraining, status.last_completed]);


    const checkStatus = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/admin/retrain/status');
            if (res.ok) {
                const data = await res.json();
                setStatus(prev => ({ ...prev, ...data }));
            }
        } catch (e) {
            console.error("Status check failed", e);
        }
    };

    const handleRetrain = async () => {
        if (!confirm("Start AI Model Retraining? This process may take several minutes and uses server resources.")) return;
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/admin/retrain', { method: 'POST' });
            if (res.ok) {
                // alert("Training started!"); // Removed generic alert in favor of modal
                checkStatus();
            } else {
                alert("Failed to start training.");
            }
        } catch (e) {
            console.error(e);
            alert("Error connecting to server.");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => setSelectedFile(e.target.files[0]);
    const handleFilesChange = (e) => setSelectedFiles(e.target.files);

    const handleUpload = async () => {
        setUploading(true);
        setUploadStatus(null);

        const formData = new FormData();

        if (uploadTab === 'bulk') {
            if (!selectedFile) return;
            formData.append('type', 'archive');
            formData.append('file', selectedFile);
        } else {
            if (!selectedFiles.length || !className) return;
            formData.append('type', 'single_class');
            formData.append('class_name', className);
            for (let i = 0; i < selectedFiles.length; i++) {
                formData.append('files[]', selectedFiles[i]);
            }
        }

        try {
            const res = await fetch('http://localhost:5000/api/admin/dataset/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (res.ok) {
                setUploadStatus({ type: 'success', msg: data.message });
                // Reset inputs
                setSelectedFile(null);
                setSelectedFiles([]);
                setClassName('');
                // Clear file inputs visually if possible, or just rely on state
            } else {
                setUploadStatus({ type: 'error', msg: data.error || "Upload failed." });
            }
        } catch (e) {
            console.error(e);
            setUploadStatus({ type: 'error', msg: "Connection error." });
        } finally {
            setUploading(false);
        }
    };

    return (
        <>
            <div className="bg-white backdrop-blur-xl border-emerald-500/20 p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-4">
                <div>
                    <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                        <Activity className="w-4 h-4 text-indigo-500" />
                        AI Model Status
                    </h4>
                    <p className="text-xs text-slate-700 mt-0.5">
                        {status.is_training ? "Training in progress..." : "Ready for updates"}
                    </p>
                </div>

                <div className="h-8 w-px bg-slate-100"></div>

                {status.is_training ? (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 bg-indigo-900/30 text-indigo-800 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors animate-pulse"
                        >
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            View Progress...
                        </button>
                    </div>
                ) : status.last_completed && new Date(status.last_completed) > new Date(Date.now() - 300000) ? ( // Show success for 5 mins
                    <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-sm font-bold">Updated Recently</span>
                        <button
                            onClick={handleRetrain}
                            disabled={loading}
                            className="ml-2 px-2 py-1 text-xs bg-slate-100 text-slate-800 rounded hover:bg-slate-200"
                        >
                            Redo
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleRetrain}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Retrain Model
                    </button>
                )}
            </div>



            {/* DATASET UPLOAD SECTION */}
            {/* DATASET UPLOAD SECTION - REMOVED PER USER REQUEST */
             /*


                <div className="flex gap-4 border-b border-slate-200 mb-4">
                    <button
                        onClick={() => setUploadTab('bulk')}
                        className={`text-sm font-medium pb-2 transition-colors ${uploadTab === 'bulk' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-700 hover:text-slate-700'}`}
                    >
                        Bulk Upload (Zip/Tar)
                    </button>
                    <button
                        onClick={() => setUploadTab('single')}
                        className={`text-sm font-medium pb-2 transition-colors ${uploadTab === 'single' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-700 hover:text-slate-700'}`}
                    >
                        Single Class Upload
                    </button>
                </div>

                {
                    uploadTab === 'bulk' ? (
                        <div className="space-y-3">
                            <div className="text-xs text-slate-700 bg-slate-50/90 p-3 rounded border border-slate-200">
                                <p className="font-semibold mb-1">Instructions:</p>
                                <ul className="list-disc pl-4 space-y-1">
                                    <li>Upload a <b>.zip</b>, <b>.tar</b>, or <b>.tar.gz</b> file.</li>
                                    <li>The archive should contain folders named like <code>Plant_Disease</code>.</li>
                                    <li>Images will be automatically split (80% Train, 20% Validation).</li>
                                </ul>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="file"
                                    accept=".zip,.tar,.tar.gz,.tgz"
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-900/30 file:text-indigo-800 hover:file:bg-indigo-100"
                                />
                                <button
                                    onClick={handleUpload}
                                    disabled={uploading || !selectedFile}
                                    className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 whitespace-nowrap"
                                >
                                    {uploading ? 'Uploading...' : 'Upload Archive'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="text-xs text-slate-700 bg-slate-50/90 p-3 rounded border border-slate-200">
                                <p className="font-semibold mb-1">Instructions:</p>
                                <ul className="list-disc pl-4 space-y-1">
                                    <li>Select a specific class name (e.g. <code>Tomato_Bacterial_Spot</code>).</li>
                                    <li>Select multiple images to add to this class.</li>
                                </ul>
                            </div>
                            <input
                                type="text"
                                placeholder="Class Name (e.g. Tomato_Healthy)"
                                className="w-full p-2 border border-slate-200/80 rounded text-sm"
                                value={className}
                                onChange={e => setClassName(e.target.value)}
                            />
                            <div className="flex gap-2">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleFilesChange}
                                    className="block w-full text-sm text-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-900/30 file:text-indigo-800 hover:file:bg-indigo-100"
                                />
                                <button
                                    onClick={handleUpload}
                                    disabled={uploading || !selectedFiles.length || !className}
                                    className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 whitespace-nowrap"
                                >
                                    {uploading ? 'Uploading...' : 'Upload Images'}
                                </button>
                            </div>
                        </div>
                    )}

                    </div>
                )}
            */ }

            {/* PROGRESS MODAL */}
            {
                showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[80vh]">
                            {/* Modal Header */}
                            <div className="p-4 bg-slate-100 border-b border-slate-200 flex justify-between items-center">
                                <h3 className="text-slate-900 font-bold flex items-center gap-2">
                                    <Terminal className="w-5 h-5 text-indigo-700" />
                                    Model Retraining Logs
                                </h3>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-slate-800 hover:text-slate-900 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Log Output */}
                            <div className="flex-1 overflow-y-auto p-6 font-mono text-sm space-y-1 custom-scrollbar bg-slate-50">
                                {status?.logs && Array.isArray(status.logs) && status.logs.length > 0 ? (
                                    status.logs.map((log, i) => (
                                        <div key={i} className="text-slate-700 break-words flex gap-2">
                                            <span className="text-slate-800 shrink-0 select-none">{'>'}</span>
                                            <span>{log}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-slate-700 italic">Initializing training sequence...</div>
                                )}
                                {/* Auto-scroll anchor */}
                                <div id="log-end"></div>
                            </div>

                            {/* Progress Bar Section */}
                            {status.is_training && (
                                <div className="px-6 py-4 bg-white border-t border-slate-200">
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Training Progress</span>
                                        <div className="text-right">
                                            <span className="text-sm font-bold text-slate-900 block">{Math.round(status.progress || 0)}%</span>
                                            {status.time_remaining && (
                                                <span className="text-[10px] text-slate-800 font-mono block">
                                                    ETA: {status.time_remaining}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                                        <div
                                            className="bg-indigo-500 h-2.5 rounded-full transition-all duration-500 ease-out"
                                            style={{ width: `${Math.round(status.progress || 0)}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-slate-700 mt-2 text-center">
                                        {Math.round(status.progress || 0) < 10 ? "Initializing..." :
                                            Math.round(status.progress || 0) < 50 ? "Training Model..." :
                                                Math.round(status.progress || 0) < 90 ? "Validating Results..." :
                                                    "Finalizing..."}
                                    </p>
                                </div>
                            )}

                            {/* Modal Footer */}
                            <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-between items-center">
                                <div className="flex items-center gap-2 text-xs">
                                    {status.is_training ? (
                                        <>
                                            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
                                            <span className="text-yellow-400 font-medium">Process Running...</span>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-2 h-2 rounded-full bg-green-400"></div>
                                            <span className="text-green-400 font-medium">Process Finished</span>
                                        </>
                                    )}
                                </div>
                                {!status.is_training && (
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 bg-slate-200 hover:bg-slate-600 text-slate-900 text-sm font-medium rounded-lg transition-colors"
                                    >
                                        Close Monitor
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    );
}

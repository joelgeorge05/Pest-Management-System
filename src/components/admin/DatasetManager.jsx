import React, { useState, useEffect } from 'react';
import { Upload, FolderPlus, AlertCircle, CheckCircle, Image as ImageIcon, Loader, RefreshCw } from 'lucide-react';

const DatasetManager = () => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRetraining, setIsRetraining] = useState(false);

    // Create Class State
    const [newClassName, setNewClassName] = useState('');
    const [createStatus, setCreateStatus] = useState(null); // { type: 'success' | 'error', message: '' }

    // Upload State
    const [selectedClass, setSelectedClass] = useState('');
    const [uploadFiles, setUploadFiles] = useState([]);
    const [uploadStatus, setUploadStatus] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        fetchClasses();
        checkTrainingStatus();
    }, []);

    const fetchClasses = async () => {
        try {
            const response = await fetch('http://localhost:5000/classes');
            if (response.ok) {
                const data = await response.json();
                // Sort alphabetically
                const sorted = data.sort((a, b) => a.display_name.localeCompare(b.display_name));
                setClasses(sorted);
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkTrainingStatus = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/admin/retrain/status');
            if (res.ok) {
                const data = await res.json();
                setIsRetraining(data.is_training);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleCreateClass = async (e) => {
        e.preventDefault();
        if (!newClassName.trim()) return;

        setCreateStatus(null);
        try {
            const res = await fetch('http://localhost:5000/api/admin/dataset/create_class', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ class_name: newClassName.trim() })
            });

            const data = await res.json();

            if (res.ok) {
                setCreateStatus({ type: 'success', message: data.message });
                setNewClassName('');
                fetchClasses(); // Refresh list
            } else {
                setCreateStatus({ type: 'error', message: data.error || 'Failed to create class' });
            }
        } catch (error) {
            setCreateStatus({ type: 'error', message: 'Server connection failed' });
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            setUploadFiles(Array.from(e.target.files));
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedClass || uploadFiles.length === 0) return;

        setIsUploading(true);
        setUploadStatus(null);

        const formData = new FormData();
        formData.append('type', 'single_class');
        formData.append('class_name', selectedClass);

        uploadFiles.forEach(file => {
            formData.append('files[]', file);
        });

        try {
            const res = await fetch('http://localhost:5000/api/admin/dataset/upload', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();

            if (res.ok) {
                setUploadStatus({ type: 'success', message: data.message });
                setUploadFiles([]);
                // Reset file input manually if needed, or rely on state
                document.getElementById('file-upload').value = '';
            } else {
                setUploadStatus({ type: 'error', message: data.error || 'Upload failed' });
            }
        } catch (error) {
            setUploadStatus({ type: 'error', message: 'Network error during upload' });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-8">

            {/* Header / Info */}
            <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                    <AlertCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-blue-900">Dataset Management</h3>
                    <p className="text-blue-700 mt-1">
                        Add new classes or upload images to existing ones.
                        <strong> Important:</strong> You must
                        <span className="inline-flex items-center gap-1 mx-1 font-bold bg-white backdrop-blur-xl border-emerald-500/20 px-2 py-0.5 rounded text-blue-800 text-xs border border-blue-200">
                            <RefreshCw className="w-3 h-3" /> Retrain Model
                        </span>
                        after making changes for them to take effect.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* 1. Create New Class */}
                <div className="bg-white backdrop-blur-xl border-emerald-500/20 p-6 rounded-2xl shadow-sm border border-slate-200/80">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-50 rounded-lg">
                            <FolderPlus className="w-5 h-5 text-purple-600" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">Create New Class</h2>
                    </div>

                    <form onSubmit={handleCreateClass} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-800 mb-1">Class Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Potato___Early_Blight"
                                className="w-full px-4 py-2 border border-slate-200/80 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                value={newClassName}
                                onChange={(e) => setNewClassName(e.target.value)}
                                disabled={isRetraining}
                            />
                            <p className="text-xs text-slate-800 mt-1">
                                Use underscores instead of spaces is recommended.
                            </p>
                        </div>

                        {createStatus && (
                            <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${createStatus.type === 'success' ? 'bg-emerald-900/30 text-emerald-800' : 'bg-red-900/30 text-red-300'
                                }`}>
                                {createStatus.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                {createStatus.message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={!newClassName.trim() || isRetraining}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FolderPlus className="w-4 h-4" />
                            Create Class
                        </button>
                    </form>
                </div>

                {/* 2. Upload Images */}
                <div className="bg-white backdrop-blur-xl border-emerald-500/20 p-6 rounded-2xl shadow-sm border border-slate-200/80">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-emerald-50 rounded-lg">
                            <Upload className="w-5 h-5 text-emerald-600" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">Upload Images</h2>
                    </div>

                    <form onSubmit={handleUpload} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-800 mb-1">Target Class</label>
                            <select
                                className="w-full px-4 py-2 border border-slate-200/80 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white backdrop-blur-xl border-emerald-500/20"
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                disabled={loading || isRetraining}
                            >
                                <option value="">Select a class...</option>
                                {classes.map(cls => (
                                    <option key={cls.id} value={cls.id}>
                                        {cls.display_name} ({cls.original_name})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-800 mb-1">Select Images</label>
                            <div className="relative border-2 border-dashed border-slate-200/80 rounded-xl p-6 hover:bg-slate-50/90 transition-colors text-center cursor-pointer group">
                                <input
                                    id="file-upload"
                                    type="file"
                                    accept=".png, .jpg, .jpeg"
                                    multiple
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={handleFileChange}
                                    disabled={isRetraining}
                                />
                                <div className="flex flex-col items-center gap-2 text-slate-800 group-hover:text-slate-800">
                                    <ImageIcon className="w-8 h-8" />
                                    <span className="text-sm font-medium">
                                        {uploadFiles.length > 0
                                            ? `${uploadFiles.length} files selected`
                                            : "Drag & drop or update click to select"}
                                    </span>
                                    <span className="text-xs">PNG, JPG up to 10MB</span>
                                </div>
                            </div>
                        </div>

                        {uploadStatus && (
                            <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${uploadStatus.type === 'success' ? 'bg-emerald-900/30 text-emerald-800' : 'bg-red-900/30 text-red-300'
                                }`}>
                                {uploadStatus.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                {uploadStatus.message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={!selectedClass || uploadFiles.length === 0 || isUploading || isRetraining}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isUploading ? <Loader className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                            {isUploading ? 'Uploading...' : 'Upload Images'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-slate-50/90 p-6 rounded-2xl border border-slate-200/80">
                <h4 className="font-bold text-slate-800 mb-3">Best Practices</h4>
                <ul className="text-sm text-slate-800 space-y-2 list-disc list-inside">
                    <li>Ensure images are clear, well-lit, and focused on the leaf/symptom.</li>
                    <li>Avoid uploading duplicates to prevent model bias.</li>
                    <li>The system automatically splits uploads into <strong>80% Training</strong> and <strong>20% Validation</strong>.</li>
                    <li>For new classes, aim for at least <strong>50-100 images</strong> for decent accuracy.</li>
                </ul>
            </div>
        </div>
    );
};

export default DatasetManager;

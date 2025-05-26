import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { UploadCloud, FileText, XCircle } from 'lucide-react';

function DocumentUpload({ onUploadSuccess }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [dragActive, setDragActive] = useState(false);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setSelectedFile(e.dataTransfer.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            toast.error("Please select a file first.");
            return;
        }
        setIsUploading(true);
        setUploadProgress(0);
        const toastId = toast.loading(`Uploading ${selectedFile.name}... 0%`);

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            await api.uploadFile(formData, (progressEvent) => {
                const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setUploadProgress(percent);
                toast.loading(`Uploading ${selectedFile.name}... ${percent}%`, { id: toastId });
            });
            toast.success(`${selectedFile.name} uploaded successfully! Document processing started.`, { id: toastId });
            setSelectedFile(null);
            if (onUploadSuccess) onUploadSuccess();
        } catch (error) {
            toast.error(`Upload failed: ${error.message || 'Unknown error'}`, { id: toastId });
            console.error("Upload failed:", error);
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    return (
        <div className="mb-4 p-1">
            <label 
                htmlFor="file-upload-input"
                onDragEnter={handleDrag} 
                onDragLeave={handleDrag} 
                onDragOver={handleDrag} 
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center w-full h-32 px-4 transition bg-surface-light dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer hover:border-primary dark:hover:border-primary-light
                    ${dragActive ? "border-primary dark:border-primary-light ring-2 ring-primary" : ""}
                    ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                    <UploadCloud size={32} className={`mb-2 ${dragActive ? 'text-primary' : 'text-text-muted-light dark:text-text-muted-dark'}`} />
                    <p className="mb-1 text-xs text-text-muted-light dark:text-text-muted-dark">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-text-muted-light dark:text-text-muted-dark">PDF, DOCX, TXT, PPTX, code files</p>
                </div>
                <input id="file-upload-input" type="file" className="hidden" onChange={handleFileChange} disabled={isUploading} 
                       accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.py,.js,.md,.html,.xml,.json,.csv,.log" />
            </label>

            {selectedFile && (
                <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 truncate">
                        <FileText size={18} className="text-primary flex-shrink-0" />
                        <span className="truncate" title={selectedFile.name}>{selectedFile.name}</span>
                        <span className="text-text-muted-light dark:text-text-muted-dark text-xs whitespace-nowrap">
                            ({(selectedFile.size / 1024).toFixed(1)} KB)
                        </span>
                    </div>
                    {!isUploading && (
                        <button onClick={() => setSelectedFile(null)} className="text-red-500 hover:text-red-700">
                            <XCircle size={18} />
                        </button>
                    )}
                </div>
            )}
            
            {isUploading && (
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
                    <div className="bg-primary h-1.5 rounded-full transition-all duration-300 ease-linear" style={{ width: `${uploadProgress}%` }}></div>
                </div>
            )}

            <button
                onClick={handleUpload}
                className="w-full mt-2 btn-primary-custom text-sm py-1.5 disabled:opacity-60"
                disabled={!selectedFile || isUploading}
            >
                {isUploading ? `Uploading ${uploadProgress}%...` : "Upload Document"}
            </button>
        </div>
    );
}
export default DocumentUpload;
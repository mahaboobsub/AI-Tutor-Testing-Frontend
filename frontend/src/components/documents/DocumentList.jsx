import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FileText, Edit3, Trash2, RefreshCw, Loader2, AlertTriangle } from 'lucide-react';
// You'll need a modal component for rename
// import RenameFileModal from './RenameFileModal'; 

function DocumentList() {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    // const [showRenameModal, setShowRenameModal] = useState(false);
    // const [fileToRename, setFileToRename] = useState(null);

    const fetchFiles = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const userFiles = await api.getFiles();
            setFiles(userFiles || []);
        } catch (err) {
            setError(err.message || "Failed to fetch documents.");
            toast.error("Could not load your documents.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFiles();
    }, [fetchFiles]);

    const handleRename = async (file, newName) => {
        // This would be triggered by a modal
        if (!newName || newName === file.originalName) return;
        const toastId = toast.loading(`Renaming ${file.originalName}...`);
        try {
            await api.renameFile(file.serverFilename, newName);
            toast.success(`Renamed to ${newName}`, { id: toastId });
            fetchFiles(); // Refresh list
        } catch (err) {
            toast.error(`Rename failed: ${err.message}`, { id: toastId });
        }
    };

    const handleDelete = async (file) => {
        if (!window.confirm(`Are you sure you want to delete "${file.originalName}"? It will be moved to backup.`)) return;
        const toastId = toast.loading(`Deleting ${file.originalName}...`);
        try {
            await api.deleteFile(file.serverFilename);
            toast.success(`${file.originalName} moved to backup.`, { id: toastId });
            fetchFiles(); // Refresh list
        } catch (err) {
            toast.error(`Delete failed: ${err.message}`, { id: toastId });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-4 text-text-muted-light dark:text-text-muted-dark">
                <Loader2 size={20} className="animate-spin mr-2" /> Loading documents...
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded-md text-sm flex items-center gap-2">
                <AlertTriangle size={18} /> {error} 
                <button onClick={fetchFiles} className="ml-auto text-xs underline">Retry</button>
            </div>
        );
    }
    
    if (files.length === 0) {
        return <p className="text-center text-xs text-text-muted-light dark:text-text-muted-dark p-4">No documents uploaded yet. Use the section above to add files.</p>;
    }

    // TODO: Implement document selection for analysis context.
    // This requires passing a callback or using context to inform App.js or AnalysisControls.jsx
    // of the selected document.

    return (
        <div className="space-y-1.5 text-xs custom-scrollbar">
            {files.map(file => (
                <div 
                    key={file.serverFilename} 
                    className="p-2 bg-surface-light dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md flex items-center justify-between hover:shadow-md transition-shadow"
                    // onClick={() => onSelectDocument(file)} // Example of selection
                    // className={`... ${selectedDoc?.serverFilename === file.serverFilename ? 'ring-2 ring-primary' : ''}`}
                >
                    <div className="flex items-center gap-1.5 truncate">
                        <FileText size={16} className="text-primary flex-shrink-0" />
                        <span className="truncate" title={file.originalName}>{file.originalName}</span>
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-1">
                        <button 
                            // onClick={(e) => { e.stopPropagation(); setFileToRename(file); setShowRenameModal(true); }} 
                            onClick={(e) => { e.stopPropagation(); const newN = prompt(`Rename "${file.originalName}" to:`, file.originalName); if(newN) handleRename(file, newN); }}
                            className="p-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300" title="Rename">
                            <Edit3 size={14} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(file);}} className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300" title="Delete">
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>
            ))}
            {/* <RenameFileModal isOpen={showRenameModal} onClose={() => setShowRenameModal(false)} file={fileToRename} onSave={handleRename} /> */}
        </div>
    );
}
export default DocumentList;
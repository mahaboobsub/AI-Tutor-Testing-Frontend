import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import MindmapViewer from './MindmapViewer'; // Import if needed
import { ChevronDown, ChevronUp, Loader2, AlertTriangle } from 'lucide-react';
import * as LucideIcons from 'lucide-react'; // Import all for dynamic icon
import { marked } from 'marked';


const createMarkup = (markdownText) => {
    if (!markdownText) return { __html: '' };
    return { __html: marked.parse(markdownText) };
};


function AnalysisTool({ toolType, title, icon, selectedDocumentFilename }) { // selectedDocumentFilename passed from parent
    const [isOpen, setIsOpen] = useState(false);
    const [result, setResult] = useState(null);
    const [thinking, setThinking] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const IconComponent = LucideIcons[icon] || LucideIcons.HelpCircle; // Default icon

    const handleRunAnalysis = async () => {
        if (!selectedDocumentFilename) {
            toast.error("Please select a document from the left panel first.");
            return;
        }
        setIsLoading(true);
        setError('');
        setResult(null);
        setThinking(null);
        const toastId = toast.loading(`Generating ${title} for ${selectedDocumentFilename}...`);

        try {
            const payload = { filename: selectedDocumentFilename, analysis_type: toolType };
            const response = await api.requestAnalysis(payload);
            setResult(response.content);
            setThinking(response.thinking);
            setIsOpen(true); // Auto-open on successful analysis
            toast.success(`${title} generated!`, { id: toastId });
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || `Failed to generate ${title}.`;
            setError(errorMessage);
            toast.error(errorMessage, { id: toastId });
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-surface-light dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 text-sm font-medium text-text-light dark:text-text-dark focus:outline-none w-full text-left"
                >
                    <IconComponent size={16} className="text-primary" />
                    <span>{title}</span>
                </button>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleRunAnalysis}
                        className="px-2 py-1 text-xs btn-primary-custom disabled:opacity-50"
                        disabled={isLoading || !selectedDocumentFilename}
                        title={!selectedDocumentFilename ? "Select a document first" : `Run ${title}`}
                    >
                        {isLoading ? <Loader2 size={14} className="animate-spin" /> : "Run"}
                    </button>
                    <button onClick={() => setIsOpen(!isOpen)} className="p-1 text-text-muted-light dark:text-text-muted-dark hover:text-primary">
                        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                </div>
            </div>

            {isOpen && (
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600 animate-fadeIn">
                    {isLoading && <p className="text-xs text-text-muted-light dark:text-text-muted-dark p-2">Generating...</p>}
                    {error && (
                        <div className="p-2 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded-md text-xs flex items-center gap-1">
                            <AlertTriangle size={14} /> {error}
                        </div>
                    )}
                    {thinking && !error && (
                        <details className="text-xs mb-1.5">
                            <summary className="cursor-pointer text-text-muted-light dark:text-text-muted-dark hover:text-primary">AI Reasoning</summary>
                            <pre className="mt-1 p-1.5 bg-gray-100 dark:bg-gray-700 rounded text-text-light dark:text-text-dark text-[0.7rem] max-h-24 overflow-y-auto custom-scrollbar">
                                <code>{thinking}</code>
                            </pre>
                        </details>
                    )}
                    {result && !error && (
                        toolType === 'mindmap' ? (
                            <MindmapViewer markdownContent={result} />
                        ) : (
                            <div className="prose prose-xs dark:prose-invert max-w-none text-text-light dark:text-text-dark p-1 max-h-60 overflow-y-auto custom-scrollbar text-[0.75rem]"
                                 dangerouslySetInnerHTML={createMarkup(result)}
                            />
                        )
                    )}
                    {!isLoading && !result && !error && <p className="text-xs text-text-muted-light dark:text-text-muted-dark p-2">Click "Run" to generate analysis.</p>}
                </div>
            )}
        </div>
    );
}
export default AnalysisTool;
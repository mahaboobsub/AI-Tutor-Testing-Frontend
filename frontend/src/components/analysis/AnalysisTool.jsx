// // frontend/src/components/analysis/AnalysisTool.jsx
// import React, { useState } from 'react';
// import api from '../../services/api.js'; // Assuming .js for services
// import toast from 'react-hot-toast';
// import MindmapViewer from './MindmapViewer.jsx';
// import { ChevronDown, ChevronUp, Loader2, AlertTriangle } from 'lucide-react'; // Loader2 is imported once here
// import * as LucideIcons from 'lucide-react'; // For dynamic icon selection by name
// import { marked } from 'marked';
// import Button from '../core/Button.jsx';
// import IconButton from '../core/IconButton.jsx'; // Import IconButton
// import { motion } from 'framer-motion'; // Import motion

// // Configure marked for consistent rendering
// marked.setOptions({
//   breaks: true,
//   gfm: true,
// });

// const createMarkup = (markdownText) => {
//     if (!markdownText) return { __html: '' };
//     const rawHtml = marked.parse(markdownText);
//     // For production, consider DOMPurify:
//     // import DOMPurify from 'dompurify';
//     // const cleanHtml = DOMPurify.sanitize(rawHtml);
//     // return { __html: cleanHtml };
//     return { __html: rawHtml };
// };

// const escapeHtml = (unsafe) => { // Helper for <pre> tags if thinking content isn't markdown
//     if (typeof unsafe !== 'string') return '';
//     return unsafe
//          .replace(/&/g, "&")
//          .replace(/</g, "<")
//          .replace(/>/g, ">")
//          .replace(/"/g, '"')
//          .replace(/'/g, "'");
// };

// function AnalysisTool({ toolType, title, iconName, selectedDocumentFilename }) {
//     const [isOpen, setIsOpen] = useState(false);
//     const [result, setResult] = useState(null);
//     const [thinking, setThinking] = useState(null);
//     const [isLoading, setIsLoading] = useState(false);
//     const [error, setError] = useState('');

//     // Dynamically select icon component based on iconName prop
//     const IconComponent = LucideIcons[iconName] || LucideIcons.HelpCircle; // Default to HelpCircle if not found

//     const handleRunAnalysis = async () => {
//         if (!selectedDocumentFilename) {
//             toast.error("Please select a document from the left panel first.");
//             return;
//         }
//         setIsLoading(true);
//         setError('');
//         setResult(null);
//         setThinking(null);
//         const toastId = toast.loading(`Generating ${title} for ${selectedDocumentFilename}...`);

//         try {
//             const payload = { filename: selectedDocumentFilename, analysis_type: toolType };
//             const response = await api.requestAnalysis(payload); // Mocked in V1
//             setResult(response.content);
//             setThinking(response.thinking);
//             setIsOpen(true); 
//             toast.success(`${title} generated (mock data)!`, { id: toastId });
//         } catch (err) {
//             const errorMessage = err.response?.data?.message || err.message || `Failed to generate ${title}.`;
//             setError(errorMessage);
//             toast.error(errorMessage, { id: toastId });
//             console.error("AnalysisTool Error:", err);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     return (
//         <div className="card-base p-3"> {/* Use themed card style from index.css */}
//             <div className="flex items-center justify-between">
//                 <button 
//                     onClick={() => setIsOpen(!isOpen)}
//                     className="flex items-center gap-2 text-sm font-medium text-text-light dark:text-text-dark focus:outline-none w-full text-left hover:text-primary dark:hover:text-primary-light transition-colors"
//                     aria-expanded={isOpen}
//                 >
//                     <IconComponent size={16} className="text-primary dark:text-primary-light flex-shrink-0" />
//                     <span className="flex-grow">{title}</span>
//                 </button>
//                 <div className="flex items-center gap-1 flex-shrink-0">
//                     <Button
//                         onClick={handleRunAnalysis}
//                         variant="primary" 
//                         size="sm"
//                         className="!px-3 !py-1 text-xs" // Override Button padding for smaller size
//                         isLoading={isLoading} // Button component handles its own loader icon
//                         disabled={isLoading || !selectedDocumentFilename}
//                         title={!selectedDocumentFilename ? "Select a document first" : `Run ${title} Analysis`}
//                     >
//                        Run
//                     </Button>
//                     <IconButton 
//                         icon={isOpen ? ChevronUp : ChevronDown} 
//                         onClick={() => setIsOpen(!isOpen)} 
//                         size="sm" 
//                         variant="ghost"
//                         className="p-1" // Ensure IconButton has padding if its default is too large
//                         aria-label={isOpen ? "Collapse section" : "Expand section"}
//                     />
//                 </div>
//             </div>

//             {isOpen && (
//                 <motion.div 
//                     initial={{ height: 0, opacity: 0 }} 
//                     animate={{ height: 'auto', opacity: 1 }} 
//                     exit={{ height: 0, opacity: 0 }}
//                     transition={{ duration: 0.2, ease: "easeInOut" }}
//                     className="mt-2 pt-2 border-t border-border-light dark:border-border-dark overflow-hidden" 
//                 >
//                     <div className="space-y-2"> {/* Added wrapper for consistent spacing */}
//                         {isLoading && (
//                             <p className="text-xs text-text-muted-light dark:text-text-muted-dark p-2 flex items-center gap-2">
//                                 <Loader2 size={14} className="animate-spin"/>Generating...
//                             </p>
//                         )}
//                         {error && (
//                             <div className="p-2 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-300 rounded-md text-xs flex items-center gap-1">
//                                 <AlertTriangle size={14} /> {error}
//                             </div>
//                         )}
//                         {thinking && !error && (
//                             <details className="text-xs" open={!!result}> {/* Open if result is also present */}
//                                 <summary className="cursor-pointer text-text-muted-light dark:text-text-muted-dark hover:text-primary dark:hover:text-primary-light font-medium">
//                                     AI Reasoning
//                                 </summary>
//                                 <pre className="mt-1 p-1.5 bg-gray-100 dark:bg-gray-900 rounded text-[0.7rem] max-h-28 overflow-y-auto custom-scrollbar whitespace-pre-wrap break-words">
//                                     <code>{escapeHtml(thinking)}</code>
//                                 </pre>
//                             </details>
//                         )}
//                         {result && !error && (
//                             toolType === 'mindmap' ? (
//                                 <MindmapViewer markdownContent={result} />
//                             ) : (
//                                 <div 
//                                     className="prose prose-xs dark:prose-invert max-w-none text-text-light dark:text-text-dark p-1 max-h-60 overflow-y-auto custom-scrollbar text-[0.75rem] leading-relaxed"
//                                     dangerouslySetInnerHTML={createMarkup(result)}
//                                 />
//                             )
//                         )}
//                         {!isLoading && !result && !error && !selectedDocumentFilename && (
//                              <p className="text-xs text-text-muted-light dark:text-text-muted-dark p-2">Select a document to run analysis.</p>
//                         )}
//                          {!isLoading && !result && !error && selectedDocumentFilename && (
//                              <p className="text-xs text-text-muted-light dark:text-text-muted-dark p-2">Click "Run" to generate analysis.</p>
//                         )}
//                     </div>
//                 </motion.div>
//             )}
//         </div>
//     );
// }
// export default AnalysisTool;







// src/components/analysis/AnalysisTool.jsx
import React, { useState } from 'react';
import api from '../../services/api.js';
import toast from 'react-hot-toast';
// import MindmapViewer from './MindmapViewer.jsx'; // No longer directly used here for toolType 'mindmap'
import MermaidMindmapModal from './MermaidMindmapModal.jsx'; // Import the new modal
import { ChevronDown, ChevronUp, Loader2, AlertTriangle } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { marked } from 'marked';
import Button from '../core/Button.jsx';
import IconButton from '../core/IconButton.jsx';
import { motion } from 'framer-motion';

marked.setOptions({
  breaks: true,
  gfm: true,
});

const createMarkup = (markdownText) => {
    if (!markdownText) return { __html: '' };
    return { __html: marked.parse(markdownText) };
};

const escapeHtml = (unsafe) => {
    if (typeof unsafe !== 'string') return '';
    return unsafe.replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">").replace(/"/g, '"').replace(/'/g, "'");
};

function AnalysisTool({ toolType, title, iconName, selectedDocumentFilename }) {
    const [isOpen, setIsOpen] = useState(false); // For the accordion itself
    const [result, setResult] = useState(null); // For non-mindmap results shown inline
    const [thinking, setThinking] = useState(null); // For inline thinking
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // State for Mermaid Mindmap Modal
    const [isMermaidModalOpen, setIsMermaidModalOpen] = useState(false);
    const [mermaidCode, setMermaidCode] = useState('');
    const [mindmapDocumentName, setMindmapDocumentName] = useState('');

    const IconComponent = LucideIcons[iconName] || LucideIcons.HelpCircle;

    const handleRunAnalysis = async (forceRefreshMindmap = false) => {
        if (!selectedDocumentFilename) {
            toast.error("Please select a document first.");
            return;
        }
        setIsLoading(true);
        setError('');
        if (toolType !== 'mindmap' || forceRefreshMindmap) { // Reset inline results only if not mindmap or refreshing
            setResult(null);
            setThinking(null);
        }
        if (forceRefreshMindmap) { // Also reset mermaid code if refreshing
            setMermaidCode('');
        }

        const toastId = toast.loading(`Generating ${title} for ${selectedDocumentFilename}...`);

        try {
            const payload = { filename: selectedDocumentFilename, analysis_type: toolType };
            const response = await api.requestAnalysis(payload);
            
            if (toolType === 'mindmap') {
                setMermaidCode(response.content);
                setMindmapDocumentName(selectedDocumentFilename); // Store name for modal title
                setIsMermaidModalOpen(true); // Open the modal
                setIsOpen(false); // Optionally close the accordion
            } else {
                setResult(response.content);
                setThinking(response.thinking);
                setIsOpen(true); // Open accordion for inline results
            }
            toast.success(`${title} generated!`, { id: toastId });
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || `Failed to generate ${title}.`;
            setError(errorMessage);
            toast.error(errorMessage, { id: toastId });
            console.error("AnalysisTool Error:", err);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Handler for the refresh button inside the Mermaid modal
    const handleRefreshMindmap = () => {
        // It will call handleRunAnalysis, which will re-fetch and update mermaidCode
        if (selectedDocumentFilename) {
            handleRunAnalysis(true); // Pass true to indicate refresh
        }
    };


    return (
        <>
            <div className="card-base p-3">
                <div className="flex items-center justify-between">
                    <button 
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center gap-2 text-sm font-medium text-text-light dark:text-text-dark focus:outline-none w-full text-left hover:text-primary dark:hover:text-primary-light transition-colors"
                        aria-expanded={isOpen && toolType !== 'mindmap'} // Accordion only opens for non-mindmap
                    >
                        <IconComponent size={16} className="text-primary dark:text-primary-light flex-shrink-0" />
                        <span className="flex-grow">{title}</span>
                    </button>
                    <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                            onClick={() => handleRunAnalysis()}
                            variant="primary" 
                            size="sm"
                            className="!px-3 !py-1 text-xs"
                            isLoading={isLoading}
                            disabled={isLoading || !selectedDocumentFilename}
                            title={!selectedDocumentFilename ? "Select a document first" : `Run ${title} Analysis`}
                        >
                           Run
                        </Button>
                        {toolType !== 'mindmap' && ( // Chevron only for non-mindmap tools using accordion
                            <IconButton 
                                icon={isOpen ? ChevronUp : ChevronDown} 
                                onClick={() => setIsOpen(!isOpen)} 
                                size="sm" 
                                variant="ghost"
                                className="p-1"
                                aria-label={isOpen ? "Collapse section" : "Expand section"}
                            />
                        )}
                    </div>
                </div>

                {/* Inline display for non-mindmap results */}
                {isOpen && toolType !== 'mindmap' && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: 'auto', opacity: 1 }} 
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="mt-2 pt-2 border-t border-border-light dark:border-border-dark overflow-hidden" 
                    >
                        <div className="space-y-2">
                            {isLoading && (
                                <p className="text-xs text-text-muted-light dark:text-text-muted-dark p-2 flex items-center gap-2">
                                    <Loader2 size={14} className="animate-spin"/>Generating...
                                </p>
                            )}
                            {error && (
                                <div className="p-2 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-300 rounded-md text-xs flex items-center gap-1">
                                    <AlertTriangle size={14} /> {error}
                                </div>
                            )}
                            {thinking && !error && (
                                <details className="text-xs" open={!!result}>
                                    <summary className="cursor-pointer text-text-muted-light dark:text-text-muted-dark hover:text-primary dark:hover:text-primary-light font-medium">
                                        AI Reasoning
                                    </summary>
                                    <pre className="mt-1 p-1.5 bg-gray-100 dark:bg-gray-900 rounded text-[0.7rem] max-h-28 overflow-y-auto custom-scrollbar whitespace-pre-wrap break-words">
                                        <code>{escapeHtml(thinking)}</code>
                                    </pre>
                                </details>
                            )}
                            {result && !error && (
                                 // No MindmapViewer here anymore, only other types
                                <div 
                                    className="prose prose-xs dark:prose-invert max-w-none text-text-light dark:text-text-dark p-1 max-h-60 overflow-y-auto custom-scrollbar text-[0.75rem] leading-relaxed"
                                    dangerouslySetInnerHTML={createMarkup(result)}
                                />
                            )}
                            {!isLoading && !result && !error && !selectedDocumentFilename && (
                                 <p className="text-xs text-text-muted-light dark:text-text-muted-dark p-2">Select a document to run analysis.</p>
                            )}
                             {!isLoading && !result && !error && selectedDocumentFilename && (
                                 <p className="text-xs text-text-muted-light dark:text-text-muted-dark p-2">Click "Run" to generate analysis.</p>
                            )}
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Mermaid Mindmap Modal - rendered if toolType is 'mindmap' */}
            {toolType === 'mindmap' && (
                <MermaidMindmapModal
                    isOpen={isMermaidModalOpen}
                    onClose={() => setIsMermaidModalOpen(false)}
                    mermaidCode={mermaidCode}
                    documentName={mindmapDocumentName}
                    onRefresh={handleRefreshMindmap} // Pass the refresh handler
                />
            )}
        </>
    );
}
export default AnalysisTool;
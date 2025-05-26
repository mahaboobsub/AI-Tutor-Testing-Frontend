import React, { useState } from 'react';
import DocumentUpload from '../documents/DocumentUpload';
import DocumentList from '../documents/DocumentList';
import { ChevronDown, ChevronUp, FilePlus, ListFilter, Settings2 } from 'lucide-react'; // Example icons

function LeftPanel() {
    const [isPromptSectionOpen, setIsPromptSectionOpen] = useState(true);
    const [systemPrompt, setSystemPrompt] = useState("You are a helpful AI engineering tutor."); // Default system prompt
    const [isDocManagementOpen, setIsDocManagementOpen] = useState(true);

    // TODO: Fetch and manage document list state, pass to DocumentList & DocumentUpload
    // TODO: Implement prompt management (save/load presets)

    return (
        <div className="flex flex-col h-full">
            {/* Custom Prompt Section */}
            <div className="mb-4">
                <button 
                    onClick={() => setIsPromptSectionOpen(!isPromptSectionOpen)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-left text-text-light dark:text-text-dark bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md focus:outline-none"
                >
                    <span><Settings2 size={16} className="inline mr-2" /> Custom Prompt</span>
                    {isPromptSectionOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {isPromptSectionOpen && (
                    <div className="mt-2 p-3 bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-600 rounded-md animate-fadeIn">
                        {/* Dropdown for prompt presets - To be implemented */}
                        <textarea
                            value={systemPrompt}
                            onChange={(e) => setSystemPrompt(e.target.value)}
                            rows="3"
                            className="input-custom text-xs"
                            placeholder="Enter system prompt (e.g., Act as an expert in thermodynamics...)"
                        />
                        {/* Buttons for Save/Load prompt presets */}
                    </div>
                )}
            </div>

            {/* Document Management Section */}
            <div className="flex-grow flex flex-col overflow-hidden">
                 <button 
                    onClick={() => setIsDocManagementOpen(!isDocManagementOpen)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-left text-text-light dark:text-text-dark bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md focus:outline-none mb-2"
                >
                    <span><FilePlus size={16} className="inline mr-2" /> Document Management</span>
                    {isDocManagementOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {isDocManagementOpen && (
                    <div className="flex-grow flex flex-col overflow-hidden animate-fadeIn">
                        <DocumentUpload onUploadSuccess={() => { /* TODO: refresh doc list */ }} />
                        <div className="mt-3 flex-grow overflow-y-auto">
                             {/* SELECT DOCUMENT with filter dropdown - placeholder */}
                            <div className="mb-2">
                                <label htmlFor="doc-filter" className="text-xs text-text-muted-light dark:text-text-muted-dark">Filter documents:</label>
                                <select id="doc-filter" className="input-custom input-custom text-xs mt-1">
                                    <option value="all">All Documents</option>
                                    <option value="pdf">PDFs</option>
                                    {/* More filter options */}
                                </select>
                            </div>
                            <DocumentList />
                        </div>
                    </div>
                )}
            </div>
             {/* TODO: Document Preview Capabilities - complex, maybe a modal or dedicated view */}
        </div>
    );
}
export default LeftPanel;
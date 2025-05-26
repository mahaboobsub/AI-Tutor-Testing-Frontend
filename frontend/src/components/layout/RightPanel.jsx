import React, { useState } from 'react';
import AnalysisTool from '../analysis/AnalysisTool';
import { ChevronDown, ChevronUp, Telescope } from 'lucide-react'; // Example icons

function RightPanel() {
    const [isAnalyzerOpen, setIsAnalyzerOpen] = useState(true);
    // TODO: Manage state for selected document for analysis, analysis results for each tool

    return (
        <div className="flex flex-col h-full">
            <button 
                onClick={() => setIsAnalyzerOpen(!isAnalyzerOpen)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-left text-text-light dark:text-text-dark bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md focus:outline-none mb-2"
            >
                <span><Telescope size={16} className="inline mr-2" /> Advanced Analyzer</span>
                {isAnalyzerOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {isAnalyzerOpen && (
                <div className="flex-grow space-y-3 overflow-y-auto animate-fadeIn p-1">
                    {/* 
                        Here you'd pass the selected document from LeftPanel (or a global context) 
                        to each AnalysisTool instance. This requires more state management.
                        For simplicity, AnalysisTool will internally manage its state for now.
                    */}
                    <AnalysisTool toolType="faq" title="FAQ Generator" icon="HelpCircle" />
                    <AnalysisTool toolType="topics" title="Key Topics Extractor" icon="Tags" />
                    <AnalysisTool toolType="mindmap" title="Mind Map Creator" icon="GitFork" />
                </div>
            )}
        </div>
    );
}
export default RightPanel;
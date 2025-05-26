import React from 'react';
import { HardDrive, Cloud } from 'lucide-react'; // Example icons

function LLMSelection({ selectedLLM, onLlmChange }) {
    const llms = [
        { id: 'ollama', name: 'Ollama LLM', description: 'Local & Default', Icon: HardDrive },
        { id: 'gemini', name: 'Gemini LLM', description: 'Cloud Powered', Icon: Cloud },
    ];

    return (
        <div>
            <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">
                Choose Your Preferred LLM
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {llms.map((llm) => (
                    <button
                        key={llm.id}
                        type="button"
                        onClick={() => onLlmChange(llm.id)}
                        className={`p-4 border rounded-lg text-left transition-all duration-150 focus:outline-none
                            ${selectedLLM === llm.id 
                                ? 'bg-primary-light dark:bg-primary-dark border-primary dark:border-primary-light ring-2 ring-primary dark:ring-primary-light shadow-lg' 
                                : 'bg-surface-light dark:bg-surface-dark border-gray-300 dark:border-gray-600 hover:border-primary-light dark:hover:border-primary-dark hover:shadow-md'
                            }`}
                    >
                        <div className="flex items-center mb-1">
                            <llm.Icon size={20} className={`mr-2 ${selectedLLM === llm.id ? 'text-primary dark:text-primary-light' : 'text-text-muted-light dark:text-text-muted-dark'}`} />
                            <span className={`font-semibold ${selectedLLM === llm.id ? 'text-primary dark:text-primary-light' : 'text-text-light dark:text-text-dark'}`}>
                                {llm.name}
                            </span>
                        </div>
                        <p className={`text-xs ${selectedLLM === llm.id ? 'text-primary-dark dark:text-primary' : 'text-text-muted-light dark:text-text-muted-dark'}`}>
                            {llm.description}
                        </p>
                    </button>
                ))}
            </div>
        </div>
    );
}

export default LLMSelection;
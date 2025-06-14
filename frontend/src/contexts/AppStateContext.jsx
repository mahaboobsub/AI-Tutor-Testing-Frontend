// src/contexts/AppStateContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

export const AppStateContext = createContext(null);

export const useAppState = () => {
    const context = useContext(AppStateContext);
    if (!context) throw new Error('useAppState must be used within an AppStateProvider');
    return context;
};

const INITIAL_DEV_SESSION_ID = `dev-ui-session-${Date.now()}`;
const defaultSystemPromptText = "You are assessing understanding of engineering/scientific topics. Ask targeted questions to test knowledge, identify misconceptions, and provide feedback on the answers. Start by asking the user what topic they want to be quizzed on.";

export const AppStateProvider = ({ children }) => {
    const [theme, setThemeState] = useState(() => localStorage.getItem('theme') || 'dark');
    const [selectedLLM, setSelectedLLM] = useState(localStorage.getItem('selectedLLM') || 'ollama');
    const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
    const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
    const [currentSessionId, setCurrentSessionIdState] = useState(() => localStorage.getItem('aiTutorSessionId') || INITIAL_DEV_SESSION_ID);
    const [systemPrompt, setSystemPromptState] = useState(localStorage.getItem('aiTutorSystemPrompt') || defaultSystemPromptText);
    const [selectedDocumentForAnalysis, setSelectedDocumentForAnalysisState] = useState(null);

    const toggleTheme = () => {
        setThemeState(prevTheme => {
            const newTheme = prevTheme === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
            return newTheme;
        });
    };

    const switchLLM = (llm) => {
        setSelectedLLM(llm);
        localStorage.setItem('selectedLLM', llm);
    };

    const setSessionId = (sessionId) => {
        const newId = sessionId || INITIAL_DEV_SESSION_ID;
        setCurrentSessionIdState(newId);
        if (newId) {
            localStorage.setItem('aiTutorSessionId', newId);
        } else {
            localStorage.removeItem('aiTutorSessionId');
        }
    };

    const setSystemPrompt = (promptText) => {
        const newPrompt = promptText || defaultSystemPromptText;
        setSystemPromptState(newPrompt);
        localStorage.setItem('aiTutorSystemPrompt', newPrompt);
    };

    const selectDocumentForAnalysis = (documentFile) => {
        setSelectedDocumentForAnalysisState(documentFile);
    };

    useEffect(() => {
        const rootHtmlElement = document.documentElement;
        rootHtmlElement.classList.remove('light', 'dark');
        rootHtmlElement.classList.add(theme);
        document.body.className = '';
        document.body.classList.add(theme === 'dark' ? 'bg-background-dark' : 'bg-background-light');
        document.body.classList.add(theme === 'dark' ? 'text-text-dark' : 'text-text-light');
    }, [theme]);

    useEffect(() => {
        if (!currentSessionId) {
            const newDevId = `dev-ui-session-${Date.now()}`;
            setCurrentSessionIdState(newDevId);
            localStorage.setItem('aiTutorSessionId', newDevId);
        }
    }, [currentSessionId]);

    return ( // This is line 74 in this version
        <AppStateContext.Provider value={{ // This is line 75
            theme, toggleTheme, // This is line 76 - error was here
            selectedLLM, switchLLM,
            isLeftPanelOpen, setIsLeftPanelOpen,
            isRightPanelOpen, setIsRightPanelOpen,
            currentSessionId, setSessionId,
            systemPrompt, setSystemPrompt,
            selectedDocumentForAnalysis, selectDocumentForAnalysis
        }}>
            {children}
        </AppStateContext.Provider>
    );
};



// // frontend/src/contexts/AppStateContext.jsx
// import React, { createContext, useState, useContext, useEffect } from 'react';

// export const AppStateContext = createContext(null);

// export const useAppState = () => {
//     const context = useContext(AppStateContext);
//     if (!context) throw new Error('useAppState must be used within an AppStateProvider');
//     return context;
// };

// const INITIAL_DEV_SESSION_ID = `dev-ui-session-${Date.now()}`; 
// const defaultSystemPromptText = "You are assessing understanding of engineering/scientific topics. Ask targeted questions to test knowledge, identify misconceptions, and provide feedback on the answers. Start by asking the user what topic they want to be quizzed on.";

// export const AppStateProvider = ({ children }) => {
//     const [theme, setThemeState] = useState(() => localStorage.getItem('theme') || 'dark');
//     const [selectedLLM, setSelectedLLM] = useState(localStorage.getItem('selectedLLM') || 'ollama');
//     const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
//     const [isRightPanelOpen, setIsRightPanelOpen] = useState(true); 
    
//     const [currentSessionId, setCurrentSessionIdState] = useState(() => {
//         return localStorage.getItem('aiTutorSessionId') || INITIAL_DEV_SESSION_ID;
//     });
    
//     const [systemPrompt, setSystemPromptState] = useState(
//         localStorage.getItem('aiTutorSystemPrompt') || defaultSystemPromptText
//     );
    
//     // THIS IS THE STATE FOR THE SELECTED DOCUMENT
//     const [selectedDocumentForAnalysis, setSelectedDocumentForAnalysisState] = useState(null); // Stores { originalName, serverFilename, ... } or null

//     const toggleTheme = () => {
//         setThemeState(prevTheme => {
//             const newTheme = prevTheme === 'light' ? 'dark' : 'light';
//             localStorage.setItem('theme', newTheme);
//             return newTheme;
//         });
//     };
    
//     const switchLLM = (llm) => {
//         setSelectedLLM(llm);
//         localStorage.setItem('selectedLLM', llm);
//     };

//     const setSessionId = (sessionId) => {
//         const newId = sessionId || INITIAL_DEV_SESSION_ID; 
//         setCurrentSessionIdState(newId);
//         localStorage.setItem('aiTutorSessionId', newId);
//     };

//     const setSystemPrompt = (promptText) => {
//         const newPrompt = promptText || defaultSystemPromptText;
//         setSystemPromptState(newPrompt);
//         localStorage.setItem('aiTutorSystemPrompt', newPrompt);
//     };

//     // THIS IS THE SETTER FOR THE SELECTED DOCUMENT
//     const selectDocumentForAnalysis = (documentFile) => { 
//         console.log("AppStateContext: selectDocumentForAnalysis called with:", documentFile);
//         setSelectedDocumentForAnalysisState(documentFile); // documentFile is { originalName, serverFilename } or null
//     };

//     useEffect(() => {
//         document.documentElement.classList.remove('light', 'dark');
//         document.documentElement.classList.add(theme);
//     }, [theme]);

//     useEffect(() => { 
//         if (!currentSessionId) {
//             setSessionId(INITIAL_DEV_SESSION_ID);
//         }
//     }, [currentSessionId]); // Removed setSessionId from dependencies


//     return (
//         <AppStateContext.Provider value={{
//             theme, toggleTheme,
//             selectedLLM, switchLLM,
//             isLeftPanelOpen, setIsLeftPanelOpen,
//             isRightPanelOpen, setIsRightPanelOpen,
//             currentSessionId, setSessionId,
//             systemPrompt, setSystemPrompt,
//             selectedDocumentForAnalysis, selectDocumentForAnalysis // Provide selected doc and its setter
//         }}>
//             {children}
//         </AppStateContext.Provider>
//     );
// };


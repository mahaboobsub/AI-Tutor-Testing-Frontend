// import React, { createContext, useState, useContext } from 'react';

// export const AppStateContext = createContext();

// export const useAppState = () => useContext(AppStateContext);

// export const AppStateProvider = ({ children }) => {
//     const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark'); // 'light' or 'dark'
//     const [selectedLLM, setSelectedLLM] = useState(localStorage.getItem('selectedLLM') || 'ollama'); // 'ollama' or 'gemini'
//     const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
//     const [isRightPanelOpen, setIsRightPanelOpen] = useState(false); // Initially closed
//     const [currentSessionId, setCurrentSessionId] = useState(localStorage.getItem('aiTutorSessionId') || null);

//     const toggleTheme = () => {
//         const newTheme = theme === 'light' ? 'dark' : 'light';
//         setTheme(newTheme);
//         localStorage.setItem('theme', newTheme);
//         document.documentElement.classList.toggle('dark', newTheme === 'dark');
//     };
    
//     const switchLLM = (llm) => {
//         setSelectedLLM(llm);
//         localStorage.setItem('selectedLLM', llm);
//         // Potentially trigger API key update modal if switching to Gemini and key not set
//     };

//     const setSessionId = (sessionId) => {
//         setCurrentSessionId(sessionId);
//         if (sessionId) {
//             localStorage.setItem('aiTutorSessionId', sessionId);
//         } else {
//             localStorage.removeItem('aiTutorSessionId');
//         }
//     };


//     return (
//         <AppStateContext.Provider value={{
//             theme, toggleTheme,
//             selectedLLM, switchLLM,
//             isLeftPanelOpen, setIsLeftPanelOpen,
//             isRightPanelOpen, setIsRightPanelOpen,
//             currentSessionId, setSessionId
//         }}>
//             {children}
//         </AppStateContext.Provider>
//     );
// };
// ... other imports ...
// const DEV_MODE_BYPASS_AUTH = true; // Match the value in AuthContext for consistency in dev setup

// export const AppStateProvider = ({ children }) => {
//     // ... other states ...
//     const [currentSessionId, setCurrentSessionId] = useState(
//         DEV_MODE_BYPASS_AUTH 
//         ? 'dev-session-123' 
//         : localStorage.getItem('aiTutorSessionId') || null
//     );

//     // ... rest of the AppStateProvider ...

//     const setSessionId = (sessionId) => {
//         setCurrentSessionId(sessionId);
//         if (DEV_MODE_BYPASS_AUTH && !sessionId) { // Prevent clearing dev session on accidental null set
//             console.log("DEV_MODE: Preventing clearing of dev session ID.");
//             if (!currentSessionId) setCurrentSessionId('dev-session-123'); // Reset if it somehow got cleared
//             return;
//         }
//         if (sessionId) {
//             localStorage.setItem('aiTutorSessionId', sessionId);
//         } else {
//             localStorage.removeItem('aiTutorSessionId');
//         }
//     };

//     return (
//         <AppStateContext.Provider value={{
//             // ... other values ...
//             currentSessionId, setSessionId 
//         }}>
//             {children}
//         </AppStateContext.Provider>
//     );
// };
// frontend/src/contexts/AppStateContext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';

export const AppStateContext = createContext(null); // Initialize with null

export const useAppState = () => { // Custom hook to use the AppStateContext
    const context = useContext(AppStateContext);
    if (context === undefined || context === null) { // Check if context is undefined or null
        throw new Error('useAppState must be used within an AppStateProvider');
    }
    return context;
};

const DEV_MODE_BYPASS_AUTH = true; // Ensure this matches other dev flags if used for initial state

export const AppStateProvider = ({ children }) => {
    const [theme, setThemeState] = useState(() => {
        const storedTheme = localStorage.getItem('theme');
        // Ensure theme is applied on initial load if not already on html tag
        if (storedTheme === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
        return storedTheme || 'dark';
    });
    const [selectedLLM, setSelectedLLM] = useState(localStorage.getItem('selectedLLM') || 'ollama');
    const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
    const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
    const [currentSessionId, setCurrentSessionIdState] = useState(
        DEV_MODE_BYPASS_AUTH
        ? 'dev-session-appstate-123' // Consistent dev session ID
        : localStorage.getItem('aiTutorSessionId') || null
    );
    // State for the selected document for analysis
    const [selectedDocumentForAnalysis, setSelectedDocumentForAnalysis] = useState(null);


    const toggleTheme = () => {
        setThemeState(prevTheme => {
            const newTheme = prevTheme === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
            document.documentElement.classList.toggle('dark', newTheme === 'dark');
            // For Tailwind, class on <html> is usually enough.
            // If you have body-specific theme styles:
            // document.body.classList.remove(prevTheme);
            // document.body.classList.add(newTheme);
            return newTheme;
        });
    };
    
    const switchLLM = (llm) => {
        setSelectedLLM(llm);
        localStorage.setItem('selectedLLM', llm);
    };

    const setSessionId = (sessionId) => {
        setCurrentSessionIdState(sessionId);
        if (DEV_MODE_BYPASS_AUTH && !sessionId && currentSessionId) {
             console.warn("DEV_MODE: Attempted to clear dev session ID. Retaining current dev session.");
             if(!currentSessionIdState) setCurrentSessionIdState('dev-session-appstate-123'); // Ensure it has a value
             return;
        }
        if (sessionId) {
            localStorage.setItem('aiTutorSessionId', sessionId);
        } else {
            localStorage.removeItem('aiTutorSessionId');
        }
    };

    const selectDocumentForAnalysis = (documentFile) => { // documentFile could be { originalName, serverFilename }
        setSelectedDocumentForAnalysis(documentFile);
    };

    // Apply theme to HTML element on initial load and when theme changes
     useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);


    return (
        <AppStateContext.Provider value={{
            theme, toggleTheme,
            selectedLLM, switchLLM,
            isLeftPanelOpen, setIsLeftPanelOpen,
            isRightPanelOpen, setIsRightPanelOpen,
            currentSessionId, setSessionId, // Use the wrapped setter
            selectedDocumentForAnalysis, selectDocumentForAnalysis
        }}>
            {children}
        </AppStateContext.Provider>
    );
};
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './hooks/useAuth.jsx';
import { useAppState } from './contexts/AppStateContext.jsx';
import AuthModal from './components/auth/AuthModal.jsx';
import TopNav from './components/layout/TopNav.jsx';
import LeftPanel from './components/layout/LeftPanel.jsx';
import CenterPanel from './components/layout/CenterPanel.jsx';
import RightPanel from './components/layout/RightPanel.jsx';
import LeftCollapsedNav from './components/layout/LeftCollapsedNav.jsx';
import RightCollapsedNav from './components/layout/RightCollapsedNav.jsx';
import ChatHistoryModal from './components/chat/ChatHistoryModal.jsx';
import api from './services/api.js';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// For this Version 1:
// - AuthContext.jsx should have BYPASS_AUTH_FOR_DEVELOPMENT = true
// - AppStateContext.jsx should have INITIALIZE_WITH_DEV_SESSION = true
// - api.js should have DEV_MODE_MOCK_API = true

function App() {
    const { 
        token, 
        user, 
        loading: authLoading, 
        logout,
        isTestingMode // This flag comes from AuthContext (BYPASS_AUTH_FOR_DEVELOPMENT)
    } = useAuth();

    const { 
        theme, 
        isLeftPanelOpen, 
        isRightPanelOpen, 
        currentSessionId, 
        setSessionId: setGlobalSessionId 
    } = useAppState();
    
    const [appInitializing, setAppInitializing] = useState(true); 
    const [showAuthModal, setShowAuthModal] = useState(false); 
    const [messages, setMessages] = useState([]);
    const [chatStatus, setChatStatus] = useState('Ready.');
    const [orchestratorStatus, setOrchestratorStatus] = useState({ status: "loading", message: "Connecting..." });
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

    useEffect(() => {
        const rootHtmlElement = document.documentElement;
        rootHtmlElement.classList.remove('light', 'dark');
        rootHtmlElement.classList.add(theme);
        document.body.className = ''; 
        document.body.classList.add(theme === 'dark' ? 'bg-background-dark' : 'bg-background-light');
        console.log("App.jsx: Theme applied -", theme);
    }, [theme]);

    useEffect(() => {
        console.log("App.jsx Auth Effect: authLoading:", authLoading, "isTestingMode:", isTestingMode, "Token:", token, "User:", user);
        if (authLoading) {
            setAppInitializing(true);
            return;
        }

        if (isTestingMode && user && token) {
            console.log("App.jsx: Auth Bypassed by Context. User:", user);
            setShowAuthModal(false);
            if (!currentSessionId) {
                const devSession = localStorage.getItem('aiTutorSessionId') || `dev-main-app-session-${Date.now()}`;
                setGlobalSessionId(devSession);
                console.log("App.jsx: Initializing dev session:", devSession);
            }
        } else if (!token) {
            console.log("App.jsx: No token, showing AuthModal.");
            setShowAuthModal(true);
        } else { 
            console.log("App.jsx: Token exists, user authenticated (or will be shortly).");
            setShowAuthModal(false);
            if (user && !currentSessionId) { // User object is set, but no session yet
                api.startNewSession().then(data => setGlobalSessionId(data.sessionId));
            }
        }
        setAppInitializing(false);
    }, [token, user, authLoading, currentSessionId, setGlobalSessionId, isTestingMode]);

    useEffect(() => { 
        api.getOrchestratorStatus().then(setOrchestratorStatus);
        // Interval removed for brevity in this version, can be added back if needed
    }, []);

    const fetchChatHistory = useCallback(async (sid) => {
        if (!sid || (!token && !isTestingMode)) {
             setMessages([]); 
             setChatStatus( (token || isTestingMode) ? "Select or start a chat." : "Please login.");
             return; 
        }
        setChatStatus("Loading mock history...");
        try {
            const historyData = await api.getChatHistory(sid); // Mocked call
            const formattedMessages = (Array.isArray(historyData) ? historyData : []).map(msg => ({
                id: msg.id || msg._id || String(Math.random() + Date.now()),
                sender: msg.sender || (msg.role === 'model' ? 'bot' : 'user'),
                text: msg.parts?.[0]?.text || msg.text || '',
                thinking: msg.thinking, references: msg.references || [],
                timestamp: msg.timestamp || new Date().toISOString(),
                source_pipeline: msg.source_pipeline
            }));
            setMessages(formattedMessages);
            setChatStatus(formattedMessages.length > 0 ? "Mock history loaded." : "Chat empty.");
        } catch (error) {
            toast.error("Mock history load failed (check api.js mocks).");
            setChatStatus("Error loading mock history.");
        }
    }, [token, isTestingMode]); 

    useEffect(() => {
        if (currentSessionId && (token || isTestingMode)) { // Check isTestingMode too for bypassed auth
            fetchChatHistory(currentSessionId);
        }
    }, [currentSessionId, token, isTestingMode, fetchChatHistory]);

    const handleAuthSuccess = (authData) => {
        setShowAuthModal(false);
        if (authData?.sessionId) setGlobalSessionId(authData.sessionId);
        else if (token && !currentSessionId) { // Fallback
             api.startNewSession().then(data => setGlobalSessionId(data.sessionId));
        }
        // User state is managed by AuthContext
    };
    
    const handleLogout = () => {
        logout(); 
        setGlobalSessionId(null);
        setMessages([]);
        if (!isTestingMode) setShowAuthModal(true); 
        else console.log("App.jsx (V1): Mock logout. To see AuthModal, disable bypass in AuthContext.");
        toast.success("Logged out (mock).");
    };

    const handleNewChat = async () => { 
        const data = await api.startNewSession(); // Mocked
        setGlobalSessionId(data.sessionId);
        setMessages([]); 
        setChatStatus("New mock chat!");
        toast.success("New mock chat started!");
    };

    const handleSelectSessionFromHistory = (sessionId) => {
        if (sessionId) setGlobalSessionId(sessionId);
        setIsHistoryModalOpen(false); 
    };

    if (appInitializing || (authLoading && !isTestingMode)) { 
        return (
            <div className="fixed inset-0 flex flex-col items-center justify-center bg-background-dark text-text-dark">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary mb-4"></div>
                <p className="text-xl">Initializing AI Tutor...</p>
            </div>
        );
    }

    // Determine if main app should render based on auth state (bypassed or real)
    const canRenderMainApp = (isTestingMode && user && token) || (!isTestingMode && user && token);

    return (
        <div className={`flex flex-col h-screen overflow-hidden font-sans ${theme}`}>
            <AnimatePresence>
                {!canRenderMainApp && showAuthModal && ( // Show AuthModal if not authenticated and not bypassed
                    <AuthModal isOpen={true} onClose={handleAuthSuccess} />
                )}
            </AnimatePresence>

            {canRenderMainApp && (
                <>
                    <TopNav
                        user={user}
                        onLogout={handleLogout}
                        onNewChat={handleNewChat}
                        onHistoryClick={() => setIsHistoryModalOpen(true)}
                        orchestratorStatus={orchestratorStatus}
                    />
                    <div className="flex flex-1 overflow-hidden pt-16 bg-background-light dark:bg-background-dark">
                        <AnimatePresence mode="wait">
                            {isLeftPanelOpen ? (
                                <motion.aside 
                                    key="left-panel-main"
                                    initial={{ x: '-100%', opacity: 0 }}
                                    animate={{ x: '0%', opacity: 1 }}
                                    exit={{ x: '-100%', opacity: 0 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                    className="w-full md:w-72 lg:w-80 xl:w-96 bg-surface-light dark:bg-surface-dark border-r border-border-light dark:border-border-dark overflow-y-auto p-3 sm:p-4 shadow-lg flex-shrink-0 custom-scrollbar"
                                >
                                    <LeftPanel /> 
                                </motion.aside>
                            ) : (
                                <LeftCollapsedNav />
                            )}
                        </AnimatePresence>
                        
                        <main className={`flex-1 flex flex-col overflow-hidden p-1 sm:p-2 md:p-4 
                                         transition-all duration-300 ease-in-out
                                         ${isLeftPanelOpen ? 'lg:ml-0' : 'lg:ml-16 md:ml-14'} 
                                         ${isRightPanelOpen ? 'lg:mr-0' : 'lg:mr-16 md:mr-14'}`}>
                           <CenterPanel 
                                messages={messages} 
                                setMessages={setMessages} 
                                currentSessionId={currentSessionId}
                                chatStatus={chatStatus}
                                setChatStatus={setChatStatus}
                            />
                        </main>

                        <AnimatePresence mode="wait">
                            {isRightPanelOpen ? (
                                <motion.aside 
                                    key="right-panel-main"
                                    initial={{ x: '100%', opacity: 0 }}
                                    animate={{ x: '0%', opacity: 1 }}
                                    exit={{ x: '100%', opacity: 0 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                    className="hidden md:flex md:flex-col md:w-72 lg:w-80 xl:w-96 bg-surface-light dark:bg-surface-dark border-l border-border-light dark:border-border-dark overflow-y-auto p-3 sm:p-4 shadow-lg flex-shrink-0 custom-scrollbar"
                                >
                                    <RightPanel />
                                </motion.aside>
                            ) : (
                                <RightCollapsedNav />
                            )}
                        </AnimatePresence>
                    </div>
                    
                    <ChatHistoryModal
                        isOpen={isHistoryModalOpen}
                        onClose={() => setIsHistoryModalOpen(false)}
                        onSelectSession={handleSelectSessionFromHistory}
                    />
                </>
            )}
            
            {/* Fallback for unexpected state where app is not initializing, user not logged in, and modal isn't forced */}
            { !appInitializing && !canRenderMainApp && !showAuthModal && (
                 <div className="fixed inset-0 flex flex-col items-center justify-center bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
                     <p className="text-xl">Error in application state. Please <button 
                        onClick={()=> { setShowAuthModal(true); }} 
                        className="text-primary hover:underline font-semibold"
                        >try logging in</button>.</p>
                 </div>
            )}
        </div>
    );
}

export default App;



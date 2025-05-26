// // import { useState } from 'react'
// // import reactLogo from './assets/react.svg'
// // import viteLogo from '/vite.svg'
// // import './App.css'

// // function App() {
// //   const [count, setCount] = useState(0)

// //   return (
// //     <>
// //       <div>
// //         <a href="https://vite.dev" target="_blank">
// //           <img src={viteLogo} className="logo" alt="Vite logo" />
// //         </a>
// //         <a href="https://react.dev" target="_blank">
// //           <img src={reactLogo} className="logo react" alt="React logo" />
// //         </a>
// //       </div>
// //       <h1>Vite + React</h1>
// //       <div className="card">
// //         <button onClick={() => setCount((count) => count + 1)}>
// //           count is {count}
// //         </button>
// //         <p>
// //           Edit <code>src/App.jsx</code> and save to test HMR
// //         </p>
// //       </div>
// //       <p className="read-the-docs">
// //         Click on the Vite and React logos to learn more
// //       </p>
// //     </>
// //   )
// // }

// // export default App

// import React, { useState, useEffect, useCallback } from 'react';
// import { useAuth } from './hooks/useAuth';
// import { useAppState } from './contexts/AppStateContext';
// import AuthModal from './components/auth/AuthModal';
// import TopNav from './components/layout/TopNav';
// import LeftPanel from './components/layout/LeftPanel';
// import CenterPanel from './components/layout/CenterPanel';
// import RightPanel from './components/layout/RightPanel';
// import api from './services/api'; // Your API service functions
// import toast from 'react-hot-toast';
// import { motion, AnimatePresence } from 'framer-motion';

// // Icons
// import { AlertTriangle, CheckCircle2 } from 'lucide-react';


// function App() {
//     const { token, user, loading: authLoading, logout, setUser: setAuthUser } = useAuth();
//     const { 
//         theme, 
//         selectedLLM,
//         isLeftPanelOpen, setIsLeftPanelOpen,
//         isRightPanelOpen, setIsRightPanelOpen,
//         currentSessionId, setSessionId: setGlobalSessionId 
//     } = useAppState();
    
//     const [showAuthModal, setShowAuthModal] = useState(false);
//     const [messages, setMessages] = useState([]);
//     const [chatStatus, setChatStatus] = useState(''); // e.g., "Thinking...", "Responded"
//     const [orchestratorStatus, setOrchestratorStatus] = useState({ status: "loading", message: "Connecting..." });


//     // Initialize theme
//     useEffect(() => {
//         if (theme === 'dark') {
//             document.documentElement.classList.add('dark');
//         } else {
//             document.documentElement.classList.remove('dark');
//         }
//     }, [theme]);

//     // Check auth status on initial load
//     useEffect(() => {
//         if (!authLoading && !token) {
//             setShowAuthModal(true);
//         } else if (token && !currentSessionId) {
//             // If logged in but no session, create one
//             api.startNewSession().then(data => {
//                 setGlobalSessionId(data.sessionId);
//             }).catch(err => {
//                 toast.error("Failed to start a new session.");
//                 console.error(err);
//             });
//         }
//     }, [token, authLoading, currentSessionId, setGlobalSessionId]);

//     // Fetch orchestrator status
//     useEffect(() => {
//         const fetchStatus = async () => {
//             const statusData = await api.getOrchestratorStatus();
//             setOrchestratorStatus(statusData);
//         };
//         fetchStatus();
//         const intervalId = setInterval(fetchStatus, 20000); // Check every 20s
//         return () => clearInterval(intervalId);
//     }, []);

//     // Fetch chat history when session ID changes
//     const fetchChatHistory = useCallback(async (sid) => {
//         if (!sid || !token) {
//             setMessages([]); // Clear messages if no session or token
//             return;
//         }
//         setChatStatus("Loading history...");
//         try {
//             const historyData = await api.getChatHistory(sid); // Token is auto-included by axios interceptor
//             const formattedMessages = (Array.isArray(historyData) ? historyData : []).map(msg => ({
//                 id: msg.id || msg._id || String(Math.random()),
//                 sender: msg.role === 'model' ? 'bot' : 'user',
//                 text: msg.parts && msg.parts.length > 0 ? msg.parts[0].text : (msg.text || ''), // Handle both structures
//                 thinking: msg.thinking,
//                 references: msg.references || [],
//                 timestamp: msg.timestamp
//             }));
//             setMessages(formattedMessages);
//             setChatStatus(formattedMessages.length > 0 ? "History loaded." : "New chat. Send a message to start!");
//         } catch (error) {
//             toast.error(`Failed to load chat history: ${error.message}`);
//             setChatStatus("Error loading history.");
//             console.error("Failed to load chat history:", error);
//         }
//     }, [token]);

//     useEffect(() => {
//         if (currentSessionId && token) {
//             fetchChatHistory(currentSessionId);
//         } else if (!token) {
//             setMessages([]); // Clear messages if logged out
//         }
//     }, [currentSessionId, token, fetchChatHistory]);


//     const handleAuthSuccess = (authData) => { // authData contains { token, username, _id, sessionId }
//         setShowAuthModal(false);
//         // AuthContext already sets token and user from its login/signup methods
//         // App.js just needs to use the sessionId provided
//         if (authData.sessionId) {
//             setGlobalSessionId(authData.sessionId);
//         }
//         // If authData.user is more complete, update AuthContext's user
//         if(authData.username && authData._id){
//             setAuthUser({username: authData.username, id: authData._id});
//         }
//     };
    
//     const handleLogout = () => {
//         logout();
//         setGlobalSessionId(null); // Clear session on logout
//         setShowAuthModal(true); // Show auth modal after logout
//         toast.success("Logged out successfully.");
//     };

//     const handleNewChat = async () => {
//         try {
//             const data = await api.startNewSession();
//             setGlobalSessionId(data.sessionId);
//             setMessages([]); // Clear current messages for the new chat
//             setChatStatus("New chat started. Send a message!");
//             toast.success("New chat started!");
//         } catch (error) {
//             toast.error("Failed to start new chat.");
//             console.error("Failed to start new chat:", error);
//         }
//     };


//     if (authLoading) {
//         return (
//             <div className="fixed inset-0 flex items-center justify-center bg-background-dark dark:bg-opacity-80">
//                 <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
//                 <p className="ml-4 text-xl text-text-dark">Initializing...</p>
//             </div>
//         );
//     }

//     return (
//         <div className={`flex flex-col h-screen overflow-hidden font-sans ${theme}`}>
//             <AnimatePresence>
//                 {showAuthModal && !token && (
//                     <AuthModal isOpen={showAuthModal} onClose={handleAuthSuccess} />
//                 )}
//             </AnimatePresence>

//             {token && user && (
//                 <>
//                     <TopNav
//                         user={user}
//                         onLogout={handleLogout}
//                         onNewChat={handleNewChat}
//                         onHistoryClick={() => { /* TODO: Implement History Modal/Panel */ toast.info("History feature coming soon!"); }}
//                         onLLMSwitchClick={() => { /* TODO: Implement LLM Switch Modal */ toast.info("LLM switching coming soon!"); }}
//                         orchestratorStatus={orchestratorStatus}
//                     />
//                     <div className="flex flex-1 overflow-hidden pt-16"> {/* pt-16 for fixed TopNav height */}
//                         {/* Left Panel */}
//                         <AnimatePresence>
//                         {isLeftPanelOpen && (
//                             <motion.aside 
//                                 initial={{ x: '-100%', opacity: 0 }}
//                                 animate={{ x: '0%', opacity: 1 }}
//                                 exit={{ x: '-100%', opacity: 0 }}
//                                 transition={{ type: 'spring', stiffness: 300, damping: 30 }}
//                                 className="w-64 md:w-72 lg:w-80 bg-surface-light dark:bg-surface-dark border-r border-gray-200 dark:border-gray-700 overflow-y-auto p-4 shadow-lg flex-shrink-0"
//                             >
//                                 <LeftPanel />
//                             </motion.aside>
//                         )}
//                         </AnimatePresence>

//                         {/* Center Panel */}
//                         <main className="flex-1 flex flex-col overflow-hidden p-2 sm:p-4">
//                            <CenterPanel 
//                                 messages={messages} 
//                                 setMessages={setMessages} 
//                                 currentSessionId={currentSessionId}
//                                 chatStatus={chatStatus}
//                                 setChatStatus={setChatStatus}
//                             />
//                         </main>

//                         {/* Right Panel */}
//                         <AnimatePresence>
//                         {isRightPanelOpen && (
//                             <motion.aside 
//                                 initial={{ x: '100%', opacity: 0 }}
//                                 animate={{ x: '0%', opacity: 1 }}
//                                 exit={{ x: '100%', opacity: 0 }}
//                                 transition={{ type: 'spring', stiffness: 300, damping: 30 }}
//                                 className="w-64 md:w-72 lg:w-80 bg-surface-light dark:bg-surface-dark border-l border-gray-200 dark:border-gray-700 overflow-y-auto p-4 shadow-lg flex-shrink-0"
//                             >
//                                 <RightPanel />
//                             </motion.aside>
//                         )}
//                         </AnimatePresence>
//                     </div>
//                 </>
//             )}
//         </div>
//     );
// }

// export default App;

// import React, { useState, useEffect, useCallback } from 'react';
// import { useAuth } from './hooks/useAuth';
// import { useAppState } from './contexts/AppStateContext';
// import AuthModal from './components/auth/AuthModal';
// import TopNav from './components/layout/TopNav';
// import LeftPanel from './components/layout/LeftPanel';
// import CenterPanel from './components/layout/CenterPanel';
// import RightPanel from './components/layout/RightPanel';
// import api from './services/api';
// import toast from 'react-hot-toast';
// import { motion, AnimatePresence } from 'framer-motion';

// // Match this with AuthContext and AppStateContext for dev mode
// const DEV_MODE_BYPASS_AUTH = true; // Set to true to bypass login and use fake user/session

// function App() {
//     const { token, user, loading: authLoadingFromContext, logout, setUser: setAuthUser, setToken: setAuthToken } = useAuth();
//     const { 
//         theme, 
//         // selectedLLM, // selectedLLM is now managed by LLMSelectionModal and TopNav directly via AppStateContext
//         isLeftPanelOpen, setIsLeftPanelOpen, // Assuming these are still needed for App level control if any
//         isRightPanelOpen, setIsRightPanelOpen, // Or if TopNav manages them via context directly
//         currentSessionId, setSessionId: setGlobalSessionId 
//     } = useAppState();
    
//     // Local loading state for App component's own async operations or initial setup
//     const [appInitializing, setAppInitializing] = useState(true);
//     const [showAuthModal, setShowAuthModal] = useState(false);
//     const [messages, setMessages] = useState([]);
//     const [chatStatus, setChatStatus] = useState('Ready. Send a message to start!');
//     const [orchestratorStatus, setOrchestratorStatus] = useState({ status: "loading", message: "Connecting..." });

//     // Initialize theme
//     useEffect(() => {
//         if (theme === 'dark') {
//             document.documentElement.classList.add('dark');
//         } else {
//             document.documentElement.classList.remove('dark');
//         }
//         // Add/remove theme class from body as well for global styles if needed
//         document.body.className = ''; // Clear previous theme classes
//         document.body.classList.add(theme); // Add current theme class (e.g., 'dark' or 'light')
//     }, [theme]);


//     // Auth and Session Initialization Logic
//     useEffect(() => {
//         if (DEV_MODE_BYPASS_AUTH) {
//             // AuthContext already provides fake token/user if DEV_MODE_BYPASS_AUTH is true in AuthContext.
//             // AppStateContext already provides fake session if DEV_MODE_BYPASS_AUTH is true in AppStateContext.
//             // Here we just ensure App.jsx acknowledges this state.
//             console.log("DEV_MODE: App.jsx recognizing bypassed auth.");
//             if (!currentSessionId) { // If AppStateContext didn't set a dev session, set one here.
//                  setGlobalSessionId('dev-session-appjsx-123');
//             }
//             setAppInitializing(false);
//             setShowAuthModal(false); // Explicitly ensure modal is not shown
//             return;
//         }

//         // Real auth flow
//         if (authLoadingFromContext) {
//             setAppInitializing(true); // Still initializing if AuthContext is loading
//             return;
//         }

//         if (!token) { // No token, needs login
//             setShowAuthModal(true);
//             setAppInitializing(false);
//         } else { // Token exists
//             setShowAuthModal(false);
//             if (!currentSessionId) { // Token exists, but no session ID found
//                 api.startNewSession().then(data => {
//                     setGlobalSessionId(data.sessionId);
//                 }).catch(err => {
//                     toast.error("Failed to start a new session. Please try logging in again.");
//                     console.error(err);
//                     // Consider logging out if session start fails critically
//                     // logout(); 
//                     // setShowAuthModal(true);
//                 });
//             }
//             setAppInitializing(false);
//         }
//     }, [token, authLoadingFromContext, currentSessionId, setGlobalSessionId, logout, setAuthToken, setAuthUser ]);


//     // Fetch orchestrator status
//     useEffect(() => {
//         const fetchStatus = async () => {
//             const statusData = await api.getOrchestratorStatus();
//             setOrchestratorStatus(statusData);
//         };
//         fetchStatus();
//         const intervalId = setInterval(fetchStatus, 20000);
//         return () => clearInterval(intervalId);
//     }, []);

//     // Fetch chat history when session ID or token changes (and both are present)
//     const fetchChatHistory = useCallback(async (sid) => {
//         if (!sid || !token) {
//             setMessages([]);
//             setChatStatus("Login or start a new chat.");
//             return;
//         }
//         setChatStatus("Loading history...");
//         try {
//             const historyData = await api.getChatHistory(sid);
//             const formattedMessages = (Array.isArray(historyData) ? historyData : []).map(msg => ({
//                 id: msg.id || msg._id || String(Math.random()),
//                 sender: msg.role === 'model' ? 'bot' : 'user',
//                 text: msg.parts && msg.parts.length > 0 ? msg.parts[0].text : (msg.text || ''),
//                 thinking: msg.thinking,
//                 references: msg.references || [],
//                 timestamp: msg.timestamp,
//                 source_pipeline: msg.source_pipeline
//             }));
//             setMessages(formattedMessages);
//             setChatStatus(formattedMessages.length > 0 ? "History loaded." : "New chat. Send a message!");
//         } catch (error) {
//             toast.error(`Failed to load chat history: ${error.message}`);
//             setChatStatus("Error loading history.");
//             console.error("Failed to load chat history:", error);
//         }
//     }, [token]); // Removed sid from dependencies to call it explicitly

//     useEffect(() => {
//         if (currentSessionId && token) {
//             fetchChatHistory(currentSessionId);
//         } else if (!token) {
//             setMessages([]); // Clear messages if logged out
//             setChatStatus("Please login.");
//         }
//     }, [currentSessionId, token, fetchChatHistory]);


//     const handleAuthSuccess = (authData) => {
//         setShowAuthModal(false);
//         // AuthContext's login/signup should have set the token and user.
//         // App.js needs to set the session ID obtained from login/signup.
//         if (authData.sessionId) {
//             setGlobalSessionId(authData.sessionId);
//              // Fetch history for this new session
//             fetchChatHistory(authData.sessionId);
//         } else {
//             // If no sessionId from auth, start a new one
//             api.startNewSession().then(data => {
//                 setGlobalSessionId(data.sessionId);
//                 fetchChatHistory(data.sessionId);
//             }).catch(err => toast.error("Failed to initialize session after login."));
//         }
//          // Ensure user object is fully populated in AuthContext if authData has more details
//         if(authData.username && authData._id && authData.token){
//             // setAuthToken(authData.token); // AuthContext should do this from login/signup
//             setAuthUser({username: authData.username, id: authData._id});
//         }
//     };
    
//     const handleLogoutAndShowModal = () => {
//         logout(); // This clears token and user in AuthContext
//         setGlobalSessionId(null); // Clear session in AppStateContext
//         localStorage.removeItem('aiTutorSessionId'); // Explicitly clear from localStorage too
//         setMessages([]);
//         setShowAuthModal(true); // Trigger AuthModal display
//         toast.success("Logged out successfully.");
//     };

//     const handleNewChat = async () => {
//         try {
//             const data = await api.startNewSession();
//             setGlobalSessionId(data.sessionId);
//             setMessages([]);
//             setChatStatus("New chat started. Send a message!");
//             toast.success("New chat started!");
//         } catch (error) {
//             toast.error("Failed to start new chat.");
//             console.error("Failed to start new chat:", error);
//         }
//     };

//     // This is the initial loading state for the entire app before we know if we show AuthModal or main app
//     if (appInitializing && !DEV_MODE_BYPASS_AUTH) { 
//         return (
//             <div className="fixed inset-0 flex items-center justify-center bg-background-light dark:bg-background-dark">
//                 <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
//                 <p className="ml-4 text-xl text-text-light dark:text-text-dark">Initializing App...</p>
//             </div>
//         );
//     }

//     return (
//         <div className={`flex flex-col h-screen overflow-hidden font-sans ${theme}`}>
//             <AnimatePresence>
//                 {showAuthModal && !token && ( // Show modal only if no token and dev bypass is off
//                     <AuthModal isOpen={showAuthModal} onClose={handleAuthSuccess} />
//                 )}
//             </AnimatePresence>

//             {/* Render main app content if token exists (or dev bypass is on and user is set) */}
//             {(token && user) && (
//                 <>
//                     <TopNav
//                         user={user} // User from AuthContext
//                         onLogout={handleLogoutAndShowModal}
//                         onNewChat={handleNewChat}
//                         onHistoryClick={() => toast.info("History feature coming soon!")}
//                         orchestratorStatus={orchestratorStatus}
//                         // Panel toggle props for TopNav to control App's panel state:
//                         isLeftPanelOpen={isLeftPanelOpen}
//                         toggleLeftPanel={() => setIsLeftPanelOpen(prev => !prev)}
//                         isRightPanelOpen={isRightPanelOpen}
//                         toggleRightPanel={() => setIsRightPanelOpen(prev => !prev)}
//                     />
//                     <div className="flex flex-1 overflow-hidden pt-16"> {/* pt-16 for fixed TopNav height */}
//                         <AnimatePresence>
//                         {isLeftPanelOpen && (
//                             <motion.aside 
//                                 key="left-panel"
//                                 initial={{ x: '-100%', opacity: 0 }}
//                                 animate={{ x: '0%', opacity: 1 }}
//                                 exit={{ x: '-100%', opacity: 0 }}
//                                 transition={{ type: 'spring', stiffness: 260, damping: 30 }}
//                                 className="w-full md:w-72 lg:w-80 xl:w-96 bg-surface-light dark:bg-surface-dark border-r border-gray-200 dark:border-gray-700 overflow-y-auto p-3 sm:p-4 shadow-lg flex-shrink-0 custom-scrollbar"
//                             >
//                                 <LeftPanel />
//                             </motion.aside>
//                         )}
//                         </AnimatePresence>

//                         <main className="flex-1 flex flex-col overflow-hidden p-1 sm:p-2 md:p-4">
//                            <CenterPanel 
//                                 messages={messages} 
//                                 setMessages={setMessages} 
//                                 currentSessionId={currentSessionId}
//                                 chatStatus={chatStatus}
//                                 setChatStatus={setChatStatus}
//                             />
//                         </main>

//                         <AnimatePresence>
//                         {isRightPanelOpen && (
//                             <motion.aside 
//                                 key="right-panel"
//                                 initial={{ x: '100%', opacity: 0 }}
//                                 animate={{ x: '0%', opacity: 1 }}
//                                 exit={{ x: '100%', opacity: 0 }}
//                                 transition={{ type: 'spring', stiffness: 260, damping: 30 }}
//                                 className="hidden md:block md:w-72 lg:w-80 xl:w-96 bg-surface-light dark:bg-surface-dark border-l border-gray-200 dark:border-gray-700 overflow-y-auto p-3 sm:p-4 shadow-lg flex-shrink-0 custom-scrollbar"
//                             >
//                                 <RightPanel />
//                             </motion.aside>
//                         )}
//                         </AnimatePresence>
//                     </div>
//                 </>
//             )}
//         </div>
//     );
// }

// export default App;

// import React, { useState, useEffect, useCallback } from 'react';
// import { useAuth } from './hooks/useAuth';
// import { useAppState } from './contexts/AppStateContext';
// import AuthModal from './components/auth/AuthModal';
// import TopNav from './components/layout/TopNav';
// import LeftPanel from './components/layout/LeftPanel';
// import CenterPanel from './components/layout/CenterPanel';
// import RightPanel from './components/layout/RightPanel';
// import api from './services/api';
// import toast from 'react-hot-toast';
// import { motion, AnimatePresence } from 'framer-motion';

// // Match this with AuthContext and AppStateContext for dev mode
// const DEV_MODE_BYPASS_AUTH = true; 

// function App() {
//     const { token, user, loading: authLoadingFromContext, logout, setUser: setAuthUser } = useAuth();
//     const { 
//         theme, 
//         isLeftPanelOpen, // Only need to read from context for rendering
//         isRightPanelOpen, // Only need to read from context for rendering
//         currentSessionId, setSessionId: setGlobalSessionId 
//     } = useAppState();
    
//     const [appInitializing, setAppInitializing] = useState(true);
//     const [showAuthModal, setShowAuthModal] = useState(false);
//     const [messages, setMessages] = useState([]);
//     const [chatStatus, setChatStatus] = useState('Ready. Send a message to start!');
//     const [orchestratorStatus, setOrchestratorStatus] = useState({ status: "loading", message: "Connecting..." });

//     // Initialize theme class on <html> and <body>
//     useEffect(() => {
//         const root = document.documentElement;
//         const body = document.body;
//         if (theme === 'dark') {
//             root.classList.add('dark');
//             body.classList.add('dark'); // Optional: if body needs explicit dark class
//             body.classList.remove('light');
//         } else {
//             root.classList.remove('dark');
//             body.classList.add('light'); // Optional
//             body.classList.remove('dark');
//         }
//     }, [theme]);

//     // Auth and Session Initialization Logic
//     useEffect(() => {
//         if (DEV_MODE_BYPASS_AUTH) {
//             console.log("DEV_MODE: App.jsx recognizing bypassed auth.");
//             if (!currentSessionId && user) { // Ensure session is set if user is dev-mode set
//                  setGlobalSessionId('dev-session-appjsx-123');
//             }
//             setAppInitializing(false);
//             setShowAuthModal(false);
//             return;
//         }

//         if (authLoadingFromContext) {
//             setAppInitializing(true);
//             return;
//         }

//         if (!token) {
//             setShowAuthModal(true);
//             setAppInitializing(false);
//         } else {
//             setShowAuthModal(false);
//             if (!currentSessionId) {
//                 api.startNewSession().then(data => {
//                     setGlobalSessionId(data.sessionId);
//                 }).catch(err => {
//                     toast.error("Session init failed. Try login.");
//                     console.error(err);
//                     // logout(); // Consider forcing logout if session init is critical
//                 });
//             }
//             setAppInitializing(false);
//         }
//     }, [token, user, authLoadingFromContext, currentSessionId, setGlobalSessionId, logout]);

//     // Fetch orchestrator status
//     useEffect(() => {
//         const fetchStatus = async () => {
//             const statusData = await api.getOrchestratorStatus();
//             setOrchestratorStatus(statusData);
//         };
//         fetchStatus();
//         const intervalId = setInterval(fetchStatus, 20000);
//         return () => clearInterval(intervalId);
//     }, []);

//     // Fetch chat history
//     const fetchChatHistory = useCallback(async (sid) => {
//         if (!sid || !token) {
//             setMessages([]);
//             setChatStatus(token ? "Start a new chat or select one." : "Please login.");
//             return;
//         }
//         setChatStatus("Loading history...");
//         try {
//             const historyData = await api.getChatHistory(sid);
//             const formattedMessages = (Array.isArray(historyData) ? historyData : []).map(msg => ({
//                 id: msg.id || msg._id || String(Math.random()),
//                 sender: msg.role === 'model' ? 'bot' : 'user',
//                 text: msg.parts && msg.parts.length > 0 ? msg.parts[0].text : (msg.text || ''),
//                 thinking: msg.thinking,
//                 references: msg.references || [],
//                 timestamp: msg.timestamp,
//                 source_pipeline: msg.source_pipeline
//             }));
//             setMessages(formattedMessages);
//             setChatStatus(formattedMessages.length > 0 ? "History loaded." : "New chat. Send a message!");
//         } catch (error) {
//             toast.error(`Failed to load chat history: ${error.message}`);
//             setChatStatus("Error loading history.");
//             console.error("Failed to load chat history:", error);
//         }
//     }, [token]); // Dependency on token

//     useEffect(() => {
//         if (currentSessionId && token) {
//             fetchChatHistory(currentSessionId);
//         } else if (!token) {
//             setMessages([]);
//             setChatStatus("Please login.");
//         }
//     }, [currentSessionId, token, fetchChatHistory]);

//     const handleAuthSuccess = (authData) => {
//         setShowAuthModal(false);
//         if (authData.sessionId) {
//             setGlobalSessionId(authData.sessionId);
//             fetchChatHistory(authData.sessionId); // Fetch history for newly assigned session
//         } else {
//             api.startNewSession().then(data => { // Fallback to start new session
//                 setGlobalSessionId(data.sessionId);
//                 fetchChatHistory(data.sessionId);
//             }).catch(err => toast.error("Failed to initialize session after login."));
//         }
//         if(authData.username && authData._id){ // Ensure user in AuthContext is updated
//             setAuthUser({username: authData.username, id: authData._id});
//         }
//     };
    
//     const handleLogoutAndShowModal = () => {
//         logout(); 
//         setGlobalSessionId(null);
//         localStorage.removeItem('aiTutorSessionId'); 
//         setMessages([]);
//         if (!DEV_MODE_BYPASS_AUTH) { // Only show modal if not in full bypass mode
//              setShowAuthModal(true); 
//         } else {
//             // In full bypass, logout might mean 'clear dev state and show modal anyway'
//             // Or, to truly "logout" from dev mode, user would change the DEV_MODE_BYPASS_AUTH flag and refresh.
//             // For a UI-testable "logout" in dev mode that shows the modal:
//             // setAuthUser(null); // This would make the `token && user` condition false
//             // setAuthToken(null); // This would make the `token && user` condition false
//             // setShowAuthModal(true); // This is now handled by the useEffect
//              console.log("DEV_MODE: Logged out. Set DEV_MODE_BYPASS_AUTH=false and refresh to see AuthModal, or handle dev logout differently.");
//         }
//         toast.success("Logged out successfully.");
//     };

//     const handleNewChat = async () => {
//         try {
//             const data = await api.startNewSession();
//             setGlobalSessionId(data.sessionId); // This will trigger useEffect to fetch history (empty)
//             setMessages([]); // Explicitly clear messages for immediate UI update
//             setChatStatus("New chat started. Send a message!");
//             toast.success("New chat started!");
//         } catch (error) {
//             toast.error("Failed to start new chat.");
//             console.error("Failed to start new chat:", error);
//         }
//     };

//     if (appInitializing && (!DEV_MODE_BYPASS_AUTH || authLoadingFromContext)) { 
//         return (
//             <div className="fixed inset-0 flex flex-col items-center justify-center bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
//                 <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary mb-4"></div>
//                 <p className="text-xl">Initializing AI Tutor...</p>
//             </div>
//         );
//     }

//     return (
//         <div className={`flex flex-col h-screen overflow-hidden font-sans ${theme}`}>
//             <AnimatePresence>
//                 {showAuthModal && !token && (
//                     <AuthModal isOpen={showAuthModal} onClose={handleAuthSuccess} />
//                 )}
//             </AnimatePresence>

//             {(token && user) && ( // Main application UI rendered if authenticated
//                 <>
//                     <TopNav
//                         user={user}
//                         onLogout={handleLogoutAndShowModal}
//                         onNewChat={handleNewChat}
//                         onHistoryClick={() => toast.info("History feature coming soon!")}
//                         orchestratorStatus={orchestratorStatus}
//                         // TopNav now uses useAppState for panel toggles, so no props needed here for that
//                     />
//                     <div className="flex flex-1 overflow-hidden pt-16 bg-background-light dark:bg-background-dark"> {/* pt-16 for fixed TopNav height */}
//                         <AnimatePresence>
//                         {isLeftPanelOpen && (
//                             <motion.aside 
//                                 key="left-panel"
//                                 initial={{ x: '-100%', opacity: 0 }}
//                                 animate={{ x: '0%', opacity: 1 }}
//                                 exit={{ x: '-100%', opacity: 0 }}
//                                 transition={{ type: 'spring', stiffness: 260, damping: 30, duration: 0.3 }}
//                                 className="w-full md:w-72 lg:w-80 xl:w-96 bg-surface-light dark:bg-surface-dark border-r border-gray-200 dark:border-gray-700 overflow-y-auto p-3 sm:p-4 shadow-lg flex-shrink-0 custom-scrollbar"
//                             >
//                                 <LeftPanel />
//                             </motion.aside>
//                         )}
//                         </AnimatePresence>

//                         <main className="flex-1 flex flex-col overflow-hidden p-1 sm:p-2 md:p-4">
//                            <CenterPanel 
//                                 messages={messages} 
//                                 setMessages={setMessages} 
//                                 currentSessionId={currentSessionId}
//                                 chatStatus={chatStatus}
//                                 setChatStatus={setChatStatus}
//                             />
//                         </main>

//                         <AnimatePresence>
//                         {isRightPanelOpen && (
//                             <motion.aside 
//                                 key="right-panel"
//                                 initial={{ x: '100%', opacity: 0 }}
//                                 animate={{ x: '0%', opacity: 1 }}
//                                 exit={{ x: '100%', opacity: 0 }}
//                                 transition={{ type: 'spring', stiffness: 260, damping: 30, duration: 0.3 }}
//                                 className="hidden md:block md:w-72 lg:w-80 xl:w-96 bg-surface-light dark:bg-surface-dark border-l border-gray-200 dark:border-gray-700 overflow-y-auto p-3 sm:p-4 shadow-lg flex-shrink-0 custom-scrollbar"
//                             >
//                                 <RightPanel />
//                             </motion.aside>
//                         )}
//                         </AnimatePresence>
//                     </div>
//                 </>
//             )}
//             {/* Fallback if not loading and not authenticated (and not in dev bypass mode) */}
//             { !appInitializing && !token && !DEV_MODE_BYPASS_AUTH && !showAuthModal && (
//                  <div className="fixed inset-0 flex flex-col items-center justify-center bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
//                      <p className="text-xl">Please <button onClick={()=> setShowAuthModal(true)} className="text-primary underline">log in</button> to continue.</p>
//                  </div>
//             )}
//         </div>
//     );
// }

// export default App;

// import React, { useState, useEffect, useCallback } from 'react';
// import { useAuth } from './hooks/useAuth';
// import { useAppState } from './contexts/AppStateContext';
// import AuthModal from './components/auth/AuthModal';
// import TopNav from './components/layout/TopNav';
// // ... other imports ...
// import toast from 'react-hot-toast';
// // ...

// // Set this to FALSE if you want to see the AuthModal first
// // const DEV_MODE_BYPASS_AUTH = false; // Or remove this App.jsx specific flag

// function App() {
//     // Get DEV_MODE_ALLOW_DEV_LOGIN from AuthContext if you want to use it for other dev features
//     const { token, user, loading: authLoading, logout, setUser: setAuthUser, DEV_MODE_ALLOW_DEV_LOGIN } = useAuth(); 
//     const { 
//         theme, 
//         isLeftPanelOpen, isRightPanelOpen, 
//         currentSessionId, setSessionId: setGlobalSessionId 
//     } = useAppState();
    
//     const [appInitializing, setAppInitializing] = useState(true); // Still useful for initial data fetches
//     const [showAuthModal, setShowAuthModal] = useState(false);
//     // ... other states ...

//     // Theme initialization (as before)
//     useEffect(() => { /* ... */ }, [theme]);

//     // Auth and Session Initialization Logic
//     useEffect(() => {
//         // This effect now primarily handles showing the auth modal if not authenticated,
//         // and initializing session if authenticated.
//         if (authLoading) { // If AuthContext is still figuring out token/user
//             setAppInitializing(true);
//             return;
//         }

//         if (!token) { // No token means user is not logged in
//             setShowAuthModal(true);
//             setAppInitializing(false);
//         } else { // Token exists, user is considered logged in
//             setShowAuthModal(false); // Ensure modal is closed
//             // If user is logged in but no session ID exists, try to start one
//             if (!currentSessionId) { 
//                 api.startNewSession().then(data => {
//                     setGlobalSessionId(data.sessionId);
//                 }).catch(err => {
//                     toast.error("Session init failed. Try login.");
//                     console.error(err);
//                 });
//             }
//             setAppInitializing(false);
//         }
//     }, [token, authLoading, currentSessionId, setGlobalSessionId]);

//     // ... (fetchOrchestratorStatus, fetchChatHistory as before) ...

//     const handleAuthSuccess = (authData) => {
//         // This function is called by AuthModal on successful login/signup/devLogin
//         setShowAuthModal(false);
//         // AuthContext should have already updated token and user.
//         // App.jsx just needs to handle the sessionId.
//         if (authData && authData.sessionId) {
//             setGlobalSessionId(authData.sessionId);
//             // fetchChatHistory will be triggered by useEffect watching currentSessionId & token
//         } else if (token) { // If authData didn't provide sessionId but we are now logged in
//              api.startNewSession().then(data => {
//                 setGlobalSessionId(data.sessionId);
//             }).catch(err => toast.error("Failed to init session."));
//         }
//          // Update user in AuthContext if authData provides more details than parseToken
//         if(authData && authData.username && authData._id && token){ // Ensure token is also set
//             setAuthUser({username: authData.username, id: authData._id});
//         }
//     };
    
//     const handleLogoutAndShowModal = () => {
//         logout(); 
//         setGlobalSessionId(null);
//         localStorage.removeItem('aiTutorSessionId'); 
//         setMessages([]);
//         setShowAuthModal(true); // Explicitly show modal after logout
//         toast.success("Logged out successfully.");
//     };

//     // ... (handleNewChat as before) ...

//     // Initial App Loader
//     if (appInitializing) { 
//         return ( /* ... loading spinner as before ... */ );
//     }

//     return (
//         <div className={`flex flex-col h-screen overflow-hidden font-sans ${theme}`}>
//             <AnimatePresence>
//                 {showAuthModal && !token && ( // Show modal if flag is true AND no token
//                     <AuthModal 
//                         isOpen={showAuthModal} 
//                         onClose={handleAuthSuccess} // Pass a callback to close modal & update state
//                     />
//                 )}
//             </AnimatePresence>

//             {(token && user) && ( // Main application UI
//                 <>
//                     {/* ... TopNav, Panels as before ... */}
//                 </>
//             )}
//             {/* Fallback if not loading, no token, and modal isn't showing (should be rare) */}
//             {!appInitializing && !token && !showAuthModal && (
//                  <div className="fixed inset-0 flex items-center justify-center">
//                      <p>Please <button onClick={()=> {
//                          setShowAuthModal(true);
//                          // Also ensure AppStateContext dev session is cleared if we are showing login
//                          if (DEV_MODE_ALLOW_DEV_LOGIN && currentSessionId && currentSessionId.startsWith('dev-session')) {
//                             setGlobalSessionId(null);
//                          }
//                         }} className="text-primary underline">log in</button> to continue.</p>
//                  </div>
//             )}
//         </div>
//     );
// }

// export default App;

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './hooks/useAuth';
import { useAppState } from './contexts/AppStateContext';
import AuthModal from './components/auth/AuthModal';
import TopNav from './components/layout/TopNav';
import LeftPanel from './components/layout/LeftPanel';
import CenterPanel from './components/layout/CenterPanel';
import RightPanel from './components/layout/RightPanel';
import api from './services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// Set this consistently across AuthContext, AppStateContext, and App.jsx for dev mode
const DEV_MODE_BYPASS_AUTH = true; 

function App() {
    const { 
        token, 
        user, 
        loading: authLoadingFromContext, 
        logout, 
        setUser: setAuthUser, 
        // setToken: setAuthToken // We usually let AuthContext manage token setting via login/logout
    } = useAuth();

    const { 
        theme, 
        isLeftPanelOpen, // AppStateContext manages this state
        isRightPanelOpen, // AppStateContext manages this state
        currentSessionId, 
        setSessionId: setGlobalSessionId 
    } = useAppState();
    
    // Local loading state for App component's own async operations or initial setup
    const [appInitializing, setAppInitializing] = useState(true);
    const [showAuthModal, setShowAuthModal] = useState(false); // Controls AuthModal visibility
    const [messages, setMessages] = useState([]);
    const [chatStatus, setChatStatus] = useState('Ready. Send a message to start!');
    const [orchestratorStatus, setOrchestratorStatus] = useState({ status: "loading", message: "Connecting..." });

    // Initialize theme class on <html> and <body>
    useEffect(() => {
        const rootHtmlElement = document.documentElement;
        const bodyElement = document.body; // If you need body-specific classes too
        if (theme === 'dark') {
            rootHtmlElement.classList.add('dark');
            // bodyElement.classList.add('dark-theme-body'); // Example
        } else {
            rootHtmlElement.classList.remove('dark');
            // bodyElement.classList.remove('dark-theme-body');
        }
        // For more complex body theming, you might set a data-theme attribute
        // bodyElement.setAttribute('data-theme', theme);
    }, [theme]);


    // Auth and Session Initialization Logic
    useEffect(() => {
        if (DEV_MODE_BYPASS_AUTH) {
            // In dev bypass mode, AuthContext and AppStateContext should already provide
            // devUser, devToken, and devSessionId.
            // App.jsx just needs to ensure it's not stuck in an initializing state.
            console.log("DEV_MODE (App.jsx): Bypassing auth, user/token should be set by AuthContext.");
            if (user && token && !currentSessionId) { // If dev user/token set, but no dev session
                 setGlobalSessionId('dev-session-appjsx-ensure-123'); // Ensure a session ID
            }
            setAppInitializing(false); // Bypass complete
            setShowAuthModal(false);   // Don't show auth modal
            return;
        }

        // Real auth flow (if DEV_MODE_BYPASS_AUTH is false)
        if (authLoadingFromContext) {
            setAppInitializing(true); // Still initializing if AuthContext is checking token
            return;
        }

        if (!token) { // No token means user is not logged in (AuthContext confirmed this)
            setShowAuthModal(true);   // Prompt for login/signup
            setAppInitializing(false);
        } else { // Token exists, user is considered logged in
            setShowAuthModal(false); // Ensure modal is closed
            if (!currentSessionId) { // Token exists, but no session ID found in AppStateContext
                api.startNewSession().then(data => {
                    setGlobalSessionId(data.sessionId);
                }).catch(err => {
                    toast.error("Session initialization failed. Please try logging in again.");
                    console.error("Session init error after token check:", err);
                    // Consider if logout is needed here if session is critical
                    // logout(); 
                });
            }
            setAppInitializing(false); // Done initializing for authenticated user
        }
    }, [token, user, authLoadingFromContext, currentSessionId, setGlobalSessionId, logout]);


    // Fetch orchestrator status (runs regardless of auth state for general app health)
    useEffect(() => {
        const fetchStatus = async () => {
            const statusData = await api.getOrchestratorStatus();
            setOrchestratorStatus(statusData);
        };
        fetchStatus();
        const intervalId = setInterval(fetchStatus, 20000); // Check every 20 seconds
        return () => clearInterval(intervalId);
    }, []);

    // Fetch chat history when session ID or token changes (and both are present)
    const fetchChatHistory = useCallback(async (sid) => {
        if (!sid || !token) { // Need both session and token
            setMessages([]);
            setChatStatus(token ? "Start or select a chat." : "Please login to see chat history.");
            return;
        }
        setChatStatus("Loading history...");
        try {
            const historyData = await api.getChatHistory(sid); // Token auto-included by API service
            const formattedMessages = (Array.isArray(historyData) ? historyData : []).map(msg => ({
                id: msg.id || msg._id || String(Math.random() + Date.now()), // Ensure unique key
                sender: msg.role === 'model' ? 'bot' : 'user',
                text: msg.parts && msg.parts.length > 0 ? msg.parts[0].text : (msg.text || ''),
                thinking: msg.thinking,
                references: msg.references || [],
                timestamp: msg.timestamp,
                source_pipeline: msg.source_pipeline
            }));
            setMessages(formattedMessages);
            setChatStatus(formattedMessages.length > 0 ? "History loaded." : "Chat is empty. Send a message!");
        } catch (error) {
            toast.error(`Failed to load chat history: ${error.message}`);
            setChatStatus("Error loading history.");
            console.error("Failed to load chat history:", error);
        }
    }, [token]); // Depends on token to make the API call

    useEffect(() => {
        // This effect runs when currentSessionId or token changes.
        // It calls fetchChatHistory if both are present.
        if (currentSessionId && token) {
            fetchChatHistory(currentSessionId);
        } else if (!token) { // If token becomes null (e.g., after logout)
            setMessages([]); // Clear messages
            setChatStatus("Please login.");
        }
        // If token exists but currentSessionId is null, the auth useEffect should handle starting a new session
    }, [currentSessionId, token, fetchChatHistory]);


    const handleAuthSuccess = (authData) => { // Called by AuthModal after successful login/signup/devLogin
        setShowAuthModal(false);
        // AuthContext's login/signup/devLogin methods should have set the token and user in AuthContext.
        // App.jsx uses the `user` and `token` from `useAuth()`.
        // The main task here is to ensure the session ID from authData is set globally.
        if (authData && authData.sessionId) {
            setGlobalSessionId(authData.sessionId);
            // fetchChatHistory will be triggered by the useEffect watching currentSessionId & token
        } else if (token) { 
            // Fallback: if authData didn't give a sessionId but we are now logged in (token exists)
            console.warn("Auth success but no sessionId in authData, starting new session.");
            api.startNewSession().then(data => {
                setGlobalSessionId(data.sessionId);
            }).catch(err => toast.error("Failed to initialize session."));
        }
        // If authData contains more complete user details than what parseToken in AuthContext provides:
        if(authData && authData.username && authData._id){
            setAuthUser({username: authData.username, id: authData._id}); // Update user in AuthContext
        }
    };
    
    const handleLogoutAndShowModal = () => {
        logout(); // Clears token and user in AuthContext
        setGlobalSessionId(null); // Clears session in AppStateContext
        localStorage.removeItem('aiTutorSessionId'); // Explicitly clear from localStorage
        setMessages([]);
        setChatStatus("Logged out. Please login.");
        if (!DEV_MODE_BYPASS_AUTH) { // Only force modal if not in full bypass
             setShowAuthModal(true); 
        } else {
            // To test the modal even in dev mode after a "dev logout", you could manually set showAuthModal.
            // However, the primary way to see AuthModal in dev mode is to set DEV_MODE_BYPASS_AUTH = false in relevant contexts.
            console.log("DEV_MODE: Logged out. To see AuthModal, set DEV_MODE_BYPASS_AUTH=false and refresh, or handle dev logout differently.");
            // For testing purposes, if you want a "dev logout" to always show the modal:
            // setShowAuthModal(true); 
        }
        toast.success("Logged out successfully.");
    };

    const handleNewChat = async () => {
        try {
            const data = await api.startNewSession();
            setGlobalSessionId(data.sessionId); // This will trigger useEffect to fetch history (which will be empty)
            setMessages([]); // Explicitly clear messages for immediate UI update
            setChatStatus("New chat started. Send a message!");
            toast.success("New chat started!");
        } catch (error) {
            toast.error("Failed to start new chat.");
            console.error("Failed to start new chat:", error);
        }
    };

    // Initial App Loader (Handles both AuthContext loading and DEV_MODE_BYPASS_AUTH logic)
    if (appInitializing) { 
        return (
            <div className="fixed inset-0 flex flex-col items-center justify-center bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary mb-4"></div>
                <p className="text-xl">Initializing AI Tutor...</p>
            </div>
        );
    }

    return (
        <div className={`flex flex-col h-screen overflow-hidden font-sans ${theme}`}> {/* Theme class applied here */}
            <AnimatePresence>
                {showAuthModal && !token && ( // Show AuthModal if needed and not authenticated
                    <AuthModal 
                        isOpen={showAuthModal} 
                        onClose={handleAuthSuccess} 
                    />
                )}
            </AnimatePresence>

            {/* Main application UI rendered if authenticated (token and user exist) */}
            {(token && user) && (
                <>
                    <TopNav
                        user={user} // User from AuthContext
                        onLogout={handleLogoutAndShowModal}
                        onNewChat={handleNewChat}
                        onHistoryClick={() => toast.info("History feature coming soon!")}
                        orchestratorStatus={orchestratorStatus}
                        // Panel toggles are handled by TopNav itself using AppStateContext
                    />
                    <div className="flex flex-1 overflow-hidden pt-16 bg-background-light dark:bg-background-dark"> {/* pt-16 for fixed TopNav */}
                        <AnimatePresence>
                        {isLeftPanelOpen && (
                            <motion.aside 
                                key="left-panel"
                                initial={{ x: '-100%', opacity: 0 }}
                                animate={{ x: '0%', opacity: 1 }}
                                exit={{ x: '-100%', opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 260, damping: 30, duration: 0.3 }}
                                className="w-full md:w-72 lg:w-80 xl:w-96 bg-surface-light dark:bg-surface-dark border-r border-gray-200 dark:border-gray-700 overflow-y-auto p-3 sm:p-4 shadow-lg flex-shrink-0 custom-scrollbar"
                            >
                                <LeftPanel />
                            </motion.aside>
                        )}
                        </AnimatePresence>

                        <main className="flex-1 flex flex-col overflow-hidden p-1 sm:p-2 md:p-4">
                           <CenterPanel 
                                messages={messages} 
                                setMessages={setMessages} 
                                currentSessionId={currentSessionId}
                                chatStatus={chatStatus}
                                setChatStatus={setChatStatus}
                            />
                        </main>

                        <AnimatePresence>
                        {isRightPanelOpen && (
                            <motion.aside 
                                key="right-panel"
                                initial={{ x: '100%', opacity: 0 }}
                                animate={{ x: '0%', opacity: 1 }}
                                exit={{ x: '100%', opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 260, damping: 30, duration: 0.3 }}
                                className="hidden md:block md:w-72 lg:w-80 xl:w-96 bg-surface-light dark:bg-surface-dark border-l border-gray-200 dark:border-gray-700 overflow-y-auto p-3 sm:p-4 shadow-lg flex-shrink-0 custom-scrollbar"
                            >
                                <RightPanel />
                            </motion.aside>
                        )}
                        </AnimatePresence>
                    </div>
                </>
            )}
            
            {/* Fallback UI if not initializing, not authenticated, and AuthModal isn't shown (should be rare) */}
            { !appInitializing && !token && !showAuthModal && (
                 <div className="fixed inset-0 flex flex-col items-center justify-center bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
                     <p className="text-xl">Please <button 
                        onClick={()=> { setShowAuthModal(true); }} 
                        className="text-primary hover:underline font-semibold"
                        >log in</button> to continue.</p>
                 </div>
            )}
        </div>
    );
}

export default App;
// import React, { useState } from 'react';
// import { useAuth } from '../../hooks/useAuth';
// import { useAppState } from '../../contexts/AppStateContext';
// import LLMSelection from './LLMSelection';
// import api from '../../services/api';
// import toast from 'react-hot-toast';
// import { LogIn, UserPlus, X } from 'lucide-react';

// function AuthModal({ isOpen, onClose }) {
//     const { login, signup } = useAuth();
//     const { selectedLLM, switchLLM: setGlobalLLM } = useAppState(); // Using context for global LLM
    
//     const [isLoginView, setIsLoginView] = useState(true);
//     const [username, setUsername] = useState('');
//     const [password, setPassword] = useState('');
//     const [localSelectedLLM, setLocalSelectedLLM] = useState(selectedLLM || 'ollama');
//     const [geminiApiKey, setGeminiApiKey] = useState(''); // For initial setup
    
//     const [error, setError] = useState('');
//     const [loading, setLoading] = useState(false);

//     const handleLlmChange = (llm) => {
//         setLocalSelectedLLM(llm);
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setError('');
//         setLoading(true);
//         toast.loading(isLoginView ? 'Logging in...' : 'Signing up...');

//         try {
//             let response;
//             if (isLoginView) {
//                 response = await login({ username, password });
//                 // After login, fetch user's preferred LLM from backend or use local default
//                 // For now, we assume login doesn't change the global LLM state directly here.
//                 // The TopNav LLM switcher will handle explicit changes.
//             } else { // Signup
//                 // For signup, we include LLM preference and potentially API key
//                 const signupData = {
//                     username,
//                     password,
//                     // Include LLM preference if your backend stores it on signup
//                     // llmProvider: localSelectedLLM, 
//                 };
//                 // The API key for Gemini should ideally be set via a separate user config endpoint AFTER login for security.
//                 // Only if backend handles it very securely on signup path.
//                 response = await signup(signupData);
//                 setGlobalLLM(localSelectedLLM); // Set global LLM on successful signup

//                 // If Gemini was selected and API key provided, try to update user config
//                 if (localSelectedLLM === 'gemini' && geminiApiKey.trim()) {
//                     // This assumes successful signup returns a token that's now set in api.js interceptor
//                     // You might need to wait for the token to be fully set in AuthContext
//                     try {
//                         await api.updateUserLLMConfig({ llmProvider: 'gemini', apiKey: geminiApiKey.trim() });
//                         toast.success('Gemini API key configured (if provided and valid).');
//                     } catch (configError) {
//                         toast.error(`Signed up, but failed to configure Gemini API key: ${configError.message}`);
//                     }
//                 }
//             }
//             toast.dismiss();
//             toast.success(isLoginView ? 'Logged in successfully!' : 'Signed up successfully!');
//             onClose(response); // Close modal and signal App.js to update state
//         } catch (err) {
//             toast.dismiss();
//             const errorMessage = err.response?.data?.message || err.message || `Failed to ${isLoginView ? 'login' : 'sign up'}`;
//             setError(errorMessage);
//             toast.error(errorMessage);
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (!isOpen) return null;

//     return (
//         <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fadeIn">
//             <div className="bg-surface-light dark:bg-surface-dark p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all">
//                 <div className="flex justify-between items-center mb-6">
//                     <h2 className="text-2xl font-bold text-text-light dark:text-text-dark">
//                         {isLoginView ? 'Welcome Back!' : 'Join Us'}
//                     </h2>
//                     <button onClick={onClose} className="text-text-muted-light dark:text-text-muted-dark hover:text-red-500 transition-colors">
//                         <X size={24} />
//                     </button>
//                 </div>

//                 {error && <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded-md text-sm">{error}</div>}

//                 <form onSubmit={handleSubmit} className="space-y-6">
//                     <div>
//                         <label htmlFor="username" className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">Username</label>
//                         <input
//                             type="text"
//                             id="username"
//                             className="input-custom"
//                             value={username}
//                             onChange={(e) => setUsername(e.target.value)}
//                             required
//                             disabled={loading}
//                         />
//                     </div>
//                     <div>
//                         <label htmlFor="password" className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">Password</label>
//                         <input
//                             type="password"
//                             id="password"
//                             className="input-custom"
//                             value={password}
//                             onChange={(e) => setPassword(e.target.value)}
//                             required
//                             minLength="6"
//                             disabled={loading}
//                         />
//                     </div>

//                     {!isLoginView && (
//                         <>
//                             <LLMSelection selectedLLM={localSelectedLLM} onLlmChange={handleLlmChange} />
//                             {localSelectedLLM === 'gemini' && (
//                                 <div>
//                                     <label htmlFor="geminiApiKey" className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">
//                                         Gemini API Key (Optional - for cloud features)
//                                     </label>
//                                     <input
//                                         type="password" // Keep it as password type for some obfuscation
//                                         id="geminiApiKey"
//                                         className="input-custom"
//                                         placeholder="Enter your Gemini API Key"
//                                         value={geminiApiKey}
//                                         onChange={(e) => setGeminiApiKey(e.target.value)}
//                                         disabled={loading}
//                                     />
//                                     <p className="text-xs text-text-muted-light dark:text-text-muted-dark mt-1">
//                                         Your API key will be stored securely by the backend.
//                                     </p>
//                                 </div>
//                             )}
//                         </>
//                     )}

//                     <button
//                         type="submit"
//                         className="w-full btn-primary-custom flex items-center justify-center gap-2"
//                         disabled={loading}
//                     >
//                         {loading ? (
//                             <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></span>
//                         ) : (
//                             isLoginView ? <LogIn size={20}/> : <UserPlus size={20}/>
//                         )}
//                         {isLoginView ? 'Login' : 'Sign Up'}
//                     </button>
//                 </form>

//                 <p className="mt-6 text-center text-sm">
//                     <button
//                         onClick={() => { setIsLoginView(!isLoginView); setError(''); }}
//                         className="font-medium text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary transition-colors"
//                         disabled={loading}
//                     >
//                         {isLoginView ? "Don't have an account? Sign Up" : "Already have an account? Login"}
//                     </button>
//                 </p>
//             </div>
//         </div>
//     );
// }
// export default AuthModal;
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useAppState } from '../../contexts/AppStateContext';
import LLMSelection from './LLMSelection';
import api from '../../services/api'; // For real signup/login
import toast from 'react-hot-toast';
import { LogIn, UserPlus, X, Terminal } from 'lucide-react'; // Added Terminal for dev

function AuthModal({ isOpen, onClose }) {
    const { login, signup, devLogin, DEV_MODE_ALLOW_DEV_LOGIN } = useAuth(); // Get devLogin and flag
    const { selectedLLM, switchLLM: setGlobalLLM } = useAppState();
    
    const [isLoginView, setIsLoginView] = useState(true);
    const [username, setUsername] = useState(DEV_MODE_ALLOW_DEV_LOGIN ? 'DevUser' : ''); // Pre-fill for dev
    const [password, setPassword] = useState(DEV_MODE_ALLOW_DEV_LOGIN ? 'devpass' : ''); // Pre-fill for dev
    const [localSelectedLLM, setLocalSelectedLLM] = useState(selectedLLM || 'ollama');
    const [geminiApiKey, setGeminiApiKey] = useState('');
    
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLlmChange = (llm) => setLocalSelectedLLM(llm);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const loadingToastId = toast.loading(isLoginView ? 'Logging in...' : 'Signing up...');

        try {
            let response;
            if (isLoginView) {
                response = await login({ username, password });
            } else {
                const signupData = { username, password /*, llmProvider: localSelectedLLM (if backend handles) */ };
                response = await signup(signupData);
                setGlobalLLM(localSelectedLLM);
                if (localSelectedLLM === 'gemini' && geminiApiKey.trim()) {
                    try {
                        await api.updateUserLLMConfig({ llmProvider: 'gemini', apiKey: geminiApiKey.trim() });
                        toast.success('Gemini API key configured.');
                    } catch (configError) {
                        toast.error(`Signed up, but failed to config Gemini key: ${configError.message}`);
                    }
                }
            }
            toast.dismiss(loadingToastId);
            toast.success(isLoginView ? 'Logged in successfully!' : 'Signed up successfully!');
            onClose(response); 
        } catch (err) {
            toast.dismiss(loadingToastId);
            const errorMessage = err.response?.data?.message || err.message || `Failed: ${isLoginView ? 'login' : 'signup'}`;
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleDevLogin = () => {
        if (devLogin) {
            const devData = devLogin(); // This sets token/user in AuthContext
            if (devData) {
                toast.success("Logged in as Dev User!");
                onClose(devData); // Pass devData which includes a mock sessionId
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-surface-light dark:bg-surface-dark p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md">
                {/* ... (Modal Header as before) ... */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-text-light dark:text-text-dark">
                        {isLoginView ? 'Welcome Back!' : 'Join Us'}
                    </h2>
                    <button onClick={() => onClose(null)} className="text-text-muted-light dark:text-text-muted-dark hover:text-red-500">
                        <X size={24} />
                    </button>
                </div>

                {error && <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded-md text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* ... (Username and Password inputs as before, possibly pre-filled if DEV_MODE_ALLOW_DEV_LOGIN) ... */}
                    <div>
                        <label /* ... */ >Username</label>
                        <input value={username} onChange={(e) => setUsername(e.target.value)} /* ... */ />
                    </div>
                    <div>
                        <label /* ... */ >Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /* ... */ />
                    </div>

                    {!isLoginView && ( /* LLM Selection and Gemini Key for Signup View */
                        <>
                            <LLMSelection selectedLLM={localSelectedLLM} onLlmChange={handleLlmChange} />
                            {/* ... (Gemini API Key input as before) ... */}
                        </>
                    )}

                    <button type="submit" /* ... */ >
                        {/* ... (Loading spinner or Icon + Text) ... */}
                        {isLoginView ? 'Login' : 'Sign Up'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm">
                    <button onClick={() => setIsLoginView(!isLoginView)} /* ... */ >
                        {isLoginView ? "Don't have an account? Sign Up" : "Already have an account? Login"}
                    </button>
                </p>

                {/* Dev Login Button */}
                {DEV_MODE_ALLOW_DEV_LOGIN && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={handleDevLogin}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-700 hover:bg-yellow-200 dark:hover:bg-yellow-600 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        >
                            <Terminal size={18} /> Dev Quick Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
export default AuthModal;
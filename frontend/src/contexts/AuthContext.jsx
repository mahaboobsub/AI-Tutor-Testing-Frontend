// import React, { createContext, useState, useEffect, useCallback } from 'react';
// import api from '../services/api';
// import { jwtDecode } from 'jwt-decode'; // npm install jwt-decode

// export const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//     const [token, setToken] = useState(localStorage.getItem('authToken'));
//     const [user, setUser] = useState(null); // { id, username, llmProvider, apiKey }
//     const [loading, setLoading] = useState(true); // Initial auth check

//     const parseToken = useCallback((tok) => {
//         if (!tok) return null;
//         try {
//             const decoded = jwtDecode(tok); // Ensure your JWT has these fields
//             return { id: decoded.id, username: decoded.username }; // Add other fields if present
//         } catch (e) {
//             console.error("Failed to decode token:", e);
//             localStorage.removeItem('authToken');
//             return null;
//         }
//     }, []);

//     useEffect(() => {
//         const storedToken = localStorage.getItem('authToken');
//         if (storedToken) {
//             const decodedUser = parseToken(storedToken);
//             if (decodedUser) {
//                 setUser(decodedUser);
//                 setToken(storedToken);
//                 api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`; // For axios global config
//             } else {
//                 // Invalid token found
//                 localStorage.removeItem('authToken');
//             }
//         }
//         setLoading(false);
//     }, [parseToken]);

//     const login = async (credentials) => {
//         try {
//             const data = await api.login(credentials); // API should return { token, userDetails, sessionId }
//             localStorage.setItem('authToken', data.token);
//             const decodedUser = parseToken(data.token);
//             setUser(decodedUser);
//             setToken(data.token);
//             api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
//             return data; // Pass along sessionId, etc.
//         } catch (error) {
//             console.error("Login failed:", error);
//             throw error;
//         }
//     };
    
//     const signup = async (signupData) => { // signupData includes username, password, llmProvider, apiKey (optional)
//         try {
//             // The actual API key storage should be handled securely by the backend.
//             // Frontend might only send it during initial signup or LLM config update.
//             // The backend then encrypts and stores it, never sending it back.
//             const data = await api.signup(signupData); // API handles user creation
//              // After signup, typically auto-login or prompt to login
//             // For now, let's assume signup returns token like login for immediate use
//             if(data.token) {
//                 localStorage.setItem('authToken', data.token);
//                 const decodedUser = parseToken(data.token);
//                 setUser(decodedUser);
//                 setToken(data.token);
//                 api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
//             }
//             return data;
//         } catch (error) {
//             console.error("Signup failed:", error);
//             throw error;
//         }
//     };

//     const logout = () => {
//         localStorage.removeItem('authToken');
//         setUser(null);
//         setToken(null);
//         delete api.defaults.headers.common['Authorization'];
//     };

//     return (
//         <AuthContext.Provider value={{ token, user, loading, login, signup, logout, setUser, setToken }}>
//             {children}
//         </AuthContext.Provider>
//     );
// };

// import React, { createContext, useState, useEffect, useCallback } from 'react';
// // import api from '../services/api'; // We'll mock API calls for now
// // import { jwtDecode } from 'jwt-decode';

// export const AuthContext = createContext(null);

// const DEV_MODE_BYPASS_AUTH = true; // <--- SET THIS TO true FOR BYPASS

// export const AuthProvider = ({ children }) => {
//     const [token, setToken] = useState(DEV_MODE_BYPASS_AUTH ? 'fake-dev-token' : localStorage.getItem('authToken'));
//     const [user, setUser] = useState(
//         DEV_MODE_BYPASS_AUTH 
//         ? { id: 'devUser123', username: 'DevUser' } 
//         : null
//     );
//     const [loading, setLoading] = useState(false); // Set to false if bypassing initial auth check

//     // Original parseToken and useEffect for real auth can be kept but won't run if DEV_MODE_BYPASS_AUTH is true
//     const parseToken = useCallback((tok) => { /* ... original code ... */ }, []);
//     useEffect(() => {
//         if (DEV_MODE_BYPASS_AUTH) {
//             setLoading(false); // Already set user and token
//             return;
//         }
//         // ... original useEffect logic for real auth ...
//         setLoading(false); // Ensure loading is set to false after check
//     }, [parseToken]);


//     const login = async (credentials) => {
//         if (DEV_MODE_BYPASS_AUTH) {
//             console.log("DEV_MODE: Bypassing real login.", credentials);
//             const fakeUserData = { id: 'devUser123', username: credentials.username || 'DevUser' };
//             setUser(fakeUserData);
//             setToken('fake-dev-token');
//             return { token: 'fake-dev-token', userDetails: fakeUserData, sessionId: 'dev-session-123' };
//         }
//         // ... original login logic using api.login ...
//     };
    
//     const signup = async (signupData) => {
//          if (DEV_MODE_BYPASS_AUTH) {
//             console.log("DEV_MODE: Bypassing real signup.", signupData);
//             const fakeUserData = { id: 'devUserSignup123', username: signupData.username || 'NewDevUser' };
//             setUser(fakeUserData);
//             setToken('fake-dev-signup-token');
//             // In dev mode, simulate setting the LLM from signup
//             // This would normally be handled by AppStateContext or through API
//             // const { switchLLM } = useAppState(); // Can't use hook here
//             // if (signupData.llmProvider) { /* update global state somehow or ignore for now */ }
//             return { token: 'fake-dev-signup-token', userDetails: fakeUserData, sessionId: 'dev-session-signup-123' };
//         }
//         // ... original signup logic using api.signup ...
//     };

//     const logout = () => {
//         if (DEV_MODE_BYPASS_AUTH) {
//             // To test the logout flow even in dev mode, you might want to clear the fake state
//             // For now, let's keep it simple: to "logout" in dev, you'd set DEV_MODE_BYPASS_AUTH to false and refresh
//             // or implement a dev-mode specific logout:
//             // setUser(null);
//             // setToken(null);
//             // console.log("DEV_MODE: Simulated logout. Refresh or set DEV_MODE_BYPASS_AUTH=false to see AuthModal.");
//             // Or, for a more realistic test of the logout flow:
//             localStorage.removeItem('authToken'); // Still good to remove if it was set
//             setUser(null);
//             setToken(null);
//             // No API call for logout in this simplified bypass
//             return;
//         }
//         // ... original logout logic ...
//     };

//     return (
//         <AuthContext.Provider value={{ token, user, loading, login, signup, logout, setUser, setToken }}>
//             {children}
//         </AuthContext.Provider>
//     );
// };


import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api'; // We'll still use the mock or real API
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext(null);

export const DEV_MODE_ALLOW_DEV_LOGIN = true; // New flag: Allows a special "Dev Login" button
// const DEV_MODE_BYPASS_AUTH = false; // We are no longer fully bypassing, so this might be false or removed

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('authToken'));
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const parseToken = useCallback((tok) => {
        if (!tok) return null;
        try {
            const decoded = jwtDecode(tok);
            return { id: decoded.id, username: decoded.username };
        } catch (e) {
            console.error("Failed to decode token:", e);
            localStorage.removeItem('authToken');
            return null;
        }
    }, []);

    useEffect(() => {
        const storedToken = localStorage.getItem('authToken');
        if (storedToken) {
            const decodedUser = parseToken(storedToken);
            if (decodedUser) {
                setUser(decodedUser);
                setToken(storedToken);
                // If using axios global config for token:
                // apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            }
        }
        setLoading(false);
    }, [parseToken]);

    const login = async (credentials) => {
        // Real login logic (or mock if api.js is in mock mode)
        try {
            const data = await api.login(credentials); 
            localStorage.setItem('authToken', data.token);
            const decodedUser = parseToken(data.token);
            setUser(decodedUser);
            setToken(data.token);
            // if (apiClient) apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
            return data; 
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    };
    
    const signup = async (signupData) => {
        // Real signup logic (or mock)
        try {
            const data = await api.signup(signupData);
            if(data.token) { // Assuming signup also returns a token for auto-login
                localStorage.setItem('authToken', data.token);
                const decodedUser = parseToken(data.token);
                setUser(decodedUser);
                setToken(data.token);
                // if (apiClient) apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
            }
            return data;
        } catch (error) {
            console.error("Signup failed:", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        setUser(null);
        setToken(null);
        // if (apiClient) delete apiClient.defaults.headers.common['Authorization'];
        // Also clear session from AppStateContext if needed, usually done in App.jsx's logout handler
    };

    // Special function for Dev Login button
    const devLogin = () => {
        if (DEV_MODE_ALLOW_DEV_LOGIN) {
            const devToken = 'fake-dev-token-for-button';
            const devUser = { id: 'devUserFromButton', username: 'DevButtonUser' };
            localStorage.setItem('authToken', devToken);
            setUser(devUser);
            setToken(devToken);
            // if (apiClient) apiClient.defaults.headers.common['Authorization'] = `Bearer ${devToken}`;
            console.log("DEV_MODE: Logged in as DevButtonUser");
            return { token: devToken, username: devUser.username, _id: devUser.id, sessionId: 'dev-session-from-button' };
        }
        return null;
    };


    return (
        <AuthContext.Provider value={{ token, user, loading, login, signup, logout, devLogin, setUser, setToken, DEV_MODE_ALLOW_DEV_LOGIN }}>
            {children}
        </AuthContext.Provider>
    );
};
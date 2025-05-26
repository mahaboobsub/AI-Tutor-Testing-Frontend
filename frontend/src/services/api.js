// import axios from 'axios';

// // Configure Axios instance
// const apiClient = axios.create({
//     baseURL: import.meta.env.VITE_API_BASE_URL || process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api',
//     headers: {
//         'Content-Type': 'application/json',
//     }
// });

// // Add a request interceptor to include the token
// apiClient.interceptors.request.use(config => {
//     const token = localStorage.getItem('authToken');
//     if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
// }, error => {
//     return Promise.reject(error);
// });


// const api = {
//     // --- Auth ---
//     login: async (credentials) => { // {username, password}
//         const response = await apiClient.post('/auth/signin', credentials);
//         return response.data; // Expects { token, username, _id, sessionId }
//     },
//     signup: async (userData) => { // {username, password, llmProvider (optional), apiKey (optional, if handled by backend securely) }
//         // The backend should ideally handle API key storage securely and not just echo it.
//         // llmProvider and apiKey might be part of user preferences updated later.
//         const response = await apiClient.post('/auth/signup', userData);
//         return response.data; // Expects { token, username, _id, sessionId }
//     },
//     // Maybe a /auth/me endpoint to verify token and get user details
//     // verifyToken: async () => {
//     //     const response = await apiClient.get('/auth/me');
//     //     return response.data;
//     // },


//     // --- Chat ---
//     sendMessage: async (payload) => { // { query, history, sessionId, useRag (boolean) }
//         const response = await apiClient.post('/chat/message', payload);
//         return response.data; // Expects { reply: {role, parts, thinking, references, timestamp}, sessionId, source_pipeline }
//     },
//     getChatHistory: async (sessionId) => {
//         const response = await apiClient.get(`/chat/history/${sessionId}`);
//         return response.data; // Expects array of messages
//     },
//     getChatSessions: async () => {
//         const response = await apiClient.get('/chat/sessions');
//         return response.data; // Expects array of { sessionId, updatedAt, messageCount, preview }
//     },
//     startNewSession: async () => {
//         const response = await apiClient.post('/chat/new_session', {});
//         return response.data; // Expects { sessionId }
//     },

//     // --- Files ---
//     uploadFile: async (formData, onUploadProgress) => {
//         const response = await apiClient.post('/upload', formData, {
//             headers: { 'Content-Type': 'multipart/form-data' },
//             onUploadProgress: onUploadProgress
//         });
//         return response.data; // Expects { message, filename, originalname }
//     },
//     getFiles: async () => {
//         const response = await apiClient.get('/files');
//         return response.data; // Expects array of file objects
//     },
//     renameFile: async (serverFilename, newOriginalName) => {
//         const response = await apiClient.patch(`/files/${serverFilename}`, { newOriginalName });
//         return response.data;
//     },
//     deleteFile: async (serverFilename) => {
//         const response = await apiClient.delete(`/files/${serverFilename}`);
//         return response.data;
//     },

//     // --- Analysis ---
//     requestAnalysis: async (payload) => { // { filename, analysis_type, (optional) file_path if needed by backend}
//         const response = await apiClient.post('/analysis/document', payload);
//         return response.data; // Expects { content, thinking }
//     },

//     // --- Syllabus (if still used) ---
//     getSyllabus: async (subjectId) => {
//         const response = await apiClient.get(`/syllabus/${subjectId}`);
//         return response.data;
//     },
    
//     // --- User Preferences / LLM Config ---
//     // These are NEW endpoints your backend friend would need to implement
//     updateUserLLMConfig: async (configData) => { // { llmProvider, apiKey (if applicable for Gemini) }
//         // Backend should encrypt and store API keys securely.
//         // This endpoint would update the user's preference for LLM and their Gemini key.
//         // The Ollama URL is usually configured server-side for the Local RAG service.
//         const response = await apiClient.post('/user/config/llm', configData);
//         return response.data;
//     },
//     getUserLLMConfig: async () => {
//         // Returns user's current LLM preference, perhaps not the actual key.
//         const response = await apiClient.get('/user/config/llm');
//         return response.data; // Expects { llmProvider: 'ollama' | 'gemini' }
//     },


//     // --- Status ---
//     getOrchestratorStatus: async () => {
//         try {
//             // Base URL for apiClient is already /api, so go up one level for general health
//             const healthUrl = (import.meta.env.VITE_API_BASE_URL || process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api').replace('/api', '');
//             const response = await axios.get(`${healthUrl}/api/health`);
//             return response.data;
//         } catch (error) {
//             console.warn("Failed to fetch orchestrator status:", error);
//             return { status: "error", message: "Orchestrator unreachable" };
//         }
//     },
// };

// export default api;
// // Also export the apiClient instance if you need to use it directly sometimes
// export { apiClient };
import axios from 'axios';

const DEV_MODE_MOCK_API = true; // Set this to true or false as needed

// --- Define apiClient at the top level ---
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api',
    headers: {
        'Content-Type': 'application/json',
    }
});

// Add a request interceptor to include the token (if not in dev mode or if real calls are made in dev mode)
if (!DEV_MODE_MOCK_API) { // Or adjust this logic if some dev calls are real
    apiClient.interceptors.request.use(config => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    }, error => {
        return Promise.reject(error);
    });
}
// If you want the interceptor to always run, even for potential real calls during dev mode, move it outside the if.
// For purely mocked API, the interceptor might not be strictly necessary.
// However, it's good practice to have it for when DEV_MODE_MOCK_API is false.
// Let's make it always active for consistency when switching modes:
apiClient.interceptors.request.use(config => {
    if (DEV_MODE_MOCK_API && config.url.startsWith(apiClient.defaults.baseURL)) {
        // If mocking and it's a call to our base URL, we might not need the token.
        // However, if some mock functions call the real apiClient, token might be needed.
        // For simplicity with full mocking, let's assume token isn't added for mock calls.
        // BUT, if you have a mix, you'd need more nuanced logic.
        // Given our setup, the mock functions DON'T use apiClient directly.
        // So this interceptor will only apply when DEV_MODE_MOCK_API is false.
    }
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});


const mockDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

const api = {
    login: async (credentials) => {
        if (DEV_MODE_MOCK_API) {
            await mockDelay();
            console.log("MOCK API: login", credentials);
            if (credentials.username === "test" && credentials.password === "password") { // Example mock credentials
                return { token: 'mock-token-xyz', username: 'TestUser', _id: 'testuser123', sessionId: 'mock-session-123' };
            } else if (credentials.username === "DevUser" && credentials.password === "devpass") { // For the AuthContext bypass
                 return { token: 'fake-dev-token', username: 'DevUser', _id: 'devUser123', sessionId: 'dev-session-123' };
            }
            // Simulate a failure for other credentials if needed for testing UI
            throw new Error("Invalid mock credentials");
        }
        // Real API call
        const response = await apiClient.post('/auth/signin', credentials);
        return response.data;
    },
    signup: async (userData) => {
        if (DEV_MODE_MOCK_API) {
            await mockDelay();
            console.log("MOCK API: signup", userData);
            return { token: 'mock-signup-token-xyz', username: userData.username, _id: `newmock-${Date.now()}`, sessionId: `mock-session-signup-${Date.now()}` };
        }
        // Real API call
        const response = await apiClient.post('/auth/signup', userData);
        return response.data;
    },
    
    sendMessage: async (payload) => {
        if (DEV_MODE_MOCK_API) {
            await mockDelay(payload.useRag ? 2000 : 1000); // Slower for RAG
            console.log("MOCK API: sendMessage", payload);
            const botText = payload.useRag 
                ? `This is a MOCKED RAG response to: "${payload.query}". \n\nIt uses your documents (not really). Source [1] is very relevant. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris.`
                : `This is a MOCKED direct LLM response to: "${payload.query}". \n\nSed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.`;
            const thinkingText = payload.useRag 
                ? "<thinking>\n1. User query analyzed: seeking information via RAG.\n2. (Mock) Searched user documents for keywords: '" + payload.query.split(" ")[0] + "'.\n3. (Mock) Found 1 relevant chunk in 'mock_document.pdf'.\n4. (Mock) Synthesizing answer based on this chunk and general knowledge.\n</thinking>" 
                : null;
            const references = payload.useRag 
                ? [{ number: 1, source: "mock_document.pdf", content_preview: "This is a preview of the mock document containing key information related to the query..."}] 
                : [];
            
            return { 
                reply: {
                    role: 'model', 
                    parts: [{text: botText }], 
                    thinking: thinkingText, 
                    references: references,
                    timestamp: new Date().toISOString()
                }, 
                sessionId: payload.sessionId, 
                source_pipeline: payload.useRag ? 'mock_ollama_rag' : 'mock_gemini_direct'
            };
        }
        // Real API call
        const response = await apiClient.post('/chat/message', payload);
        return response.data;
    },
    getChatHistory: async (sessionId) => {
        if (DEV_MODE_MOCK_API) {
            await mockDelay(300);
            console.log("MOCK API: getChatHistory for session", sessionId);
            if (sessionId === 'dev-session-123' || sessionId === 'mock-session-123' || sessionId === 'dev-session-appjsx-123') {
                 return [
                    { _id: 'hist1', role: 'user', parts: [{text: "Hello AI! How does mocking work?"}], timestamp: new Date(Date.now() - 120000).toISOString() },
                    { _id: 'hist2', role: 'model', parts: [{text: "Hello User! Mocking involves simulating backend responses so you can test the frontend independently. This is a mocked history message."}], thinking: null, references: [], timestamp: new Date(Date.now() - 100000).toISOString(), source_pipeline: 'mock_gemini_direct' },
                    { _id: 'hist3', role: 'user', parts: [{text: "Tell me about RAG."}], timestamp: new Date(Date.now() - 60000).toISOString() },
                    { _id: 'hist4', role: 'model', parts: [{text: "RAG stands for Retrieval Augmented Generation. It enhances LLM responses by first retrieving relevant information from a knowledge base. This is a mocked explanation from RAG."}], thinking: "<thinking>User asked about RAG. This is a core concept. I will explain it briefly.</thinking>", references: [{number: 1, source: "RAG_explanation_doc.pdf", content_preview:"RAG combines retrieval with generation..."}], timestamp: new Date(Date.now() - 50000).toISOString(), source_pipeline: 'mock_ollama_rag' },
                ];
            }
            return [];
        }
        // Real API call
        const response = await apiClient.get(`/chat/history/${sessionId}`);
        return response.data;
    },
    getChatSessions: async () => {
        if (DEV_MODE_MOCK_API) {
            await mockDelay(400);
            console.log("MOCK API: getChatSessions");
            return [
                { sessionId: 'mock-session-123', updatedAt: new Date().toISOString(), messageCount: 4, preview: "RAG stands for Retrieval Augmented..." },
                { sessionId: 'another-mock-session', updatedAt: new Date(Date.now() - 7200000).toISOString(), messageCount: 10, preview: "Discussing advanced mock topics in detail..." }
            ];
        }
        // Real API call
        const response = await apiClient.get('/chat/sessions');
        return response.data;
    },
    startNewSession: async () => {
        if (DEV_MODE_MOCK_API) {
            await mockDelay(100);
            const newMockSessionId = `mock-session-${Date.now()}`;
            console.log("MOCK API: startNewSession, created:", newMockSessionId);
            return { sessionId: newMockSessionId };
        }
        // Real API call
        const response = await apiClient.post('/chat/new_session', {});
        return response.data;
    },

    // Mock File Operations
    uploadFile: async (formData, onUploadProgress) => {
        if (DEV_MODE_MOCK_API) {
            const mockFileName = formData.get('file')?.name || 'mock_uploaded_file.pdf';
            console.log("MOCK API: uploadFile", mockFileName);
            if (onUploadProgress) { /* ... simulate progress ... */ }
            await mockDelay(1200);
            return { message: `${mockFileName} uploaded (mocked)!`, filename: `server-${mockFileName}`, originalname: mockFileName };
        }
        // Real API call
        const response = await apiClient.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: onUploadProgress
        });
        return response.data;
    },
    getFiles: async () => {
        if (DEV_MODE_MOCK_API) {
            await mockDelay(200);
            console.log("MOCK API: getFiles");
            return [
                { serverFilename: 'mock-server-doc1.pdf', originalName: 'My Research Paper.pdf', type: 'application/pdf', size: 123456, lastModified: new Date().toISOString() },
                { serverFilename: 'mock-server-code1.py', originalName: 'script.py', type: 'text/x-python', size: 7890, lastModified: new Date().toISOString() },
                { serverFilename: 'mock-manual.txt', originalName: 'User Manual.txt', type: 'text/plain', size: 30250, lastModified: new Date(Date.now()- 86400000).toISOString() },

            ];
        }
        // Real API call
        const response = await apiClient.get('/files');
        return response.data;
    },
    renameFile: async (serverFilename, newOriginalName) => {
         if (DEV_MODE_MOCK_API) {
            await mockDelay(300);
            console.log("MOCK API: renameFile", serverFilename, "to", newOriginalName);
            // Find and update in mock data if you want the list to reflect it immediately
            return { message: "File renamed (mocked)" };
        }
        // Real API call
        const response = await apiClient.patch(`/files/${serverFilename}`, { newOriginalName });
        return response.data;
    },
    deleteFile: async (serverFilename) => {
         if (DEV_MODE_MOCK_API) {
            await mockDelay(300);
            console.log("MOCK API: deleteFile", serverFilename);
            // Remove from mock data if needed for UI consistency
            return { message: "File deleted (mocked)" };
        }
        // Real API call
        const response = await apiClient.delete(`/files/${serverFilename}`);
        return response.data;
    },

    // Mock Analysis
    requestAnalysis: async (payload) => {
        if (DEV_MODE_MOCK_API) {
            await mockDelay(payload.analysis_type === 'mindmap' ? 3000 : 1500);
            console.log("MOCK API: requestAnalysis", payload);
            let content = `## Mocked ${payload.analysis_type.toUpperCase()} for: *${payload.filename}*\n\n`;
            if (payload.analysis_type === 'faq') {
                content += "**Q1: What is this document about (mocked)?**\nA1: This document (mockingly) covers key concepts related to your query.\n\n**Q2: How is this FAQ generated (mocked)?**\nA2: It's simulated for UI testing purposes, based on the selected document name and analysis type.";
            } else if (payload.analysis_type === 'topics') {
                content += "- **Mock Topic 1:** Core ideas from the document (simulated).\n- **Mock Topic 2:** Frontend and UI development strategies.\n- **Mock Topic 3:** Backend API simulation techniques.";
            } else if (payload.analysis_type === 'mindmap') {
                content = `# Mocked Mindmap: ${payload.filename}\n## Main Idea 1\n### Sub-Idea 1.1\n### Sub-Idea 1.2\n#### Detail 1.2.1\n## Main Idea 2\n### Sub-Idea 2.1`;
            }
            return { content: content, thinking: "Mocked thinking process:\n1. Received analysis request for '" + payload.filename + "' (type: "+payload.analysis_type+").\n2. (Mock) Loaded document content.\n3. (Mock) Applied specific LLM prompt for "+payload.analysis_type+".\n4. Generated the mock output displayed." };
        }
        // Real API call
        const response = await apiClient.post('/analysis/document', payload);
        return response.data;
    },
    
    updateUserLLMConfig: async (configData) => {
        if (DEV_MODE_MOCK_API) {
            await mockDelay(); console.log("MOCK API: updateUserLLMConfig", configData);
            localStorage.setItem('mockSelectedLLM', configData.llmProvider);
            if(configData.llmProvider === 'gemini' && configData.apiKey){ localStorage.setItem('mockGeminiApiKeyStatus', 'KeyProvided(Mock)'); }
            return { message: `LLM preference updated to ${configData.llmProvider} (mocked).` };
        }
        const response = await apiClient.post('/user/config/llm', configData);
        return response.data;
    },
    getUserLLMConfig: async () => {
         if (DEV_MODE_MOCK_API) {
            await mockDelay();
            const mockLLM = localStorage.getItem('mockSelectedLLM') || 'ollama';
            console.log("MOCK API: getUserLLMConfig, returning:", mockLLM);
            return { llmProvider: mockLLM };
        }
        const response = await apiClient.get('/user/config/llm');
        return response.data;
    },

    getOrchestratorStatus: async () => {
        if (DEV_MODE_MOCK_API) {
            await mockDelay(100);
            return { status: "ok", message: "Orchestrator (Mocked & Online)", database_status: "Connected" };
        }
        try {
            const healthUrl = (import.meta.env.VITE_API_BASE_URL || process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api').replace('/api', '');
            const response = await axios.get(`${healthUrl}/api/health`); // Use axios directly for non-apiClient base URL
            return response.data;
        } catch (error) {
            console.warn("Failed to fetch orchestrator status:", error);
            return { status: "error", message: "Orchestrator unreachable" };
        }
    },
    // Add syllabus if needed
    getSyllabus: async (subjectId) => {
        if(DEV_MODE_MOCK_API) {
            await mockDelay();
            console.log("MOCK API: getSyllabus", subjectId);
            return `# Mock Syllabus for ${subjectId}\n\n- Topic 1\n- Topic 2`;
        }
        const response = await apiClient.get(`/syllabus/${subjectId}`);
        return response.data;
    }
};

export default api;
export { apiClient }; // Export apiClient itself if needed for direct use (e.g. file uploads with custom config)
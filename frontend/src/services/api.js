// // frontend/src/services/api.js (Version 1 - UI Testing with Full Mocks)
// import axios from 'axios'; // Keep for V2 structure, not used by V1 mocks directly

// const DEV_MODE_MOCK_API = true; 

// const mockDelay = (ms = 200) => new Promise(resolve => setTimeout(resolve, ms));

// // --- MOCK DATA STORE - Ensure these are defined AT THE TOP LEVEL of this module ---
// const MOCK_USER_DATA_STORE = { 
//     'devUser001': { username: 'DevUI-User', _id: 'devUser001' }
// };

// let MOCK_SESSIONS_STORE = { // Renamed to avoid conflict if you copy-pasted with _API suffix
//     'session-mock-1': { sessionId: 'session-mock-1', updatedAt: new Date(Date.now() - 3600000).toISOString(), messageCount: 4, preview: "Thermodynamics basics and applications..." },
//     'session-mock-2': { sessionId: 'session-mock-2', updatedAt: new Date(Date.now() - 7200000).toISOString(), messageCount: 6, preview: "Exploring quantum entanglement simply..." },
//     'dev-initial-session-appstate': { sessionId: 'dev-initial-session-appstate', updatedAt: new Date().toISOString(), messageCount: 2, preview: "Initial development session for UI testing..." }
// };

// let MOCK_CHAT_HISTORY_STORE = { // Renamed
//     'session-mock-1': [
//         { id: 's1msg1', _id: 's1msg1', role: 'user', parts: [{text: "Hello AI tutor! Can you explain the first law of thermodynamics?"}], timestamp: new Date(Date.now() - 3550000).toISOString() },
//         { id: 's1msg2', _id: 's1msg2', role: 'model', parts: [{text: "Certainly! The first law of thermodynamics, also known as the law of conservation of energy, states that energy cannot be created or destroyed in an isolated system. It can only be transformed from one form to another. \n\nFor example, in a heat engine, chemical energy in fuel is converted into thermal energy, which is then converted into mechanical work."}], thinking: "<thinking>User asked for 1st law. Provided definition and an example.</thinking>", references: [], timestamp: new Date(Date.now() - 3540000).toISOString(), source_pipeline: 'mock_ollama_direct'},
//         { id: 's1msg3', _id: 's1msg3', role: 'user', parts: [{text: "What about its applications in aerospace engineering?"}], timestamp: new Date(Date.now() - 3500000).toISOString() },
//         { id: 's1msg4', _id: 's1msg4', role: 'model', parts: [{text: "Great question! In aerospace, it's fundamental for designing jet engines and rocket propulsion systems (analyzing thrust from energy conversion), understanding aerodynamic heating on re-entry vehicles, and managing thermal control systems for satellites and spacecraft to maintain operational temperatures in the vacuum of space. For instance, the energy balance for a jet engine directly applies this law [1]."}], thinking: "<thinking>User asked for aerospace applications. Linked to engine design and thermal management. Added a mock reference.</thinking>", references: [{number: 1, source: "Aerospace_Thermo_Principles_Vol1.pdf", content_preview:"The first law is applied to calculate the energy changes as air and fuel pass through a jet engine, determining available thrust..."}], timestamp: new Date(Date.now() - 3400000).toISOString(), source_pipeline: 'mock_ollama_rag'},
//     ],
//     'dev-initial-session-appstate': [
//         { id: 'devmsg1', _id: 'devmsg1', role: 'user', parts: [{text: "Hi there, this is the initial dev session for UI testing!"}], timestamp: new Date(Date.now() - 60000).toISOString() },
//         { id: 'devmsg2', _id: 'devmsg2', role: 'model', parts: [{text: "Hello Dev User! Welcome to the UI testing environment. All systems are currently using mock data. Feel free to explore!"}], thinking: null, references: [], timestamp: new Date().toISOString(), source_pipeline: 'mock_gemini_direct'},
//     ]
// };

// let MOCK_FILES_STORE = [ // Renamed
//     { serverFilename: 'doc-quantum-001.pdf', originalName: 'Quantum_Entanglement_Intro.pdf', type: 'application/pdf', size: 305800, lastModified: new Date(Date.now() - 86400000 * 3).toISOString() },
//     { serverFilename: 'doc-thermo-002.docx', originalName: 'Aerospace_Thermo_Principles_Vol1.docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', size: 150200, lastModified: new Date(Date.now() - 86400000 * 2).toISOString() },
//     { serverFilename: 'code-rocket-sim-003.py', originalName: 'rocket_trajectory_sim.py', type: 'text/x-python', size: 25700, lastModified: new Date(Date.now() - 86400000).toISOString() },
// ];

// const MOCK_ANALYSIS_RESULTS = { // Renamed
//     faq: { content: "## Mocked FAQs for Selected Document\n\n**Q1: What is this?**\nA1: A mock FAQ section.", thinking: "Generated mock FAQs." },
//     topics: { content: "### Mock Key Topics\n\n- Mock Topic Alpha\n- Mock Topic Beta", thinking: "Identified mock topics." },
//     mindmap: { content: `# Mocked Mindmap: Selected Document\n## Central Theme\n### Key Concept A\n### Key Concept B`, thinking: "Created mock mindmap structure." }
// };
// // --- END OF MOCK DATA STORE ---


// const apiClient = axios.create({ // This is for V2
//     baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api',
// });
// apiClient.interceptors.request.use(config => { /* ... as before ... */ });


// const api = {
//     login: async (credentials) => {
//         if (DEV_MODE_MOCK_API) {
//             await mockDelay(400); 
//             console.log("MOCK API (V1): login attempt", credentials);
//             const username = credentials.username || 'DevUser';
//             const userToLogin = MOCK_USER_DATA_STORE['devUser001'] || { username: username, _id: `mock-id-${username}` };
            
//             const sessionId = `session-login-${Date.now()}`;
            
//             // Initialize stores if they were somehow cleared (shouldn't happen at module scope but defensive)
//             if (!MOCK_CHAT_HISTORY_STORE) MOCK_CHAT_HISTORY_STORE = {};
//             if (!MOCK_SESSIONS_STORE) MOCK_SESSIONS_STORE = {};

//             MOCK_CHAT_HISTORY_STORE[sessionId] = []; 
//             MOCK_SESSIONS_STORE[sessionId] = { 
//                 sessionId, 
//                 updatedAt: new Date().toISOString(), 
//                 messageCount: 0, 
//                 preview: "New Session (Mock Login)" 
//             };
            
//             return { 
//                 token: `mock-token-for-${userToLogin.username}-${Date.now()}`, 
//                 username: userToLogin.username, 
//                 _id: userToLogin._id, 
//                 sessionId: sessionId
//             };
//         }
//         // Real call for V2
//         const response = await apiClient.post('/auth/signin', credentials);
//         return response.data;
//     },

//     signup: async (userData) => {
//         if (DEV_MODE_MOCK_API) {
//             await mockDelay(400);
//             console.log("MOCK API (V1): signup attempt", userData);
//             const sessionId = `session-signup-${Date.now()}`;

//             if (!MOCK_CHAT_HISTORY_STORE) MOCK_CHAT_HISTORY_STORE = {};
//             if (!MOCK_SESSIONS_STORE) MOCK_SESSIONS_STORE = {};

//             MOCK_CHAT_HISTORY_STORE[sessionId] = [];
//             MOCK_SESSIONS_STORE[sessionId] = { sessionId, updatedAt: new Date().toISOString(), messageCount: 0, preview: "New Session (Mock Signup)" };
//             return { 
//                 token: `mock-signup-token-${userData.username}-${Date.now()}`, 
//                 username: userData.username, 
//                 _id: `mock-id-${userData.username}`, 
//                 sessionId: sessionId 
//             };
//         }
//         const response = await apiClient.post('/auth/signup', userData);
//         return response.data;
//     },

//     sendMessage: async (payload) => {
//         if (DEV_MODE_MOCK_API) {
//             await mockDelay(payload.useRag ? 800 : 400); console.log("MOCK API (V1): sendMessage", payload);
//             const query = payload.query || ""; const llmInUse = payload.llmProvider || 'ollama'; const systemP = payload.systemPrompt || "Default prompt.";
//             const botText = payload.useRag 
//                 ? `This is a MOCKED RAG response from ${llmInUse.toUpperCase()} for: "${query.substring(0,25)}...". Considering your system prompt for a "${systemP.substring(0,20)}..." style, document [1] offers insights.`
//                 : `This is a MOCK direct response from ${llmInUse.toUpperCase()} for: "${query.substring(0,25)}...". Your system prompt mode: "${systemP.substring(0,20)}...".`;
//             const thinking = payload.useRag ? `<thinking>Query: "${query.substring(0,15)}..."\nLLM: ${llmInUse.toUpperCase()} (RAG)\nSystem Prompt: "${systemP.substring(0,30)}..."\n(Mock) Found context in '${MOCK_FILES_STORE[0]?.originalName || "mock_doc.pdf"}'.</thinking>` : `<thinking>Query: "${query.substring(0,15)}..."\nLLM: ${llmInUse.toUpperCase()} (Direct)\nSystem Prompt: "${systemP.substring(0,30)}..."\n(Mock) Processing direct query.</thinking>`;
//             const references = payload.useRag ? [{ number: 1, source: MOCK_FILES_STORE[0]?.originalName || "default_mock.pdf", content_preview: "This is a snippet from the relevant mock document related to your query..."}] : [];
//             const botMsg = { id: `bot-${Date.now()}`, role: 'model', parts: [{text: botText }], thinking, references, timestamp: new Date().toISOString(), source_pipeline: payload.useRag ? `mock_${llmInUse}_rag` : `mock_${llmInUse}_direct`};
//             if (payload.sessionId) {
//                 if (!MOCK_CHAT_HISTORY_STORE[payload.sessionId]) MOCK_CHAT_HISTORY_STORE[payload.sessionId] = [];
//                 MOCK_CHAT_HISTORY_STORE[payload.sessionId].push(botMsg); 
//                 if(MOCK_SESSIONS_STORE[payload.sessionId]) { MOCK_SESSIONS_STORE[payload.sessionId].messageCount = (MOCK_SESSIONS_STORE[payload.sessionId].messageCount || 0) + 2; MOCK_SESSIONS_STORE[payload.sessionId].updatedAt = new Date().toISOString(); MOCK_SESSIONS_STORE[payload.sessionId].preview = botText.substring(0,50) + "..."; }
//             }
//             return { reply: botMsg, sessionId: payload.sessionId, source_pipeline: botMsg.source_pipeline };
//         }
//         const response = await apiClient.post('/chat/message', payload); return response.data;
//     },

//     getChatHistory: async (sessionId) => {
//         if (DEV_MODE_MOCK_API) {
//             await mockDelay(150); console.log("MOCK API (V1): getChatHistory for", sessionId);
//             if (!MOCK_CHAT_HISTORY_STORE) MOCK_CHAT_HISTORY_STORE = {}; // Defensive
//             return MOCK_CHAT_HISTORY_STORE[sessionId] || [];
//         }
//         const response = await apiClient.get(`/chat/history/${sessionId}`); return response.data;
//     },

//     getChatSessions: async () => {
//         if (DEV_MODE_MOCK_API) {
//             await mockDelay(150); console.log("MOCK API (V1): getChatSessions");
//             if (!MOCK_SESSIONS_STORE) MOCK_SESSIONS_STORE = {}; // Defensive
//             return Object.values(MOCK_SESSIONS_STORE).sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt));
//         }
//         const response = await apiClient.get('/chat/sessions'); return response.data;
//     },

//     startNewSession: async () => {
//         if (DEV_MODE_MOCK_API) {
//             await mockDelay(50); const newSid = `session-mock-new-${Date.now()}`;
//             if (!MOCK_CHAT_HISTORY_STORE) MOCK_CHAT_HISTORY_STORE = {}; // Defensive
//             if (!MOCK_SESSIONS_STORE) MOCK_SESSIONS_STORE = {}; // Defensive
//             MOCK_CHAT_HISTORY_STORE[newSid] = [];
//             MOCK_SESSIONS_STORE[newSid] = { sessionId: newSid, updatedAt: new Date().toISOString(), messageCount: 0, preview: "Newly Started Mock Session" };
//             console.log("MOCK API (V1): startNewSession, created:", newSid);
//             return { sessionId: newSid };
//         }
//         const response = await apiClient.post('/chat/new_session', {}); return response.data;
//     },

//     uploadFile: async (formData, onUploadProgress) => {
//         if (DEV_MODE_MOCK_API) {
//             const file = formData.get('file'); const mockFileName = file?.name || 'mock_upload.pdf';
//             console.log("MOCK API (V1): uploadFile", mockFileName);
//             if(onUploadProgress){ let p=0;const i=setInterval(()=>{p+=25;onUploadProgress({loaded:p,total:100});if(p>=100)clearInterval(i);},80);}
//             await mockDelay(400);
//             const newFileEntry = { serverFilename: `mock-server-${Date.now()}-${mockFileName}`, originalName: mockFileName, type: file?.type || 'application/octet-stream', size: file?.size || Math.floor(Math.random()*100000), lastModified: new Date().toISOString() };
//             if (!MOCK_FILES_STORE) MOCK_FILES_STORE = []; // Defensive
//             MOCK_FILES_STORE.unshift(newFileEntry);
//             return { message: `${mockFileName} uploaded (mocked)!`, filename: newFileEntry.serverFilename, originalname: newFileEntry.originalName };
//         }
//         const response = await apiClient.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' }, onUploadProgress }); return response.data;
//     },

//     getFiles: async () => {
//         if (DEV_MODE_MOCK_API) { 
//             await mockDelay(100); console.log("MOCK API (V1): getFiles"); 
//             if (!MOCK_FILES_STORE) MOCK_FILES_STORE = []; // Defensive
//             return [...MOCK_FILES_STORE]; 
//         }
//         const response = await apiClient.get('/files'); return response.data;
//     },

//     renameFile: async (serverFilename, newOriginalName) => {
//          if (DEV_MODE_MOCK_API) {
//             await mockDelay(); console.log("MOCK API (V1): renameFile", serverFilename, "to", newOriginalName);
//             if (!MOCK_FILES_STORE) MOCK_FILES_STORE = []; // Defensive
//             const file = MOCK_FILES_STORE.find(f => f.serverFilename === serverFilename);
//             if (file) file.originalName = newOriginalName;
//             return { message: "File renamed (mocked)" };
//         }
//         const response = await apiClient.patch(`/files/${serverFilename}`, { newOriginalName }); return response.data;
//     },

//     deleteFile: async (serverFilename) => {
//          if (DEV_MODE_MOCK_API) {
//             await mockDelay(); console.log("MOCK API (V1): deleteFile", serverFilename);
//             if (!MOCK_FILES_STORE) MOCK_FILES_STORE = []; // Defensive
//             MOCK_FILES_STORE = MOCK_FILES_STORE.filter(f => f.serverFilename !== serverFilename);
//             return { message: "File deleted (mocked)" };
//         }
//         const response = await apiClient.delete(`/files/${serverFilename}`); return response.data;
//     },

//     requestAnalysis: async (payload) => {
//         if (DEV_MODE_MOCK_API) {
//             await mockDelay(payload.analysis_type === 'mindmap' ? 1200 : 600);
//             console.log("MOCK API (V1): requestAnalysis", payload);
//             if (!MOCK_ANALYSIS_RESULTS) MOCK_ANALYSIS_RESULTS = {}; // Defensive
//             const result = MOCK_ANALYSIS_RESULTS[payload.analysis_type] || { content: `No mock data for ${payload.analysis_type} on ${payload.filename}`, thinking: "Used fallback."};
//             return { ...result, content: result.content.replace("Selected Document", payload.filename || "the Document") };
//         }
//         const response = await apiClient.post('/analysis/document', payload); return response.data;
//     },

//     updateUserLLMConfig: async (configData) => {
//         if (DEV_MODE_MOCK_API) { 
//             await mockDelay(); console.log("MOCK API (V1): updateUserLLMConfig", configData);
//             localStorage.setItem('mockUserLLMPreference', configData.llmProvider);
//             if(configData.llmProvider === 'gemini' && configData.apiKey) localStorage.setItem('mockUserGeminiKeyStatus_V1', 'ProvidedDuringMock');
//             if(configData.llmProvider === 'ollama' && configData.ollamaUrl) localStorage.setItem('mockUserOllamaUrl_V1', configData.ollamaUrl);
//             return { message: `LLM preference updated (mocked).` };
//         }
//         const response = await apiClient.post('/user/config/llm', configData); return response.data;
//     },

//     getUserLLMConfig: async () => {
//          if (DEV_MODE_MOCK_API) {
//             await mockDelay(); const llmProvider = localStorage.getItem('mockUserLLMPreference') || 'ollama';
//             console.log("MOCK API (V1): getUserLLMConfig, returning:", llmProvider);
//             return { llmProvider };
//         }
//         const response = await apiClient.get('/user/config/llm'); return response.data;
//     },

//     getOrchestratorStatus: async () => {
//         if (DEV_MODE_MOCK_API) { 
//             await mockDelay(50); 
//             return { status: "ok", message: "Backend (Mocked & Online)", database_status: "Connected (Mock)" };
//         }
//         const baseUrlForHealth = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api').replace('/api', '');
//         const response = await axios.get(`${baseUrlForHealth}/api/health`);
//         return response.data;
//     },

//     getSyllabus: async (subjectId) => {
//         if(DEV_MODE_MOCK_API) { 
//             await mockDelay(); console.log("MOCK API (V1): getSyllabus for", subjectId);
//             return `# Mock Syllabus: ${subjectId}\n\n- Section 1: Intro to ${subjectId}\n- Section 2: Core Principles`;
//         }
//         const response = await apiClient.get(`/syllabus/${subjectId}`); return response.data;
//     }
// };

// export default api;
















// src/services/api.js
import axios from 'axios';

const DEV_MODE_MOCK_API = true;

const mockDelay = (ms = 200) => new Promise(resolve => setTimeout(resolve, ms));

// --- MOCK DATA STORE ---
let MOCK_USER_DATA_STORE = {
    'devUser001': { username: 'DevUI-User', _id: 'devUser001' }
};

let MOCK_SESSIONS_STORE = {
    'session-mock-1': { sessionId: 'session-mock-1', updatedAt: new Date(Date.now() - 3600000).toISOString(), messageCount: 4, preview: "Thermodynamics basics and applications..." },
    'session-mock-2': { sessionId: 'session-mock-2', updatedAt: new Date(Date.now() - 7200000).toISOString(), messageCount: 6, preview: "Exploring quantum entanglement simply..." },
    'dev-initial-session-appstate': { sessionId: 'dev-initial-session-appstate', updatedAt: new Date().toISOString(), messageCount: 2, preview: "Initial development session for UI testing..." }
};

let MOCK_CHAT_HISTORY_STORE = {
    'session-mock-1': [
        { id: 's1msg1', _id: 's1msg1', role: 'user', parts: [{text: "Hello AI tutor! Can you explain the first law of thermodynamics?"}], timestamp: new Date(Date.now() - 3550000).toISOString() },
        { id: 's1msg2', _id: 's1msg2', role: 'model', parts: [{text: "Certainly! The first law of thermodynamics, also known as the law of conservation of energy, states that energy cannot be created or destroyed in an isolated system. It can only be transformed from one form to another. \n\nFor example, in a heat engine, chemical energy in fuel is converted into thermal energy, which is then converted into mechanical work."}], thinking: "<thinking>User asked for 1st law. Provided definition and an example.</thinking>", references: [], timestamp: new Date(Date.now() - 3540000).toISOString(), source_pipeline: 'mock_ollama_direct'},
        { id: 's1msg3', _id: 's1msg3', role: 'user', parts: [{text: "What about its applications in aerospace engineering?"}], timestamp: new Date(Date.now() - 3500000).toISOString() },
        { id: 's1msg4', _id: 's1msg4', role: 'model', parts: [{text: "Great question! In aerospace, it's fundamental for designing jet engines and rocket propulsion systems (analyzing thrust from energy conversion), understanding aerodynamic heating on re-entry vehicles, and managing thermal control systems for satellites and spacecraft to maintain operational temperatures in the vacuum of space. For instance, the energy balance for a jet engine directly applies this law [1]."}], thinking: "<thinking>User asked for aerospace applications. Linked to engine design and thermal management. Added a mock reference.</thinking>", references: [{number: 1, source: "Aerospace_Thermo_Principles_Vol1.pdf", content_preview:"The first law is applied to calculate the energy changes as air and fuel pass through a jet engine, determining available thrust..."}], timestamp: new Date(Date.now() - 3400000).toISOString(), source_pipeline: 'mock_ollama_rag'},
    ],
    'dev-initial-session-appstate': [
        { id: 'devmsg1', _id: 'devmsg1', role: 'user', parts: [{text: "Hi there, this is the initial dev session for UI testing!"}], timestamp: new Date(Date.now() - 60000).toISOString() },
        { id: 'devmsg2', _id: 'devmsg2', role: 'model', parts: [{text: "Hello Dev User! Welcome to the UI testing environment. All systems are currently using mock data. Feel free to explore!"}], thinking: null, references: [], timestamp: new Date().toISOString(), source_pipeline: 'mock_gemini_direct'},
    ]
    // Add more sessions as needed
};

let MOCK_FILES_STORE = [
    { serverFilename: 'doc-quantum-001.pdf', originalName: 'Quantum_Entanglement_Intro.pdf', type: 'application/pdf', size: 305800, lastModified: new Date(Date.now() - 86400000 * 3).toISOString() },
    { serverFilename: 'doc-thermo-002.docx', originalName: 'Aerospace_Thermo_Principles_Vol1.docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', size: 150200, lastModified: new Date(Date.now() - 86400000 * 2).toISOString() },
    { serverFilename: 'code-rocket-sim-003.py', originalName: 'rocket_trajectory_sim.py', type: 'text/x-python', size: 25700, lastModified: new Date(Date.now() - 86400000).toISOString() },
];

let MOCK_ANALYSIS_RESULTS = {
    faq: { 
        content: "## Mocked FAQs for {{DOCUMENT_NAME}}\n\n**Q1: What is the main topic of {{DOCUMENT_NAME}}?**\nA1: This is a mock FAQ section about {{DOCUMENT_NAME}} demonstrating its core concepts.\n\n**Q2: What are some key takeaways from {{DOCUMENT_NAME}}?**\nA2: Key takeaways include mocked point A, mocked point B, and the overall significance of mocked point C within {{DOCUMENT_NAME}}.", 
        thinking: "Generated mock FAQs based on the content of {{DOCUMENT_NAME}}." 
    },
    topics: { 
        content: "### Mock Key Topics for {{DOCUMENT_NAME}}\n\n- Mock Topic Alpha related to {{DOCUMENT_NAME}}\n- Mock Topic Beta from {{DOCUMENT_NAME}}\n- Emerging Concept Gamma in {{DOCUMENT_NAME}}", 
        thinking: "Identified mock key topics from {{DOCUMENT_NAME}}." 
    },
    mindmap: { // For Mermaid.js
        content: `graph TD
    A["{{DOCUMENT_NAME}} Core Idea"]:::docStyle --> B("Key Concept 1");
    A --> C("Key Concept 2");
    A --> F("Another Main Branch");
    B --> D("Sub-concept 1.1");
    B --> E("Sub-concept 1.2");
    C --> G("Sub-concept 2.1");
    F --> H("Detail F.1");
    F --> I("Detail F.2");
    G --> J("Sub-sub-concept 2.1.1");

    subgraph "Section X"
        D
        E
    end
    subgraph "Section Y"
        G
        J
    end
    
    classDef docStyle fill:#f9f,stroke:#333,stroke-width:2px,color:#333
    classDef default fill:#fff,stroke:#555,stroke-width:2px,color:#000
    class A docStyle;
`,
        thinking: "Generated mock mindmap structure using Mermaid syntax for the document: {{DOCUMENT_NAME}}."
    }
};
// --- END OF MOCK DATA STORE ---

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api',
});

apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});


const api = {
    login: async (credentials) => {
        if (DEV_MODE_MOCK_API) {
            await mockDelay(400);
            console.log("MOCK API (V1): login attempt", credentials);
            const username = credentials.username || 'DevUser';
            if (typeof MOCK_USER_DATA_STORE !== 'object' || MOCK_USER_DATA_STORE === null) MOCK_USER_DATA_STORE = {};
            const userToLogin = MOCK_USER_DATA_STORE['devUser001'] || { username: username, _id: `mock-id-${username}` };
            const sessionId = `session-login-${Date.now()}`;

            if (typeof MOCK_CHAT_HISTORY_STORE !== 'object' || MOCK_CHAT_HISTORY_STORE === null) MOCK_CHAT_HISTORY_STORE = {};
            if (typeof MOCK_SESSIONS_STORE !== 'object' || MOCK_SESSIONS_STORE === null) MOCK_SESSIONS_STORE = {};
            if (!MOCK_CHAT_HISTORY_STORE[sessionId]) MOCK_CHAT_HISTORY_STORE[sessionId] = [];
             MOCK_SESSIONS_STORE[sessionId] = { sessionId, updatedAt: new Date().toISOString(), messageCount: 0, preview: `New Mock Login Session for ${userToLogin.username}` };
            
            return { token: `mock-token-for-${userToLogin.username}-${Date.now()}`, username: userToLogin.username, _id: userToLogin._id, sessionId: sessionId };
        }
        const response = await apiClient.post('/auth/signin', credentials);
        return response.data;
    },

    signup: async (userData) => {
        if (DEV_MODE_MOCK_API) {
            await mockDelay(400);
            console.log("MOCK API (V1): signup attempt", userData);
            const sessionId = `session-signup-${Date.now()}`;
            if (typeof MOCK_CHAT_HISTORY_STORE !== 'object' || MOCK_CHAT_HISTORY_STORE === null) MOCK_CHAT_HISTORY_STORE = {};
            if (typeof MOCK_SESSIONS_STORE !== 'object' || MOCK_SESSIONS_STORE === null) MOCK_SESSIONS_STORE = {};
            if (!MOCK_CHAT_HISTORY_STORE[sessionId]) MOCK_CHAT_HISTORY_STORE[sessionId] = [];
            MOCK_SESSIONS_STORE[sessionId] = { sessionId, updatedAt: new Date().toISOString(), messageCount: 0, preview: `New Mock Signup Session for ${userData.username}` };
            
            return { token: `mock-signup-token-${userData.username}-${Date.now()}`, username: userData.username, _id: `mock-id-${userData.username}`, sessionId: sessionId };
        }
        const response = await apiClient.post('/auth/signup', userData);
        return response.data;
    },

    sendMessage: async (payload) => {
        if (DEV_MODE_MOCK_API) {
            await mockDelay(payload.useRag ? 800 : 400); 
            console.log("MOCK API (V1): sendMessage", payload);
            const query = payload.query || ""; 
            const llmInUse = payload.llmProvider || 'ollama'; 
            const systemP = payload.systemPrompt || "Default prompt.";
            
            const botText = payload.useRag 
                ? `This is a MOCKED RAG response from ${llmInUse.toUpperCase()} for: "${query.substring(0,25)}...". Considering your system prompt ("${systemP.substring(0,20)}..."), document [1] offers insights.`
                : `This is a MOCK direct response from ${llmInUse.toUpperCase()} for: "${query.substring(0,25)}...". Your system prompt mode: "${systemP.substring(0,20)}...".`;
            
            const thinkingText = payload.useRag 
                ? `<thinking>Query: "${query.substring(0,15)}..."\nLLM: ${llmInUse.toUpperCase()} (RAG)\nSystem Prompt: "${systemP.substring(0,30)}..."\n(Mock) Found context in '${(MOCK_FILES_STORE && MOCK_FILES_STORE[0]?.originalName) || "mock_doc.pdf"}'.</thinking>` 
                : `<thinking>Query: "${query.substring(0,15)}..."\nLLM: ${llmInUse.toUpperCase()} (Direct)\nSystem Prompt: "${systemP.substring(0,30)}..."\n(Mock) Processing direct query.</thinking>`;
            
            const references = payload.useRag && MOCK_FILES_STORE && MOCK_FILES_STORE.length > 0 
                ? [{ number: 1, source: MOCK_FILES_STORE[0]?.originalName || "default_mock.pdf", content_preview: "This is a snippet from the relevant mock document related to your query..."}] 
                : [];
            
            const botMsg = { 
                id: `bot-${Date.now()}-${Math.random().toString(16).slice(2)}`, 
                role: 'model', 
                parts: [{text: botText }], 
                thinking: thinkingText, 
                references, 
                timestamp: new Date().toISOString(), 
                source_pipeline: payload.useRag ? `mock_${llmInUse}_rag` : `mock_${llmInUse}_direct`
            };
            
            if (payload.sessionId) {
                if (typeof MOCK_CHAT_HISTORY_STORE !== 'object' || MOCK_CHAT_HISTORY_STORE === null) MOCK_CHAT_HISTORY_STORE = {};
                if (!MOCK_CHAT_HISTORY_STORE[payload.sessionId]) MOCK_CHAT_HISTORY_STORE[payload.sessionId] = [];
                MOCK_CHAT_HISTORY_STORE[payload.sessionId].push({role: 'user', parts: [{text: query}], timestamp: new Date(Date.now() - 100).toISOString()}); // Add user message too
                MOCK_CHAT_HISTORY_STORE[payload.sessionId].push(botMsg); 
                
                if (typeof MOCK_SESSIONS_STORE !== 'object' || MOCK_SESSIONS_STORE === null) MOCK_SESSIONS_STORE = {};
                if(MOCK_SESSIONS_STORE[payload.sessionId]) { 
                    MOCK_SESSIONS_STORE[payload.sessionId].messageCount = (MOCK_SESSIONS_STORE[payload.sessionId].messageCount || 0) + 2; 
                    MOCK_SESSIONS_STORE[payload.sessionId].updatedAt = new Date().toISOString(); 
                    MOCK_SESSIONS_STORE[payload.sessionId].preview = botText.substring(0,50) + "..."; 
                }
            }
            return { reply: botMsg, sessionId: payload.sessionId, source_pipeline: botMsg.source_pipeline };
        }
        const response = await apiClient.post('/chat/message', payload); return response.data;
    },

    getChatHistory: async (sessionId) => {
        if (DEV_MODE_MOCK_API) {
            await mockDelay(150); console.log("MOCK API (V1): getChatHistory for", sessionId);
            if (typeof MOCK_CHAT_HISTORY_STORE !== 'object' || MOCK_CHAT_HISTORY_STORE === null) MOCK_CHAT_HISTORY_STORE = {};
            return MOCK_CHAT_HISTORY_STORE[sessionId] || [];
        }
        const response = await apiClient.get(`/chat/history/${sessionId}`); return response.data;
    },

    getChatSessions: async () => {
        if (DEV_MODE_MOCK_API) {
            await mockDelay(150); console.log("MOCK API (V1): getChatSessions");
            if (typeof MOCK_SESSIONS_STORE !== 'object' || MOCK_SESSIONS_STORE === null) MOCK_SESSIONS_STORE = {};
            return Object.values(MOCK_SESSIONS_STORE).sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        }
        const response = await apiClient.get('/chat/sessions'); return response.data;
    },

    startNewSession: async () => {
        if (DEV_MODE_MOCK_API) {
            await mockDelay(50); const newSid = `session-mock-new-${Date.now()}`;
            if (typeof MOCK_CHAT_HISTORY_STORE !== 'object' || MOCK_CHAT_HISTORY_STORE === null) MOCK_CHAT_HISTORY_STORE = {};
            if (typeof MOCK_SESSIONS_STORE !== 'object' || MOCK_SESSIONS_STORE === null) MOCK_SESSIONS_STORE = {};
            MOCK_CHAT_HISTORY_STORE[newSid] = [];
            MOCK_SESSIONS_STORE[newSid] = { sessionId: newSid, updatedAt: new Date().toISOString(), messageCount: 0, preview: "Newly Started Mock Session" };
            console.log("MOCK API (V1): startNewSession, created:", newSid);
            return { sessionId: newSid };
        }
        const response = await apiClient.post('/chat/new_session', {}); return response.data;
    },

    uploadFile: async (formData, onUploadProgress) => {
        if (DEV_MODE_MOCK_API) {
            const file = formData.get('file'); const mockFileName = file?.name || 'mock_upload.pdf';
            console.log("MOCK API (V1): uploadFile", mockFileName);
            if(onUploadProgress){ let p=0;const i=setInterval(()=>{p+=25;if(p<=100)onUploadProgress({loaded:p,total:100});if(p>=100)clearInterval(i);},80);}
            await mockDelay(400);
            const newFileEntry = { serverFilename: `mock-server-${Date.now()}-${mockFileName.replace(/[^a-zA-Z0-9.]/g, '_')}`, originalName: mockFileName, type: file?.type || 'application/octet-stream', size: file?.size || Math.floor(Math.random()*100000), lastModified: new Date().toISOString() };
            if (!Array.isArray(MOCK_FILES_STORE)) MOCK_FILES_STORE = [];
            MOCK_FILES_STORE.unshift(newFileEntry);
            return { message: `${mockFileName} uploaded (mocked)!`, filename: newFileEntry.serverFilename, originalname: newFileEntry.originalName };
        }
        const response = await apiClient.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' }, onUploadProgress }); return response.data;
    },

    getFiles: async () => {
        if (DEV_MODE_MOCK_API) {
            await mockDelay(100); console.log("MOCK API (V1): getFiles");
            if (!Array.isArray(MOCK_FILES_STORE)) MOCK_FILES_STORE = [];
            return [...MOCK_FILES_STORE];
        }
        const response = await apiClient.get('/files'); return response.data;
    },

    renameFile: async (serverFilename, newOriginalName) => {
         if (DEV_MODE_MOCK_API) {
            await mockDelay(); console.log("MOCK API (V1): renameFile", serverFilename, "to", newOriginalName);
            if (!Array.isArray(MOCK_FILES_STORE)) MOCK_FILES_STORE = [];
            const fileIndex = MOCK_FILES_STORE.findIndex(f => f.serverFilename === serverFilename);
            if (fileIndex > -1) MOCK_FILES_STORE[fileIndex].originalName = newOriginalName;
            return { message: "File renamed (mocked)" };
        }
        const response = await apiClient.patch(`/files/${serverFilename}`, { newOriginalName }); return response.data;
    },

    deleteFile: async (serverFilename) => {
         if (DEV_MODE_MOCK_API) {
            await mockDelay(); console.log("MOCK API (V1): deleteFile", serverFilename);
            if (!Array.isArray(MOCK_FILES_STORE)) MOCK_FILES_STORE = [];
            MOCK_FILES_STORE = MOCK_FILES_STORE.filter(f => f.serverFilename !== serverFilename);
            return { message: "File deleted (mocked)" };
        }
        const response = await apiClient.delete(`/files/${serverFilename}`); return response.data;
    },

    requestAnalysis: async (payload) => {
        if (DEV_MODE_MOCK_API) {
            const delayMs = payload.analysis_type === 'mindmap' ? 1000 : 500; // Adjusted delay
            await mockDelay(delayMs);
            console.log("MOCK API (V1): requestAnalysis", payload);
            
            if (typeof MOCK_ANALYSIS_RESULTS !== 'object' || MOCK_ANALYSIS_RESULTS === null) {
                 MOCK_ANALYSIS_RESULTS = { 
                    faq: { content: "Default FAQ for {{DOCUMENT_NAME}}", thinking: "Fallback thinking." }, 
                    topics: { content: "Default Topics for {{DOCUMENT_NAME}}", thinking: "Fallback thinking." },
                    mindmap: { content: "graph TD\nA[{{DOCUMENT_NAME}}] --> B(Error: Fallback Mindmap);", thinking: "Fallback thinking." }
                 };
            }

            let resultTemplate = MOCK_ANALYSIS_RESULTS[payload.analysis_type];
            if (!resultTemplate) {
                return { 
                    content: `No mock data template for analysis type '${payload.analysis_type}' on document '${payload.filename || 'the document'}'.`, 
                    thinking: "Used fallback due to missing analysis type template."
                };
            }
            
            // Create a deep copy to avoid modifying the template
            const result = JSON.parse(JSON.stringify(resultTemplate));

            // Replace placeholder in content and thinking
            const docName = payload.filename || "Selected Document";
            if (result.content && typeof result.content === 'string') {
                result.content = result.content.replace(/\{\{DOCUMENT_NAME\}\}/g, docName);
            }
            if (result.thinking && typeof result.thinking === 'string') {
                result.thinking = result.thinking.replace(/\{\{DOCUMENT_NAME\}\}/g, docName);
            }
            
            return result;
        }
        // Real API call for V2
        const response = await apiClient.post('/analysis/document', payload); 
        return response.data;
    },

    updateUserLLMConfig: async (configData) => {
        if (DEV_MODE_MOCK_API) { 
            await mockDelay(); console.log("MOCK API (V1): updateUserLLMConfig", configData);
            localStorage.setItem('mockUserLLMPreference_v1', configData.llmProvider); // Added _v1 to avoid clash with older keys
            if(configData.llmProvider === 'gemini' && configData.apiKey) localStorage.setItem('mockUserGeminiKeyStatus_v1', 'ProvidedDuringMock');
            if(configData.llmProvider === 'ollama' && configData.ollamaUrl) localStorage.setItem('mockUserOllamaUrl_v1', configData.ollamaUrl);
            return { message: `LLM preference updated to ${configData.llmProvider} (mocked).` };
        }
        const response = await apiClient.post('/user/config/llm', configData); return response.data;
    },

    getUserLLMConfig: async () => {
         if (DEV_MODE_MOCK_API) {
            await mockDelay(); const llmProvider = localStorage.getItem('mockUserLLMPreference_v1') || 'ollama';
            console.log("MOCK API (V1): getUserLLMConfig, returning:", llmProvider);
            return { llmProvider };
        }
        const response = await apiClient.get('/user/config/llm'); return response.data;
    },

    getOrchestratorStatus: async () => {
        if (DEV_MODE_MOCK_API) { 
            await mockDelay(50); 
            return { status: "ok", message: "Backend (Mocked & Online)", database_status: "Connected (Mock)" };
        }
        const baseUrlForHealth = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api').replace('/api', '');
        try {
            const response = await axios.get(`${baseUrlForHealth}/api/health`);
            return response.data;
        } catch (error) {
            console.error("API: Error fetching orchestrator status:", error);
            return { status: "error", message: "Failed to connect to backend", database_status: "Unknown" };
        }
    },

    // Example, not used yet by current UI but good to have in mock
    getSyllabus: async (subjectId) => { 
        if(DEV_MODE_MOCK_API) { 
            await mockDelay(); console.log("MOCK API (V1): getSyllabus for", subjectId);
            return `# Mock Syllabus: ${subjectId}\n\n- Section 1: Intro to ${subjectId}\n- Section 2: Core Principles of ${subjectId}\n- Module A\n- Module B`;
        }
        const response = await apiClient.get(`/syllabus/${subjectId}`); return response.data;
    }
};

export default api;
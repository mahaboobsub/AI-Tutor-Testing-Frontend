// import React from 'react';
// import { marked } from 'marked'; // Ensure marked is installed
// import { ChevronDown, Brain, Link as LinkIcon, Zap, Server } from 'lucide-react'; // Zap for Ollama, Server for Gemini (example)

// // Configure marked for consistent rendering
// // WARNING: sanitize: false can be a security risk if LLM output is not trusted.
// // For production, use DOMPurify:
// // import DOMPurify from 'dompurify';
// // const cleanHtml = DOMPurify.sanitize(rawHtml);
// marked.setOptions({
//   breaks: true,
//   gfm: true,
//   // sanitize: false, // Set to true or use DOMPurify for production if LLM output is untrusted
// });

// const createMarkup = (markdownText) => {
//     if (!markdownText) return { __html: '' };
//     const rawHtml = marked.parse(markdownText);
//     // const cleanHtml = DOMPurify.sanitize(rawHtml); // For production
//     return { __html: rawHtml }; // For dev, or if LLM output is trusted
// };

// const escapeHtml = (unsafe) => {
//     if (typeof unsafe !== 'string') return '';
//     return unsafe
//          .replace(/&/g, "&")
//          .replace(/</g, "<")
//          .replace(/>/g, ">")
//          .replace(/"/g, '"')
//          .replace(/'/g, "'");
// };


// function MessageBubble({ sender, text, thinking, references, timestamp, sourcePipeline }) {
//     const isUser = sender === 'user';

//     const formatTimestamp = (ts) => {
//         if (!ts) return '';
//         try {
//             return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//         } catch (e) { return ''; }
//     };

//     const getPipelineIcon = () => {
//         if (!sourcePipeline) return null;
//         if (sourcePipeline.includes('ollama')) return <Zap size={12} className="text-green-400" title="Ollama" />;
//         if (sourcePipeline.includes('gemini')) return <Server size={12} className="text-blue-400" title="Gemini" />;
//         return null;
//     };

//     return (
//         <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} w-full`}>
//             <div 
//                 className={`message-bubble max-w-[85%] md:max-w-[75%] p-3 rounded-2xl shadow-md ${
//                     isUser 
//                     ? 'bg-primary dark:bg-primary-dark text-white rounded-br-lg' 
//                     : 'bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark rounded-bl-lg border border-gray-200 dark:border-gray-700'
//                 }`}
//             >
//                 <div className="prose prose-sm dark:prose-invert max-w-none message-content" dangerouslySetInnerHTML={createMarkup(text || '')} />
                
//                 <div className="flex items-center justify-end mt-1.5 text-xs opacity-70">
//                     {!isUser && getPipelineIcon() && <span className="mr-1.5">{getPipelineIcon()}</span>}
//                     {formatTimestamp(timestamp)}
//                 </div>
//             </div>

//             {!isUser && (thinking || (references && references.length > 0)) && (
//                 <div className="message-metadata-container max-w-[85%] md:max-w-[75%] mt-1.5 pl-2">
//                     {thinking && (
//                         <details className="group text-xs mb-1">
//                             <summary className="flex items-center gap-1 cursor-pointer text-text-muted-light dark:text-text-muted-dark hover:text-primary dark:hover:text-primary-light transition-colors">
//                                 <Brain size={14} /> Reasoning
//                                 <ChevronDown size={14} className="group-open:rotate-180 transition-transform" />
//                             </summary>
//                             <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded-md text-text-light dark:text-text-dark whitespace-pre-wrap break-all text-[0.7rem] max-h-32 overflow-y-auto custom-scrollbar">
//                                 <code>{escapeHtml(thinking)}</code>
//                             </pre>
//                         </details>
//                     )}
//                     {references && references.length > 0 && (
//                         <details className="group text-xs" open>
//                             <summary className="flex items-center gap-1 cursor-pointer text-text-muted-light dark:text-text-muted-dark hover:text-primary dark:hover:text-primary-light transition-colors">
//                                 <LinkIcon size={14} /> References
//                                 <ChevronDown size={14} className="group-open:rotate-180 transition-transform" />
//                             </summary>
//                             <ul className="mt-1 pl-1 space-y-0.5 text-[0.7rem]">
//                                 {references.map((ref, index) => (
//                                     <li 
//                                         key={index} 
//                                         className="text-text-muted-light dark:text-text-muted-dark hover:text-text-light dark:hover:text-text-dark transition-colors"
//                                         title={`Preview: ${escapeHtml(ref.content_preview || '')}`}
//                                     >
//                                         <span className="font-semibold text-accent">[{ref.number}]</span> {escapeHtml(ref.source)}
//                                     </li>
//                                 ))}
//                             </ul>
//                         </details>
//                     )}
//                 </div>
//             )}
//         </div>
//     );
// }

// export default MessageBubble;













// src/components/chat/MessageBubble.jsx
import React, { useState, useEffect } from 'react';
import { marked } from 'marked';
import { ChevronDown, Brain, Link as LinkIcon, Zap, Server, Copy, Volume2, PauseCircle, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import IconButton from '../core/IconButton.jsx';
import { playTextToSpeech, stopTextToSpeech, isCurrentlySpeaking } from '../../utils/speechUtils.js'; // We assume speechUtils.js exists and is correct

// Configure marked
marked.setOptions({
  breaks: true,
  gfm: true,
});

const createMarkup = (markdownText) => {
    if (!markdownText) return { __html: '' };
    const rawHtml = marked.parse(markdownText);
    return { __html: rawHtml };
};

const escapeHtml = (unsafe) => {
    if (typeof unsafe !== 'string') return '';
    return unsafe
         .replace(/&/g, "&")
         .replace(/</g, "<")
         .replace(/>/g, ">")
         .replace(/"/g, '"')
         .replace(/'/g, "'");
};

function MessageBubble({ id, sender, text, thinking, references, timestamp, sourcePipeline }) {
    // console.log("MessageBubble PROPS - ID:", id, "Sender:", sender, "Text snippet:", text?.substring(0, 20)); // Main log for props

    const isUser = sender === 'user';
    const [isSpeakingThisMessage, setIsSpeakingThisMessage] = useState(false);

    useEffect(() => {
        // Cleanup function: if this message was speaking when the component unmounts, ensure it's stopped.
        return () => {
            if (isCurrentlySpeaking(id)) { // Check if this specific message is speaking
                // console.log(`MessageBubble Unmount (ID: ${id}): Stopping speech.`);
                stopTextToSpeech(id); // Tell speechUtils to stop this specific message
            }
        };
    }, [id]); // Dependency: id ensures this cleanup is tied to the specific message instance

    const formatTimestamp = (ts) => {
        if (!ts) return '';
        try {
            return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (e) { return ''; }
    };

    const getPipelineIcon = () => {
        if (!sourcePipeline) return null;
        if (sourcePipeline.includes('ollama')) return <Zap size={12} className="text-green-400" title="Ollama" />;
        if (sourcePipeline.includes('gemini')) return <Server size={12} className="text-blue-400" title="Gemini" />;
        return <Info size={12} className="text-gray-400" title={sourcePipeline} />;
    };

    const handleCopyToClipboard = async () => {
        console.log(`[MessageBubble ID: ${id}] Copy button clicked. Text:`, text?.substring(0,30)+"...");
        if (!text) {
            toast.error("Nothing to copy.", { duration: 1500 });
            return;
        }
        if (!navigator.clipboard) {
            toast.error("Clipboard API not available.", { duration: 2000 });
            console.error(`[MessageBubble ID: ${id}] navigator.clipboard is not available. Ensure HTTPS or localhost if not already.`);
            return;
        }
        try {
            await navigator.clipboard.writeText(text);
            toast.success("Copied to clipboard!", { duration: 1500 });
        } catch (err) {
            console.error(`[MessageBubble ID: ${id}] Failed to copy text: `, err);
            toast.error("Failed to copy. See console.", { duration: 2000 });
        }
    };

    const handleToggleSpeech = () => {
        console.log(`[MessageBubble ID: ${id}] TTS button clicked. Current local speaking state: ${isSpeakingThisMessage}`);
        if (!id) {
            console.error("[MessageBubble handleToggleSpeech] Message ID is undefined! Cannot process TTS.");
            toast.error("Error: Message ID missing for TTS.");
            return;
        }
        if (!text) {
            toast.error("Nothing to speak.", { duration: 1500 });
            return;
        }
        if (typeof window.speechSynthesis === 'undefined') {
            toast.warn("Speech synthesis not supported.", { duration: 2000 });
            return;
        }

        if (isCurrentlySpeaking(id)) { // Check if *this specific message* is the one speaking
            console.log(`[MessageBubble ID: ${id}] This message is speaking. Calling stopTextToSpeech(${id}).`);
            stopTextToSpeech(id);
            // setIsSpeakingThisMessage(false); // Rely on callback from speechUtils for this
        } else {
            // If another message is speaking, stop it.
            if (isCurrentlySpeaking()) { // isCurrentlySpeaking() without ID checks if *anything* is speaking
                 console.log(`[MessageBubble ID: ${id}] Another message is speaking. Calling general stopTextToSpeech().`);
                 stopTextToSpeech(); 
            }
            
            // Now, play this message
            console.log(`[MessageBubble ID: ${id}] Calling playTextToSpeech.`);
            setIsSpeakingThisMessage(true); // Optimistically set UI to speaking state
            playTextToSpeech(text, id, () => {
                // This callback is invoked by speechUtils when speech ends or is cancelled for THIS messageId
                console.log(`[MessageBubble ID: ${id}] onSpeechEnd callback from speechUtils. Setting isSpeakingThisMessage to false.`);
                setIsSpeakingThisMessage(false);
            });
        }
    };

    return (
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} w-full group/message`}>
            <div 
                className={`message-bubble relative max-w-[85%] md:max-w-[75%] p-3 rounded-2xl shadow-md ${
                    isUser 
                    ? 'bg-primary dark:bg-primary-dark text-white rounded-br-lg' 
                    : 'bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark rounded-bl-lg border border-gray-200 dark:border-gray-700'
                }`}
            >
                <div className="prose prose-sm dark:prose-invert max-w-none message-content" dangerouslySetInnerHTML={createMarkup(text || '')} />
                
                <div className="flex items-center justify-end mt-1.5 text-xs opacity-70">
                    {!isUser && getPipelineIcon() && <span className="mr-1.5">{getPipelineIcon()}</span>}
                    {formatTimestamp(timestamp)}
                </div>

                {!isUser && text && (
                    <div className="absolute -top-2 -right-2 sm:top-1 sm:right-1 flex items-center gap-0.5 p-0.5 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-full shadow-md 
                                    opacity-0 group-hover/message:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
                        <IconButton
                            icon={Copy}
                            onClick={handleCopyToClipboard}
                            title="Copy text"
                            size="sm"
                            variant="ghost"
                            className="p-1.5 text-text-muted-light dark:text-text-muted-dark hover:text-primary dark:hover:text-primary-light"
                        />
                        {typeof window.speechSynthesis !== 'undefined' && (
                            <IconButton
                                icon={isSpeakingThisMessage ? PauseCircle : Volume2}
                                onClick={handleToggleSpeech}
                                title={isSpeakingThisMessage ? "Stop speech" : "Read aloud"}
                                size="sm"
                                variant="ghost"
                                className={`p-1.5 ${isSpeakingThisMessage 
                                    ? 'text-red-500 dark:text-red-400 animate-pulse' 
                                    : 'text-text-muted-light dark:text-text-muted-dark hover:text-primary dark:hover:text-primary-light'}`}
                            />
                        )}
                    </div>
                )}
            </div>

            {!isUser && (thinking || (references && references.length > 0)) && (
                 <div className="message-metadata-container max-w-[85%] md:max-w-[75%] mt-1.5 pl-2">
                    {thinking && (
                        <details className="group text-xs mb-1">
                            <summary className="flex items-center gap-1 cursor-pointer text-text-muted-light dark:text-text-muted-dark hover:text-primary dark:hover:text-primary-light transition-colors">
                                <Brain size={14} /> Reasoning
                                <ChevronDown size={14} className="group-open:rotate-180 transition-transform" />
                            </summary>
                            <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded-md text-text-light dark:text-text-dark whitespace-pre-wrap break-all text-[0.7rem] max-h-32 overflow-y-auto custom-scrollbar">
                                <code>{escapeHtml(thinking)}</code>
                            </pre>
                        </details>
                    )}
                    {references && references.length > 0 && (
                        <details className="group text-xs" open>
                            <summary className="flex items-center gap-1 cursor-pointer text-text-muted-light dark:text-text-muted-dark hover:text-primary dark:hover:text-primary-light transition-colors">
                                <LinkIcon size={14} /> References
                                <ChevronDown size={14} className="group-open:rotate-180 transition-transform" />
                            </summary>
                            <ul className="mt-1 pl-1 space-y-0.5 text-[0.7rem]">
                                {references.map((ref, index) => (
                                    <li 
                                        key={index} 
                                        className="text-text-muted-light dark:text-text-muted-dark hover:text-text-light dark:hover:text-text-dark transition-colors"
                                        title={`Preview: ${escapeHtml(ref.content_preview || '')}`}
                                    >
                                        <span className="font-semibold text-accent">[{ref.number}]</span> {escapeHtml(ref.source)}
                                    </li>
                                ))}
                            </ul>
                        </details>
                    )}
                </div>
            )}
        </div>
    );
}

export default MessageBubble;
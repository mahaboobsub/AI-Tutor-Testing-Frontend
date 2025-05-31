// src/utils/speechUtils.js
let utterance = null;
let onEndCallback = null;
let activeMessageId = null;

const cleanupUtteranceAndCallback = () => {
    console.log("[speechUtils] cleanupUtteranceAndCallback called. ActiveMessageId before clear:", activeMessageId);
    if (utterance) {
        utterance.onend = null;
        utterance.onerror = null;
        utterance = null;
        console.log("[speechUtils] Utterance cleaned up.");
    }
    if (onEndCallback) {
        onEndCallback();
        console.log("[speechUtils] onEndCallback called.");
        onEndCallback = null;
    }
    activeMessageId = null;
    console.log("[speechUtils] activeMessageId set to null.");
};

export const playTextToSpeech = (text, messageId, onSpeechEnd) => {
    console.log("[speechUtils] playTextToSpeech initiated. Text snippet:", text?.substring(0, 30) + "...", "Message ID:", messageId);
    if (!messageId) {
        console.error("[speechUtils] FATAL: playTextToSpeech called with undefined messageId. Aborting.");
        if (onSpeechEnd) onSpeechEnd(); // Still call callback to prevent hung states
        return;
    }
    if (!text || typeof window.speechSynthesis === 'undefined') {
        console.warn("[speechUtils] Speech synthesis not supported or no text provided for messageId:", messageId);
        if (onSpeechEnd) onSpeechEnd();
        return;
    }

    if (window.speechSynthesis.speaking) {
        console.log("[speechUtils] Speech synthesis is already active. Cancelling existing speech. Current activeMessageId:", activeMessageId);
        window.speechSynthesis.cancel(); // This will trigger onend for the current utterance
    }
    
    activeMessageId = messageId;
    onEndCallback = onSpeechEnd;
    console.log("[speechUtils] Set activeMessageId to:", activeMessageId);

    utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    
    utterance.onend = () => {
        console.log(`[speechUtils] Speech.onend triggered for utterance associated with message: ${messageId}. Current activeMessageId: ${activeMessageId}`);
        // Only cleanup if this is the active message that just finished
        if (activeMessageId === messageId) {
            cleanupUtteranceAndCallback();
        } else {
            console.log(`[speechUtils] onend for ${messageId}, but activeMessageId is ${activeMessageId} (or null if cancel came first). This utterance was likely cancelled for another.`);
            // If onEndCallback is still set and matches the original intent for *this* utterance's end, call it.
            // This handles the case where cancel() on a *different* utterance might still trigger this one's onEnd too soon.
            if (onEndCallback && activeMessageId !== messageId) { // if another message took over
                 // Check if the callback is still relevant for THIS message ending.
                 // If it was cancelled to play another, the new onEndCallback will be for the new one.
                 // This specific callback might no longer be the one to call if a new speech started.
                 // For simplicity, let the new active speech's onEnd handle its own state.
            }
        }
    };
    
    utterance.onerror = (event) => {
        console.error(`[speechUtils] Speech.onerror for message ${messageId}:`, event.error, "Utterance text:", utterance?.text?.substring(0,30)+"...");
        // Ensure cleanup happens even on error for this message.
        if (activeMessageId === messageId) {
            cleanupUtteranceAndCallback();
        }
    };

    console.log(`[speechUtils] Attempting to speak for message ${messageId}`);
    try {
        window.speechSynthesis.speak(utterance);
    } catch (e) {
        console.error("[speechUtils] Error calling window.speechSynthesis.speak():", e);
        if (activeMessageId === messageId) { // If this error occurred for the active message
            cleanupUtteranceAndCallback();
        }
    }
};

export const stopTextToSpeech = (messageIdToStop) => {
    console.log("[speechUtils] stopTextToSpeech called. messageIdToStop:", messageIdToStop, "Current activeMessageId:", activeMessageId, "Is speaking:", window.speechSynthesis?.speaking);
    if (typeof window.speechSynthesis === 'undefined' || !window.speechSynthesis.speaking) {
        console.log("[speechUtils] Not speaking or synthesis not supported, nothing to stop.");
        // If there's a lingering callback for the message we intended to stop, clear it.
        if (messageIdToStop && messageIdToStop === activeMessageId && onEndCallback) {
            console.log("[speechUtils] Clearing lingering callback for stopped message:", messageIdToStop);
            onEndCallback(); // Trigger UI update
            onEndCallback = null;
            activeMessageId = null;
        }
        return;
    }

    // If a specific message ID is provided, only stop if it's the one currently active.
    // If no ID is provided, stop whatever is speaking.
    if (!messageIdToStop || activeMessageId === messageIdToStop) {
        console.log(`[speechUtils] Attempting to cancel speech for message: ${activeMessageId || 'any active'}`);
        window.speechSynthesis.cancel(); // This will trigger the 'onend' of the current utterance.
                                         // The onEnd handler itself will call cleanupUtteranceAndCallback.
    } else {
        console.log(`[speechUtils] stopTextToSpeech called for ${messageIdToStop}, but activeMessageId is ${activeMessageId}. Not stopping this time.`);
    }
};

export const isCurrentlySpeaking = (messageIdToCheck) => {
    if (typeof window.speechSynthesis === 'undefined') return false;
    const speaking = window.speechSynthesis.speaking;
    if (messageIdToCheck) {
        return speaking && activeMessageId === messageIdToCheck;
    }
    return speaking;
};
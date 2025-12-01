/**
 * Message handling utilities for UI ↔ Main thread communication
 */

type MessageHandler = (message: any) => void;

/**
 * Send message to main thread
 */
export function sendMessage(message: any): void {
  console.log('[Message Handler] Sending to main thread:', message);
  parent.postMessage({ pluginMessage: message }, '*');
}

/**
 * Listen for messages from main thread
 */
export function onMessage(handler: MessageHandler): () => void {
  const wrappedHandler = (event: MessageEvent) => {
    console.log('[Message Handler] Received raw event:', event);
    const message = event.data.pluginMessage;
    if (message) {
      console.log('[Message Handler] Extracted pluginMessage:', message);
      handler(message);
    } else {
      console.log('[Message Handler] No pluginMessage in event data');
    }
  };

  window.addEventListener('message', wrappedHandler);

  // Return unsubscribe function
  return () => {
    window.removeEventListener('message', wrappedHandler);
  };
}

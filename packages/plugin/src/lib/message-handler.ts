/**
 * Message handling utilities for UI ↔ Main thread communication
 */

type MessageHandler = (message: any) => void;

/**
 * Send message to main thread
 */
export function sendMessage(message: any): void {
  parent.postMessage({ pluginMessage: message }, '*');
}

/**
 * Listen for messages from main thread
 */
export function onMessage(handler: MessageHandler): () => void {
  const wrappedHandler = (event: MessageEvent) => {
    const message = event.data.pluginMessage;
    if (message) {
      handler(message);
    }
  };

  window.addEventListener('message', wrappedHandler);

  // Return unsubscribe function
  return () => {
    window.removeEventListener('message', wrappedHandler);
  };
}

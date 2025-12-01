/**
 * WebSocket Client
 * Handles real-time connection to orchestrator backend
 */

import type { PrototypeConfig } from '@orchestrator/shared';

type MessageHandler = (message: any) => void;

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private handlers: Set<MessageHandler> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isIntentionallyClosed = false;

  constructor(private url: string) {}

  /**
   * Connect to WebSocket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);
        this.isIntentionallyClosed = false;

        this.ws.onopen = () => {
          console.log('✅ WebSocket connected');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            console.log('📨 Received:', message.type, message);
            this.handlers.forEach(handler => handler(message));
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('👋 WebSocket closed');
          if (!this.isIntentionallyClosed) {
            this.attemptReconnect();
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Send message to server
   */
  send(message: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('📤 Sending:', message.type, message);
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }

  /**
   * Add message handler
   */
  onMessage(handler: MessageHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  /**
   * Join session
   */
  joinSession(sessionId: string, deviceType: 'tv' | 'phone'): void {
    this.send({
      type: 'JOIN_SESSION',
      sessionId,
      deviceType,
    });
  }

  /**
   * Send navigation event
   */
  navigate(frameId: string): void {
    this.send({
      type: 'NAVIGATE',
      frameId,
    });
  }

  /**
   * Send interaction event
   */
  interact(interactionType: string, nodeId?: string, frameId?: string): void {
    this.send({
      type: 'INTERACTION',
      interactionType,
      nodeId,
      frameId,
    });
  }

  /**
   * Disconnect from server
   */
  disconnect(): void {
    this.isIntentionallyClosed = true;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;

    console.log(`Reconnecting in ${delay}ms... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect().catch(error => {
        console.error('Reconnection failed:', error);
      });
    }, delay);
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

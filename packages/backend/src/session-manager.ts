/**
 * Session Manager
 * Manages multiple prototype sessions and their configurations
 */

import { nanoid } from 'nanoid';
import type { PrototypeConfig } from '@orchestrator/shared';
import type { WebSocket } from 'ws';

export interface Device {
  id: string;
  type: 'tv' | 'phone';
  ws: WebSocket;
  currentFrameId?: string;
  joinedAt: Date;
}

export interface Session {
  id: string;
  config: PrototypeConfig;
  devices: Map<string, Device>;
  createdAt: Date;
  lastActivityAt: Date;
}

export class SessionManager {
  private sessions: Map<string, Session> = new Map();
  private readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Create a new session with configuration
   */
  createSession(config: PrototypeConfig): Session {
    const sessionId = nanoid(10);

    const session: Session = {
      id: sessionId,
      config,
      devices: new Map(),
      createdAt: new Date(),
      lastActivityAt: new Date(),
    };

    this.sessions.set(sessionId, session);
    console.log(`📝 Created session ${sessionId} for file: ${config.fileName}`);

    // Clean up old sessions
    this.cleanupInactiveSessions();

    return session;
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): Session | undefined {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivityAt = new Date();
    }
    return session;
  }

  /**
   * Add device to session
   */
  addDevice(sessionId: string, deviceType: 'tv' | 'phone', ws: WebSocket): Device | null {
    const session = this.getSession(sessionId);
    if (!session) {
      console.warn(`⚠️  Session ${sessionId} not found`);
      return null;
    }

    // Check if TV slot is already taken
    if (deviceType === 'tv') {
      const existingTV = Array.from(session.devices.values()).find(d => d.type === 'tv');
      if (existingTV) {
        console.warn(`⚠️  TV slot already taken in session ${sessionId}`);
        return null;
      }
    }

    // Check max players for phones
    if (deviceType === 'phone') {
      const phoneCount = Array.from(session.devices.values()).filter(d => d.type === 'phone').length;
      if (phoneCount >= session.config.maxPlayers) {
        console.warn(`⚠️  Max players (${session.config.maxPlayers}) reached in session ${sessionId}`);
        return null;
      }
    }

    const device: Device = {
      id: nanoid(8),
      type: deviceType,
      ws,
      currentFrameId: deviceType === 'tv'
        ? session.config.devices.tv.startingFrameId
        : session.config.devices.phone.startingFrameId,
      joinedAt: new Date(),
    };

    session.devices.set(device.id, device);
    console.log(`📱 Device ${device.id} (${deviceType}) joined session ${sessionId}`);

    return device;
  }

  /**
   * Remove device from session
   */
  removeDevice(sessionId: string, deviceId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const device = session.devices.get(deviceId);
    if (device) {
      session.devices.delete(deviceId);
      console.log(`👋 Device ${deviceId} (${device.type}) left session ${sessionId}`);
    }

    // Clean up empty sessions
    if (session.devices.size === 0) {
      this.sessions.delete(sessionId);
      console.log(`🗑️  Removed empty session ${sessionId}`);
    }
  }

  /**
   * Get all devices in session
   */
  getDevices(sessionId: string): Device[] {
    const session = this.sessions.get(sessionId);
    return session ? Array.from(session.devices.values()) : [];
  }

  /**
   * Get device by ID
   */
  getDevice(sessionId: string, deviceId: string): Device | undefined {
    const session = this.sessions.get(sessionId);
    return session?.devices.get(deviceId);
  }

  /**
   * Update device current frame
   */
  updateDeviceFrame(sessionId: string, deviceId: string, frameId: string): void {
    const device = this.getDevice(sessionId, deviceId);
    if (device) {
      device.currentFrameId = frameId;
    }
  }

  /**
   * Broadcast message to all devices in session except sender
   */
  broadcastToSession(sessionId: string, message: any, excludeDeviceId?: string): void {
    const devices = this.getDevices(sessionId);

    devices.forEach(device => {
      if (device.id !== excludeDeviceId && device.ws.readyState === 1) { // 1 = OPEN
        device.ws.send(JSON.stringify(message));
      }
    });
  }

  /**
   * Send message to specific device type(s) in session
   */
  sendToDeviceType(sessionId: string, deviceType: 'tv' | 'phone' | 'all-phones', message: any): void {
    const devices = this.getDevices(sessionId);

    devices.forEach(device => {
      const shouldSend =
        deviceType === 'tv' && device.type === 'tv' ||
        (deviceType === 'phone' || deviceType === 'all-phones') && device.type === 'phone';

      if (shouldSend && device.ws.readyState === 1) {
        device.ws.send(JSON.stringify(message));
      }
    });
  }

  /**
   * Clean up sessions that have been inactive
   */
  private cleanupInactiveSessions(): void {
    const now = Date.now();

    for (const [sessionId, session] of this.sessions.entries()) {
      const inactiveTime = now - session.lastActivityAt.getTime();

      if (inactiveTime > this.SESSION_TIMEOUT && session.devices.size === 0) {
        this.sessions.delete(sessionId);
        console.log(`🗑️  Cleaned up inactive session ${sessionId}`);
      }
    }
  }

  /**
   * Get session statistics
   */
  getStats() {
    return {
      totalSessions: this.sessions.size,
      sessions: Array.from(this.sessions.values()).map(session => ({
        id: session.id,
        fileName: session.config.fileName,
        deviceCount: session.devices.size,
        devices: Array.from(session.devices.values()).map(d => ({
          type: d.type,
          joinedAt: d.joinedAt,
        })),
        createdAt: session.createdAt,
        lastActivityAt: session.lastActivityAt,
      })),
    };
  }
}

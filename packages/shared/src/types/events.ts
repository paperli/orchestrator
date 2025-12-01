/**
 * WebSocket event types for real-time communication
 */

import type { DeviceType } from './config';

// Figma Embed API events (from embedded prototypes)
export type FigmaEventType =
  | 'INITIAL_LOAD'
  | 'PRESENTED_NODE_CHANGED'
  | 'MOUSE_PRESS_OR_RELEASE'
  | 'NEW_STATE'
  | 'REQUEST_CLOSE'
  | 'LOGIN_SCREEN_SHOWN'
  | 'PASSWORD_SCREEN_SHOWN';

// Figma Embed API commands (to embedded prototypes)
export type FigmaCommandType =
  | 'NAVIGATE_FORWARD'
  | 'NAVIGATE_BACKWARD'
  | 'RESTART'
  | 'NAVIGATE_TO_FRAME_AND_CLOSE_OVERLAYS'
  | 'CHANGE_COMPONENT_STATE';

export interface FigmaEvent {
  type: FigmaEventType;
  deviceId: string;
  deviceType: DeviceType;
  sessionId: string;
  data: unknown;
  timestamp: string;
}

export interface FigmaCommand {
  type: FigmaCommandType;
  data?: {
    nodeId?: string;
    newVariantId?: string;
  };
}

// WebSocket events (between client and server)
export interface ClientToServerEvents {
  register: (data: {
    sessionId: string;
    deviceType: DeviceType;
  }) => void;
  'figma-event': (event: FigmaEvent) => void;
  disconnect: () => void;
}

export interface ServerToClientEvents {
  registered: (data: {
    deviceId: string;
    session: {
      id: string;
      playerCount: number;
    };
  }) => void;
  command: (command: FigmaCommand) => void;
  'session-update': (data: {
    playerCount: number;
    connectedDevices: string[];
  }) => void;
  error: (data: { message: string; code?: string }) => void;
}

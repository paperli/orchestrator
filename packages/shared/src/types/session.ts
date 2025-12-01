/**
 * Session and device types for runtime orchestration
 */

import type { DeviceType } from './config';

export interface Device {
  id: string;
  type: DeviceType;
  sessionId: string;
  connectedAt: string;
  lastSeen: string;
}

export interface Session {
  id: string;
  sessionCode: string;
  fileKey: string;
  configId: string;
  tvDeviceId: string | null;
  phoneDeviceIds: string[];
  maxPlayers: number;
  createdAt: string;
  expiresAt: string;
  state: SessionState;
}

export interface SessionState {
  currentQuestionIndex?: number;
  playersAnswered?: string[]; // Device IDs
  customState?: Record<string, unknown>; // For future expansion
}

export interface JoinSessionRequest {
  sessionCode: string;
  deviceType: DeviceType;
}

export interface JoinSessionResponse {
  success: boolean;
  deviceId?: string;
  session?: Session;
  error?: string;
  errorCode?: 'SESSION_NOT_FOUND' | 'SESSION_FULL' | 'INVALID_CODE';
}

/**
 * WebSocket Handler
 * Manages real-time communication between devices
 */

import type { WebSocketServer, WebSocket } from 'ws';
import type { SessionManager } from './session-manager.js';
import { RuleEngine } from './rule-engine.js';

interface WSMessage {
  type: string;
  [key: string]: any;
}

interface ConnectionState {
  sessionId?: string;
  deviceId?: string;
}

export function setupWebSocket(wss: WebSocketServer, sessionManager: SessionManager): void {
  wss.on('connection', (ws: WebSocket) => {
    console.log('🔌 New WebSocket connection');

    const state: ConnectionState = {};

    ws.on('message', (data: Buffer) => {
      try {
        const message: WSMessage = JSON.parse(data.toString());
        handleMessage(ws, message, state, sessionManager);
      } catch (error) {
        console.error('Error parsing message:', error);
        sendError(ws, 'Invalid message format');
      }
    });

    ws.on('close', () => {
      if (state.sessionId && state.deviceId) {
        sessionManager.removeDevice(state.sessionId, state.deviceId);

        // Notify other devices
        sessionManager.broadcastToSession(state.sessionId, {
          type: 'DEVICE_LEFT',
          deviceId: state.deviceId,
        });
      }
      console.log('👋 WebSocket connection closed');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });
}

function handleMessage(
  ws: WebSocket,
  message: WSMessage,
  state: ConnectionState,
  sessionManager: SessionManager
): void {
  console.log(`📨 Received: ${message.type}`, message);

  switch (message.type) {
    case 'JOIN_SESSION':
      handleJoinSession(ws, message, state, sessionManager);
      break;

    case 'NAVIGATE':
      handleNavigate(message, state, sessionManager);
      break;

    case 'INTERACTION':
      handleInteraction(message, state, sessionManager);
      break;

    case 'PING':
      ws.send(JSON.stringify({ type: 'PONG' }));
      break;

    default:
      console.warn(`Unknown message type: ${message.type}`);
  }
}

function handleJoinSession(
  ws: WebSocket,
  message: WSMessage,
  state: ConnectionState,
  sessionManager: SessionManager
): void {
  const { sessionId, deviceType } = message;

  if (!sessionId || !deviceType) {
    sendError(ws, 'Missing sessionId or deviceType');
    return;
  }

  const session = sessionManager.getSession(sessionId);
  if (!session) {
    sendError(ws, 'Session not found');
    return;
  }

  const device = sessionManager.addDevice(sessionId, deviceType, ws);
  if (!device) {
    sendError(ws, deviceType === 'tv' ? 'TV slot already taken' : 'Session is full');
    return;
  }

  // Update connection state
  state.sessionId = sessionId;
  state.deviceId = device.id;

  // Send success response
  ws.send(JSON.stringify({
    type: 'JOIN_SUCCESS',
    deviceId: device.id,
    deviceType: device.type,
    config: session.config,
    startingFrameId: device.currentFrameId,
  }));

  // Notify other devices
  sessionManager.broadcastToSession(sessionId, {
    type: 'DEVICE_JOINED',
    deviceId: device.id,
    deviceType: device.type,
  }, device.id);

  console.log(`✅ Device ${device.id} joined session ${sessionId} as ${deviceType}`);
}

function handleNavigate(
  message: WSMessage,
  state: ConnectionState,
  sessionManager: SessionManager
): void {
  const { frameId } = message;

  if (!state.sessionId || !state.deviceId) {
    console.warn('Navigate called without session');
    return;
  }

  if (!frameId) {
    console.warn('Navigate called without frameId');
    return;
  }

  // Update device's current frame
  sessionManager.updateDeviceFrame(state.sessionId, state.deviceId, frameId);

  // Broadcast to other devices
  sessionManager.broadcastToSession(state.sessionId, {
    type: 'DEVICE_NAVIGATED',
    deviceId: state.deviceId,
    frameId,
  }, state.deviceId);

  console.log(`🧭 Device ${state.deviceId} navigated to frame ${frameId}`);
}

function handleInteraction(
  message: WSMessage,
  state: ConnectionState,
  sessionManager: SessionManager
): void {
  const { interactionType, nodeId, frameId } = message;

  if (!state.sessionId || !state.deviceId) {
    console.warn('Interaction called without session');
    return;
  }

  const session = sessionManager.getSession(state.sessionId);
  if (!session) return;

  const device = sessionManager.getDevice(state.sessionId, state.deviceId);
  if (!device) return;

  console.log(`🎯 Interaction: ${interactionType} on ${nodeId || frameId} from ${device.type}`);

  // Process rules
  const ruleEngine = new RuleEngine(session.config);
  const triggeredRules = ruleEngine.findMatchingRules({
    device: device.type,
    interactionType,
    nodeId,
    frameId: frameId || device.currentFrameId,
  });

  // Execute triggered rules
  triggeredRules.forEach(rule => {
    if (!rule.enabled) return;

    rule.actions.forEach(action => {
      switch (action.type) {
        case 'NAVIGATE_TO_FRAME':
          if (action.frameId) {
            sessionManager.sendToDeviceType(state.sessionId!, rule.target, {
              type: 'EXECUTE_ACTION',
              action: 'NAVIGATE',
              frameId: action.frameId,
              frameName: action.frameName,
              triggeredBy: state.deviceId,
              ruleId: rule.id,
              ruleName: rule.name,
            });
            console.log(`  → Rule "${rule.name}": Navigate ${rule.target} to ${action.frameName}`);
          }
          break;

        case 'RESTART':
          sessionManager.sendToDeviceType(state.sessionId!, rule.target, {
            type: 'EXECUTE_ACTION',
            action: 'RESTART',
            triggeredBy: state.deviceId,
            ruleId: rule.id,
            ruleName: rule.name,
          });
          console.log(`  → Rule "${rule.name}": Restart ${rule.target}`);
          break;

        case 'CHANGE_VARIANT':
          if (action.nodeId && action.variantId) {
            sessionManager.sendToDeviceType(state.sessionId!, rule.target, {
              type: 'EXECUTE_ACTION',
              action: 'CHANGE_VARIANT',
              nodeId: action.nodeId,
              variantId: action.variantId,
              triggeredBy: state.deviceId,
              ruleId: rule.id,
              ruleName: rule.name,
            });
            console.log(`  → Rule "${rule.name}": Change variant on ${rule.target}`);
          }
          break;
      }
    });
  });
}

function sendError(ws: WebSocket, error: string): void {
  ws.send(JSON.stringify({
    type: 'ERROR',
    error,
  }));
}

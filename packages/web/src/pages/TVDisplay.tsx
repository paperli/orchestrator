/**
 * TV Display View
 * Main screen that shows prototype and responds to phone interactions
 */

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FigmaEmbed } from '../components/FigmaEmbed';
import { WebSocketClient } from '../lib/websocket-client';
import type { PrototypeConfig } from '@orchestrator/shared';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001/ws';

export function TVDisplay() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [ws] = useState(() => new WebSocketClient(WS_URL));
  const [config, setConfig] = useState<PrototypeConfig | null>(null);
  const [currentFrameId, setCurrentFrameId] = useState<string>('');
  const [deviceId, setDeviceId] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectedDevices, setConnectedDevices] = useState<number>(0);

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided');
      return;
    }

    // Connect to WebSocket
    ws.connect()
      .then(() => {
        setIsConnected(true);
        ws.joinSession(sessionId, 'tv');
      })
      .catch(err => {
        setError('Failed to connect to server');
        console.error(err);
      });

    // Set up message handlers
    const unsubscribe = ws.onMessage((message) => {
      switch (message.type) {
        case 'JOIN_SUCCESS':
          console.log('Joined session as TV:', message);
          setDeviceId(message.deviceId);
          setConfig(message.config);
          setCurrentFrameId(message.startingFrameId);
          break;

        case 'EXECUTE_ACTION':
          console.log('Executing action:', message);
          if (message.action === 'NAVIGATE' && message.frameId) {
            setCurrentFrameId(message.frameId);
          } else if (message.action === 'RESTART') {
            // Restart to initial frame
            if (config) {
              setCurrentFrameId(config.devices.tv.startingFrameId);
            }
          }
          break;

        case 'DEVICE_JOINED':
          console.log('Device joined:', message);
          setConnectedDevices(prev => prev + 1);
          break;

        case 'DEVICE_LEFT':
          console.log('Device left:', message);
          setConnectedDevices(prev => Math.max(0, prev - 1));
          break;

        case 'ERROR':
          setError(message.error);
          break;
      }
    });

    return () => {
      unsubscribe();
      ws.disconnect();
    };
  }, [sessionId, ws]);

  const handleNodeChange = (nodeId: string) => {
    setCurrentFrameId(nodeId);
    ws.navigate(nodeId);
  };

  if (error) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        flexDirection: 'column',
        padding: '20px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <h1 style={{ margin: '0 0 8px 0' }}>Error</h1>
        <p style={{ margin: 0, color: '#666' }}>{error}</p>
      </div>
    );
  }

  if (!config || !currentFrameId) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        flexDirection: 'column',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f0f0f0',
          borderTop: '4px solid #333',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}></div>
        <p style={{ marginTop: '16px' }}>Connecting to session...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#000' }}>
      {/* Status bar */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: '8px 16px',
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '12px',
      }}>
        <div>
          <span style={{ opacity: 0.7 }}>📺 TV Display</span>
          <span style={{ marginLeft: '16px', opacity: 0.7 }}>
            {config.fileName}
          </span>
        </div>
        <div>
          <span style={{
            display: 'inline-block',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: isConnected ? '#00ff00' : '#ff0000',
            marginRight: '8px',
          }}></span>
          <span style={{ opacity: 0.7 }}>
            {connectedDevices} phone{connectedDevices !== 1 ? 's' : ''} connected
          </span>
        </div>
      </div>

      {/* Figma embed */}
      <FigmaEmbed
        fileKey={config.fileKey}
        nodeId={currentFrameId}
        onNodeChange={handleNodeChange}
      />
    </div>
  );
}

/**
 * Figma Embed Component
 * Renders Figma prototypes using the Embed API
 */

import { useEffect, useRef, useState } from 'react';
import type { PrototypeConfig } from '@orchestrator/shared';

interface FigmaEmbedProps {
  fileKey: string;
  nodeId: string;
  onNodeChange?: (nodeId: string) => void;
  onInteraction?: (event: any) => void;
}

export function FigmaEmbed({ fileKey, nodeId, onNodeChange, onInteraction }: FigmaEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for invalid file key
  if (!fileKey || fileKey === 'unknown') {
    return (
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        padding: '40px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '24px' }}>⚠️</div>
        <h2 style={{ margin: '0 0 16px 0' }}>File Key Not Available</h2>
        <p style={{ margin: '0 0 24px 0', color: '#666', maxWidth: '500px' }}>
          The Figma file key could not be retrieved. This usually happens when:
        </p>
        <ul style={{ textAlign: 'left', color: '#666', marginBottom: '24px' }}>
          <li>The plugin is running in development mode</li>
          <li>The file hasn't been saved to Figma cloud</li>
        </ul>
        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
          <strong>To fix:</strong> Save your Figma file to the cloud and reload the plugin.
        </p>
      </div>
    );
  }

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    // Listen for messages from Figma embed
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from Figma
      if (!event.origin.includes('figma.com')) return;

      const message = event.data;

      switch (message.type) {
        case 'READY':
          console.log('Figma embed ready');
          setIsLoading(false);
          break;

        case 'NODE_CHANGE':
          console.log('Node changed:', message.nodeId);
          if (onNodeChange) {
            onNodeChange(message.nodeId);
          }
          break;

        case 'INTERACTION':
          console.log('Interaction:', message);
          if (onInteraction) {
            onInteraction(message);
          }
          break;

        case 'ERROR':
          console.error('Figma embed error:', message.error);
          setError(message.error);
          break;
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onNodeChange, onInteraction]);

  // Navigate to different node
  useEffect(() => {
    if (!iframeRef.current || isLoading) return;

    const iframe = iframeRef.current;
    iframe.contentWindow?.postMessage({
      type: 'NAVIGATE',
      nodeId,
    }, '*');
  }, [nodeId, isLoading]);

  const embedUrl = `https://www.figma.com/embed?embed_host=orchestrator&url=https://www.figma.com/file/${fileKey}?node-id=${encodeURIComponent(nodeId)}&hotspot-hints=0&hide-ui=1`;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>Loading...</div>
        </div>
      )}

      {error && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: 'red',
        }}>
          <div style={{ fontSize: '18px', marginBottom: '8px' }}>Error</div>
          <div>{error}</div>
        </div>
      )}

      <iframe
        ref={iframeRef}
        src={embedUrl}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: error ? 'none' : 'block',
        }}
        allowFullScreen
      />
    </div>
  );
}

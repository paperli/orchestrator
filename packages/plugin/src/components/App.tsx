/**
 * Main App component
 * Handles plugin initialization and routing between sections
 */

import { useEffect, useState } from 'react';
import type { PrototypeConfig } from '@orchestrator/shared';
import { usePluginStore } from '../store/plugin-store';
import { Header } from './Header';
import { Setup } from './Setup/Setup';
import { Rules } from './Rules/Rules';
import { Publish } from './Publish/Publish';
import { sendMessage, onMessage } from '../lib/message-handler';

export type Section = 'setup' | 'rules' | 'publish';

export function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSection, setCurrentSection] = useState<Section>('setup');

  const { config, fileInfo, setConfig, setFileInfo } = usePluginStore();

  useEffect(() => {
    console.log('[UI] App mounted, sending INIT message');

    // Initialize plugin
    sendMessage({ type: 'INIT' });

    // Set up message listeners
    const unsubscribe = onMessage(msg => {
      console.log('[UI] Received message:', msg.type, msg);

      switch (msg.type) {
        case 'INIT_SUCCESS':
          console.log('[UI] Init successful, config:', msg.config);
          setConfig(msg.config);
          setFileInfo(msg.fileInfo);
          setIsLoading(false);

          // Navigate to appropriate section
          if (msg.config) {
            setCurrentSection('rules');
          } else {
            setCurrentSection('setup');
          }
          break;

        case 'INIT_ERROR':
          console.error('[UI] Init error:', msg.error);
          setError(msg.error);
          setIsLoading(false);
          break;

        case 'SAVE_SUCCESS':
          console.log('[UI] Config saved successfully');
          // The main thread will send updated config, so wait for that
          break;

        case 'SAVE_ERROR':
          console.error('[UI] Save error:', msg.error);
          setError(msg.error);
          break;

        case 'CONFIG_UPDATED':
          console.log('[UI] Config updated:', msg.config);
          setConfig(msg.config);
          // Navigate to Rules after successful save
          setCurrentSection('rules');
          break;

        case 'ERROR':
          console.error('[UI] Error:', msg.error);
          setError(msg.error);
          break;
      }
    });

    return unsubscribe;
  }, [setConfig, setFileInfo]);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Loading plugin...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>Error</h3>
        <p>{error}</p>
        <button
          onClick={() => {
            setError(null);
            setIsLoading(true);
            sendMessage({ type: 'INIT' });
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="app">
      <Header
        currentSection={currentSection}
        onSectionChange={setCurrentSection}
        hasConfig={!!config}
      />

      <main className="app-content">
        {currentSection === 'setup' && <Setup />}
        {currentSection === 'rules' && <Rules />}
        {currentSection === 'publish' && <Publish />}
      </main>
    </div>
  );
}

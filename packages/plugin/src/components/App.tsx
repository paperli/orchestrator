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
    // Initialize plugin
    sendMessage({ type: 'INIT' });

    // Set up message listeners
    const unsubscribe = onMessage(msg => {
      switch (msg.type) {
        case 'INIT_SUCCESS':
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
          setError(msg.error);
          setIsLoading(false);
          break;

        case 'ERROR':
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

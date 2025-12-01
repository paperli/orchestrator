/**
 * Publish section component
 * Handles publishing configuration and displaying URLs
 */

import { useState, useEffect } from 'react';
import { usePluginStore } from '../../store/plugin-store';
import { sendMessage, onMessage } from '../../lib/message-handler';
import type { PublishResponse } from '@orchestrator/shared';
import './Publish.css';

export function Publish() {
  const { config } = usePluginStore();
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedData, setPublishedData] = useState<PublishResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onMessage(msg => {
      if (msg.type === 'PUBLISH_SUCCESS') {
        setPublishedData(msg.result);
        setIsPublishing(false);
        setError(null);
      } else if (msg.type === 'PUBLISH_ERROR') {
        setError(msg.error);
        setIsPublishing(false);
      }
    });

    return unsubscribe;
  }, []);

  if (!config) {
    return (
      <div className="publish">
        <div className="publish-content">
          <div className="empty-state">
            <div className="empty-state-icon">⚠️</div>
            <h3>No configuration found</h3>
            <p>Please complete the setup first.</p>
          </div>
        </div>
      </div>
    );
  }

  const handlePublish = () => {
    setIsPublishing(true);
    setError(null);
    sendMessage({ type: 'PUBLISH_CONFIG', config });
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      // Could show a toast notification here
      console.log('URL copied to clipboard');
    });
  };

  return (
    <div className="publish">
      <div className="publish-header">
        <h2>Publish Configuration</h2>
        <p className="description">
          Publish your multi-device prototype to get session URLs.
        </p>
      </div>

      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
          <button className="error-close" onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="publish-content">
        {!publishedData ? (
          <div className="publish-card">
            <h3>Ready to Publish</h3>
            <p className="help-text">
              Your configuration will be sent to the orchestrator backend
              and you'll receive URLs for testing on TV and mobile devices.
            </p>

            <div className="config-summary">
              <div className="summary-item">
                <span className="summary-label">File:</span>
                <span className="summary-value">{config.fileName}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">TV Frame:</span>
                <span className="summary-value">{config.devices.tv.startingFrameName}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Phone Frame:</span>
                <span className="summary-value">{config.devices.phone.startingFrameName}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Rules:</span>
                <span className="summary-value">{config.rules.length} rule{config.rules.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Max Players:</span>
                <span className="summary-value">{config.maxPlayers}</span>
              </div>
            </div>

            <button
              className="button-primary button-lg"
              onClick={handlePublish}
              disabled={isPublishing}
            >
              {isPublishing ? 'Publishing...' : 'Publish Configuration'}
            </button>
          </div>
        ) : (
          <div className="publish-success">
            <div className="success-icon">✓</div>
            <h3>Published Successfully!</h3>
            <p className="help-text">
              Your prototype is live. Use these URLs to test your multi-device experience.
            </p>

            <div className="url-card">
              <div className="url-header">
                <span className="url-icon">📺</span>
                <h4>TV Display URL</h4>
              </div>
              <div className="url-content">
                <input
                  type="text"
                  className="url-input"
                  value={publishedData.tvUrl}
                  readOnly
                />
                <button
                  className="button-secondary button-sm"
                  onClick={() => handleCopyUrl(publishedData.tvUrl)}
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="url-card">
              <div className="url-header">
                <span className="url-icon">📱</span>
                <h4>Phone Controller URL</h4>
              </div>
              <div className="url-content">
                <input
                  type="text"
                  className="url-input"
                  value={publishedData.phoneUrl}
                  readOnly
                />
                <button
                  className="button-secondary button-sm"
                  onClick={() => handleCopyUrl(publishedData.phoneUrl)}
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="publish-info">
              <p className="info-text">
                <strong>Session ID:</strong> {publishedData.configId}
              </p>
              <p className="info-text">
                <strong>Published:</strong> {new Date(publishedData.publishedAt).toLocaleString()}
              </p>
            </div>

            <button
              className="button-secondary button-lg"
              onClick={() => setPublishedData(null)}
            >
              Publish Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

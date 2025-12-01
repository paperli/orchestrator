/**
 * Setup section component
 * Allows designers to configure device roles and starting frames
 */

import { useState, useEffect } from 'react';
import { sendMessage, onMessage } from '../../lib/message-handler';
import { usePluginStore } from '../../store/plugin-store';
import type { PrototypeConfig } from '@orchestrator/shared';
import './Setup.css';

type SelectingDevice = 'tv' | 'phone' | null;

export function Setup() {
  const { config, fileInfo, setConfig } = usePluginStore();

  const [tvFrameId, setTvFrameId] = useState<string>('');
  const [tvFrameName, setTvFrameName] = useState<string>('');
  const [phoneFrameId, setPhoneFrameId] = useState<string>('');
  const [phoneFrameName, setPhoneFrameName] = useState<string>('');
  const [selectingDevice, setSelectingDevice] = useState<SelectingDevice>(null);
  const [error, setError] = useState<string | null>(null);

  // Load existing config if available
  useEffect(() => {
    if (config) {
      setTvFrameId(config.devices.tv.startingFrameId);
      setTvFrameName(config.devices.tv.startingFrameName);
      setPhoneFrameId(config.devices.phone.startingFrameId);
      setPhoneFrameName(config.devices.phone.startingFrameName);
    }
  }, [config]);

  // Listen for selected node response
  useEffect(() => {
    const unsubscribe = onMessage(msg => {
      if (msg.type === 'SELECTED_NODE') {
        console.log('[Setup] Received selected node:', msg);

        if (msg.error) {
          setError(msg.error);
          setSelectingDevice(null);
          return;
        }

        if (!msg.node) {
          setError('No node selected');
          setSelectingDevice(null);
          return;
        }

        // Validate it's a frame
        if (msg.node.type !== 'FRAME') {
          setError(`Please select a frame. Selected: ${msg.node.type}`);
          setSelectingDevice(null);
          return;
        }

        // Set the selected frame
        if (selectingDevice === 'tv') {
          setTvFrameId(msg.node.id);
          setTvFrameName(msg.node.name);
        } else if (selectingDevice === 'phone') {
          setPhoneFrameId(msg.node.id);
          setPhoneFrameName(msg.node.name);
        }

        setError(null);
        setSelectingDevice(null);
      }
    });

    return unsubscribe;
  }, [selectingDevice]);

  const handleSelectFrame = (device: 'tv' | 'phone') => {
    console.log('[Setup] Selecting frame for:', device);
    setSelectingDevice(device);
    setError(null);
    sendMessage({ type: 'GET_SELECTED_NODE' });
  };

  const handleSaveAndContinue = () => {
    if (!tvFrameId || !phoneFrameId || !fileInfo) {
      setError('Please select both TV and Phone frames');
      return;
    }

    // Check if same frame selected for both
    if (tvFrameId === phoneFrameId) {
      setError('TV and Phone cannot use the same frame');
      return;
    }

    // Create configuration
    const newConfig: PrototypeConfig = {
      configVersion: '1.0.0',
      fileKey: fileInfo.key,
      fileName: fileInfo.name,
      devices: {
        tv: {
          type: 'tv',
          startingFrameId: tvFrameId,
          startingFrameName: tvFrameName,
        },
        phone: {
          type: 'phone',
          startingFrameId: phoneFrameId,
          startingFrameName: phoneFrameName,
        },
      },
      rules: [],
      maxPlayers: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log('[Setup] Saving config:', newConfig);
    sendMessage({ type: 'SAVE_CONFIG', config: newConfig });
  };

  return (
    <div className="setup">
      <div className="setup-header">
        <h2>Multi-Device Setup</h2>
        <p className="description">
          Configure which frames represent your TV and Phone experiences.
        </p>
      </div>

      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
          <button className="error-close" onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="setup-content">
        <div className="device-card">
          <div className="device-card-header">
            <div className="device-icon tv">📺</div>
            <h3>TV Display</h3>
          </div>

          <div className="device-card-body">
            <label className="label">Starting Frame</label>
            <div className="frame-picker">
              {tvFrameName ? (
                <div className="frame-selected">
                  <span className="frame-name">{tvFrameName}</span>
                  <button
                    className="button-secondary button-sm"
                    onClick={() => {
                      setTvFrameId('');
                      setTvFrameName('');
                    }}
                  >
                    Clear
                  </button>
                </div>
              ) : (
                <button
                  className="button-primary"
                  onClick={() => handleSelectFrame('tv')}
                  disabled={selectingDevice !== null}
                >
                  {selectingDevice === 'tv' ? 'Select a frame...' : 'Select Frame from Canvas'}
                </button>
              )}
            </div>
            <p className="help-text">
              {selectingDevice === 'tv'
                ? 'Click on a frame in the canvas, then this will update'
                : 'Select the frame that will be shown first on the TV'}
            </p>
          </div>
        </div>

        <div className="device-card">
          <div className="device-card-header">
            <div className="device-icon phone">📱</div>
            <h3>Phone Controller</h3>
          </div>

          <div className="device-card-body">
            <label className="label">Starting Frame</label>
            <div className="frame-picker">
              {phoneFrameName ? (
                <div className="frame-selected">
                  <span className="frame-name">{phoneFrameName}</span>
                  <button
                    className="button-secondary button-sm"
                    onClick={() => {
                      setPhoneFrameId('');
                      setPhoneFrameName('');
                    }}
                  >
                    Clear
                  </button>
                </div>
              ) : (
                <button
                  className="button-primary"
                  onClick={() => handleSelectFrame('phone')}
                  disabled={selectingDevice !== null}
                >
                  {selectingDevice === 'phone' ? 'Select a frame...' : 'Select Frame from Canvas'}
                </button>
              )}
            </div>
            <p className="help-text">
              {selectingDevice === 'phone'
                ? 'Click on a frame in the canvas, then this will update'
                : 'Select the frame that will be shown first on phones'}
            </p>
          </div>
        </div>
      </div>

      <div className="setup-footer">
        <button
          className="button-primary button-lg"
          disabled={!tvFrameId || !phoneFrameId}
          onClick={handleSaveAndContinue}
        >
          Continue to Rules
        </button>
      </div>
    </div>
  );
}

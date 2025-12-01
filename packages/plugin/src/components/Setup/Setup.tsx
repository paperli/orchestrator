/**
 * Setup section component
 * Allows designers to configure device roles and starting frames
 */

import { useState } from 'react';
import './Setup.css';

export function Setup() {
  const [tvFrameId, setTvFrameId] = useState<string>('');
  const [tvFrameName, setTvFrameName] = useState<string>('');
  const [phoneFrameId, setPhoneFrameId] = useState<string>('');
  const [phoneFrameName, setPhoneFrameName] = useState<string>('');

  return (
    <div className="setup">
      <div className="setup-header">
        <h2>Multi-Device Setup</h2>
        <p className="description">
          Configure which frames represent your TV and Phone experiences.
        </p>
      </div>

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
                <button className="button-primary">
                  Select Frame from Canvas
                </button>
              )}
            </div>
            <p className="help-text">
              Select the frame that will be shown first on the TV
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
                <button className="button-primary">
                  Select Frame from Canvas
                </button>
              )}
            </div>
            <p className="help-text">
              Select the frame that will be shown first on phones
            </p>
          </div>
        </div>
      </div>

      <div className="setup-footer">
        <button
          className="button-primary button-lg"
          disabled={!tvFrameId || !phoneFrameId}
        >
          Continue to Rules
        </button>
      </div>
    </div>
  );
}

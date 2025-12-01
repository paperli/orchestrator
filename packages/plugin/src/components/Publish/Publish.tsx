/**
 * Publish section component
 * Handles publishing configuration and displaying URLs
 */

import './Publish.css';

export function Publish() {
  return (
    <div className="publish">
      <div className="publish-header">
        <h2>Publish Configuration</h2>
        <p className="description">
          Publish your multi-device prototype to get session URLs.
        </p>
      </div>

      <div className="publish-content">
        <div className="publish-card">
          <h3>Ready to Publish</h3>
          <p>
            Your configuration will be sent to the orchestrator backend
            and you'll receive URLs for testing.
          </p>

          <button className="button-primary button-lg">
            Publish Configuration
          </button>
        </div>
      </div>
    </div>
  );
}

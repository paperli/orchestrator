/**
 * Rules section component
 * Allows designers to create and manage cross-device rules
 */

import './Rules.css';

export function Rules() {
  return (
    <div className="rules">
      <div className="rules-header">
        <h2>Cross-Device Rules</h2>
        <p className="description">
          Define how TV and Phone prototypes interact with each other.
        </p>
      </div>

      <div className="rules-content">
        <div className="empty-state">
          <div className="empty-state-icon">🔗</div>
          <h3>No rules yet</h3>
          <p>
            Create your first rule to connect TV and phone flows.
          </p>
          <button className="button-primary">
            + Create First Rule
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Rules section component
 * Allows designers to create and manage cross-device rules
 */

import { useState } from 'react';
import { usePluginStore } from '../../store/plugin-store';
import { sendMessage } from '../../lib/message-handler';
import type { Rule } from '@orchestrator/shared';
import { RuleEditor } from './RuleEditor';
import './Rules.css';

export function Rules() {
  const { config, setConfig } = usePluginStore();
  const [isCreatingRule, setIsCreatingRule] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);

  if (!config) {
    return (
      <div className="rules">
        <div className="rules-content">
          <div className="empty-state">
            <div className="empty-state-icon">⚠️</div>
            <h3>No configuration found</h3>
            <p>Please complete the setup first.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleCreateRule = () => {
    setIsCreatingRule(true);
  };

  const handleSaveRule = (rule: Rule) => {
    if (!config) return;

    const existingRuleIndex = config.rules.findIndex(r => r.id === rule.id);
    let updatedRules;

    if (existingRuleIndex >= 0) {
      // Update existing rule
      updatedRules = [...config.rules];
      updatedRules[existingRuleIndex] = rule;
    } else {
      // Add new rule
      updatedRules = [...config.rules, rule];
    }

    const updatedConfig = {
      ...config,
      rules: updatedRules,
      updatedAt: new Date().toISOString(),
    };

    sendMessage({ type: 'SAVE_CONFIG', config: updatedConfig });
    setIsCreatingRule(false);
    setEditingRuleId(null);
  };

  const handleDeleteRule = (ruleId: string) => {
    if (!config) return;

    const updatedRules = config.rules.filter(r => r.id !== ruleId);
    const updatedConfig = {
      ...config,
      rules: updatedRules,
      updatedAt: new Date().toISOString(),
    };

    sendMessage({ type: 'SAVE_CONFIG', config: updatedConfig });
  };

  const handleToggleRule = (ruleId: string) => {
    if (!config) return;

    const updatedRules = config.rules.map(r =>
      r.id === ruleId ? { ...r, enabled: !r.enabled } : r
    );
    const updatedConfig = {
      ...config,
      rules: updatedRules,
      updatedAt: new Date().toISOString(),
    };

    sendMessage({ type: 'SAVE_CONFIG', config: updatedConfig });
  };

  const getTriggerLabel = (rule: Rule): string => {
    switch (rule.trigger.type) {
      case 'FRAME_VISIBLE':
        return `When ${rule.trigger.device} shows "${rule.trigger.frameName}"`;
      case 'TAP_ELEMENT':
        return `When user taps "${rule.trigger.nodeName}" on ${rule.trigger.device}`;
      case 'VARIANT_CHANGE':
        return `When "${rule.trigger.nodeName}" changes to "${rule.trigger.variantName}"`;
      default:
        return 'Unknown trigger';
    }
  };

  const getActionLabel = (rule: Rule): string => {
    const action = rule.actions[0]; // For now, show first action
    if (!action) return 'No action';

    switch (action.type) {
      case 'NAVIGATE_TO_FRAME':
        return `Navigate ${rule.target} to "${action.frameName}"`;
      case 'RESTART':
        return `Restart ${rule.target}`;
      case 'CHANGE_VARIANT':
        return `Change "${action.nodeName}" to "${action.variantName}"`;
      default:
        return 'Unknown action';
    }
  };

  const editingRule = editingRuleId ? config.rules.find(r => r.id === editingRuleId) : undefined;

  return (
    <div className="rules">
      <div className="rules-header">
        <h2>Cross-Device Rules</h2>
        <p className="description">
          Define how TV and Phone prototypes interact with each other.
        </p>
      </div>

      <div className="rules-content">
        {config.rules.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔗</div>
            <h3>No rules yet</h3>
            <p>Create your first rule to connect TV and phone flows.</p>
            <button className="button-primary" onClick={handleCreateRule}>
              + Create First Rule
            </button>
          </div>
        ) : (
          <>
            <div className="rules-list">
              {config.rules.map(rule => (
                <div key={rule.id} className={`rule-card ${!rule.enabled ? 'disabled' : ''}`}>
                  <div className="rule-header">
                    <div className="rule-title">
                      <h3>{rule.name}</h3>
                      <span className={`rule-status ${rule.enabled ? 'enabled' : 'disabled'}`}>
                        {rule.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="rule-actions">
                      <button
                        className="button-icon"
                        onClick={() => handleToggleRule(rule.id)}
                        title={rule.enabled ? 'Disable rule' : 'Enable rule'}
                      >
                        {rule.enabled ? '⏸' : '▶️'}
                      </button>
                      <button
                        className="button-icon"
                        onClick={() => setEditingRuleId(rule.id)}
                        title="Edit rule"
                      >
                        ✏️
                      </button>
                      <button
                        className="button-icon"
                        onClick={() => handleDeleteRule(rule.id)}
                        title="Delete rule"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div className="rule-body">
                    <div className="rule-flow">
                      <div className="rule-trigger">
                        <span className="rule-label">Trigger</span>
                        <span className="rule-value">{getTriggerLabel(rule)}</span>
                      </div>
                      <div className="rule-arrow">→</div>
                      <div className="rule-action">
                        <span className="rule-label">Action</span>
                        <span className="rule-value">{getActionLabel(rule)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="button-primary button-lg" onClick={handleCreateRule}>
              + Add New Rule
            </button>
          </>
        )}
      </div>

      {/* Rule Editor Modal */}
      {(isCreatingRule || editingRuleId) && (
        <RuleEditor
          rule={editingRule}
          onClose={() => {
            setIsCreatingRule(false);
            setEditingRuleId(null);
          }}
          onSave={handleSaveRule}
        />
      )}
    </div>
  );
}

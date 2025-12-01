/**
 * Rule Editor Modal
 * Modal for creating and editing cross-device rules
 */

import { useState, useEffect } from 'react';
import { sendMessage, onMessage } from '../../lib/message-handler';
import type { Rule, TriggerType, ActionType, TargetScope, DeviceType } from '@orchestrator/shared';
import './RuleEditor.css';

interface RuleEditorProps {
  rule?: Rule;
  onClose: () => void;
  onSave: (rule: Rule) => void;
}

export function RuleEditor({ rule, onClose, onSave }: RuleEditorProps) {
  const isEditing = !!rule;

  // Form state
  const [name, setName] = useState(rule?.name || '');
  const [triggerDevice, setTriggerDevice] = useState<DeviceType>(rule?.trigger.device || 'phone');
  const [triggerType, setTriggerType] = useState<TriggerType>(rule?.trigger.type || 'TAP_ELEMENT');
  const [triggerFrameId, setTriggerFrameId] = useState(rule?.trigger.frameId || '');
  const [triggerFrameName, setTriggerFrameName] = useState(rule?.trigger.frameName || '');
  const [triggerNodeId, setTriggerNodeId] = useState(rule?.trigger.nodeId || '');
  const [triggerNodeName, setTriggerNodeName] = useState(rule?.trigger.nodeName || '');

  const [targetScope, setTargetScope] = useState<TargetScope>(rule?.target || 'tv');
  const [actionType, setActionType] = useState<ActionType>(rule?.actions[0]?.type || 'NAVIGATE_TO_FRAME');
  const [actionFrameId, setActionFrameId] = useState(rule?.actions[0]?.frameId || '');
  const [actionFrameName, setActionFrameName] = useState(rule?.actions[0]?.frameName || '');
  const [actionNodeId, setActionNodeId] = useState(rule?.actions[0]?.nodeId || '');
  const [actionNodeName, setActionNodeName] = useState(rule?.actions[0]?.nodeName || '');

  const [selectingNode, setSelectingNode] = useState<'trigger' | 'action' | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Listen for node selection
  useEffect(() => {
    const unsubscribe = onMessage(msg => {
      if (msg.type === 'SELECTED_NODE') {
        if (msg.error) {
          setError(msg.error);
          setSelectingNode(null);
          return;
        }

        if (!msg.node) {
          setError('No node selected');
          setSelectingNode(null);
          return;
        }

        if (selectingNode === 'trigger') {
          if (triggerType === 'FRAME_VISIBLE' && msg.node.type !== 'FRAME') {
            setError('Please select a frame for this trigger type');
            setSelectingNode(null);
            return;
          }

          if (triggerType === 'FRAME_VISIBLE') {
            setTriggerFrameId(msg.node.id);
            setTriggerFrameName(msg.node.name);
          } else {
            setTriggerNodeId(msg.node.id);
            setTriggerNodeName(msg.node.name);
          }
        } else if (selectingNode === 'action') {
          if (actionType === 'NAVIGATE_TO_FRAME' && msg.node.type !== 'FRAME') {
            setError('Please select a frame for this action type');
            setSelectingNode(null);
            return;
          }

          if (actionType === 'NAVIGATE_TO_FRAME') {
            setActionFrameId(msg.node.id);
            setActionFrameName(msg.node.name);
          } else {
            setActionNodeId(msg.node.id);
            setActionNodeName(msg.node.name);
          }
        }

        setError(null);
        setSelectingNode(null);
      }
    });

    return unsubscribe;
  }, [selectingNode, triggerType, actionType]);

  const handleSelectNode = (type: 'trigger' | 'action') => {
    setSelectingNode(type);
    setError(null);
    sendMessage({ type: 'GET_SELECTED_NODE' });
  };

  const handleSave = () => {
    // Validate required fields
    if (!name.trim()) {
      setError('Please enter a rule name');
      return;
    }

    // Validate trigger configuration
    if (triggerType === 'FRAME_VISIBLE' && !triggerFrameId) {
      setError('Please select a frame for the trigger');
      return;
    }

    if ((triggerType === 'TAP_ELEMENT' || triggerType === 'VARIANT_CHANGE') && !triggerNodeId) {
      setError('Please select an element for the trigger');
      return;
    }

    // Validate action configuration
    if (actionType === 'NAVIGATE_TO_FRAME' && !actionFrameId) {
      setError('Please select a frame for the action');
      return;
    }

    if (actionType === 'CHANGE_VARIANT' && !actionNodeId) {
      setError('Please select an element for the action');
      return;
    }

    // Create the rule
    const newRule: Rule = {
      id: rule?.id || `rule-${Date.now()}`,
      name: name.trim(),
      enabled: rule?.enabled ?? true,
      trigger: {
        device: triggerDevice,
        type: triggerType,
        ...(triggerType === 'FRAME_VISIBLE' && {
          frameId: triggerFrameId,
          frameName: triggerFrameName,
        }),
        ...(triggerType !== 'FRAME_VISIBLE' && {
          nodeId: triggerNodeId,
          nodeName: triggerNodeName,
        }),
      },
      target: targetScope,
      actions: [
        {
          type: actionType,
          ...(actionType === 'NAVIGATE_TO_FRAME' && {
            frameId: actionFrameId,
            frameName: actionFrameName,
          }),
          ...(actionType === 'CHANGE_VARIANT' && {
            nodeId: actionNodeId,
            nodeName: actionNodeName,
          }),
        },
      ],
    };

    onSave(newRule);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Rule' : 'Create New Rule'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {error && (
          <div className="error-banner">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
            <button className="error-close" onClick={() => setError(null)}>×</button>
          </div>
        )}

        <div className="modal-body">
          {/* Rule Name */}
          <div className="form-group">
            <label className="label">Rule Name</label>
            <input
              type="text"
              className="input"
              placeholder="e.g., Login from Phone"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Trigger Section */}
          <div className="form-section">
            <h3 className="section-title">When this happens...</h3>

            <div className="form-group">
              <label className="label">Device</label>
              <select
                className="select"
                value={triggerDevice}
                onChange={(e) => setTriggerDevice(e.target.value as DeviceType)}
              >
                <option value="phone">Phone</option>
                <option value="tv">TV</option>
              </select>
            </div>

            <div className="form-group">
              <label className="label">Trigger Type</label>
              <select
                className="select"
                value={triggerType}
                onChange={(e) => {
                  setTriggerType(e.target.value as TriggerType);
                  // Clear selections when changing type
                  setTriggerFrameId('');
                  setTriggerFrameName('');
                  setTriggerNodeId('');
                  setTriggerNodeName('');
                }}
              >
                <option value="TAP_ELEMENT">Tap Element</option>
                <option value="FRAME_VISIBLE">Frame Becomes Visible</option>
                <option value="VARIANT_CHANGE">Variant Changes</option>
              </select>
            </div>

            {/* Trigger Configuration */}
            {triggerType === 'FRAME_VISIBLE' && (
              <div className="form-group">
                <label className="label">Frame</label>
                {triggerFrameName ? (
                  <div className="selected-node">
                    <span>{triggerFrameName}</span>
                    <button
                      className="button-secondary button-sm"
                      onClick={() => {
                        setTriggerFrameId('');
                        setTriggerFrameName('');
                      }}
                    >
                      Clear
                    </button>
                  </div>
                ) : (
                  <button
                    className="button-primary"
                    onClick={() => handleSelectNode('trigger')}
                    disabled={selectingNode !== null}
                  >
                    {selectingNode === 'trigger' ? 'Select a frame...' : 'Select Frame from Canvas'}
                  </button>
                )}
              </div>
            )}

            {(triggerType === 'TAP_ELEMENT' || triggerType === 'VARIANT_CHANGE') && (
              <div className="form-group">
                <label className="label">Element</label>
                {triggerNodeName ? (
                  <div className="selected-node">
                    <span>{triggerNodeName}</span>
                    <button
                      className="button-secondary button-sm"
                      onClick={() => {
                        setTriggerNodeId('');
                        setTriggerNodeName('');
                      }}
                    >
                      Clear
                    </button>
                  </div>
                ) : (
                  <button
                    className="button-primary"
                    onClick={() => handleSelectNode('trigger')}
                    disabled={selectingNode !== null}
                  >
                    {selectingNode === 'trigger' ? 'Select an element...' : 'Select Element from Canvas'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Action Section */}
          <div className="form-section">
            <h3 className="section-title">Then do this...</h3>

            <div className="form-group">
              <label className="label">Target</label>
              <select
                className="select"
                value={targetScope}
                onChange={(e) => setTargetScope(e.target.value as TargetScope)}
              >
                <option value="tv">TV</option>
                <option value="all-phones">All Phones</option>
                <option value="this-phone">This Phone</option>
              </select>
            </div>

            <div className="form-group">
              <label className="label">Action Type</label>
              <select
                className="select"
                value={actionType}
                onChange={(e) => {
                  setActionType(e.target.value as ActionType);
                  // Clear selections when changing type
                  setActionFrameId('');
                  setActionFrameName('');
                  setActionNodeId('');
                  setActionNodeName('');
                }}
              >
                <option value="NAVIGATE_TO_FRAME">Navigate to Frame</option>
                <option value="RESTART">Restart</option>
                <option value="CHANGE_VARIANT">Change Variant</option>
              </select>
            </div>

            {/* Action Configuration */}
            {actionType === 'NAVIGATE_TO_FRAME' && (
              <div className="form-group">
                <label className="label">Frame</label>
                {actionFrameName ? (
                  <div className="selected-node">
                    <span>{actionFrameName}</span>
                    <button
                      className="button-secondary button-sm"
                      onClick={() => {
                        setActionFrameId('');
                        setActionFrameName('');
                      }}
                    >
                      Clear
                    </button>
                  </div>
                ) : (
                  <button
                    className="button-primary"
                    onClick={() => handleSelectNode('action')}
                    disabled={selectingNode !== null}
                  >
                    {selectingNode === 'action' ? 'Select a frame...' : 'Select Frame from Canvas'}
                  </button>
                )}
              </div>
            )}

            {actionType === 'CHANGE_VARIANT' && (
              <div className="form-group">
                <label className="label">Component Instance</label>
                {actionNodeName ? (
                  <div className="selected-node">
                    <span>{actionNodeName}</span>
                    <button
                      className="button-secondary button-sm"
                      onClick={() => {
                        setActionNodeId('');
                        setActionNodeName('');
                      }}
                    >
                      Clear
                    </button>
                  </div>
                ) : (
                  <button
                    className="button-primary"
                    onClick={() => handleSelectNode('action')}
                    disabled={selectingNode !== null}
                  >
                    {selectingNode === 'action' ? 'Select a component...' : 'Select Component from Canvas'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="button-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="button-primary" onClick={handleSave}>
            {isEditing ? 'Save Changes' : 'Create Rule'}
          </button>
        </div>
      </div>
    </div>
  );
}

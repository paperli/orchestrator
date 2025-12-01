/**
 * Rule Engine
 * Evaluates interaction events against configured rules
 */

import type { PrototypeConfig, Rule, DeviceType } from '@orchestrator/shared';

interface InteractionEvent {
  device: DeviceType;
  interactionType: string;
  nodeId?: string;
  frameId?: string;
}

export class RuleEngine {
  private config: PrototypeConfig;

  constructor(config: PrototypeConfig) {
    this.config = config;
  }

  /**
   * Find rules that match the given interaction event
   */
  findMatchingRules(event: InteractionEvent): Rule[] {
    return this.config.rules.filter(rule => {
      if (!rule.enabled) return false;

      // Check if trigger device matches
      if (rule.trigger.device !== event.device) {
        return false;
      }

      // Check trigger type
      switch (rule.trigger.type) {
        case 'TAP_ELEMENT':
          return event.interactionType === 'TAP' &&
                 rule.trigger.nodeId === event.nodeId;

        case 'FRAME_VISIBLE':
          return event.interactionType === 'FRAME_VISIBLE' &&
                 rule.trigger.frameId === event.frameId;

        case 'VARIANT_CHANGE':
          return event.interactionType === 'VARIANT_CHANGE' &&
                 rule.trigger.nodeId === event.nodeId;

        default:
          return false;
      }
    });
  }

  /**
   * Validate rule configuration
   */
  static validateRule(rule: Rule): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required fields
    if (!rule.name || rule.name.trim() === '') {
      errors.push('Rule name is required');
    }

    if (!rule.trigger) {
      errors.push('Trigger configuration is required');
    } else {
      // Validate trigger
      if (!rule.trigger.device) {
        errors.push('Trigger device is required');
      }

      if (!rule.trigger.type) {
        errors.push('Trigger type is required');
      }

      switch (rule.trigger.type) {
        case 'TAP_ELEMENT':
        case 'VARIANT_CHANGE':
          if (!rule.trigger.nodeId) {
            errors.push('Node ID is required for this trigger type');
          }
          break;

        case 'FRAME_VISIBLE':
          if (!rule.trigger.frameId) {
            errors.push('Frame ID is required for this trigger type');
          }
          break;
      }
    }

    // Validate actions
    if (!rule.actions || rule.actions.length === 0) {
      errors.push('At least one action is required');
    } else {
      rule.actions.forEach((action, index) => {
        switch (action.type) {
          case 'NAVIGATE_TO_FRAME':
            if (!action.frameId) {
              errors.push(`Action ${index + 1}: Frame ID is required for navigation`);
            }
            break;

          case 'CHANGE_VARIANT':
            if (!action.nodeId) {
              errors.push(`Action ${index + 1}: Node ID is required for variant change`);
            }
            if (!action.variantId) {
              errors.push(`Action ${index + 1}: Variant ID is required for variant change`);
            }
            break;
        }
      });
    }

    // Validate target scope
    if (!rule.target) {
      errors.push('Target scope is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

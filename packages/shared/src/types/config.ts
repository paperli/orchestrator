/**
 * Core configuration types for multi-device orchestration
 */

export type DeviceType = 'tv' | 'phone';

export type TriggerType =
  | 'FRAME_VISIBLE'
  | 'TAP_ELEMENT'
  | 'VARIANT_CHANGE';

export type ActionType =
  | 'NAVIGATE_TO_FRAME'
  | 'RESTART'
  | 'CHANGE_VARIANT';

export type TargetScope = 'tv' | 'all-phones' | 'this-phone';

export interface DeviceConfig {
  type: DeviceType;
  startingFrameId: string;
  startingFrameName: string;
  pageId?: string;
  pageName?: string;
}

export interface RuleTrigger {
  device: DeviceType;
  type: TriggerType;
  nodeId?: string;
  nodeName?: string;
  frameId?: string;
  frameName?: string;
  variantId?: string;
  variantName?: string;
}

export interface RuleAction {
  type: ActionType;
  nodeId?: string;
  nodeName?: string;
  frameId?: string;
  frameName?: string;
  variantId?: string;
  variantName?: string;
}

export interface Rule {
  id: string;
  name: string;
  enabled: boolean;
  trigger: RuleTrigger;
  target: TargetScope;
  actions: RuleAction[];
  conditions?: Record<string, unknown>; // For future expansion
}

export interface PrototypeConfig {
  configVersion: string;
  fileKey: string;
  fileName: string;
  devices: {
    tv: DeviceConfig;
    phone: DeviceConfig;
  };
  rules: Rule[];
  maxPlayers: number;
  createdAt: string;
  updatedAt: string;
}

export interface PublishResponse {
  success: boolean;
  configId: string;
  tvUrl: string;
  phoneUrl: string;
  publishedAt: string;
  error?: string;
}

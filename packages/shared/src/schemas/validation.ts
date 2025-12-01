/**
 * Zod schemas for runtime validation
 */

import { z } from 'zod';

// Device types
export const deviceTypeSchema = z.enum(['tv', 'phone']);

// Trigger types
export const triggerTypeSchema = z.enum([
  'FRAME_VISIBLE',
  'TAP_ELEMENT',
  'VARIANT_CHANGE',
]);

// Action types
export const actionTypeSchema = z.enum([
  'NAVIGATE_TO_FRAME',
  'RESTART',
  'CHANGE_VARIANT',
]);

// Target scope
export const targetScopeSchema = z.enum([
  'tv',
  'all-phones',
  'this-phone',
]);

// Device config
export const deviceConfigSchema = z.object({
  type: deviceTypeSchema,
  startingFrameId: z.string().min(1),
  startingFrameName: z.string().min(1),
  pageId: z.string().optional(),
  pageName: z.string().optional(),
});

// Rule trigger
export const ruleTriggerSchema = z.object({
  device: deviceTypeSchema,
  type: triggerTypeSchema,
  nodeId: z.string().optional(),
  nodeName: z.string().optional(),
  frameId: z.string().optional(),
  frameName: z.string().optional(),
  variantId: z.string().optional(),
  variantName: z.string().optional(),
});

// Rule action
export const ruleActionSchema = z.object({
  type: actionTypeSchema,
  nodeId: z.string().optional(),
  nodeName: z.string().optional(),
  frameId: z.string().optional(),
  frameName: z.string().optional(),
  variantId: z.string().optional(),
  variantName: z.string().optional(),
});

// Rule
export const ruleSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  enabled: z.boolean(),
  trigger: ruleTriggerSchema,
  target: targetScopeSchema,
  actions: z.array(ruleActionSchema).min(1),
  conditions: z.record(z.unknown()).optional(),
});

// Prototype config
export const prototypeConfigSchema = z.object({
  configVersion: z.string().regex(/^\d+\.\d+\.\d+$/),
  fileKey: z.string().min(1),
  fileName: z.string().min(1),
  devices: z.object({
    tv: deviceConfigSchema,
    phone: deviceConfigSchema,
  }),
  rules: z.array(ruleSchema),
  maxPlayers: z.number().int().min(1).max(10).default(5),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Validate config
export function validateConfig(config: unknown) {
  return prototypeConfigSchema.safeParse(config);
}

// Session schemas
export const sessionCodeSchema = z
  .string()
  .length(5)
  .regex(/^[A-Z0-9]{5}$/);

export const joinSessionRequestSchema = z.object({
  sessionCode: sessionCodeSchema,
  deviceType: deviceTypeSchema,
});

// Figma event schemas
export const figmaEventTypeSchema = z.enum([
  'INITIAL_LOAD',
  'PRESENTED_NODE_CHANGED',
  'MOUSE_PRESS_OR_RELEASE',
  'NEW_STATE',
  'REQUEST_CLOSE',
  'LOGIN_SCREEN_SHOWN',
  'PASSWORD_SCREEN_SHOWN',
]);

export const figmaEventSchema = z.object({
  type: figmaEventTypeSchema,
  deviceId: z.string(),
  deviceType: deviceTypeSchema,
  sessionId: z.string(),
  data: z.unknown(),
  timestamp: z.string().datetime(),
});

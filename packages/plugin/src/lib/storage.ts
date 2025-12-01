/**
 * Plugin data storage utilities
 * Handles saving and loading configuration from Figma file
 */

import type { PrototypeConfig } from '@orchestrator/shared';

const STORAGE_KEY = 'multiscreen-config';
const CONFIG_VERSION = '1.0.0';

/**
 * Load configuration from plugin data
 */
export async function loadConfig(): Promise<PrototypeConfig | null> {
  try {
    const data = figma.root.getPluginData(STORAGE_KEY);

    if (!data) {
      return null;
    }

    const config = JSON.parse(data) as PrototypeConfig;

    // Version check
    if (config.configVersion !== CONFIG_VERSION) {
      console.warn(
        `Config version mismatch: ${config.configVersion} vs ${CONFIG_VERSION}`
      );
      // TODO: Implement migration logic if needed
    }

    return config;
  } catch (error) {
    console.error('Failed to load config:', error);
    return null;
  }
}

/**
 * Save configuration to plugin data
 */
export async function saveConfig(config: PrototypeConfig): Promise<void> {
  try {
    // Ensure config version is set
    const configWithVersion = {
      ...config,
      configVersion: CONFIG_VERSION,
      updatedAt: new Date().toISOString(),
    };

    const data = JSON.stringify(configWithVersion);

    // Check size limit (100 KB)
    // Use string length * 2 as rough estimate (UTF-16 characters are 2 bytes)
    const sizeInBytes = data.length * 2;
    if (sizeInBytes > 100 * 1024) {
      throw new Error(
        `Configuration too large: ${Math.round(sizeInBytes / 1024)} KB (max 100 KB)`
      );
    }

    figma.root.setPluginData(STORAGE_KEY, data);
  } catch (error) {
    console.error('Failed to save config:', error);
    throw error;
  }
}

/**
 * Clear configuration from plugin data
 */
export async function clearConfig(): Promise<void> {
  figma.root.setPluginData(STORAGE_KEY, '');
}

/**
 * Get all stored keys (for debugging)
 */
export function getStoredKeys(): string[] {
  return figma.root.getPluginDataKeys();
}

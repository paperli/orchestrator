/**
 * Figma Plugin Main Thread
 * Runs in Figma's plugin sandbox with access to the Figma API
 */

import type { PrototypeConfig } from '@orchestrator/shared';
import { validateConfig } from '@orchestrator/shared/schemas';
import { loadConfig, saveConfig } from './lib/storage';
import { handleGetFrames, handleGetPages, handleGetNodeInfo } from './lib/figma-utils';

// Show the plugin UI
console.log('[Main Thread] Starting plugin...');
figma.showUI(__html__, {
  width: 400,
  height: 600,
  themeColors: true,
});
console.log('[Main Thread] UI shown, waiting for INIT message');

// Message handler for UI → Main thread communication
figma.ui.onmessage = async (msg: any) => {
  console.log('[Main Thread] Received message:', msg.type);
  try {
    switch (msg.type) {
      case 'INIT':
        await handleInit();
        break;

      case 'GET_PAGES':
        await handleGetPages();
        break;

      case 'GET_FRAMES':
        await handleGetFrames(msg.pageId);
        break;

      case 'GET_NODE_INFO':
        await handleGetNodeInfo(msg.nodeId);
        break;

      case 'GET_SELECTED_NODE':
        handleGetSelectedNode();
        break;

      case 'SAVE_CONFIG':
        await handleSaveConfig(msg.config);
        break;

      case 'PUBLISH_CONFIG':
        await handlePublishConfig(msg.config);
        break;

      case 'CLOSE':
        figma.closePlugin();
        break;

      default:
        console.warn('Unknown message type:', msg.type);
    }
  } catch (error) {
    figma.ui.postMessage({
      type: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Initialize plugin - load existing config if available
 */
async function handleInit() {
  console.log('[Main Thread] handleInit called');
  try {
    const config = await loadConfig();
    console.log('[Main Thread] Config loaded:', config ? 'found' : 'none');

    const fileInfo = {
      key: figma.fileKey || 'unknown',
      name: figma.root.name,
    };
    console.log('[Main Thread] File info:', fileInfo);

    const response = {
      type: 'INIT_SUCCESS',
      config,
      fileInfo,
    };
    console.log('[Main Thread] Sending INIT_SUCCESS');
    figma.ui.postMessage(response);
  } catch (error) {
    console.error('[Main Thread] Init error:', error);
    figma.ui.postMessage({
      type: 'INIT_ERROR',
      error: error instanceof Error ? error.message : 'Failed to initialize',
    });
  }
}

/**
 * Get currently selected node
 */
function handleGetSelectedNode() {
  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    figma.ui.postMessage({
      type: 'SELECTED_NODE',
      node: null,
      error: 'No node selected',
    });
    return;
  }

  if (selection.length > 1) {
    figma.ui.postMessage({
      type: 'SELECTED_NODE',
      node: null,
      error: 'Multiple nodes selected. Please select only one.',
    });
    return;
  }

  const node = selection[0];

  figma.ui.postMessage({
    type: 'SELECTED_NODE',
    node: {
      id: node.id,
      name: node.name,
      type: node.type,
    },
  });
}

/**
 * Save configuration to plugin data
 */
async function handleSaveConfig(config: PrototypeConfig) {
  try {
    // Validate config
    const validation = validateConfig(config);
    if (!validation.success) {
      figma.ui.postMessage({
        type: 'SAVE_ERROR',
        error: 'Invalid configuration: ' + validation.error.message,
      });
      return;
    }

    // Save to plugin data
    await saveConfig(config);

    figma.notify('Configuration saved successfully');
    figma.ui.postMessage({
      type: 'SAVE_SUCCESS',
    });
  } catch (error) {
    figma.ui.postMessage({
      type: 'SAVE_ERROR',
      error: error instanceof Error ? error.message : 'Failed to save',
    });
  }
}

/**
 * Publish configuration to backend
 */
async function handlePublishConfig(config: PrototypeConfig) {
  try {
    // Validate config
    const validation = validateConfig(config);
    if (!validation.success) {
      figma.ui.postMessage({
        type: 'PUBLISH_ERROR',
        error: 'Invalid configuration: ' + validation.error.message,
      });
      return;
    }

    // Save locally first
    await saveConfig(config);

    // Get backend URL from environment or manifest
    const backendUrl = 'http://localhost:3001'; // TODO: Get from config

    // Publish to backend
    const response = await fetch(`${backendUrl}/api/config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    figma.notify('Configuration published successfully!');
    figma.ui.postMessage({
      type: 'PUBLISH_SUCCESS',
      result,
    });
  } catch (error) {
    figma.notify('Failed to publish configuration', { error: true });
    figma.ui.postMessage({
      type: 'PUBLISH_ERROR',
      error: error instanceof Error ? error.message : 'Failed to publish',
    });
  }
}

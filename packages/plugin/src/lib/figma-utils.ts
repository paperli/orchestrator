/**
 * Figma API utilities
 * Helper functions for interacting with Figma nodes and data
 */

/**
 * Get all pages in the current file
 */
export async function handleGetPages() {
  try {
    const pages = figma.root.children.map(page => ({
      id: page.id,
      name: page.name,
      type: page.type,
    }));

    figma.ui.postMessage({
      type: 'PAGES_RESULT',
      pages,
    });
  } catch (error) {
    figma.ui.postMessage({
      type: 'ERROR',
      error: error instanceof Error ? error.message : 'Failed to get pages',
    });
  }
}

/**
 * Get all frames in a specific page
 */
export async function handleGetFrames(pageId?: string) {
  try {
    let targetPage: PageNode;

    if (pageId) {
      const node = await figma.getNodeByIdAsync(pageId);
      if (!node || node.type !== 'PAGE') {
        throw new Error('Invalid page ID');
      }
      targetPage = node;
    } else {
      targetPage = figma.currentPage;
    }

    // Find all top-level frames
    const frames = targetPage.findAll(node => {
      return node.type === 'FRAME' && node.parent?.type === 'PAGE';
    }) as FrameNode[];

    const frameData = frames.map(frame => ({
      id: frame.id,
      name: frame.name,
      type: frame.type,
      width: frame.width,
      height: frame.height,
    }));

    figma.ui.postMessage({
      type: 'FRAMES_RESULT',
      frames: frameData,
      pageId: targetPage.id,
    });
  } catch (error) {
    figma.ui.postMessage({
      type: 'ERROR',
      error: error instanceof Error ? error.message : 'Failed to get frames',
    });
  }
}

/**
 * Get detailed information about a specific node
 */
export async function handleGetNodeInfo(nodeId: string) {
  try {
    const node = await figma.getNodeByIdAsync(nodeId);

    if (!node) {
      throw new Error('Node not found');
    }

    const nodeInfo: any = {
      id: node.id,
      name: node.name,
      type: node.type,
    };

    // Add type-specific information
    if ('width' in node && 'height' in node) {
      nodeInfo.width = node.width;
      nodeInfo.height = node.height;
    }

    if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
      nodeInfo.isComponent = true;
    }

    if (node.type === 'INSTANCE') {
      const instance = node as InstanceNode;
      nodeInfo.mainComponent = instance.mainComponent
        ? {
            id: instance.mainComponent.id,
            name: instance.mainComponent.name,
          }
        : null;
    }

    figma.ui.postMessage({
      type: 'NODE_INFO_RESULT',
      nodeInfo,
    });
  } catch (error) {
    figma.ui.postMessage({
      type: 'ERROR',
      error: error instanceof Error ? error.message : 'Failed to get node info',
    });
  }
}

/**
 * Find a node by ID (async wrapper)
 */
export async function getNodeById(nodeId: string): Promise<BaseNode | null> {
  try {
    return await figma.getNodeByIdAsync(nodeId);
  } catch {
    return null;
  }
}

/**
 * Check if a node still exists
 */
export async function nodeExists(nodeId: string): Promise<boolean> {
  const node = await getNodeById(nodeId);
  return node !== null;
}

/**
 * Get all components in the file
 */
export function getAllComponents(): ComponentNode[] {
  return figma.root.findAll(node => node.type === 'COMPONENT') as ComponentNode[];
}

/**
 * Get variant properties of a component
 */
export function getComponentVariants(component: ComponentNode | ComponentSetNode): string[] {
  if (component.type === 'COMPONENT_SET') {
    return component.children
      .filter(child => child.type === 'COMPONENT')
      .map(child => child.name);
  }
  return [];
}

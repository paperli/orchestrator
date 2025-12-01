# Multiscreen Orchestrator - Figma Plugin

The authoring tool for creating multi-device prototype configurations in Figma.

## Development

### Prerequisites

- Node.js 20+
- pnpm 8+
- Figma desktop app

### Setup

```bash
# Install dependencies (from monorepo root)
pnpm install

# Build the plugin
cd packages/plugin
pnpm build

# Watch mode (rebuild on file changes)
pnpm dev
```

### Installing in Figma

1. Open Figma desktop app
2. Go to **Menu → Plugins → Development → Import plugin from manifest**
3. Navigate to `packages/plugin/manifest.json` and select it
4. The plugin will appear as "Multiscreen Orchestrator" in your Plugins menu

### Running the Plugin

1. Open or create a Figma file
2. Create some frames for TV and Phone prototypes (optional)
3. Go to **Plugins → Development → Multiscreen Orchestrator**
4. The plugin UI will open

### Development Workflow

```bash
# Make changes to source files
# Terminal 1: Watch mode
cd packages/plugin
pnpm dev

# In Figma:
# - Close and reopen the plugin to see changes
# - Use Console (Plugins → Development → Show/Hide Console) for debugging
```

### Project Structure

```
src/
├── code.ts              # Main thread (Figma API access)
├── ui.tsx               # UI entry point
├── ui.html              # HTML wrapper
├── lib/
│   ├── storage.ts       # Plugin data persistence
│   ├── figma-utils.ts   # Figma API helpers
│   └── message-handler.ts # UI ↔ Main communication
├── store/
│   └── plugin-store.ts  # Zustand state management
├── components/
│   ├── App.tsx          # Main app component
│   ├── Header.tsx       # Navigation tabs
│   ├── Setup/           # Device configuration
│   ├── Rules/           # Rule editor
│   └── Publish/         # Publish flow
└── styles/
    └── globals.css      # Global styles
```

### Architecture

The plugin uses a **dual-thread architecture**:

**Main Thread (code.ts):**
- Runs in Figma's plugin sandbox
- Has access to the `figma` global object
- Can read/write file data, traverse nodes
- Communicates with UI via `postMessage`

**UI Thread (ui.tsx):**
- Runs in an iframe (React app)
- No direct access to Figma API
- Communicates with main thread via `postMessage`
- Handles all user interactions and UI rendering

**Communication Pattern:**
```typescript
// UI → Main Thread
sendMessage({ type: 'GET_FRAMES', pageId: '...' });

// Main Thread → UI
figma.ui.postMessage({ type: 'FRAMES_RESULT', frames: [...] });
```

### State Management

We use **Zustand** for UI state:

```typescript
const { config, setConfig } = usePluginStore();
```

Plugin data is persisted using Figma's `setPluginData` / `getPluginData` APIs.

### Debugging

**Main Thread:**
- Add `console.log()` in `code.ts`
- View logs: **Plugins → Development → Show/Hide Console**

**UI Thread:**
- Add `console.log()` in React components
- Open browser DevTools: **Plugins → Development → Open Console**
- Right-click plugin → Inspect Element

### Building for Production

```bash
pnpm build
```

Output files in `dist/`:
- `code.js` - Main thread bundle
- `ui.js` - UI bundle
- `ui.html` - UI HTML
- `ui.css` - Styles

### Testing

Currently, testing is manual in Figma. Future additions:
- Unit tests for utilities
- Component tests with Testing Library
- E2E tests with Figma Plugin Playground

## Current Status

**Phase 1 Complete ✅**
- ✅ Plugin scaffolding and build system
- ✅ Dual-thread architecture
- ✅ Basic UI shell with navigation
- ✅ Plugin data persistence utilities
- ✅ Figma API helper functions

**Next: Phase 2 - Setup Flow**
- Frame selection from canvas
- Device configuration
- Starting frame validation

## Troubleshooting

### Plugin doesn't appear in Figma
- Ensure you built the plugin (`pnpm build`)
- Check `manifest.json` is in the right location
- Try re-importing the manifest

### Changes not showing
- Rebuild the plugin
- Close and reopen the plugin in Figma
- Check for errors in the Console

### Build errors
- Run `pnpm install` in monorepo root
- Ensure `@orchestrator/shared` package is built
- Check TypeScript errors with `pnpm typecheck`

## Resources

- [Figma Plugin API Docs](https://developers.figma.com/docs/plugins/)
- [Implementation Plan](../../IMPLEMENTATION_PLAN.md)
- [PRD](../../PRD.md)

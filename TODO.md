# Multiscreen Orchestrator - TODO & Progress

## Current Status: Phase 3 - WIP

### ✅ Completed Components

#### Phase 1: Plugin Core Infrastructure
- [x] Figma plugin with dual-thread architecture
- [x] Build system (esbuild + Vite)
- [x] Plugin data persistence
- [x] Message passing between threads
- [x] Single-file HTML bundling

#### Phase 2: Plugin UI
- [x] Setup section with device frame selection
- [x] Manual file key input (for desktop app)
- [x] Rules section with full CRUD
- [x] Rule editor modal with all trigger/action types
- [x] Publish section with config summary
- [x] URL display and copy functionality
- [x] All UI sections scrollable and responsive

#### Phase 3: Backend Server
- [x] Express + WebSocket server (port 3001)
- [x] Session management for multiple concurrent sessions
- [x] Rule engine with pattern matching
- [x] REST API for config publishing
- [x] Device role assignment (TV/Phone)
- [x] Real-time message broadcasting

#### Phase 3: Web Runtime
- [x] React + Vite application (port 3000)
- [x] TV Display view with Figma embed
- [x] Phone Controller view with Figma embed
- [x] WebSocket client with auto-reconnect
- [x] Routing for /tv/:sessionId and /phone/:sessionId
- [x] Connection status indicators

---

## ❌ Known Issues

### Critical: Rules Not Executing

**Problem**: Cross-device interaction rules are not triggering actions between TV and Phone.

**What Works**:
- ✅ Backend receives published configs
- ✅ Sessions are created with unique IDs
- ✅ TV and Phone connect via WebSocket
- ✅ Figma prototypes render correctly
- ✅ WebSocket connection stays stable

**What Doesn't Work**:
- ❌ Tapping elements on Phone doesn't trigger TV actions
- ❌ Frame changes don't trigger rules
- ❌ No interaction events being sent from Figma Embed

**Likely Causes**:
1. **Figma Embed API limitations**: The standard embed may not expose interaction events via postMessage
2. **Node ID mismatch**: Selected node IDs in plugin may not match runtime node IDs
3. **Event listener not capturing**: FigmaEmbed component may not be receiving interaction events
4. **Message format mismatch**: Interaction messages may not match expected format

---

## 🔍 Debugging Steps (Next Session)

### 1. Verify Figma Embed API Events
- [ ] Check Figma documentation for available postMessage events
- [ ] Add console logging in FigmaEmbed.tsx to see all messages
- [ ] Test if Figma embed sends interaction events at all
- [ ] Consider if prototype mode vs embed mode affects events

### 2. Add Comprehensive Logging
- [ ] Add logs in PhoneController.tsx `handleInteraction`
- [ ] Add logs in websocket-client.ts for all sent messages
- [ ] Add logs in backend websocket.ts `handleInteraction`
- [ ] Add logs in rule-engine.ts `findMatchingRules`
- [ ] Trace full event flow: Phone → Backend → TV

### 3. Test Backend Rule Engine Independently
- [ ] Create test script to send mock INTERACTION messages
- [ ] Verify rules are loaded correctly in session
- [ ] Test rule matching with known node IDs
- [ ] Verify action execution messages are sent

### 4. Alternative Implementation
If Figma Embed doesn't expose interactions:
- [ ] Research Figma prototype URL parameters
- [ ] Consider using Figma's REST API to track navigation
- [ ] Implement manual interaction detection (click tracking)
- [ ] Add custom overlay for interaction capture

---

## 📝 Technical Notes

### File Key Handling
- Desktop Figma app returns `figma.fileKey = null` in development
- Added manual input field in Setup section
- File key format: alphanumeric string (e.g., `Agv3YzAcZMv89cUwQmcrXA`)
- Get from URL: `figma.com/file/[FILE_KEY]/...`

### WebSocket Connection
- Fixed double-disconnect by removing React StrictMode
- Connection is stable and persistent
- Auto-reconnect implemented (5 attempts, exponential backoff)

### Figma Embed URL Format
```
https://www.figma.com/embed?
  embed_host=orchestrator&
  url=https://www.figma.com/file/{fileKey}?
    node-id={nodeId}&
    hotspot-hints=0&
    hide-ui=1
```

### Rule Structure
```typescript
{
  trigger: {
    device: 'phone',
    type: 'TAP_ELEMENT',
    nodeId: '123:456'
  },
  target: 'tv',
  actions: [{
    type: 'NAVIGATE_TO_FRAME',
    frameId: '789:012'
  }]
}
```

---

## 🎯 Next Session Goals

1. **Debug interaction events**
   - Determine if Figma Embed sends interaction events
   - Find alternative if needed

2. **Get rules working**
   - Test with simple TAP → NAVIGATE rule
   - Verify end-to-end event flow
   - See TV update when phone is tapped

3. **Document workarounds**
   - If Figma Embed is limited, document alternatives
   - Consider Figma REST API integration
   - Look into iframe communication patterns

---

## 🚀 Future Enhancements

### Phase 4: Polish & Production
- [ ] Error recovery and retry logic
- [ ] Session persistence (Redis/database)
- [ ] QR code generation for phone URL
- [ ] Better loading states and animations
- [ ] Deployment configuration
- [ ] Production build optimization
- [ ] Environment variable management

### Phase 5: Advanced Features
- [ ] Multi-player phone support (currently designed but untested)
- [ ] Variant change actions
- [ ] Custom interaction types
- [ ] Analytics and session replay
- [ ] Admin dashboard for monitoring sessions

---

## 📚 Resources

- **Figma Plugin API**: https://www.figma.com/plugin-docs/
- **Figma Embed API**: https://www.figma.com/developers/embed
- **WebSocket API**: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
- **React Router**: https://reactrouter.com/

---

## 💾 How to Resume Development

1. **Start servers**:
   ```bash
   # Terminal 1 - Backend
   cd packages/backend
   pnpm dev

   # Terminal 2 - Web
   cd packages/web
   pnpm dev
   ```

2. **Rebuild plugin**:
   ```bash
   cd packages/plugin
   npm run build
   ```

3. **In Figma**:
   - Reload plugin (Cmd/Ctrl + Option/Alt + P)
   - Enter file key in Setup
   - Configure devices and rules
   - Publish to get URLs

4. **Test**:
   - Open TV URL in browser
   - Open Phone URL in another browser/device
   - Check browser console for logs
   - Try interactions and watch for events

---

**Last Updated**: 2025-12-01
**Status**: WIP - Rules interaction debugging needed
**Version**: v0.3.0-phase3-wip

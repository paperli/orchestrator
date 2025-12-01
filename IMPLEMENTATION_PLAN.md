# Multi-Device Prototype Orchestrator - Implementation Plan

**Project:** Multiscreen Orchestrator for Figma
**Version:** 1.0
**Last Updated:** 2025-11-30
**Status:** Planning Phase

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Technology Stack](#technology-stack)
3. [Architecture Overview](#architecture-overview)
4. [Project Structure](#project-structure)
5. [Implementation Phases](#implementation-phases)
6. [Detailed Component Breakdown](#detailed-component-breakdown)
7. [Development Workflow](#development-workflow)
8. [Testing Strategy](#testing-strategy)
9. [Deployment Strategy](#deployment-strategy)
10. [Risk Mitigation](#risk-mitigation)
11. [Success Criteria](#success-criteria)

---

## Executive Summary

This implementation plan outlines the development of a **Multi-Device Prototype Orchestrator** that enables designers to create and test cross-device prototypes (TV + Phone) directly in Figma. The system consists of:

1. **Figma Plugin** - Authoring tool for defining multi-device rules
2. **Web Orchestrator App** - Runtime environment for synchronized multi-device testing
3. **Backend Service** - Configuration management and real-time session coordination

**Key Goals:**
- Enable designers to prototype TV + phone interactions without leaving Figma
- Support realistic user testing with up to 5 concurrent phone devices
- Minimize engineering involvement in early UX exploration
- Ensure minimal regression and progressive enhancement

---

## Technology Stack

### Figma Plugin

**Core Technologies:**
- **Language:** TypeScript 5.3+
- **API Version:** Figma Plugin API 1.0.0 (latest)
- **Build Tool:** esbuild or Vite (for fast compilation)
- **UI Framework:** React 18+ with TypeScript
- **State Management:** Zustand or Jotai (lightweight)
- **Styling:** Tailwind CSS + Figma Design System tokens

**Key Dependencies:**
- `@figma/plugin-typings` - Official Figma API types
- `react` + `react-dom` - UI framework
- `zod` - Runtime schema validation
- `date-fns` - Date formatting

**Manifest Structure:**
```json
{
  "name": "Multiscreen Orchestrator",
  "api": "1.0.0",
  "editorType": ["figma"],
  "documentAccess": "dynamic-page",
  "main": "code.js",
  "ui": "ui.html",
  "networkAccess": {
    "allowedDomains": ["your-backend-domain.com"],
    "reasoning": "Required to publish multi-device configurations to orchestrator backend"
  },
  "permissions": ["currentuser"]
}
```

### Web Orchestrator (Frontend)

**Core Technologies:**
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript 5.3+
- **Styling:** Tailwind CSS
- **State Management:** Zustand + React Context
- **Real-time:** Socket.io-client or native WebSocket
- **QR Code:** qrcode.react

**Key Features:**
- Server-side rendering for TV/Phone views
- WebSocket connection for real-time sync
- Figma Embed API integration
- Responsive layouts (TV landscape, Phone portrait)

### Backend Service

**Core Technologies:**
- **Runtime:** Node.js 20+ LTS
- **Framework:** Express.js or Fastify
- **Language:** TypeScript 5.3+
- **Real-time:** Socket.io or ws (WebSocket library)
- **Database:** PostgreSQL 16+ (for configs) + Redis (for sessions)
- **ORM:** Prisma or Drizzle ORM
- **Validation:** Zod

**Infrastructure:**
- **Hosting:** Vercel/Netlify (frontend) + Railway/Render (backend)
- **Auth:** Auth0, Clerk, or custom SSO integration
- **Monitoring:** Sentry for error tracking

### Development Tools

- **Package Manager:** pnpm (for workspace management)
- **Monorepo Tool:** Turborepo or pnpm workspaces
- **Linting:** ESLint + Prettier
- **Type Checking:** TypeScript strict mode
- **Testing:** Vitest (unit) + Playwright (E2E)
- **Version Control:** Git + GitHub
- **CI/CD:** GitHub Actions

---

## Architecture Overview

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        FIGMA CLOUD                          │
│  ┌────────────────┐         ┌─────────────────────┐        │
│  │  Figma File    │◄────────┤ Multiscreen Plugin  │        │
│  │  (Design Doc)  │         │ (Authoring Tool)    │        │
│  └────────────────┘         └─────────┬───────────┘        │
│         │                              │                     │
│         │ Prototype URLs               │ Publish Config     │
└─────────┼──────────────────────────────┼─────────────────────┘
          │                              │
          │                              ▼
          │                    ┌──────────────────────┐
          │                    │   Backend Service    │
          │                    │  ┌────────────────┐  │
          │                    │  │  Config Store  │  │
          │                    │  │  (PostgreSQL)  │  │
          │                    │  └────────────────┘  │
          │                    │  ┌────────────────┐  │
          │                    │  │ Session Store  │  │
          │                    │  │    (Redis)     │  │
          │                    │  └────────────────┘  │
          │                    │  ┌────────────────┐  │
          │                    │  │  WebSocket Hub │  │
          │                    │  │  (Socket.io)   │  │
          │                    │  └────────────────┘  │
          │                    └──────────┬───────────┘
          │                              │
          │                              ▼
          │                    ┌──────────────────────┐
          │                    │ Orchestrator Web App │
          │                    │                      │
          ▼                    │  ┌──────────────┐   │
┌──────────────────┐           │  │   TV View    │   │
│ Figma Embed API  │◄──────────┼──│  (Desktop)   │   │
│  (iframe proto)  │           │  └──────────────┘   │
└──────────────────┘           │                      │
          ▲                    │  ┌──────────────┐   │
          │                    │  │  Phone View  │   │
          └────────────────────┼──│  (Mobile 1-5)│   │
                               │  └──────────────┘   │
                               └──────────────────────┘
```

### Data Flow

**Configuration Publishing:**
1. Designer defines rules in Figma Plugin
2. Plugin validates and serializes config to JSON
3. Plugin sends config to Backend API (authenticated)
4. Backend stores config in PostgreSQL (keyed by fileKey)
5. Backend returns stable template URLs (TV + Phone)

**Session Runtime:**
1. Researcher opens TV template URL
2. Backend creates session (Redis), generates join code
3. TV view loads, displays join code + QR
4. Participants open phone URL, enter join code
5. Each device connects via WebSocket
6. Backend loads config, initializes rule engine
7. Devices exchange events → Backend processes rules → Backend sends commands
8. Figma embeds respond to commands, update UI

---

## Project Structure

```
orchestrator/
├── .github/
│   └── workflows/
│       ├── ci.yml                 # Continuous integration
│       ├── deploy-plugin.yml      # Plugin deployment
│       └── deploy-web.yml         # Web app deployment
│
├── packages/
│   ├── plugin/                    # Figma Plugin
│   │   ├── manifest.json
│   │   ├── src/
│   │   │   ├── code.ts            # Plugin main thread
│   │   │   ├── ui.tsx             # React UI entry
│   │   │   ├── components/        # UI components
│   │   │   │   ├── Setup/
│   │   │   │   ├── Rules/
│   │   │   │   └── Publish/
│   │   │   ├── lib/
│   │   │   │   ├── api.ts         # Backend API client
│   │   │   │   ├── figma-utils.ts # Figma API helpers
│   │   │   │   └── storage.ts     # Plugin data persistence
│   │   │   └── types/
│   │   │       └── config.ts      # Shared config types
│   │   ├── ui.html
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   │
│   ├── web/                       # Orchestrator Web App
│   │   ├── src/
│   │   │   ├── app/               # Next.js App Router
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   ├── tv/
│   │   │   │   │   └── [sessionId]/
│   │   │   │   │       └── page.tsx
│   │   │   │   └── phone/
│   │   │   │       └── join/
│   │   │   │           └── page.tsx
│   │   │   ├── components/
│   │   │   │   ├── FigmaEmbed/
│   │   │   │   ├── SessionManager/
│   │   │   │   └── QRCode/
│   │   │   ├── lib/
│   │   │   │   ├── socket.ts      # WebSocket client
│   │   │   │   ├── embed-api.ts   # Figma Embed API wrapper
│   │   │   │   └── session.ts     # Session utilities
│   │   │   └── types/
│   │   ├── public/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── next.config.js
│   │
│   ├── backend/                   # Backend Service
│   │   ├── src/
│   │   │   ├── index.ts           # Server entry
│   │   │   ├── api/
│   │   │   │   ├── config.ts      # Config endpoints
│   │   │   │   ├── session.ts     # Session endpoints
│   │   │   │   └── auth.ts        # Auth middleware
│   │   │   ├── services/
│   │   │   │   ├── rule-engine.ts # Rule processing logic
│   │   │   │   ├── session.ts     # Session management
│   │   │   │   └── storage.ts     # Database abstraction
│   │   │   ├── websocket/
│   │   │   │   └── handler.ts     # WebSocket events
│   │   │   ├── db/
│   │   │   │   ├── schema.prisma  # Database schema
│   │   │   │   └── migrations/
│   │   │   └── types/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── shared/                    # Shared types & utilities
│       ├── src/
│       │   ├── types/
│       │   │   ├── config.ts      # Config schema
│       │   │   ├── session.ts     # Session types
│       │   │   ├── events.ts      # WebSocket events
│       │   │   └── rules.ts       # Rule types
│       │   ├── schemas/
│       │   │   └── validation.ts  # Zod schemas
│       │   └── utils/
│       ├── package.json
│       └── tsconfig.json
│
├── docs/
│   ├── architecture.md
│   ├── api-spec.md
│   ├── plugin-guide.md
│   └── deployment.md
│
├── .gitignore
├── .prettierrc
├── .eslintrc.js
├── package.json               # Root workspace config
├── pnpm-workspace.yaml
├── turbo.json                 # Turborepo config
├── tsconfig.base.json         # Base TypeScript config
├── PRD.md
├── IMPLEMENTATION_PLAN.md
└── README.md
```

---

## Implementation Phases

### Phase 0: Foundation (Week 1)

**Objectives:**
- Set up development environment and repository
- Establish project structure and tooling
- Create shared type definitions

**Tasks:**
1. Initialize GitHub repository with branch protection
2. Set up pnpm workspace monorepo structure
3. Configure TypeScript, ESLint, Prettier across all packages
4. Create shared types package with Zod schemas
5. Set up CI/CD pipeline (GitHub Actions)
6. Write contribution guidelines and README

**Deliverables:**
- ✅ Repository with complete structure
- ✅ Shared types package
- ✅ CI pipeline running tests and type checks
- ✅ Documentation for local development setup

---

### Phase 1: Figma Plugin - Core Infrastructure (Week 2-3)

**Objectives:**
- Build plugin scaffolding
- Implement plugin data persistence
- Create basic UI shell

**Tasks:**

**1.1 Plugin Initialization**
- Set up Vite/esbuild for plugin compilation
- Configure dual-thread architecture (code.ts + ui.tsx)
- Implement manifest.json with proper permissions
- Create development workflow with hot reload

**1.2 Data Layer**
- Implement `setPluginData`/`getPluginData` wrapper utilities
- Create config versioning system (`configVersion: "1.0.0"`)
- Build serialization/deserialization for rules
- Add validation with Zod schemas

**1.3 Figma API Integration**
- Create utilities to traverse pages and frames
- Implement node selection helpers
- Build frame/component picker functionality
- Add prototype connection reader (for future use)

**1.4 UI Shell**
- Set up React + TypeScript + Tailwind
- Create plugin panel layout (Setup/Rules/Publish tabs)
- Implement theme support (light/dark mode)
- Build reusable component library

**Deliverables:**
- ✅ Working plugin that can be installed in Figma
- ✅ Config persistence in Figma files
- ✅ Basic UI navigation between sections
- ✅ Unit tests for data layer

---

### Phase 2: Figma Plugin - Setup & Configuration (Week 4)

**Objectives:**
- Implement device role configuration
- Build starting frame selection UI
- Create configuration validation

**Tasks:**

**2.1 Setup Flow**
- Welcome screen for first-time users
- Device role cards (TV + Phone)
- Page selector dropdowns
- "Pick from canvas" functionality for starting frames
- Frame validation (ensure frames exist, are top-level)

**2.2 Configuration Management**
- Save configuration to plugin data
- Load existing configuration on plugin open
- "Edit setup" mode for modifying roles
- Conflict detection (e.g., same frame for TV and Phone)

**2.3 Validation**
- Validate frame references still exist
- Check for broken node IDs
- Display warnings/errors in UI
- Auto-recovery suggestions

**Deliverables:**
- ✅ Functional Setup section
- ✅ Designers can define TV and Phone starting frames
- ✅ Configuration persists across sessions
- ✅ E2E tests for setup flow

---

### Phase 3: Figma Plugin - Rule Editor (Week 5-6)

**Objectives:**
- Build comprehensive rule editing interface
- Implement trigger/target/action logic
- Support all v1 rule types

**Tasks:**

**3.1 Rule List View**
- Display rules in natural language format
- Add/edit/duplicate/delete controls
- Toggle active/inactive state
- Empty state with template suggestions

**3.2 Rule Editor Modal**
- "WHEN/WHERE/DO" stepped interface
- Device selector (TV/Phone)
- Trigger type selector:
  - Frame becomes visible
  - User taps element
  - Component changes state
- Live preview of rule in natural language

**3.3 Trigger Configuration**
- Frame picker with search
- Element selector ("Use selection" from canvas)
- Component variant picker
- Node ID capturing and validation

**3.4 Target Scope**
- Radio buttons: TV / All phones / This phone only
- Contextual help text

**3.5 Action Configuration**
- Action type dropdown
- Navigate to frame (with frame picker)
- Restart prototype
- (Optional) Change component variant
- Support multiple actions per rule

**3.6 Validation & Feedback**
- Real-time validation of node references
- Broken reference detection
- Conflict warnings (multiple rules, same trigger)
- Save/cancel with error display

**Deliverables:**
- ✅ Complete rule editor UI
- ✅ Support all v1 trigger types
- ✅ Natural language rule summaries
- ✅ Validation and error handling
- ✅ Unit + integration tests

---

### Phase 4: Figma Plugin - Publishing (Week 7)

**Objectives:**
- Implement configuration export
- Build backend API client
- Create publish flow with success feedback

**Tasks:**

**4.1 Configuration Export**
- Serialize configuration to JSON
- Include file key, device roles, rules
- Add config version metadata
- Validate before export

**4.2 Backend API Client**
- HTTP client with authentication
- POST /api/config endpoint
- Error handling and retry logic
- Network request loading states

**4.3 Publish UI**
- "Publish configuration" button
- Loading indicator
- Success state with URLs:
  - TV template link
  - Phone join link
  - QR code preview (optional)
- "Last published" timestamp
- Re-publish functionality (overwrites config)

**4.4 Error Handling**
- Network errors
- Authentication failures
- Validation errors from backend
- User-friendly error messages

**Deliverables:**
- ✅ Designers can publish configurations
- ✅ Stable URLs generated per file
- ✅ Re-publishing overwrites existing config
- ✅ Comprehensive error handling
- ✅ E2E tests for publish flow

---

### Phase 5: Backend Service - Core Infrastructure (Week 8-9)

**Objectives:**
- Set up backend server with database
- Implement configuration storage
- Create session management system

**Tasks:**

**5.1 Server Setup**
- Initialize Express/Fastify server
- Configure TypeScript compilation
- Set up environment variables
- Add request logging (Morgan/Pino)

**5.2 Database Schema**
- Design PostgreSQL schema:
  - `configurations` table (fileKey, config JSON, timestamps)
  - `sessions` table (sessionId, fileKey, metadata)
- Set up Prisma/Drizzle ORM
- Create migrations
- Seed development data

**5.3 Redis Session Store**
- Configure Redis connection
- Session lifecycle management (create, join, expire)
- Real-time state storage (connected devices, player count)

**5.4 Authentication**
- Implement SSO middleware (Auth0/Clerk)
- Protect config publish endpoints
- Public access for session join (no auth)

**5.5 API Endpoints**
- `POST /api/config` - Publish configuration
- `GET /api/config/:fileKey` - Retrieve config
- `POST /api/session` - Create session
- `GET /api/session/:sessionId` - Get session details

**Deliverables:**
- ✅ Functional backend server
- ✅ Database with configurations and sessions
- ✅ Redis for real-time state
- ✅ API endpoints tested with Postman/Bruno
- ✅ Unit tests for database layer

---

### Phase 6: Backend Service - Rule Engine (Week 10)

**Objectives:**
- Implement rule processing logic
- Build event matching system
- Create action execution engine

**Tasks:**

**6.1 Rule Engine Architecture**
- Parse and load configuration rules
- Create rule matching algorithm:
  - Match device (TV/Phone)
  - Match trigger type
  - Match node ID or frame name
- Evaluate conditions (v1: minimal, e.g., all players answered)

**6.2 Event Processing**
- Receive events from WebSocket clients
- Normalize Figma Embed API events
- Route events to rule engine
- Execute matching rules in priority order

**6.3 Action Execution**
- Generate commands for target devices:
  - TV only
  - All phones
  - This phone (source device)
- Format commands for Figma Embed API:
  - `NAVIGATE_TO_FRAME_AND_CLOSE_OVERLAYS`
  - `RESTART`
  - `CHANGE_COMPONENT_STATE` (optional)

**6.4 Session State Management**
- Track connected devices per session
- Maintain player count (max 5)
- Store per-question state (e.g., players answered)
- Update state based on events

**6.5 Logging & Debugging**
- Log all events and rule firings
- Debug mode with verbose logging
- Error tracking with Sentry

**Deliverables:**
- ✅ Rule engine processing events correctly
- ✅ Actions sent to appropriate devices
- ✅ Session state maintained accurately
- ✅ Unit tests for rule matching
- ✅ Integration tests for event flow

---

### Phase 7: Backend Service - WebSocket Layer (Week 11)

**Objectives:**
- Implement WebSocket server
- Handle device connections
- Broadcast events and commands

**Tasks:**

**7.1 WebSocket Setup**
- Configure Socket.io server
- Handle connection authentication (session code)
- Manage connection lifecycle (connect, disconnect, reconnect)

**7.2 Device Registration**
- Register devices as TV or Phone
- Assign device IDs
- Enforce max 5 phones per session
- Handle "session full" scenario

**7.3 Event Routing**
- Receive Figma Embed API events from clients
- Route to rule engine
- Broadcast commands to target devices
- Handle one-to-one and one-to-many messaging

**7.4 Reconnection Logic**
- Graceful reconnect for dropped connections
- Restore device state on reconnect
- Session expiry (30 min idle timeout)

**7.5 Debug Overlay**
- Optional WebSocket debug messages
- Event stream for internal debugging

**Deliverables:**
- ✅ WebSocket server handling multiple connections
- ✅ Devices can connect and receive commands
- ✅ Reconnection works seamlessly
- ✅ Load testing with 6+ concurrent devices
- ✅ Integration tests for WebSocket flow

---

### Phase 8: Web Orchestrator - TV View (Week 12)

**Objectives:**
- Build TV session view
- Integrate Figma Embed API
- Display join code and QR code

**Tasks:**

**8.1 TV Session Creation**
- `GET /tv/:fileKey` endpoint (or template link)
- Backend creates session, returns sessionId + join code
- Load config for session

**8.2 TV Layout**
- Fullscreen Figma prototype embed (iframe)
- Top-right: Session join code display
- Bottom-right: QR code (links to phone join URL)
- Optional: Player count indicator

**8.3 Figma Embed Integration**
- Embed prototype with `client-id` parameter
- Listen for `INITIAL_LOAD` event
- Send navigation commands (`NAVIGATE_FORWARD`, etc.)
- Handle `PRESENTED_NODE_CHANGED` events

**8.4 WebSocket Connection**
- Connect to backend WebSocket
- Register as TV device
- Send Figma events to backend
- Receive and execute commands

**8.5 Error States**
- Config load failure
- Figma embed error
- WebSocket disconnection
- Retry mechanisms

**Deliverables:**
- ✅ TV view loads and displays prototype
- ✅ Join code and QR code visible
- ✅ WebSocket connected and sending events
- ✅ Commands from backend execute correctly
- ✅ E2E tests for TV flow

---

### Phase 9: Web Orchestrator - Phone View (Week 13)

**Objectives:**
- Build phone join flow
- Implement phone session view
- Handle multi-device sync

**Tasks:**

**9.1 Phone Join Flow**
- `GET /phone/join` page
- Session code input
- Validation and "Join Session" button
- Handle prefilled codes from QR scan

**9.2 Phone Session View**
- Fullscreen Figma prototype embed
- Minimal chrome (no visible UI overlay)
- Loading state while prototype initializes

**9.3 Figma Embed Integration**
- Embed phone prototype
- Listen for events (clicks, frame changes, variants)
- Send events to backend via WebSocket
- Execute commands received from backend

**9.4 WebSocket Connection**
- Connect with session code
- Register as Phone device
- Handle "session full" error
- Reconnection on network drop

**9.5 Disconnection Handling**
- Modal overlay on disconnect
- "Rejoin" and "Exit" options
- Graceful error messages

**Deliverables:**
- ✅ Phone join flow functional
- ✅ Phone view displays prototype
- ✅ Multi-device sync working (TV + 5 phones)
- ✅ Reconnection handled gracefully
- ✅ E2E tests for phone flow

---

### Phase 10: Integration & Testing (Week 14-15)

**Objectives:**
- End-to-end integration testing
- Bug fixing and polish
- Performance optimization

**Tasks:**

**10.1 Integration Testing**
- Full flow: Plugin → Publish → TV + Phones
- Test all rule types and triggers
- Test edge cases (disconnects, invalid data)
- Cross-browser testing (Chrome, Safari)

**10.2 Performance Testing**
- Load testing with 5 concurrent phones
- Measure event latency (target: <300ms)
- Optimize WebSocket message size
- Database query optimization

**10.3 Security Audit**
- Validate authentication on publish endpoints
- Test session code security
- Check for XSS/injection vulnerabilities
- Rate limiting on API endpoints

**10.4 Bug Fixes**
- Triage and fix bugs from testing
- Address edge cases
- Improve error messages

**10.5 Polish**
- UI/UX improvements
- Loading states and transitions
- Accessibility (ARIA labels, keyboard navigation)
- Mobile responsiveness for phone view

**Deliverables:**
- ✅ All critical bugs fixed
- ✅ Performance targets met
- ✅ Security vulnerabilities addressed
- ✅ Comprehensive test coverage (>80%)

---

### Phase 11: Documentation & Launch Prep (Week 16)

**Objectives:**
- Create user documentation
- Prepare for beta launch
- Set up monitoring and analytics

**Tasks:**

**11.1 Documentation**
- Plugin user guide (with screenshots)
- Designer workflow examples
- API documentation for backend
- Troubleshooting guide

**11.2 Monitoring Setup**
- Sentry error tracking (frontend + backend)
- Analytics dashboard (session count, rule usage)
- Logging aggregation (Datadog/LogRocket)

**11.3 Beta Launch Prep**
- Deploy to staging environment
- Internal beta testing with 3+ designers
- Collect feedback and iterate
- Create launch announcement

**11.4 Deployment**
- Deploy backend to production
- Deploy web app to production
- Submit plugin for Figma review
- Configure production monitoring

**Deliverables:**
- ✅ Complete documentation
- ✅ Monitoring and analytics live
- ✅ Beta launched internally
- ✅ Production deployment ready

---

## Detailed Component Breakdown

### 1. Figma Plugin Architecture

**Thread Model:**
- **Main Thread** (`code.ts`): Runs in Figma's plugin sandbox, has access to `figma` global object
- **UI Thread** (`ui.tsx`): Runs in iframe, no access to Figma API, communicates via `postMessage`

**Communication Flow:**
```typescript
// UI → Main Thread
// In ui.tsx
parent.postMessage({
  pluginMessage: { type: 'GET_FRAMES' }
}, '*');

// Main Thread → UI
// In code.ts
figma.ui.onmessage = (msg) => {
  if (msg.type === 'GET_FRAMES') {
    const frames = figma.currentPage.findAll(n => n.type === 'FRAME');
    figma.ui.postMessage({
      type: 'FRAMES_RESULT',
      frames: frames.map(f => ({ id: f.id, name: f.name }))
    });
  }
};

// In ui.tsx
window.onmessage = (event) => {
  const msg = event.data.pluginMessage;
  if (msg.type === 'FRAMES_RESULT') {
    setFrames(msg.frames);
  }
};
```

**Plugin Data Storage:**
```typescript
// Store configuration
const config = {
  configVersion: "1.0.0",
  devices: { tv: {...}, phone: {...} },
  rules: [...]
};

figma.root.setPluginData(
  'multiscreen-config',
  JSON.stringify(config)
);

// Retrieve configuration
const configJSON = figma.root.getPluginData('multiscreen-config');
const config = configJSON ? JSON.parse(configJSON) : null;
```

**Key Plugin APIs to Use:**
- `figma.currentPage.findAll()` - Find frames and components
- `figma.currentPage.selection` - Get selected nodes
- `node.setPluginData()` / `node.getPluginData()` - Persist data
- `figma.ui.postMessage()` - Send data to UI
- `figma.ui.onmessage` - Receive data from UI
- `figma.notify()` - Show toast notifications

---

### 2. Backend Rule Engine

**Rule Matching Algorithm:**

```typescript
interface Rule {
  id: string;
  trigger: {
    device: 'tv' | 'phone';
    type: 'FRAME_VISIBLE' | 'TAP_ELEMENT' | 'VARIANT_CHANGE';
    nodeId?: string;
    frameName?: string;
    variantId?: string;
  };
  target: 'tv' | 'all-phones' | 'this-phone';
  actions: Action[];
}

interface Action {
  type: 'NAVIGATE_TO_FRAME' | 'RESTART' | 'CHANGE_VARIANT';
  nodeId?: string;
  frameName?: string;
  variantId?: string;
}

interface Event {
  type: 'PRESENTED_NODE_CHANGED' | 'MOUSE_PRESS_OR_RELEASE' | 'NEW_STATE';
  deviceId: string;
  deviceType: 'tv' | 'phone';
  data: any;
}

function matchRule(rule: Rule, event: Event): boolean {
  // Match device type
  if (rule.trigger.device !== event.deviceType) return false;

  // Match event type
  if (rule.trigger.type === 'FRAME_VISIBLE' &&
      event.type === 'PRESENTED_NODE_CHANGED') {
    return event.data.presentedNodeId === rule.trigger.nodeId;
  }

  if (rule.trigger.type === 'VARIANT_CHANGE' &&
      event.type === 'NEW_STATE') {
    return event.data.variantId === rule.trigger.variantId;
  }

  // Add more matching logic...

  return false;
}

function executeRule(rule: Rule, event: Event, session: Session) {
  const commands = rule.actions.map(action => ({
    type: action.type,
    data: action
  }));

  // Determine target devices
  let targetDevices: string[] = [];
  if (rule.target === 'tv') {
    targetDevices = [session.tvDeviceId];
  } else if (rule.target === 'all-phones') {
    targetDevices = session.phoneDeviceIds;
  } else if (rule.target === 'this-phone') {
    targetDevices = [event.deviceId];
  }

  // Send commands to target devices
  targetDevices.forEach(deviceId => {
    sendCommandToDevice(deviceId, commands);
  });
}
```

---

### 3. Figma Embed API Integration

**Setup Requirements:**
1. Create OAuth app at https://www.figma.com/developers/apps
2. Get client ID
3. Add embed origins in OAuth app settings
4. Add `client-id` parameter to iframe URL

**Iframe Setup:**
```html
<iframe
  id="figma-embed"
  src="https://embed.figma.com/proto/FILE_KEY?node-id=NODE_ID&client-id=YOUR_CLIENT_ID&embed-host=your-domain.com"
  allowfullscreen
></iframe>
```

**Sending Commands:**
```typescript
const iframe = document.getElementById('figma-embed') as HTMLIFrameElement;
const figmaOrigin = 'https://www.figma.com';

function navigateToFrame(nodeId: string) {
  iframe.contentWindow?.postMessage(
    {
      type: 'NAVIGATE_TO_FRAME_AND_CLOSE_OVERLAYS',
      data: { nodeId }
    },
    figmaOrigin
  );
}

function restartPrototype() {
  iframe.contentWindow?.postMessage(
    { type: 'RESTART' },
    figmaOrigin
  );
}
```

**Listening for Events:**
```typescript
window.addEventListener('message', (event) => {
  if (event.origin !== 'https://www.figma.com') return;

  const message = event.data;

  switch (message.type) {
    case 'INITIAL_LOAD':
      console.log('Prototype loaded');
      break;

    case 'PRESENTED_NODE_CHANGED':
      console.log('Frame changed to:', message.presentedNodeId);
      // Send to backend via WebSocket
      socket.emit('figma-event', {
        type: 'PRESENTED_NODE_CHANGED',
        data: message
      });
      break;

    case 'MOUSE_PRESS_OR_RELEASE':
      console.log('User clicked at:', message.position);
      socket.emit('figma-event', {
        type: 'MOUSE_PRESS_OR_RELEASE',
        data: message
      });
      break;

    case 'NEW_STATE':
      console.log('Component variant changed:', message);
      socket.emit('figma-event', {
        type: 'NEW_STATE',
        data: message
      });
      break;
  }
});
```

---

### 4. WebSocket Protocol

**Client → Server Events:**
```typescript
// Device registration
socket.emit('register', {
  sessionId: 'ABC123',
  deviceType: 'tv' | 'phone'
});

// Figma events
socket.emit('figma-event', {
  type: 'PRESENTED_NODE_CHANGED' | 'MOUSE_PRESS_OR_RELEASE' | 'NEW_STATE',
  data: { ... }
});
```

**Server → Client Events:**
```typescript
// Registration confirmation
socket.on('registered', ({ deviceId, sessionData }) => {
  console.log('Registered as:', deviceId);
});

// Commands from rule engine
socket.on('command', ({ type, data }) => {
  if (type === 'NAVIGATE_TO_FRAME_AND_CLOSE_OVERLAYS') {
    navigateToFrame(data.nodeId);
  } else if (type === 'RESTART') {
    restartPrototype();
  }
});

// Session updates
socket.on('session-update', ({ playerCount }) => {
  console.log('Players in session:', playerCount);
});

// Errors
socket.on('error', ({ message }) => {
  console.error('Session error:', message);
});
```

---

## Development Workflow

### Local Development Setup

**Prerequisites:**
- Node.js 20+ LTS
- pnpm 8+
- Docker (for PostgreSQL + Redis)
- Figma desktop app (for plugin testing)

**Setup Steps:**
```bash
# Clone repository
git clone https://github.com/your-org/orchestrator.git
cd orchestrator

# Install dependencies
pnpm install

# Start local database (Docker Compose)
docker-compose up -d

# Run database migrations
cd packages/backend
pnpm prisma migrate dev

# Start all services in dev mode
cd ../..
pnpm dev
# This runs:
# - Plugin build (watch mode)
# - Backend server (localhost:3001)
# - Web app (localhost:3000)
```

**Plugin Development:**
```bash
# Build plugin
cd packages/plugin
pnpm build

# Watch mode (rebuilds on file changes)
pnpm dev

# In Figma:
# 1. Menu → Plugins → Development → Import plugin from manifest
# 2. Select packages/plugin/manifest.json
# 3. Run plugin from Plugins menu
# 4. Make changes, rebuild, re-run plugin
```

**Hot Reload:**
- Use Figma plugin hot reload tools (e.g., `figma-plugin-dev`)
- Backend uses `nodemon` for auto-restart
- Web app uses Next.js Fast Refresh

---

### Git Workflow

**Branching Strategy:**
- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - Feature branches
- `fix/*` - Bug fix branches
- `release/*` - Release preparation

**Commit Convention:**
- Use Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`, etc.
- Examples:
  - `feat(plugin): add rule editor UI`
  - `fix(backend): resolve session expiry bug`
  - `docs: update API documentation`

**Pull Request Process:**
1. Create feature branch from `develop`
2. Implement changes with tests
3. Push and create PR to `develop`
4. Code review (at least 1 approval)
5. CI checks must pass (linting, tests, build)
6. Squash and merge to `develop`

---

### Code Quality Standards

**TypeScript:**
- Strict mode enabled
- No implicit `any`
- Explicit return types for functions

**Linting:**
- ESLint with recommended rules
- Prettier for formatting
- Pre-commit hooks with Husky

**Testing:**
- Unit tests: Vitest (target >80% coverage)
- Integration tests: Supertest for API
- E2E tests: Playwright for web flows
- Test naming: `describe` → `it` pattern

**Documentation:**
- JSDoc comments for public APIs
- README per package
- Architecture decision records (ADRs) for major decisions

---

## Testing Strategy

### Unit Tests

**Plugin:**
- Config serialization/deserialization
- Rule validation logic
- Figma API utilities

**Backend:**
- Rule matching algorithm
- Session management
- Database queries

**Web:**
- Component rendering
- Utility functions
- State management

**Example:**
```typescript
// packages/shared/src/types/__tests__/validation.test.ts
import { describe, it, expect } from 'vitest';
import { validateConfig } from '../validation';

describe('Config Validation', () => {
  it('should validate a valid config', () => {
    const config = {
      configVersion: '1.0.0',
      devices: { tv: {...}, phone: {...} },
      rules: []
    };
    const result = validateConfig(config);
    expect(result.success).toBe(true);
  });

  it('should reject config with invalid version', () => {
    const config = {
      configVersion: 'invalid',
      devices: {},
      rules: []
    };
    const result = validateConfig(config);
    expect(result.success).toBe(false);
  });
});
```

---

### Integration Tests

**Backend API:**
- Test config publish flow
- Test session creation and join
- Test WebSocket connection

**Example:**
```typescript
// packages/backend/src/__tests__/api.test.ts
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../index';

describe('POST /api/config', () => {
  it('should publish a valid config', async () => {
    const config = { /* valid config */ };
    const response = await request(app)
      .post('/api/config')
      .set('Authorization', 'Bearer test-token')
      .send(config)
      .expect(200);

    expect(response.body).toHaveProperty('tvUrl');
    expect(response.body).toHaveProperty('phoneUrl');
  });
});
```

---

### E2E Tests

**Web App:**
- Full flow: Create session → Join phones → Trigger events → Verify sync

**Example with Playwright:**
```typescript
// packages/web/e2e/multi-device.spec.ts
import { test, expect } from '@playwright/test';

test('multi-device sync', async ({ browser }) => {
  // Create TV context
  const tvContext = await browser.newContext();
  const tvPage = await tvContext.newPage();

  // Create phone context (simulate mobile)
  const phoneContext = await browser.newContext({
    ...devices['iPhone 13']
  });
  const phonePage = await phoneContext.newPage();

  // TV: Open session
  await tvPage.goto('/tv/test-file-key');
  const joinCode = await tvPage.locator('[data-testid="join-code"]').textContent();

  // Phone: Join session
  await phonePage.goto('/phone/join');
  await phonePage.fill('[data-testid="session-code"]', joinCode);
  await phonePage.click('[data-testid="join-button"]');

  // Verify connection
  await expect(tvPage.locator('[data-testid="player-count"]')).toHaveText('1');

  // Simulate rule trigger (mock Figma event)
  await tvPage.evaluate(() => {
    window.postMessage({
      type: 'PRESENTED_NODE_CHANGED',
      presentedNodeId: 'frame-lobby'
    }, '*');
  });

  // Verify phone navigated
  await expect(phonePage.locator('[data-testid="current-frame"]')).toHaveText('Join Screen');
});
```

---

## Deployment Strategy

### Environments

**Development:**
- Local development (localhost)
- Docker Compose for databases

**Staging:**
- Mimics production environment
- Used for internal testing
- Deployed on every merge to `develop`

**Production:**
- Live environment for beta/GA
- Deployed from `main` branch
- Blue-green deployment for zero downtime

---

### Deployment Targets

**Figma Plugin:**
- Built locally or in CI
- Submitted to Figma for review
- Published via Figma Community (private initially)

**Web App (Next.js):**
- Deployed to Vercel or Netlify
- Auto-deploy on `main` branch push
- Environment variables configured in platform

**Backend:**
- Deployed to Railway, Render, or AWS ECS
- PostgreSQL: Managed service (e.g., Neon, Supabase)
- Redis: Managed service (e.g., Upstash, Redis Cloud)
- Environment variables in platform config

---

### CI/CD Pipeline

**GitHub Actions Workflows:**

**.github/workflows/ci.yml:**
```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main, develop]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm build
```

**.github/workflows/deploy-web.yml:**
```yaml
name: Deploy Web App

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4

      - run: pnpm install
      - run: pnpm --filter web build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

### Environment Variables

**Plugin:**
- `BACKEND_API_URL` - Backend API endpoint

**Web App:**
- `NEXT_PUBLIC_BACKEND_WS_URL` - WebSocket URL
- `NEXT_PUBLIC_FIGMA_CLIENT_ID` - Figma OAuth client ID

**Backend:**
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `AUTH_SECRET` - JWT signing secret
- `FIGMA_CLIENT_ID` - Figma OAuth client ID
- `FIGMA_CLIENT_SECRET` - Figma OAuth secret
- `SENTRY_DSN` - Sentry error tracking

---

## Risk Mitigation

### Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Figma Embed API changes | High | Medium | Version lock Embed API, monitor Figma changelog, maintain fallback |
| Plugin API deprecation | High | Low | Use stable APIs only, subscribe to Figma dev updates |
| WebSocket scaling issues | Medium | Medium | Use Redis pub/sub for multi-server, load testing |
| Database performance | Medium | Low | Index optimization, caching with Redis, query analysis |
| Session hijacking | High | Low | Secure session codes, rate limiting, expiry |

---

### Process Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Scope creep | Medium | High | Strict adherence to v1 PRD, deferred feature backlog |
| Designer adoption low | High | Medium | Early beta with 3+ designers, iterate on feedback |
| Timeline slippage | Medium | Medium | Weekly progress reviews, buffer time in Phase 10 |
| Security vulnerability | High | Low | Security audit in Phase 10, dependency scanning |

---

## Success Criteria

### Beta Launch (Week 16)

- ✅ 3+ designers actively using plugin
- ✅ 10+ unique sessions created
- ✅ All critical bugs resolved (<5 open bugs)
- ✅ Performance targets met (<300ms latency)
- ✅ 80%+ test coverage

### Post-Launch (3 Months)

- ✅ 50% reduction in designer time to prototype (self-reported)
- ✅ 80% of common trivia flows prototypeable without engineering
- ✅ Positive feedback from UX researchers
- ✅ <1% error rate in production

---

## Next Steps

### Immediate Actions (This Week)

1. **Initialize GitHub Repository**
   - Create repository with branch protection
   - Set up issue templates and labels
   - Add contributing guidelines

2. **Set Up Project Structure**
   - Initialize pnpm workspace
   - Create all package scaffolds
   - Configure TypeScript and linting

3. **Create Shared Types Package**
   - Define config schema with Zod
   - Create TypeScript interfaces
   - Set up package exports

4. **Set Up CI Pipeline**
   - Create GitHub Actions workflows
   - Configure test runners
   - Set up automated checks

---

## Appendix

### Key Dependencies

**Plugin:**
- `@figma/plugin-typings: ^1.90.0`
- `react: ^18.2.0`
- `react-dom: ^18.2.0`
- `zustand: ^4.5.0`
- `zod: ^3.22.0`
- `tailwindcss: ^3.4.0`

**Web:**
- `next: ^14.1.0`
- `react: ^18.2.0`
- `socket.io-client: ^4.6.0`
- `qrcode.react: ^3.1.0`
- `tailwindcss: ^3.4.0`

**Backend:**
- `express: ^4.18.0` or `fastify: ^4.26.0`
- `socket.io: ^4.6.0`
- `@prisma/client: ^5.9.0`
- `redis: ^4.6.0`
- `zod: ^3.22.0`

---

### References

- [Figma Plugin API Docs](https://developers.figma.com/docs/plugins/)
- [Figma Embed API Docs](https://developers.figma.com/docs/embeds/embed-api/)
- [Figma Embed Kit Example](https://github.com/figma/embed-kit-2.0-example)
- [Next.js Documentation](https://nextjs.org/docs)
- [Socket.io Documentation](https://socket.io/docs/)
- [Prisma Documentation](https://www.prisma.io/docs/)

---

**End of Implementation Plan**

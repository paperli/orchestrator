# PRD: Multi‑Device Prototype Orchestrator for Figma  
*(Working name: “Multiscreen Orchestrator”)*

## 1. Document Info

- **Owner:** Product Design – Multiplatform Hub  
- **Stakeholders:**  
  - Product: PM for Trivia / Multiplatform Hub  
  - Design: Product designers & UX researchers  
  - Engineering: Web frontend, Plugin engineers, Backend  
- **Status:** Draft v1.1  
- **Last Updated:** 2025‑11‑28  

---

## 2. Summary

We want designers to simulate “TV + phones” gameplay for our voice trivia products using **only Figma**, without hand‑coded prototypes or custom demo apps.

We’ll build:

1. **A Figma plugin (Authoring Tool)** where designers:
   - Mark which flows belong to **TV** and **Phone** roles.
   - Define cross‑device rules (“When TV shows Lobby, phones show Join screen”).
   - Publish a **multi‑device prototype configuration** that’s stored **per Figma file**.

2. **A web Orchestrator app (Runtime)** that:
   - Embeds the Figma TV and Phone prototypes.
   - Manages live sessions (join code, multiple phones connecting).
   - Listens for prototype events from Figma and applies the designer’s rules to sync TV and phones.

The public session link is **stable**: re‑publishing from the plugin **overwrites** the underlying configuration but preserves the same link. In v1 we don’t expose config history, but we keep the architecture compatible with future version tracking.

Test participants (remote or in‑person) **do not need auth**; only designers need access to the plugin/back‑office.

We support up to **5 phones per session** in v1, but keep the structure flexible for more devices and roles later.

---

## 3. Background & Context

Our product: **voice trivia games played primarily on TV, controlled/augmented by phones** (single and multiplayer).  
Design challenge: Figma is excellent at single‑device prototyping but has no native concept of **cross‑device state synchronization**.

Current workarounds:

- Designers manually sync two prototypes during tests (“Wizard of Oz”).
- Engineering builds throwaway demo apps to simulate multi‑device behavior.
- Multi‑tool workflows (e.g., Figma + ProtoPie) add friction and complexity.

We want to make **Figma the main design surface** and layer our own multi‑device orchestration around it.

---

## 4. Problem Statement

**Designers cannot currently prototype realistic TV + phone interactions for our trivia experiences using only Figma.**

Pain points:

- No way to **link TV and phone prototypes** so they react to each other.
- Hard to explore interactions like:
  - Phones joining sessions shown on TV.
  - Different players seeing different states.
  - TV responding to aggregated actions on phones (answers submitted, etc.).
- Research sessions require manual “driving” behind the scenes, which is slow and error‑prone.

We need an integrated toolchain that:

- Reuses existing Figma workflows.
- Adds multi‑device coordination with minimal overhead.
- Works for **single‑player and multiplayer** trivia flows.

---

## 5. Objectives & Success Metrics

### 5.1 Objectives

1. **Enable multi‑device prototyping in Figma**  
   Designers can define TV + phone interaction patterns without leaving Figma.

2. **Support realistic testing of trivia flows**  
   - Participants join a game session on their phones.
   - TV and all phones stay in sync according to a designed flow.
   - Researchers can run usability tests with minimal backstage choreography.

3. **Minimize engineering involvement in early UX exploration**  
   Reduce the need for custom demo apps for multi‑device design reviews and tests.

### 5.2 Success Metrics (v1)

- **Adoption**
  - ≥ 3 designers actively using the tool for real projects within 2 months of beta.
  - ≥ 10 unique prototype sessions run internally in first quarter post‑launch.

- **Efficiency / UX**
  - Designers report **≥ 50% reduction** in time to stand up a new multi‑screen prototype (self‑reported).
  - ≥ 80% of “common trivia flows” (join, lobby, question, answer, reveal, scoreboard) can be prototyped without engineering.

- **Quality**
  - Qualitative feedback from researchers:  
    “I can run a multi‑device test without someone ‘driving’ the prototypes manually.”

---

## 6. Scope

### 6.1 In Scope (v1)

- **Device roles**
  - 1 **TV** (browser on TV or laptop hooked to TV).
  - 1..5 **Player Phones** (mobile browser).
  - Data model remains flexible to support more devices/roles later.

- **Designer environment**
  - Figma (Editor + Prototyping).
  - Custom Figma plugin for authoring multi‑device logic.
  - **Configs are per Figma file** (one active config per file in v1).

- **Runtime environment**
  - Web Orchestrator app (runs in browsers).
  - Figma prototypes embedded via iframes.

- **Interactions**
  - Trigger TV → update phones.
  - Trigger phone → update TV.
  - Trigger individual phone → update that phone only (e.g., answer state, player identity).
  - Basic session logic (player joins, leaves, “game started”, “question index”).

- **Session model**
  - One **session** has:
    - One TV client.
    - Up to 5 phone clients.
    - One set of shared “prototype rules” from the Figma plugin.

- **Authentication**
  - Designers (plugin + publishing) are behind internal auth/SSO.
  - Test participants (TV + phones) **do not require auth**; they join via published links/codes.

### 6.2 Out of Scope (v1)

- Native mobile apps or native TV apps (Web only in v1).
- Real backend game logic (scores, persistence beyond session lifetime).
- Voice recognition / real device microphones (voice can be simulated via buttons/timers).
- Arbitrary device types beyond TV + phone (e.g., tablets, watches).
- Exporting or syncing from tools other than Figma (e.g., Sketch, XD).

---

## 7. Personas

### 7.1 Primary: Product Designer

- Goals:
  - Explore and communicate multi‑device trivia experiences.
  - Iterate quickly on flows without asking engineers for custom prototypes.
- Needs:
  - **Visual mapping** between TV and phone screens.
  - **No‑code** rules for cross‑device triggers (“When this happens, do that”).
  - Plugin UX that feels “Figma‑native”: simple panels, selections, and natural language rules.

### 7.2 Secondary: UX Researcher

- Goals:
  - Run usability tests where participants use their own phones and a shared TV.
  - Observe natural behavior without explaining backend hacks.
- Needs:
  - Easy way to launch sessions.
  - Clear join instructions for participants.
  - Reliability (no frequent state desyncs).

### 7.3 Secondary: Engineer / Tech Lead

- Goals:
  - Understand intended multi‑device behavior before implementation.
  - Use prototypes as reference for implementation.
- Needs:
  - Clear mapping between prototype steps and intended game logic.
  - Minimal overhead to keep this tool maintained.

---

## 8. User Scenarios & Flows

### 8.1 Scenario A: Single‑Player Trivia (TV + one phone)

1. Designer creates TV and Phone flows in Figma.
2. Designer opens plugin, sets:
   - TV starting frame → “Lobby”.
   - Phone starting frame → “Join screen”.
3. Designer defines rules:
   - When **TV frame == Lobby**, all phones show **Join**.
   - When **TV “Start Game” button tapped**,  
     → TV → “Question 1”, Phones → “Answer Q1”.
   - When **phone answer selected**, that phone shows “Answer locked”.
   - After delay or manual trigger,  
     → TV → “Reveal Answer”, Phone → “Feedback (correct/wrong)”.
4. Designer publishes config.
5. In testing, researcher:
   - Opens TV link on TV browser.
   - Opens phone link on one phone.
   - Runs through the experience; everything stays in sync.

### 8.2 Scenario B: Multiplayer Trivia (TV + up to 5 phones)

1. Same as before, but plugin rules include:
   - When **phone joins**, orchestrator:
     - Assigns a player slot up to `maxPlayers = 5`.
     - Updates TV Lobby to show new player (via dedicated frames or overlay).
   - For each question:
     - Phones show answer options.
     - When a phone answers, that phone locks.
     - TV displays “Answered” indicator per player (or aggregated status).
   - When **all players answered** OR time runs out:
     - TV → “Reveal Answer”.
     - All phones → “Answer Result”.
2. Researcher invites multiple participants to join via QR code.
3. They play through several questions; all devices remain coordinated.

---

## 9. Functional Requirements

### 9.1 Figma Plugin – Authoring Tool

#### 9.1.1 Discovery & Setup

- **FR‑P1**: The plugin can be installed and launched from any Figma file where the user has edit access.
- **FR‑P2**: On launch, plugin reads:
  - File key, pages, frames, prototype connections.
- **FR‑P3**: Plugin lets the user select or confirm:
  - Which page/frames represent **TV**.
  - Which page/frames represent **Phone**.
  - For v1, assume one TV role and one Player Phone role (internally allow more roles in schema).

#### 9.1.2 Role & Flow Configuration

- **FR‑P4**: Allow designer to specify:
  - **TV starting frame** (node ID).
  - **Phone starting frame** (node ID).
- **FR‑P5**: Store role configuration in plugin data in the Figma file so it persists across sessions and collaborators.
- **FR‑P6**: There is exactly **one active configuration per Figma file** in v1, editable and re‑publishable.

#### 9.1.3 Rule Editor (Logical Model)

- **FR‑P7**: Provide a visual “rules list” where designer can:
  - Add / edit / duplicate / delete rules.
  - Toggle rules on/off.
- **FR‑P8**: Each rule must have:
  - **Trigger**:
    - Device: TV or Phone.
    - Trigger type (v1 allowed types):
      - `Frame shown` (frame becomes active).
      - `User taps element` (node click).
      - `Component variant changed` (e.g., button state from default → selected).
  - **Optional Conditions** (v1 minimal):
    - Session conditions like “all players answered” (exposed as simple dropdowns, backed by session state).
  - **Actions** (one or more per rule):
    - Target scope:
      - TV.
      - All phones.
      - This phone only (the phone that triggered the event).
    - Action type:
      - Navigate to specific frame.
      - Restart prototype.
      - (Nice‑to‑have v1) Change variant of a specific component.
- **FR‑P9**: Rule editor uses human‑readable labels (frame names, component names) with node IDs handled internally.

#### 9.1.4 Rule–to–Figma Mapping

- **FR‑P10**: For triggers/actions that reference frames or components, plugin must support:
  - Selecting from a searchable dropdown list of frames/components.
  - A “Use selection” affordance: designer selects a layer/component on the canvas and plugin captures that node as the target.
- **FR‑P11**: For `Component variant changed` triggers, plugin:
  - Allows designer to choose:
    - Component (or instance).
    - Source variant (optional).
    - Target variant (state to detect, e.g., “selected”).
  - Serializes this into a stable identifier the Orchestrator can map to Figma’s embed events.

#### 9.1.5 Validation & Error Handling

- **FR‑P12**: Validate rules on save:
  - Ensure referenced frames/components still exist.
  - Highlight broken references with clear messages and visual badges in the rule list.
- **FR‑P13**: Provide basic conflict hints:
  - Warn when multiple rules share exactly the same trigger and target different frames on the same device.
  - Warnings do not block publish (designer can override).

#### 9.1.6 Publish Configuration

- **FR‑P14**: Export a configuration JSON that includes:
  - File key.
  - Device roles, starting frames.
  - List of rules (triggers, targets, actions, conditions).
  - Prototype share URLs (or embed URLs) for TV and Phone flows.
- **FR‑P15**: Send this configuration to the Orchestrator backend via HTTPS.
- **FR‑P16**: Because configs are **per file** and link‑stable:
  - Subsequent publishes **overwrite** the existing configuration associated with this file.
  - The backend returns the same public “session template” link if one exists; otherwise it creates one.
- **FR‑P17**: On successful publish, display:
  - A **TV template link** to use on the big screen.
  - A **Phone base/join link** to share with participants.
  - A short label like “Last published 3 min ago”.

---

### 9.2 Orchestrator Web App – Runtime

#### 9.2.1 Session Management

- **FR‑O1**: When accessing a **TV template link**:
  - Create a new session with:
    - Unique session ID / short join code.
    - Metadata: file key, config ID, timestamp.
- **FR‑O2**: TV view:
  - Shows embedded Figma prototype for TV in an iframe.
  - Displays the join code and optional QR code for phones.
- **FR‑O3**: When a **Phone join link** is opened:
  - Prompt for session code (if not present in URL).
  - Register device as a **phone participant** in that session.
  - Enforce `maxPlayers = 5`:
    - If full, show “game full” message and do not join.

#### 9.2.2 Device Communication

- **FR‑O4**: For each embedded Figma prototype (TV or Phone):
  - Receive events from Figma’s embed (e.g., frame change, variant change, click).
  - Send control commands to Figma via `postMessage` (navigate to frame, restart, etc.).
- **FR‑O5**: Orchestrator must route:
  - Events → Rule engine → Actions → Commands to appropriate devices.

#### 9.2.3 Rule Engine (Runtime)

- **FR‑O6**: Load configuration JSON for a session on creation.
- **FR‑O7**: For each incoming event:
  - Identify applicable rule(s) (match device + trigger type + frame/component).
  - Evaluate simple conditions (e.g., playersAnswered == totalPlayers).
  - Execute actions:
    - **TV only**: navigation/commands to TV iframe.
    - **All phones**: broadcast navigation/commands to all phone iframes in session.
    - **This phone**: navigation/commands only to emitting phone.
- **FR‑O8**: Maintain minimal session state:
  - List of connected phones (up to 5).
  - Per‑question: which players have answered.
  - Current question index (if used in rules).

#### 9.2.4 Phone Experience (Runtime UI wrapper)

- **FR‑O9**: When a phone joins:
  - Show a brief loading state until Figma phone prototype is ready.
  - Then show the embedded phone prototype fullscreen within browser.
- **FR‑O10**: If connection to session is lost:
  - Show an error and prompt to rejoin via code.

#### 9.2.5 Observability / Debugging

- **FR‑O11**: Provide optional **debug overlay** (toggle via query param or secret key) for internal use showing:
  - Current session ID.
  - Connected device count.
  - Recent events and rule firings.
- **FR‑O12**: Log key events server‑side:
  - Session start / end.
  - Join / leave.
  - Rule triggers.
  - Errors.

---

### 9.3 Shared Requirements (Plugin + Orchestrator)

- **FR‑S1**: Configuration format between plugin and Orchestrator is versioned (e.g., `configVersion`).
- **FR‑S2**: Changes to plugin rules overwrite the current config; we retain the option to add version history later without changing public URLs.
- **FR‑S3**: Designers must authenticate (SSO) to:
  - Install and use the plugin.
  - Publish or manage configurations.
- **FR‑S4**: Test participants (TV or phones) must **not** be required to log in; they join via links/codes only.

---

## 10. Detailed Plugin UX – Logic & Triggers

This section describes how designers *actually use* the plugin inside Figma.

### 10.1 Plugin Information Architecture

The plugin is a single panel with three main sections:

1. **Setup** – define devices and starting frames.
2. **Rules** – define and manage cross‑device logic.
3. **Publish** – review configuration status and publish links.

The plugin opens on the **Setup** section when no configuration exists, and on **Rules** when a configuration already exists.

Persistent elements:

- File name and status at top:  
  “`my‑trivia‑file.fig` · Config: Not published / Published (time).”
- A small “device legend” showing:
  - TV (icon + color).
  - Phone (icon + color).

### 10.2 Setup Flow (Designer First‑Time Experience)

**State 1 – No Config**

- Message: “Create a multi‑device prototype for this Figma file.”
- Primary button: **“Start setup”**.

**Step 1 – Choose Device Roles**

- Two cards:
  - **TV role**
    - Dropdown: select page for TV screens (optional).
    - Button: “Pick starting frame from canvas”
      - Instructions: “Select the frame that is the first screen on TV, then click ‘Use selection’.”
  - **Phone role**
    - Same pattern for phone.

- Once both have valid frames, “Continue” is enabled.

**Step 2 – Confirm Flows**

- List of discovered frames for each device (simple scroll list).
- Designer can optionally:
  - Mark “key frames” to show first in pickers later (for faster rule authoring).
- “Save & continue” moves to **Rules** for the first time.

After completing Setup once, opening the plugin lands on **Rules**, with Setup accessible for editing via a small “Edit setup” link.

### 10.3 Rules Section – Rule List View

The **Rules** section has:

- A compact **“Empty state”** if there are no rules yet:
  - Copy: “Connect your TV and phone flows with rules.”
  - Primary: “+ Create first rule”
  - Secondary: Template chips:
    - “Lobby → Join”
    - “Start game → Show question”
    - “Answer selected → Lock + reveal”

- When rules exist:
  - A list of rule rows, each displayed in natural language:

    > **Rule 1**  
    > When **TV** shows **Lobby** → **All Phones** go to **Join Game**

  - Each row has icons to:
    - Edit (pencil).
    - Duplicate.
    - Delete.
    - Toggle active/inactive.

  - A “+ Add rule” button at the bottom.

### 10.4 Rule Editor – “When / Where / Do” Pattern

Clicking “Create rule” or editing an existing one opens an inline or modal editor structured as:

1. **WHEN…** (Trigger)
2. **WHERE…** (Target scope)
3. **DO…** (Actions)

#### 10.4.1 WHEN – Choosing a Trigger

Controls:

- **Device selector**:  
  Dropdown: `TV` / `Phone`.

- **Trigger type selector** (radio buttons or dropdown):
  - **Frame becomes visible**
  - **User taps element**
  - **Component changes state**

Depending on trigger type:

1. **Frame becomes visible**
   - Frame picker:
     - List of frames from the chosen device’s page.
     - Search by frame name.
     - “Use selected frame” button to bind the frame currently selected on the Figma canvas.

2. **User taps element**
   - Instructions:
     - “Select the element that acts as the trigger (e.g., Start button), then click ‘Use selection’.”
   - Once selection is captured:
     - Show its name and frame context (“Start Button in Lobby frame”).

3. **Component changes state**
   - Picker flow:
     - Buttons:
       - “Pick instance from canvas” (designer selects a component instance).
     - Once picked:
       - Display component name and available variants in two dropdowns:
         - (Optional) From variant: [Any / Default / etc.]
         - To variant: e.g., “Selected”.
   - Designer can choose:
     - “Trigger when ANY instance of this component changes to [Selected]”
     - or “Only this specific instance”.

A live, natural language preview updates as the designer tweaks fields, e.g.:

> When **Phone** component **Answer Option** changes to variant **Selected**

#### 10.4.2 WHERE – Choosing Target Scope

A simple choice:

- Radios:
  - **TV**
  - **All phones**
  - **This phone only**

For v1, we don’t expose more advanced scopes (e.g., “all other phones”). The data model stays flexible enough to add that later.

The preview updates, e.g.:

> When **Phone** component **Answer Option** changes to **Selected**, **This Phone**…

#### 10.4.3 DO – Defining Actions

Designer can add one or more actions.

**Action type** dropdown:

- Navigate to frame
- Restart prototype
- (Optional v1) Change component variant

**Navigate to frame**

- Device is implied by “WHERE” but shown read‑only (“Target: All phones”).
- Frame picker similar to Trigger’s frame picker:
  - List of frames for that device.
  - Search.
  - “Use selection” from canvas.

**Restart prototype**

- No additional fields; just restarts prototype for the scoped device(s).

**Change component variant** (nice‑to‑have v1)

- Similar component picker as Trigger.
- Designer picks:
  - Component / instance on target device.
  - Variant to switch to (e.g., “Show overlay: Results”).

Multiple actions appear as a small stack:

1. TV → Navigate to `Question 1`
2. All phones → Navigate to `Answer Q1`

With ability to delete individual actions.

### 10.5 Saving & Feedback

- The rule editor has buttons:
  - **Save rule**
  - **Cancel**
- On save:
  - Rule list updates.
  - Any validation errors show inline under affected fields.

Error examples:

- “This frame no longer exists. Please choose another frame.”
- “Trigger node not found. Re‑select the layer on the canvas.”

### 10.6 Example: Building a Common Trivia Flow

To make the flow “When TV Lobby is shown, phones show Join screen”:

1. In Rules, click **“+ Add rule”**.
2. WHEN:
   - Device: TV.
   - Trigger type: Frame becomes visible.
   - Frame: select “Lobby”.
3. WHERE:
   - Target scope: All phones.
4. DO:
   - Action type: Navigate to frame.
   - Frame: select “Join Game”.
5. Save.

The rule list row reads:

> When **TV** shows **Lobby** → **All phones** go to **Join Game**

Designers can repeat this pattern for Start Game, Answer Selected, Reveal Results, etc., always seeing a natural language summary.

---

## 11. Orchestrator UX

### 11.1 TV View

- Opens from the **TV template link**.
- Layout:
  - Center: TV Figma prototype iframe (maximized).
  - Top‑right: “Session code: 4‑letter/5‑digit code”.
  - Optional bottom‑right: QR code linking to phone join URL with prefilled session code.
  - Optional small status line: “Players joined: 0 / 5.”

Error states:

- If config fails to load:
  - Message: “This prototype configuration can’t be loaded. Ask your designer to republish the config.”
  - Retry button.

### 11.2 Phone View

- Opens from **Phone join link**.
- Initial screen (if no session code in URL):
  - Title: “Join a prototype game”.
  - Input: Session code.
  - Button: “Join”.
- If session code is prefilled:
  - Skip straight to joining state.

Once joined:

- Short “Connecting…” spinner while Figma phone prototype loads.
- Then phone prototype goes fullscreen with no extra chrome (or minimal top bar only in debug mode).

If session is full (more than 5 players):

- Show: “This session is full (5/5 players). Ask the host to start a new session.”

If connection drops:

- Modal overlay: “Your connection was lost. Rejoin?” with:
  - “Rejoin” (retries).
  - “Exit”.

---

## 12. Technical Overview

### 12.1 Architecture (High‑Level)

- **Figma Plugin**
  - Runs in Figma’s plugin environment.
  - Uses plugin API for:
    - Reading frames, nodes, names.
    - Storing plugin data per file.
  - Communicates with backend via HTTPS to publish configuration.

- **Backend / Orchestrator Server**
  - Stores:
    - Configuration JSON keyed by Figma file key.
    - Session metadata.
  - Handles:
    - Session creation and join.
    - WebSocket (or SSE) connections for live sessions.
    - Logging / analytics.

- **Orchestrator Frontend**
  - Web app that:
    - Embeds TV and Phone prototypes (iframed).
    - Listens for Figma messages from each iframe.
    - Sends control messages to iframes.
    - Connects to backend via WebSocket/SSE for cross‑device sync.

### 12.2 Data Model (Simplified)

- **PrototypeConfig**
  - `fileKey`
  - `configVersion` (internal, not exposed in URLs for v1)
  - `devices` (e.g., `{ tv: {...}, phone: {...} }`)
  - `rules[]`
  - `maxPlayers` (default 5)

- **Session**
  - `sessionId` (short code)
  - `fileKey`
  - `configSnapshot` (config at time of session creation)
  - `tvClientId`
  - `phoneClients[]` (up to 5)
  - `state` (question index, answered players, etc.)

---

## 13. Non‑Functional Requirements

- **Performance**
  - TV and phone actions should propagate in under 300–500 ms on a typical internal or home network.
- **Reliability**
  - The system should handle reconnects gracefully (participants drop and rejoin).
- **Security**
  - Designers must authenticate (SSO) to use the plugin and publish.
  - Sessions themselves (TV/phone join) require only knowledge of the URL/code.
- **Compatibility**
  - Supported browsers:
    - TV: Chrome / Edge (desktop) projected to TV.
    - Phone: Mobile Safari (iOS), Chrome (Android).

---

## 14. Dependencies

- Figma:
  - Plugin API availability.
  - Embed behavior and messaging API.
- Internal infrastructure:
  - Hosting for Orchestrator web app and backend.
  - WebSocket / SSE capability.
- Org:
  - Internal auth / SSO for designers.

---

## 15. Risks & Mitigations

- **Risk:** Figma changes embed or messaging APIs.  
  **Mitigation:**  
  - Keep integration isolated.
  - Use a configuration version and test whenever Figma updates.

- **Risk:** Complex flows exceed v1 rule system (e.g., heavy branching or game logic).  
  **Mitigation:**  
  - Clearly document v1 rule limitations.
  - Plan v2 for richer conditions and variables if needed.

- **Risk:** Performance issues with many phones.  
  **Mitigation:**  
  - v1 limits to 5 players per session.
  - Design data model and messaging to scale higher later.

---

## 16. Analytics & Telemetry

Track, at minimum:

- **Prototype configs**
  - Created and published counts (per file key).
- **Sessions**
  - Count per config.
  - Average players per session.
  - Average duration.
- **Failures**
  - Figma embed load errors.
  - Rule execution errors.
  - Session joins failing due to “full” or invalid code.

Provide a simple internal dashboard in v2+; for v1, raw logs/metrics are sufficient.

---

## 17. Decisions (from Open Questions)

1. **Config ownership**
   - Configs are **per Figma file**; one active config per file in v1.

2. **Versioning & URLs**
   - The public template link is **stable per file**.
   - Re‑publishing overwrites the existing config.
   - Internally we keep `configVersion` so we can add history in future without changing URLs.

3. **Authentication**
   - Only designers need auth (plugin + publishing).
   - Test participants (TV + phones) can open the published links without logging in, enabling remote user testing.

4. **Maximum players**
   - v1 supports **up to 5 phones per session**.
   - Data model and code paths use `maxPlayers` as a parameter so we can increase later without structural change.
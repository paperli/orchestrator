# Testing Guide - Multiscreen Orchestrator

This guide will walk you through testing the Figma plugin you just built.

## Prerequisites

- ✅ Figma desktop app installed ([Download here](https://www.figma.com/downloads/))
- ✅ Plugin built successfully (`pnpm build` completed)

## Step-by-Step Testing Instructions

### Step 1: Build the Plugin

```bash
# From the project root
cd /Users/ken-junglee/Documents/projects/orchestrator

# Build the shared package first (required dependency)
cd packages/shared
pnpm build

# Build the plugin
cd ../plugin
pnpm build
```

You should see output like:
```
✓ 70 modules transformed.
../dist/ui.html    1.06 kB │ gzip:  0.55 kB
../dist/ui.css     5.95 kB │ gzip:  1.37 kB
../dist/code.js   59.68 kB │ gzip: 14.18 kB
../dist/ui.js    151.37 kB │ gzip: 48.59 kB
✓ built in 435ms
```

### Step 2: Install Plugin in Figma

1. **Open Figma Desktop App**
   - Make sure you're using the desktop app, not the browser version
   - The plugin API requires the desktop app

2. **Access Plugin Development Menu**
   - Click on the menu icon (☰) in the top-left corner
   - Navigate to: **Plugins → Development → Import plugin from manifest...**

   ![Figma Menu](https://help.figma.com/hc/article_attachments/4406424932375/Import_plugin_from_manifest.png)

3. **Select the Manifest File**
   - A file picker will open
   - Navigate to:
     ```
     /Users/ken-junglee/Documents/projects/orchestrator/packages/plugin/manifest.json
     ```
   - Click **Open**

4. **Verify Installation**
   - You should see a success message
   - The plugin "Multiscreen Orchestrator" is now installed

### Step 3: Create a Test Figma File

Create a simple test file to work with:

1. **Create a New File**
   - File → New design file
   - Or use an existing file

2. **Create Test Frames (Optional but Recommended)**

   For a realistic test, create some frames:

   **TV Frames:**
   - Press `F` to create a frame
   - Select "Desktop" → "Desktop" (1440 × 1024) or any large size
   - Name it "TV - Lobby"
   - Create another frame: "TV - Question 1"
   - Create another frame: "TV - Results"

   **Phone Frames:**
   - Press `F` to create a frame
   - Select "Phone" → "iPhone 14 Pro" (393 × 852)
   - Name it "Phone - Join"
   - Create another frame: "Phone - Answer"
   - Create another frame: "Phone - Results"

   Your canvas should look like:
   ```
   [TV - Lobby]  [TV - Question 1]  [TV - Results]

   [Phone - Join]  [Phone - Answer]  [Phone - Results]
   ```

### Step 4: Run the Plugin

1. **Open the Plugin**
   - Menu → Plugins → Development → **Multiscreen Orchestrator**
   - Or use Quick Actions: `Cmd+/` (Mac) or `Ctrl+/` (Windows), type "Multiscreen"

2. **Plugin UI Should Open**
   - A panel appears on the right side (400px wide, 600px tall)
   - You should see three tabs at the top: **Setup | Rules | Publish**
   - The "Setup" tab should be active
   - "Rules" and "Publish" tabs should be grayed out (disabled)

### Step 5: Test the UI

#### Test 1: Initial State
- ✅ Plugin loads without errors
- ✅ Loading spinner appears briefly, then main UI
- ✅ Setup tab is active
- ✅ You see two device cards: "📺 TV Display" and "📱 Phone Controller"
- ✅ Both cards show "Select Frame from Canvas" buttons
- ✅ "Continue to Rules" button at bottom is disabled (grayed out)

#### Test 2: Theme Support
- Toggle Figma's theme: Menu → Preferences → Theme
- Switch between Light and Dark mode
- ✅ Plugin UI should adapt automatically
- ✅ Colors should change appropriately

#### Test 3: Navigation (Disabled Tabs)
- Click on "Rules" tab
  - ✅ Nothing should happen (tab is disabled)
- Click on "Publish" tab
  - ✅ Nothing should happen (tab is disabled)
- Click on "Setup" tab
  - ✅ Should remain on Setup (already active)

#### Test 4: Device Cards
- Look at the TV Display card:
  - ✅ Has a TV emoji icon (📺)
  - ✅ Title says "TV Display"
  - ✅ Has "Starting Frame" label
  - ✅ Has a blue "Select Frame from Canvas" button
  - ✅ Has help text: "Select the frame that will be shown first on the TV"

- Look at the Phone Controller card:
  - ✅ Has a phone emoji icon (📱)
  - ✅ Title says "Phone Controller"
  - ✅ Same structure as TV card

### Step 6: Test Browser Console

1. **Open Console**
   - Menu → Plugins → Development → **Open Console**
   - A browser DevTools window opens

2. **Check for Errors**
   - Look at the Console tab
   - ✅ Should see initialization messages
   - ✅ No red error messages
   - ❌ If you see errors, note them down

3. **Inspect Elements**
   - Click the Elements/Inspector tab
   - You can see the HTML structure
   - Explore the React component tree

### Step 7: Test Main Thread Console

1. **Open Plugin Console**
   - Menu → Plugins → Development → **Show/Hide Console**
   - A smaller console window appears

2. **Check Main Thread**
   - This shows logs from `code.ts` (main thread)
   - ✅ Should be relatively quiet
   - ✅ No errors about plugin data loading

### Step 8: Test Responsiveness

1. **Resize the Plugin Panel**
   - Drag the left edge of the plugin panel
   - ✅ UI should adapt (scroll if needed)
   - ✅ No horizontal scrolling should occur

2. **Scroll Test**
   - If you have a small screen, try scrolling
   - ✅ Content should scroll smoothly
   - ✅ Header with tabs should stay fixed at top

### What to Expect (Current Limitations)

Since we're in Phase 1, some features are **intentionally not working yet**:

❌ **Not Yet Implemented:**
- "Select Frame from Canvas" button does nothing (Phase 2)
- Can't save configuration (Phase 2)
- Can't navigate to Rules or Publish (requires config)
- No backend connection (Phase 5-7)

✅ **What Should Work:**
- Plugin loads and displays UI
- Tabs render correctly
- Theme support works
- No JavaScript errors
- Console shows no errors
- UI is responsive

## Troubleshooting

### Plugin Doesn't Appear in Menu

**Problem:** Can't find "Multiscreen Orchestrator" in plugins menu

**Solutions:**
1. Make sure you imported the manifest (Step 2)
2. Check that `manifest.json` exists at the correct path
3. Try re-importing: Plugins → Development → Import plugin from manifest
4. Restart Figma desktop app

### Plugin Won't Load / Blank Screen

**Problem:** Plugin opens but shows a blank screen or infinite loading

**Solutions:**
1. Check browser console for errors (Menu → Plugins → Development → Open Console)
2. Rebuild the plugin:
   ```bash
   cd packages/plugin
   pnpm build
   ```
3. Close and reopen the plugin in Figma
4. Check that all files exist in `dist/`:
   ```bash
   ls -la /Users/ken-junglee/Documents/projects/orchestrator/packages/plugin/dist/
   ```
   You should see: `code.js`, `ui.js`, `ui.html`, `ui.css`

### Build Errors

**Problem:** `pnpm build` fails

**Solutions:**
1. Build shared package first:
   ```bash
   cd packages/shared
   pnpm build
   ```
2. Install dependencies:
   ```bash
   cd /Users/ken-junglee/Documents/projects/orchestrator
   pnpm install
   ```
3. Check for TypeScript errors:
   ```bash
   cd packages/plugin
   pnpm typecheck
   ```

### Theme Not Working

**Problem:** Plugin doesn't adapt to Figma's light/dark mode

**Solution:**
- This is normal - the CSS uses Figma's CSS variables which may not be fully applied yet
- Check in the browser console: `getComputedStyle(document.body).getPropertyValue('--figma-color-bg')`
- If it returns nothing, Figma's theme system isn't injecting variables (this is a Figma limitation)

### Buttons Don't Work

**Problem:** Clicking buttons does nothing

**Expected:** In Phase 1, most buttons are placeholders and won't do anything yet. This is normal!

**What Should Work:**
- Tab navigation (Setup is already active)
- Opening/closing the plugin

**What Won't Work Yet:**
- "Select Frame from Canvas" buttons (Phase 2)
- "Continue to Rules" button (Phase 2)
- "Create First Rule" button (Phase 3)
- "Publish Configuration" button (Phase 4)

## Success Checklist

If you can check all these boxes, Phase 1 is working correctly:

- [ ] Plugin appears in Figma's Plugins menu
- [ ] Plugin opens without errors
- [ ] UI displays with correct layout
- [ ] Three tabs visible: Setup, Rules, Publish
- [ ] Setup tab is active
- [ ] Rules and Publish tabs are disabled
- [ ] Two device cards (TV and Phone) are visible
- [ ] Browser console shows no errors
- [ ] Main thread console shows no errors
- [ ] Theme switches between light/dark (if you change Figma's theme)

## Next Steps

Once you've verified everything works:

1. **Take Screenshots** (optional)
   - Screenshot the plugin UI
   - Note any visual issues

2. **Report Issues**
   - If something doesn't work as described above
   - Check if it's a "known limitation" from Phase 1
   - Note the error messages from console

3. **Ready for Phase 2?**
   - We'll implement the "Select Frame from Canvas" functionality
   - Make the Setup flow fully functional
   - Enable navigation to Rules section

---

## Quick Reference Commands

```bash
# Build everything
cd /Users/ken-junglee/Documents/projects/orchestrator
pnpm install
pnpm build

# Rebuild just the plugin
cd packages/plugin
pnpm build

# Watch mode (auto-rebuild on changes)
cd packages/plugin
pnpm dev

# Check for errors
cd packages/plugin
pnpm typecheck
```

## Need Help?

- Check the [Plugin README](./packages/plugin/README.md)
- Review the [Implementation Plan](./IMPLEMENTATION_PLAN.md)
- Open an issue on GitHub

Happy testing! 🧪

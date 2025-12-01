# Quick Start Guide

This guide will help you get the Multiscreen Orchestrator project up and running quickly.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20+ LTS ([Download](https://nodejs.org/))
- **pnpm** 8+ ([Install](https://pnpm.io/installation))
- **Docker** ([Install](https://docs.docker.com/get-docker/))
- **Figma Desktop App** ([Download](https://www.figma.com/downloads/))
- **Git** ([Install](https://git-scm.com/downloads))

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/orchestrator.git
cd orchestrator
```

### 2. Install Dependencies

```bash
pnpm install
```

This will install all dependencies for all packages in the monorepo.

### 3. Set Up Local Databases

We use Docker Compose to run PostgreSQL and Redis locally:

```bash
docker-compose up -d
```

This starts:
- PostgreSQL on `localhost:5432`
- Redis on `localhost:6379`

### 4. Configure Environment Variables

Create environment files for each package:

**Backend (`packages/backend/.env`):**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/orchestrator"
REDIS_URL="redis://localhost:6379"
PORT=3001
NODE_ENV=development
```

**Web App (`packages/web/.env.local`):**
```env
NEXT_PUBLIC_BACKEND_WS_URL=ws://localhost:3001
NEXT_PUBLIC_FIGMA_CLIENT_ID=your-figma-client-id
```

**Plugin (`packages/plugin/.env`):**
```env
BACKEND_API_URL=http://localhost:3001/api
```

### 5. Run Database Migrations

```bash
cd packages/backend
pnpm prisma migrate dev
cd ../..
```

### 6. Start Development Servers

Start all services in development mode:

```bash
pnpm dev
```

This starts:
- **Plugin build** (watch mode) - rebuilds on file changes
- **Backend server** - http://localhost:3001
- **Web app** - http://localhost:3000

## Developing the Figma Plugin

### Building the Plugin

```bash
cd packages/plugin
pnpm build
```

### Installing in Figma

1. Open Figma desktop app
2. Go to **Menu → Plugins → Development → Import plugin from manifest**
3. Navigate to `packages/plugin/manifest.json` and select it
4. The plugin will now appear in your Plugins menu

### Running the Plugin

1. Open or create a Figma file
2. Go to **Plugins → Development → Multiscreen Orchestrator**
3. The plugin UI will open

### Hot Reload (Optional)

For faster development, use watch mode:

```bash
cd packages/plugin
pnpm dev
```

After making changes:
1. Save your files (plugin rebuilds automatically)
2. Close and reopen the plugin in Figma
3. Your changes will be reflected

## Testing the Full Flow

### 1. Configure a Multi-Device Prototype

1. Create a Figma file with TV and Phone frames
2. Set up prototype connections between frames
3. Run the plugin and configure:
   - TV starting frame
   - Phone starting frame
   - Add rules (e.g., "When TV shows Lobby → All phones show Join")
4. Click "Publish Configuration"

### 2. Start a Session

1. Copy the TV URL from the plugin
2. Open it in a browser (preferably on a large screen)
3. Note the session join code displayed

### 3. Join on Phone

1. Copy the Phone URL from the plugin
2. Open it on a mobile device (or use browser DevTools mobile view)
3. Enter the session code
4. The prototype should load and sync with TV

### 4. Test Interactions

- Navigate through the TV prototype
- Observe phones updating automatically
- Tap elements on phone prototypes
- Verify TV responds according to your rules

## Running Tests

### All Tests

```bash
pnpm test
```

### Specific Package

```bash
pnpm --filter plugin test
pnpm --filter web test
pnpm --filter backend test
```

### Watch Mode

```bash
pnpm test:watch
```

### Coverage

```bash
pnpm test:coverage
```

## Building for Production

### Build All Packages

```bash
pnpm build
```

### Build Specific Package

```bash
pnpm --filter plugin build
pnpm --filter web build
pnpm --filter backend build
```

## Useful Commands

### Code Quality

```bash
# Lint all packages
pnpm lint

# Format code
pnpm format

# Type check
pnpm typecheck
```

### Database

```bash
# Create new migration
cd packages/backend
pnpm prisma migrate dev --name your_migration_name

# View database in Prisma Studio
pnpm prisma studio
```

### Docker

```bash
# Start databases
docker-compose up -d

# Stop databases
docker-compose down

# View logs
docker-compose logs -f

# Reset databases (WARNING: deletes all data)
docker-compose down -v
docker-compose up -d
```

## Troubleshooting

### Port Already in Use

If you see "Port 3000 is already in use" or "Port 3001 is already in use":

```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

### Database Connection Issues

1. Ensure Docker is running: `docker ps`
2. Check container status: `docker-compose ps`
3. Restart containers: `docker-compose restart`

### Plugin Not Showing Changes

1. Rebuild the plugin: `cd packages/plugin && pnpm build`
2. Close and reopen Figma
3. Re-import the plugin manifest
4. Check the browser console (Figma → Plugins → Development → Show/Hide Console)

### WebSocket Connection Failed

1. Ensure backend is running: `curl http://localhost:3001/health`
2. Check CORS settings in backend
3. Verify WebSocket URL in web app `.env.local`

## Next Steps

- Read the [Implementation Plan](./IMPLEMENTATION_PLAN.md) for development roadmap
- Check [Contributing Guide](./CONTRIBUTING.md) for contribution guidelines
- Review [PRD](./PRD.md) for product requirements
- Explore the codebase starting with `packages/shared/src/types`

## Getting Help

- **Documentation:** Check the `/docs` folder
- **Issues:** [GitHub Issues](https://github.com/your-org/orchestrator/issues)
- **Discussions:** [GitHub Discussions](https://github.com/your-org/orchestrator/discussions)

Happy coding! 🚀

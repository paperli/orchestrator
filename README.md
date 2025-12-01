# Multiscreen Orchestrator for Figma

A comprehensive multi-device prototype orchestration system that enables designers to create and test cross-device experiences (TV + Phone) directly within Figma.

## Overview

The Multiscreen Orchestrator consists of three main components:

1. **Figma Plugin** - Authoring tool for defining multi-device interaction rules
2. **Web Orchestrator App** - Runtime environment for synchronized multi-device testing
3. **Backend Service** - Configuration management and real-time session coordination

## Key Features

- 🎨 **Figma-Native Workflow** - Design and configure multi-device prototypes without leaving Figma
- 📱 **Multi-Device Support** - Synchronize 1 TV + up to 5 phone devices
- ⚡ **Real-Time Sync** - Sub-300ms latency for cross-device interactions
- 🔧 **No-Code Rules** - Visual rule editor with natural language summaries
- 🔒 **Secure Sessions** - SSO for designers, passwordless join for testers
- 🎯 **User Testing Ready** - QR code joining, stable session URLs

## Project Status

**Current Phase:** Planning & Foundation
**Version:** 0.1.0-alpha
**Last Updated:** 2025-11-30

See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for detailed development roadmap.

## Documentation

- [Product Requirements Document (PRD)](./PRD.md)
- [Implementation Plan](./IMPLEMENTATION_PLAN.md)
- [Architecture Documentation](./docs/architecture.md) (coming soon)
- [API Specification](./docs/api-spec.md) (coming soon)

## Technology Stack

### Figma Plugin
- TypeScript 5.3+
- React 18+ with Tailwind CSS
- Figma Plugin API 1.0.0
- Vite for build tooling

### Web Orchestrator
- Next.js 14+ (App Router)
- TypeScript 5.3+
- Socket.io for real-time communication
- Figma Embed API integration

### Backend Service
- Node.js 20+ LTS
- Express.js / Fastify
- PostgreSQL 16+ (configuration storage)
- Redis (session management)
- Socket.io (WebSocket server)

## Prerequisites

- Node.js 20+ LTS
- pnpm 8+
- Docker (for local PostgreSQL + Redis)
- Figma desktop app (for plugin development)

## Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/orchestrator.git
cd orchestrator

# Install dependencies
pnpm install

# Set up local databases (Docker required)
docker-compose up -d

# Run database migrations
cd packages/backend
pnpm prisma migrate dev
cd ../..

# Start all services in development mode
pnpm dev
```

This will start:
- Figma Plugin build (watch mode)
- Backend server at http://localhost:3001
- Web app at http://localhost:3000

### Plugin Development

```bash
# Build the plugin
cd packages/plugin
pnpm build

# Watch mode (auto-rebuild on changes)
pnpm dev
```

To test in Figma:
1. Open Figma desktop app
2. Go to **Menu → Plugins → Development → Import plugin from manifest**
3. Select `packages/plugin/manifest.json`
4. Run the plugin from the Plugins menu

## Project Structure

```
orchestrator/
├── packages/
│   ├── plugin/          # Figma Plugin
│   ├── web/             # Orchestrator Web App
│   ├── backend/         # Backend Service
│   └── shared/          # Shared types & utilities
├── docs/                # Documentation
├── .github/             # CI/CD workflows
├── PRD.md               # Product Requirements
├── IMPLEMENTATION_PLAN.md
└── README.md
```

## Development Workflow

### Branching Strategy
- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - Feature branches
- `fix/*` - Bug fix branches

### Commit Convention
We use [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `chore:` - Maintenance tasks
- `test:` - Test updates

### Pull Request Process
1. Create a feature branch from `develop`
2. Implement changes with tests
3. Push and create PR to `develop`
4. Get at least 1 code review approval
5. Ensure CI checks pass
6. Squash and merge

## Testing

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter plugin test
pnpm --filter web test
pnpm --filter backend test

# Run E2E tests
pnpm --filter web test:e2e

# Coverage report
pnpm test:coverage
```

## Deployment

### Staging
Automatically deployed on merge to `develop` branch.

### Production
Deployed from `main` branch after manual approval.

**Deployment Targets:**
- **Plugin:** Figma Community (submitted for review)
- **Web App:** Vercel/Netlify
- **Backend:** Railway/Render

See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md#deployment-strategy) for detailed deployment instructions.

## Contributing

We welcome contributions! Please follow these guidelines:

1. Read the [Implementation Plan](./IMPLEMENTATION_PLAN.md)
2. Check open issues or create a new one
3. Fork the repository
4. Create a feature branch
5. Make your changes with tests
6. Submit a pull request

## Support

For issues and questions:
- 🐛 **Bug Reports:** [GitHub Issues](https://github.com/your-org/orchestrator/issues)
- 💬 **Discussions:** [GitHub Discussions](https://github.com/your-org/orchestrator/discussions)
- 📧 **Email:** design-tools@your-org.com

## License

[MIT License](./LICENSE) (or specify your license)

## Acknowledgments

- Figma team for the Plugin API and Embed Kit
- Design team for product vision and testing
- Engineering team for technical guidance

---

**Status:** 🚧 Under Active Development

Last updated: 2025-11-30

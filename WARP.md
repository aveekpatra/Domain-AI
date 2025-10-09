# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

DomainMonster is an AI-powered domain name finder built with Next.js and Convex. The app generates creative, brandable domain name suggestions using AI and provides real-time availability checking through the Name.com API. The frontend is built as a modern landing page with a search interface for domain suggestions.

## Key Architecture

### Tech Stack
- **Frontend**: Next.js 15.2.3 with React 19, TailwindCSS 4, TypeScript
- **Backend**: Convex for database and real-time operations
- **AI Integration**: OpenRouter API for domain name generation
- **Domain Checking**: Name.com API (both Core API and v4 API supported)
- **Runtime**: Node.js for API routes
- **Package Manager**: Bun (uses bun.lock)

### Core Components

**API Routes** (`app/api/`):
- `/api/domains/generate` - Generates AI-powered domain suggestions with availability checking
- `/api/domains/validate` - Validates and checks availability of specific domains  
- `/api/prompts/improve` - Improves user prompts using AI

**Lib Services** (`lib/`):
- `namecom.ts` - Name.com API integration (supports both Core and v4 APIs)
- `openrouter.ts` - OpenRouter AI API wrapper for domain generation
- `schemas.ts` - Zod validation schemas for API requests/responses
- `rateLimit.ts` - Rate limiting for API endpoints

**UI Components** (`components/`):
- Landing page components: Hero, FeatureTiles, DarkShowcase, UseCases, CTASection
- Search functionality: DomainResults, PromptBar
- Convex integration: ConvexClientProvider

## Development Commands

### Primary Development
```bash
# Install dependencies
npm install

# Start development (runs both frontend and backend in parallel)  
npm run dev

# Start frontend only
npm run dev:frontend

# Start Convex backend only  
npm run dev:backend

# Start Convex dev server and open dashboard (runs before dev)
npm run predev
```

### Production & Deployment
```bash
# Build production version
npm run build

# Start production server
npm start
```

### Code Quality
```bash
# Run ESLint
npm run lint

# Format code with Prettier (uses default config)
prettier --write .
```

### Testing & Utilities
```bash
# Test Name.com API connection
node scripts/test-namecom-api.js
```

## Environment Configuration

The app requires several environment variables for full functionality:

### Core Services
- `NEXT_PUBLIC_CONVEX_URL` - Convex deployment URL
- `OPENROUTER_API_KEY` - OpenRouter API key for AI domain generation
- `OPENROUTER_MODEL` - AI model to use (default: "openrouter/auto")
- `OPENROUTER_SITE_URL` - Your site URL for OpenRouter
- `OPENROUTER_APP_TITLE` - App name for OpenRouter (default: "DomainMonster")

### Name.com Integration
- `NAMECOM_USERNAME` - Name.com account username (not email)
- `NAMECOM_API_TOKEN` - Name.com API token
- `NAMECOM_USE_CORE` - Set to "true" to use Core API instead of v4 API
- `NAMECOM_CORE_API` - Core API base URL (default: https://api.name.com)  
- `NAMECOM_API_BASE` - v4 API base URL (default: https://api.name.com/v4)

### Security & Rate Limiting
- `ALLOWED_ORIGIN` - CORS allowed origin for API endpoints
- `NODE_ENV` - Environment mode (development/production)

## Name.com API Integration

The app supports both Name.com APIs:

**Core API** (preferred): Set `NAMECOM_USE_CORE=true`
- Unified availability and pricing endpoint
- Returns prices in cents (automatically converted to dollars)
- Uses `/domains:checkAvailability`

**v4 API** (legacy): Default when Core API not enabled  
- Separate availability checking
- Uses `/domains:checkAvailability` 
- Batch processing with 50 domain limit per request

For testing, use development endpoints:
- Core: `NAMECOM_CORE_API=https://api.dev.name.com`
- v4: `NAMECOM_API_BASE=https://api.dev.name.com/v4`

## Convex Integration Notes

The project follows strict Convex patterns defined in `.cursor/rules/convex_rules.mdc`:

### Function Syntax
Always use the new function syntax:
```typescript
export const myQuery = query({
  args: { id: v.string() },
  returns: v.object({...}),
  handler: async (ctx, args) => {
    // Implementation
  }
});
```

### Validators
- Use `v.null()` for functions returning null
- Always include `args` and `returns` validators
- Use `v.id("tableName")` for document IDs
- Import validators from `convex/values`

### Database Schema  
Defined in `convex/schema.ts` with minimal setup (currently only has a sample `numbers` table).

## Rate Limiting

API endpoints implement rate limiting via `lib/rateLimit.ts`:
- `domains-generate` - For AI domain generation
- `domains-validate` - For domain availability checking

## Development Patterns

### TypeScript Configuration
- Strict mode enabled
- Path mapping: `@/*` points to project root
- ES2017 target with ESNext modules
- Next.js TypeScript plugin integrated

### Code Style
- ESLint with Next.js core web vitals and TypeScript rules
- Prettier with default configuration
- Server-only imports marked with `"server-only"`

### Error Handling
- Structured error responses with hints for common issues
- Development-only logging for API debugging
- Graceful fallbacks when external services fail

## Testing the Integration

Use the provided test script to verify Name.com API connectivity:

```bash
node scripts/test-namecom-api.js
```

This script tests authentication and provides troubleshooting guidance for common API configuration issues.

## Important Cursor Rules

This project includes Convex-specific development rules in `.cursor/rules/convex_rules.mdc` that should be followed when working with Convex functions, schemas, and database operations. The rules cover function registration, validators, TypeScript patterns, and API design principles specific to Convex.
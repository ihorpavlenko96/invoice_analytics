# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a monorepo containing three main applications:
- `./client` - React 19 + TypeScript frontend application (port 3000)
- `./api` - NestJS + TypeScript backend API (port 5000) 
- `./landing` - Landing page with SSR (port 3001)

## Development Commands

### Full Stack Development (Docker Compose)
```bash
# Start all services (recommended for development)
docker-compose up

# Services will be available at:
# - Client: http://localhost:3000
# - Landing: http://localhost:3001  
# - API: http://localhost:5000
# - Database: postgresql://postgres:postgres@localhost:5432/postgres3
```

### Individual Project Commands

#### API (NestJS)
```bash
cd api
npm install
npm run start:dev        # Start with auto-restart and linting
npm run build           # Production build
npm run test            # Run tests
npm run lint            # Lint code
npm run migration:run   # Run database migrations
```

#### Client (React)
```bash
cd client
npm install
npm run dev             # Start dev server with linting
npm run build          # Production build  
npm run test           # Run tests
npm run lint           # Check linting
npm run lint:fix       # Fix linting issues
```

#### Landing Page
```bash
cd landing
npm install
npm run dev:ssr        # Start SSR development server
npm run build:ssr      # Build for SSR production
npm run dev            # Start client-only development
```

## Architecture Overview

### Backend (API) - Clean Architecture + CQRS

The API follows clean architecture principles with distinct layers:

**Layer Structure:**
- `src/api/` - Presentation layer (controllers, routes, middleware)
- `src/application/` - Application layer (use cases, CQRS commands/queries, DTOs)
- `src/domain/` - Domain layer (entities, enums, business logic)  
- `src/infrastructure/` - Infrastructure layer (database, external services, auth)

**Key Patterns:**
- CQRS with separate command and query handlers
- Repository pattern for data access
- Domain-driven design with entities and value objects
- TypeORM for database operations with PostgreSQL
- Clerk authentication with JWT tokens
- Clean dependency injection (inward-pointing dependencies)

### Frontend (Client) - Module-Based React Architecture

**Tech Stack:**
- React 19 + TypeScript + Vite 6
- Clerk for authentication  
- Zustand for local state, React Query for server state
- Material UI + Emotion for components and styling
- React Router v7 for routing
- Formik + Yup for forms and validation

**Module Structure:**
```
src/modules/
├── tenants/     # Multi-tenant management (CRUD operations)
├── users/       # User management with role-based access
├── secrets/     # API key/secrets management
├── invoices/    # Invoice processing with AI integration
└── login/       # Authentication UI components
```

**Role-Based Access Control:**
- Three roles: `SUPER_ADMIN`, `ADMIN`, `USER`
- Route protection via `ProtectedRoute` component
- Role checking through `useUserRoles` hook
- Dynamic UI rendering based on user permissions

### Key Integration Patterns

**API Integration:**
- React Query for all server state management
- Standardized query keys in `*QueryKeys.ts` files
- Queries for GET operations, Mutations for POST/PUT/DELETE
- Base API URL from `VITE_API_URL` environment variable

**Authentication Flow:**
- Clerk handles JWT token management automatically
- Conditional rendering: `Login` component vs `AppRoutes` 
- Protected routes enforce role-based access control

**Database Integration:**
- PostgreSQL with TypeORM migrations
- Multi-tenant architecture support
- Migration commands: `npm run migration:generate/run/revert`

## Environment Configuration

### Required Environment Variables

**API:**
- Database connection string
- Clerk publishable/secret keys
- AI/LLM service keys (OpenAI)
- Secret storage configuration (AWS/Azure)

**Client:**
- `VITE_API_URL` - Backend API base URL
- Clerk publishable key

## Development Workflow

**Linting Policy:**
- Both API and Client run ESLint checks before starting dev servers
- Use `npm run lint:fix` to auto-resolve linting issues
- Prettier is configured for consistent code formatting

**Testing:**
- All projects configured with Jest
- API includes e2e testing with separate jest config
- Tests are optional and pass by default (`--passWithNoTests`)

**Database Development:**
- Use migration scripts for schema changes
- TypeORM entities define database structure
- Docker Compose provides local PostgreSQL instance

## AI/LLM Integration

The system includes sophisticated AI capabilities for invoice processing:
- Model abstraction layer with strategy pattern
- OpenAI integration for invoice data extraction
- MCP (Model Context Protocol) support
- Configurable model selection and processing
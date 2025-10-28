# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a monorepo containing three main applications:
- `./client` - React 19 + TypeScript frontend application (port 3000)
- `./api` - NestJS + TypeScript backend API (port 5000)
- `./landing` - Landing page with SSR using Tailwind CSS (port 3001)

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
npm run start:dev             # Start with auto-restart and linting
npm run start:dev:debug       # Start with debugger on port 9229
npm run start:dev:nodemon     # Start with nodemon and debugger
npm run build                 # Production build
npm run test                  # Run tests (passes with no tests)
npm run test:watch            # Run tests in watch mode
npm run test:cov              # Run tests with coverage
npm run test:e2e              # Run e2e tests
npm run lint                  # Lint and fix code

# Database migrations (using custom script)
npm run migration:generate <name>  # Generate migration from entity changes
npm run migration:create <name>    # Create empty migration
npm run migration:run              # Run pending migrations
npm run migration:revert           # Revert last migration
```

#### Client (React)
```bash
cd client
npm install
npm run dev             # Start dev server with linting (Vite)
npm run build          # Production build
npm run preview        # Preview production build
npm run test           # Run tests (passes with no tests)
npm run lint           # Check linting
npm run lint:fix       # Fix linting issues
npm run format         # Format code with Prettier
```

#### Landing Page
```bash
cd landing
npm install
npm run dev:ssr        # Start SSR development server with linting
npm run build:ssr      # Build for SSR production
npm run dev            # Start client-only development (Vite)
npm run start          # Start production SSR server
npm run lint           # Check linting
npm run lint:fix       # Fix linting issues
```

### Running Single Tests
```bash
# In any project directory
npm test -- --testNamePattern="test name"     # Run specific test by name
npm test -- --testPathPattern="file.spec"     # Run specific test file
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
- Migrations stored in `src/infrastructure/persistence/migrations/`

**Important Architecture Rules (from .cursor/rules):**
- Dependencies must always point inward: API → Application → Domain
- Domain layer has no dependencies on other layers
- Use DTOs for data transfer between layers
- Domain exceptions should be specific and meaningful
- Commands for state changes, Queries for reads
- No business logic in infrastructure or presentation layers

### Frontend (Client) - Module-Based React Architecture

**Tech Stack:**
- React 19 + TypeScript + Vite 6
- Clerk for authentication
- Zustand for local state, React Query for server state
- Material UI + Emotion for components and styling
- React Router v7 for routing
- Formik + Yup for forms and validation
- DND Kit for drag and drop functionality
- MUI X Charts for data visualization

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

### Landing Page - SSR React with Tailwind

**Tech Stack:**
- React 18 + TypeScript + Vite 5
- Server-side rendering with Express
- Tailwind CSS for styling
- Framer Motion for animations
- Separate client and server builds

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
- TypeORM config in `src/infrastructure/persistence/typeorm.config.ts`

## Environment Configuration

### Required Environment Variables

**API:**
- Database connection string
- Clerk publishable/secret keys
- AI/LLM service keys (OpenAI)
- Secret storage configuration (AWS/Azure)
- Sentry DSN for error tracking

**Client:**
- `VITE_API_URL` - Backend API base URL
- Clerk publishable key

## Development Workflow

**Linting Policy:**
- Both API and Client run ESLint checks before starting dev servers
- Landing page also enforces linting on SSR dev start
- Use `npm run lint:fix` to auto-resolve linting issues
- Prettier is configured for consistent code formatting
- Husky git hooks configured for pre-commit checks

**Testing:**
- All projects configured with Jest + ts-jest
- API includes e2e testing with separate jest config
- Tests are optional and pass by default (`--passWithNoTests`)
- Test files follow `*.spec.ts` naming convention

**Debugging:**
- API debug port: 9229 (configured for remote debugging)
- Use `npm run start:dev:debug` or `npm run start:dev:nodemon` for debugging
- Docker compose exposes debug port for containerized development

**Database Development:**
- Use migration scripts for schema changes
- TypeORM entities define database structure
- Docker Compose provides local PostgreSQL instance
- Health checks ensure database is ready before API starts

## AI/LLM Integration

The system includes sophisticated AI capabilities for invoice processing:
- Model abstraction layer with strategy pattern
- OpenAI integration for invoice data extraction
- MCP (Model Context Protocol) support for advanced model interactions
- Configurable model selection and processing
- Located in API's application and infrastructure layers

## CI/CD Pipeline

- Azure Pipelines configuration in `azure-pipelines.yml`
- Automated builds and deployments
- Terraform infrastructure as code in `terraform/` directory
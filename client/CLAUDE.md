# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Commands
```bash
# Install dependencies
npm install

# Start development server (includes linting)
npm run dev

# Build for production
npm run build

# Lint and fix issues
npm run lint        # Check for linting issues
npm run lint:fix    # Auto-fix linting issues

# Format code
npm run format

# Run tests
npm run test

# Preview production build
npm run preview
```

### Development Server
- Runs on `http://localhost:3000`
- ESLint runs automatically before starting the dev server
- Hot module replacement enabled via Vite

## High-Level Architecture

### Tech Stack
- **React 19** with TypeScript for type safety
- **Vite 6** for fast development and optimized builds
- **Clerk** for authentication (JWT-based)
- **Zustand** for state management
- **TanStack React Query** for server state and API calls
- **Material UI** + **Emotion** for component library and styling
- **React Router v7** for routing
- **Formik** + **Yup** for form handling and validation

### Application Structure

#### Authentication Flow
- Uses Clerk for authentication management
- Entry point (`App.tsx`) conditionally renders:
  - `Login` component for signed-out users
  - `AppRoutes` with protected routes for signed-in users
- JWT tokens managed by Clerk, no manual token handling needed

#### Module-Based Architecture
The application follows a feature-module pattern where each business domain has its own module:

```
src/modules/
├── tenants/     # Tenant management (CRUD, multi-tenancy)
├── users/       # User management 
├── secrets/     # Secrets/API key management
├── invoices/    # Invoice processing with AI integration
└── login/       # Authentication UI
```

Each module typically contains:
- `components/` - UI components
- `stores/` - Zustand stores for local state
- `types/` - TypeScript type definitions
- Query/mutation files using React Query patterns
- Service files for API integration

#### API Integration Pattern
- Uses React Query for all API calls
- Query keys defined in `*QueryKeys.ts` files
- Queries in `*Queries.ts` for GET operations
- Mutations in `*Mutations.ts` for POST/PUT/DELETE
- Base API URL from `VITE_API_URL` environment variable

#### Role-Based Access Control
- Three main roles: `SUPER_ADMIN`, `ADMIN`, `USER`
- Routes protected via `ProtectedRoute` component
- Role checking via `useUserRoles` hook
- UI components dynamically show/hide based on user role

#### Routing Structure
- All routes wrapped in `MainLayout` for consistent navigation
- Protected routes enforce role-based access
- Route hierarchy:
  - `/` - Home page
  - `/tenant-management` - Super Admin only
  - `/invoice-management` - Super Admin only  
  - `/user-management` - Admin/Super Admin
  - `/secrets` - Admin only

### Key Patterns

#### State Management
- **Zustand** for local component state (forms, UI state)
- **React Query** for server state (API data)
- Stores typically handle dialog state, form state, and UI interactions

#### API Response Caching
- Configured cache times in `common/constants/cacheTimes.ts`
- React Query handles cache invalidation on mutations

#### Form Handling
- Formik for form state management
- Yup schemas for validation
- Material UI form components

### Environment Configuration
- `.env` file required with:
  - `VITE_API_URL` - Backend API base URL
- All API calls automatically prepend this base URL
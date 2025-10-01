# TTRPG Combat Dashboard

## Overview

A web-based combat management dashboard for tabletop role-playing games (TTRPGs), built with a React frontend and Express backend. The application provides real-time combat tracking with initiative management, character health/mana monitoring, status effects, action system (attacks/abilities/spells), and event logging. Designed with a dark fantasy aesthetic optimized for extended gaming sessions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type safety and component development
- Vite as the build tool and dev server with HMR (Hot Module Replacement)
- Wouter for client-side routing (lightweight alternative to React Router)
- Path aliases configured for clean imports (`@/`, `@shared/`, `@assets/`)

**UI Component Library**
- Radix UI primitives for accessible, unstyled components (dialogs, dropdowns, popovers, etc.)
- shadcn/ui design system with "new-york" style variant
- Tailwind CSS for utility-first styling with custom design tokens
- Class Variance Authority (CVA) for component variants

**State Management**
- TanStack Query (React Query) for server state management
- Local component state with React hooks
- localStorage for combat state persistence and save management

**Design System**
- Dark mode primary theme with medieval/fantasy aesthetic
- Custom color palette: brown primary (#25 60% 35%), gold accents (#43 75% 50%)
- Faction-based color coding: blue (players), red (NPCs), pink (bosses)
- Typography: Roboto/Open Sans with optional Cinzel/Marcellus accent fonts
- Consistent spacing system using Tailwind's 8px base unit

### Backend Architecture

**Server Framework**
- Express.js for HTTP server and API routing
- TypeScript with ES modules (type: "module")
- Custom middleware for request/response logging and error handling
- Vite integration in development mode with SSR-ready setup

**Data Storage Strategy**
- In-memory storage implementation (MemStorage class) for development
- Interface-based storage design (IStorage) for future database integration
- Drizzle ORM configured for PostgreSQL migrations (ready but not actively used)
- Session storage structure prepared with connect-pg-simple

**API Design**
- RESTful API pattern with `/api` prefix for all routes
- Type-safe request/response handling with shared schemas
- Centralized error handling middleware

### Data Schema & Models

**Core Entities** (defined in `shared/schema.ts`)
- **Participant**: Combat entity with HP/MP, AC, initiative, faction, characteristics (D&D-style stats), actions, statuses
- **Action**: Attack/ability/spell with effect system and cooldown mechanics
- **Effect**: Modular effect types (damage, heal, status application, custom values)
- **Status**: Temporary conditions with duration tracking (rounds/turns)
- **Combat State**: Round/turn tracking, participant list, event log
- **Save Data**: Complete combat snapshots with metadata

**Validation & Type Safety**
- Zod schemas for runtime validation
- TypeScript types derived from Zod schemas (using z.infer)
- Drizzle-Zod integration for database schema validation
- Shared schema between frontend and backend

### Key Features & Components

**Combat Management**
- Initiative tracker with automatic turn progression
- Round/turn counter with visual active participant indicator
- Quick damage/heal actions on participant rows
- Death save tracking for unconscious characters
- Short/long rest system with configurable HP/MP restoration

**Action System**
- Three action types: attacks, abilities, spells
- Visual effect editor with modular effect building
- Cooldown tracking with automatic reset on rest
- Target selection dialog for multi-target actions
- Custom damage/heal value overrides per application

**Status Effect System**
- Duration-based effects (rounds or turns)
- Visual status chips with removal capability
- Status manager dialog for CRUD operations
- Automatic duration decrementation on turn/round changes

**Save System**
- Named save slots with descriptions and timestamps
- Full combat state serialization
- Export/import functionality
- Search and filter saved games
- localStorage-based persistence

**Event Logging**
- Timestamped combat event tracking
- Color-coded event types (damage, heal, status, turn, round, rest)
- Scrollable history with clear functionality
- Automatic logging of all combat actions

## External Dependencies

### UI & Styling
- **Radix UI**: Comprehensive primitive component library (20+ components)
- **Tailwind CSS**: Utility-first CSS framework with PostCSS
- **shadcn/ui**: Pre-built component patterns on Radix UI
- **Lucide React**: Icon library for UI elements
- **Class Variance Authority**: Type-safe component variants
- **tailwind-merge & clsx**: Conditional className utilities

### Data & Validation
- **Zod**: Schema validation and TypeScript type inference
- **Drizzle ORM**: Database toolkit with PostgreSQL support
- **@neondatabase/serverless**: Serverless Postgres driver
- **Drizzle-Zod**: Integration between Drizzle and Zod schemas

### State & Routing
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form state and validation
- **@hookform/resolvers**: Zod resolver for forms
- **Wouter**: Lightweight routing library

### Development Tools
- **Vite**: Build tool and dev server
- **TypeScript**: Type safety across codebase
- **ESBuild**: Production bundling for server code
- **tsx**: TypeScript execution for development

### Specialized Libraries
- **date-fns**: Date manipulation and formatting
- **embla-carousel-react**: Carousel component functionality
- **cmdk**: Command palette component
- **input-otp**: OTP input handling
- **react-day-picker**: Calendar/date picker
- **vaul**: Drawer component implementation
- **recharts**: Charting library (configured but not actively used)

### Replit-Specific
- **@replit/vite-plugin-runtime-error-modal**: Error overlay in development
- **@replit/vite-plugin-cartographer**: Code navigation
- **@replit/vite-plugin-dev-banner**: Development banner

### Database (Configured)
- **PostgreSQL**: Primary database (via DATABASE_URL environment variable)
- **connect-pg-simple**: PostgreSQL session store for Express
- **Neon Database**: Serverless PostgreSQL provider
# Copilot Instructions — Thai Tour Booking Website

## Architecture Overview

Full-stack tour booking system: **NestJS backend** (`project/backend/`) + **React frontend** (`project/frontend/`). PostgreSQL database via Docker on port 5433. Thai-language UI, English code identifiers. Comments are often in Thai.

### Backend (NestJS)

Modules: `auth`, `tours`, `bookings`, `payments`, `users`, `admin`. Each module follows the NestJS pattern: `*.module.ts`, `*.controller.ts`, `*.service.ts`, plus `entities/` and `dto/` subdirectories.

- **API prefix**: Data routes use `api/v1/` (e.g. `@Controller('api/v1/tours')`). Auth routes use bare `@Controller('auth')` — no version prefix.
- **Entities** use `@PrimaryGeneratedColumn('uuid')`, `snake_case` DB columns, TypeORM decorators. Enums are co-located in entity files.
- **DTOs** use `class-validator` + `class-transformer`. Required fields use `!` (non-null assertion), optional use `?` + `@IsOptional()`. Nested DTOs are defined inline in the same file.
- **Services** inject repositories via `@InjectRepository()`. Complex writes use `this.dataSource.transaction()` with pessimistic locking. Error handling uses NestJS built-ins (`NotFoundException`, `BadRequestException`).
- **Auth**: JWT via `@nestjs/passport` with `AuthGuard('jwt')` applied per-route. User extracted via `req.user?.id` from `@Request() req`. Google OAuth also supported.
- **Scheduling**: `@nestjs/schedule` with `@Cron()` for background jobs (e.g. expiring unpaid bookings).
- **Config**: Simple `as const` object in `src/config/booking.config.ts`, not NestJS `registerAs()`.

### Frontend (React + Vite)

- **Routing**: React Router v7 in `App.tsx`. Public pages + admin pages behind client-side `AdminGuard`.
- **Styling**: Tailwind CSS v4 with warm palette (`#FF8400`, `#4F200D`, `#F6F1E9`).
- **Components**: shadcn/ui primitives in `src/components/ui/` (badge, button, card, input). `cn()` util from `clsx` + `tailwind-merge`.
- **API calls**: Inline in page components — mix of `fetch()` and `axios`. Base URL hardcoded to `http://localhost:3000`. Auth token from `localStorage.getItem('jwt_token')`.
- **Types**: Defined inline per page file (not in `src/types/`). Interfaces may differ between pages.
- **State**: Local `useState` + `useEffect` only. TanStack Query is installed but not universally used.
- **Path alias**: `@/` maps to `src/` (configured in tsconfig + vite).

## Developer Workflows

```bash
# Start everything (DB + backend + frontend):
./run.sh

# Or manually:
docker-compose up -d postgres          # PostgreSQL on localhost:5433
cd project/backend && npm run start:dev # Backend on localhost:3000
cd project/frontend && npm run dev      # Frontend on localhost:5173

# Stop:
./stop.sh

# Backend tests:
cd project/backend
npm run test            # unit tests (Jest)
npm run test:e2e        # e2e tests (jest-e2e.json config)

# Frontend build:
cd project/frontend && npm run build    # tsc + vite build
```

Default admin seeded on startup: `admin` / `admin1234`.

## Key Patterns to Follow

### Adding a Backend Feature

1. Create entity in `entities/` with UUID PK, `snake_case` columns, `@CreateDateColumn()`/`@UpdateDateColumn()`.
2. Create DTOs in `dto/` with `class-validator` decorators. Nest related DTOs in the same file.
3. Service: inject repos via `@InjectRepository()`. Use `DataSource.transaction()` for multi-table writes. Throw NestJS HTTP exceptions.
4. Controller: prefix `api/v1/<resource>`. Apply `@UseGuards(AuthGuard('jwt'))` per-route for protected endpoints. Use `@Param('id', ParseUUIDPipe)` for UUID params.
5. Register entity and module in `app.module.ts`.

### Adding a Frontend Page

1. Create page in `src/pages/`. Define interfaces inline at top of file.
2. Use Tailwind classes for styling. Import shadcn components from `@/components/ui/`.
3. Add route in `App.tsx`. Admin pages nest under `<AdminGuard>` → `<AdminLayout>`.
4. API calls: use axios with `Authorization: Bearer ${localStorage.getItem('jwt_token')}` for authenticated requests.

## Database

- PostgreSQL 16. TypeORM with `synchronize: true` (auto-schema, dev only).
- Connection: `postgresql://thai_tours:thai_tours_password@localhost:5433/thai_tours`.
- Entities registered both via `autoLoadEntities` and explicit `entities[]` array in `app.module.ts`.

## Project-Specific Notes

- The `bookings` module uses a legacy alias pattern: DTOs accept both `pax` and `numberOfTravelers` via `@Transform`.
- Tour schedules are a separate entity (`TourSchedule`) with composite unique index on `[tour_id, available_date]`.
- Payment flow: create booking → upload payment slip → admin verifies → booking confirmed.
- The `RolesGuard` + `@Roles()` decorator infrastructure exists in `auth/` but is not applied to controllers.

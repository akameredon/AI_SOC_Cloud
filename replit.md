# AI-SOC Cloud

AI-powered Security Operations Center SaaS that turns any CCTV system into an intelligent security monitoring platform with real-time threat detection, automated alerts, and incident reporting.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/ai-soc run dev` — run the dashboard UI
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Frontend: React + Vite, shadcn/ui, Recharts, Tailwind CSS

## Where things live

- `lib/api-spec/openapi.yaml` — single source of truth for all API contracts
- `lib/db/src/schema/` — Drizzle ORM table definitions (cameras, zones, events, alerts, alertRules, incidents)
- `artifacts/api-server/src/routes/` — Express route handlers (cameras, zones, events, alerts, alertRules, incidents, dashboard)
- `artifacts/ai-soc/src/` — React frontend dashboard

## Architecture decisions

- AI detection layer (YOLO/Frigate) is decoupled behind the `/api/events` ingest endpoint — events are posted into the platform via REST from any detection pipeline
- All tenant data is stored in PostgreSQL; TimescaleDB is not needed for MVP scale
- Dashboard analytics use PostgreSQL aggregation queries (no separate analytics DB)
- Alert channels (WhatsApp/SMS/email) are modeled in the DB but delivery is a future backend service integration
- Multi-tenant isolation is schema-ready via `tenant_id` FK extension (not implemented in MVP)

## Product

- **Dashboard** — live summary stats, 24h event timeline, event type breakdown, camera health matrix
- **Camera Management** — register RTSP/ONVIF cameras, test connections, toggle AI detection per camera
- **Security Events** — filterable threat log with AI explanations, risk scores, and status management
- **Alerts** — multi-channel alert history (in-app, email, SMS, WhatsApp) with acknowledge/dismiss
- **Incident Reports** — aggregate events into incidents with severity tracking and AI summaries
- **Detection Zones** — configure restricted/monitored/safe zones per camera
- **Alert Rules Engine** — rule-based triggers per event type, risk threshold, delay, and channel

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Always run `pnpm --filter @workspace/api-spec run codegen` after changing `lib/api-spec/openapi.yaml` before writing route handlers
- Body schema names must be entity-shaped (e.g. `CameraInput`) not operation-shaped (e.g. `CreateCameraBody`) to avoid TS2308 collisions
- Event timeline uses `date_trunc('hour', timestamp)` — works best when there is data within the last 24 hours

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- AI detection integration: POST events to `POST /api/events` with the `EventInput` schema

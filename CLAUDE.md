# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Employee Management System Backend — a REST API built with Node.js 22, Express, TypeScript, PostgreSQL (via Prisma), JWT auth, and Zod validation.

## Commands

```bash
npm run dev              # start dev server with hot reload (tsx watch src/server.ts)
npm run build             # typecheck + compile to dist/
npm start                 # run compiled dist/server.js
npm run lint               # eslint over src/**/*.ts and tests/**/*.ts

npm test                   # run all unit tests (jest)
npx jest tests/unit/services/employee.service.test.ts   # run a single test file
npx jest -t "createEmployee"                              # run tests matching a name
npm run test:coverage       # run tests with coverage (80% line/function threshold enforced)

npm run prisma:generate     # regenerate the Prisma client after a schema change
npm run prisma:migrate       # create + apply a new migration (prompts for a name)
npm run prisma:studio         # open Prisma Studio GUI
npm run seed                   # upsert the initial admin user from ADMIN_EMAIL/ADMIN_PASSWORD
```

A local `.env` is required (see `.env.example`) — `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ALLOWED_ORIGINS`. `src/config/env.ts` validates these with Zod at startup and throws immediately if anything is missing/invalid — a broken `.env` fails fast rather than surfacing as a runtime error later.

## Architecture

Strict layered architecture, one-way dependency flow:

```
Route → Middleware → Controller → Service → Repository → Database (Prisma)
```

- **Controllers** (`src/controllers/`) — HTTP only: pull data off `req`, call one service method, shape the response via `utils/api-response.ts`. No business logic, no Prisma imports. Every handler is wrapped in `utils/async-handler.ts` so thrown/rejected errors reach `error.middleware.ts` — do not add per-handler try/catch.
- **Services** (`src/services/`) — business logic and authorization decisions that depend on request identity (e.g. resolving "which employee record does this JWT belong to" in `leave.service.ts`). Services throw `AppError` (`utils/app-error.ts`); they never touch `res` or Prisma directly, only repositories.
- **Repositories** (`src/repositories/`) — the only layer that imports `@prisma/client` / touches the DB. Each repository class takes a `PrismaClient` via constructor injection defaulting to the shared singleton (`src/config/database.ts`), which is what makes them mockable in tests without a DB (see `jest-mock-extended` usage in `tests/unit/repositories/`). `EmployeeRepository` also converts Prisma's `Decimal` salary to a `string` when mapping rows to the domain entity — do that conversion in the repository, not in services/controllers.
- **Entities** (`src/entities/`) — domain interfaces. These re-export Prisma's generated enums (`Role`, `EmployeeStatus`, `LeaveType`, `LeaveStatus`) rather than redefining them, so entity types and Prisma row types stay structurally compatible without manual mapping.
- **DTOs** (`src/dtos/<module>/*.dto.ts`) — Zod schemas shaped as `{ body, params, query }`; `middleware/validate.middleware.ts` parses `req` against the schema and reassigns `req.body`/`req.params` with the coerced/defaulted values before the controller runs.
- **Dependency injection** is manual constructor injection (no DI framework/decorators). Every service/repository/controller class takes its dependencies as constructor params with real defaults (e.g. `new EmployeeRepository()`), so production code can `new` things with zero config while tests pass in mocks. Preserve this pattern for new classes.

### Auth & authorization model

- `User` (login/JWT identity) and `Employee` (HR record) are **separate tables**; `Employee.userId` is a nullable, unique FK — an employee doesn't need a login, and a login isn't necessarily linked to an employee record yet.
- JWT payload (`utils/jwt.util.ts`) is `{ sub, email, role }`; `middleware/authenticate.middleware.ts` verifies the bearer token and sets `req.user` (typed via `src/types/express.d.ts` augmentation). `middleware/authorize.middleware.ts` then gates by `Role`.
- `POST /api/auth/register` is **ADMIN-only** (must be called with an admin's bearer token) — there is no public self-signup. The very first admin only exists because `npm run seed` upserts one from `ADMIN_EMAIL`/`ADMIN_PASSWORD`.
- In `leave.service.ts`, an EMPLOYEE caller's `employeeId` is always resolved server-side from their own `req.user.sub` → `Employee.userId` lookup (never trusted from the request body); only ADMIN callers may pass an arbitrary `employeeId`.

### API documentation

`src/config/swagger.ts` builds the OpenAPI spec with `swagger-jsdoc`, scanning `@openapi` JSDoc blocks in `src/routes/*.ts`. Served at `/api-docs` (Swagger UI) and `/api-docs.json` (raw spec); `openapi.json` at the repo root is a generated snapshot for Postman/Insomnia import (regenerate per the command in `README.md` after editing route JSDoc). On Windows, `swaggerJsdoc`'s `apis` glob silently matches zero files if given a `path.join`-built pattern (backslashes break the internal glob) — `swagger.ts` works around this by forcing forward slashes; keep that if the path construction changes.

### Response & error conventions

- Every response body is `{ success, message, data }` or `{ success, message, errors }`, built via `successResponse`/`errorResponse` in `utils/api-response.ts` — don't hand-roll response shapes in controllers.
- All thrown errors should be `AppError` (use its static helpers: `AppError.notFound()`, `.conflict()`, `.badRequest()`, `.forbidden()`, `.unauthorized()`). `middleware/error.middleware.ts` is the only place that formats error responses and it hides non-`AppError` messages behind "Internal server error" when `NODE_ENV=production`.

## Testing conventions

- Tests live under `tests/unit/<layer>/`, mirroring `src/<layer>/`, run via `jest.config.js` (plain JS — `ts-jest` handles the `.ts` test files; a `jest.config.ts` was tried and dropped because it requires `ts-node`).
- Repositories are tested by mocking `PrismaClient` with `jest-mock-extended`'s `mockDeep<PrismaClient>()` and injecting it via the constructor.
- Services/controllers are tested with `jest.mock("../../../src/repositories/...")` / `jest.mock("../../../src/services/...")` (auto-mock) and constructing the class under test with the mocked collaborator injected directly — no real DB or HTTP layer involved.
- Controller tests use the shared `createMockRequest`/`createMockResponse` helpers in `tests/unit/controllers/test-helpers.ts` instead of `supertest`.
- `utils/async-handler.ts` must return the promise from the wrapped handler (`return handler(...).catch(next)`, not a bare call) — this is what lets controller tests `await controller.method(req, res, next)` and reliably observe `next()` being called on rejection.
- Coverage threshold (branches 70%, functions/lines/statements 80%) is enforced globally by `npm run test:coverage` over `src/services`, `src/repositories`, `src/controllers`, `src/utils`. `tests/unit/*/default-construction.test.ts` files exist specifically to exercise the default-constructor-parameter branches (e.g. `new EmployeeService()` with no args) — keep them in sync when adding new classes with default-injected dependencies.

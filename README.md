# Employee Management System Backend

A REST API for managing employees, departments, and leave requests, built with Node.js 22, Express, TypeScript, PostgreSQL (via Prisma), JWT authentication, and Zod validation. See [CLAUDE.md](CLAUDE.md) for architecture details.

## Tech Stack

Node.js 22 · Express · TypeScript · PostgreSQL · Prisma ORM · JWT · bcrypt · Zod · Winston · Helmet · CORS · Swagger

## Prerequisites

- Node.js 22+
- A running PostgreSQL instance

## Setup & Run

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment**

   Copy `.env.example` to `.env` and fill in your values:

   ```bash
   cp .env.example .env
   ```

   | Variable | Description |
   |---|---|
   | `DATABASE_URL` | PostgreSQL connection string, e.g. `postgresql://postgres:postgres@localhost:5432/employee_management?schema=public` |
   | `JWT_SECRET` | Secret used to sign JWTs (min 16 characters) |
   | `JWT_EXPIRES_IN` | Access token lifetime, e.g. `1h` |
   | `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Credentials for the initial admin created by the seed script |
   | `ALLOWED_ORIGINS` | CORS origins, comma-separated, or `*` |
   | `PORT` | Port the server listens on (default `3000`) |

3. **Create the database schema**

   ```bash
   npm run prisma:migrate
   ```

4. **Seed the initial admin user**

   ```bash
   npm run seed
   ```

   This upserts a `User` with role `ADMIN` using `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`. There is no public self-registration — this seeded account is the only way to bootstrap access; all other accounts are created via the admin-only `/api/auth/register` endpoint.

5. **Run the server**

   ```bash
   npm run dev     # development, with hot reload
   # or
   npm run build && npm start   # production build
   ```

   - API base URL: `http://localhost:3000/api`
   - Health check: `http://localhost:3000/health`
   - Swagger UI: `http://localhost:3000/api-docs`

## Testing

```bash
npm test                 # run all unit tests
npm run test:coverage     # run with coverage (80% line/function threshold enforced)
npm run lint               # eslint
npm run build                # typecheck + compile
```

## Authentication

The API uses stateless JWT bearer authentication.

1. **Log in** to obtain a token:

   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"ChangeMe123!"}'
   ```

   Response includes `data.token` — a JWT signed with `JWT_SECRET`, expiring after `JWT_EXPIRES_IN`.

2. **Send the token** on subsequent requests:

   ```bash
   curl http://localhost:3000/api/employees \
     -H "Authorization: Bearer <token>"
   ```

   Requests without a valid `Authorization: Bearer <token>` header receive `401 Unauthorized`.

### Roles

There are two roles, carried in the JWT payload (`{ sub, email, role }`):

- **ADMIN** — full access: manage users, employees, departments; review (approve/reject) any leave request.
- **EMPLOYEE** — can view employees/departments, submit leave requests for themselves, and view their own leave requests. Attempting an admin-only action returns `403 Forbidden`.

### User accounts vs. employee records

`User` (login identity) and `Employee` (HR record) are separate and only optionally linked via `Employee.userId`. Creating an employee does **not** create a login — an admin must separately `POST /api/auth/register` a user account and then link it by setting `userId` on the employee record (`PUT /api/employees/:id`) before that person can log in and use employee-scoped endpoints like `GET /api/leaves/mine`.

### Registration

`POST /api/auth/register` requires an **ADMIN** bearer token — there is no public sign-up. The caller chooses the new account's role (`ADMIN` or `EMPLOYEE`).

## API Documentation

Full interactive API documentation (request/response schemas, try-it-out) is served via Swagger UI at:

```
http://localhost:3000/api-docs
```

The raw OpenAPI 3.0 spec is available as JSON at `http://localhost:3000/api-docs.json`, and a generated copy is checked into the repo at [`openapi.json`](openapi.json) — import it directly into Postman/Insomnia. Regenerate it after changing any route JSDoc annotations:

```bash
curl -s http://localhost:3000/api-docs.json | node -e "process.stdout.write(JSON.stringify(JSON.parse(require('fs').readFileSync(0,'utf8')), null, 2))" > openapi.json
```

### Endpoint summary

All responses are wrapped as `{ "success": true, "message": "...", "data": {...} }` on success or `{ "success": false, "message": "...", "errors": [...] }` on failure.

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Log in, receive a JWT |
| POST | `/api/auth/register` | ADMIN | Create a new user account |
| GET | `/api/employees` | Any authenticated user | List all employees |
| GET | `/api/employees/:id` | Any authenticated user | Get an employee by id |
| POST | `/api/employees` | ADMIN | Create an employee |
| PUT | `/api/employees/:id` | ADMIN | Update an employee |
| DELETE | `/api/employees/:id` | ADMIN | Delete an employee |
| GET | `/api/departments` | Any authenticated user | List all departments |
| GET | `/api/departments/:id` | Any authenticated user | Get a department by id |
| POST | `/api/departments` | ADMIN | Create a department |
| PUT | `/api/departments/:id` | ADMIN | Update a department |
| DELETE | `/api/departments/:id` | ADMIN | Delete a department (must have no employees assigned) |
| POST | `/api/leaves` | Any authenticated user | Submit a leave request (EMPLOYEE: for self; ADMIN: for any `employeeId`) |
| GET | `/api/leaves/mine` | Any authenticated user | List the caller's own leave requests (requires a linked employee record) |
| GET | `/api/leaves` | ADMIN | List all leave requests |
| PATCH | `/api/leaves/:id/review` | ADMIN | Approve or reject a pending leave request |
| GET | `/health` | Public | Service health check |

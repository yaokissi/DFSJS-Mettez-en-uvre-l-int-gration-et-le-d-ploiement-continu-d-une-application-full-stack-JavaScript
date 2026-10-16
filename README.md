# Orion CRM

A full-stack Customer Relationship Management (CRM) application built with React, Node.js, Express, and Prisma. The project includes automated CI/CD pipelines, multi-stage Docker containerization, and centralized logging powered by an ELK stack.

## Architecture

This project is organized as a monorepo comprising frontend, backend, containerization, and observability configurations:

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, TanStack Query, Zustand, Axios
- **Backend**: Node.js 22 LTS, Express 5, TypeScript, Prisma ORM, SQLite, Winston
- **Containerization**: Multi-stage Docker builds on Alpine Linux orchestrated via Docker Compose
- **Observability**: Centralized log aggregation with Elasticsearch, Logstash, and Kibana (ELK Stack)
- **CI/CD Pipeline**: GitHub Actions workflow automating dependency audits, unit tests, code coverage, SonarQube Cloud quality gates, Trivy container security scans, and Docker Hub image publication

## Prerequisites

- **Node.js** >= 22.0.0
- **npm** >= 10.0.0
- **Docker Engine** and **Docker Compose** (v2.x or later)

---

## Running with Docker (Recommended)

Docker Compose starts the entire stack, including the frontend, backend, SQLite persistent storage, and the ELK logging infrastructure.

### 1. Start all services

From the project root directory, run:

```bash
docker compose up --build -d
```

This command builds the multi-stage images for frontend and backend, sets up the dedicated bridge networks, mounts the persistent SQLite volume (`sqlite-data`), and starts the ELK containers.

### 2. Access the services

Once the containers are running, the services are accessible at the following URLs:

- **Frontend Application**: `http://localhost` (Port 80)
- **Backend REST API**: `http://localhost:8080`
- **Kibana (Log Dashboards)**: `http://localhost:5601`
- **Elasticsearch API**: `http://localhost:9200`

### 3. View container logs

To inspect logs in real time from the running backend:

```bash
docker compose logs -f backend
```

To view logs across all services:

```bash
docker compose logs -f
```

### 4. Stop the services

To stop and remove containers and networks:

```bash
docker compose down
```

To stop containers and reset the persistent SQLite database volume:

```bash
docker compose down -v
```

---

## Running Locally (Development Mode)

If you prefer to run the applications directly on your host machine without Docker:

### 1. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Generate Prisma client and run migrations
npx prisma generate
npx prisma migrate dev --name init

# Start development server with live reload
npm run dev
```

The API will be available at `http://localhost:8080`.

### 2. Frontend Setup

In a separate terminal:

```bash
cd client

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Start development server
npm run dev
```

The application will be available at `http://localhost:4200` (or the port specified in Vite output).

---

## Centralized Logging (ELK Stack)

The backend uses a structured logger configured with Winston (`server/src/utils/logger.ts`) that outputs log entries in JSON format.

When running via Docker Compose:
1. HTTP requests and application events are logged with timestamp, log level, HTTP method, URL, and status code.
2. Logs are forwarded to Logstash listening on port `5044/tcp`.
3. Logstash parses and indexes the events into Elasticsearch under the index prefix `orion-logs-*`.
4. Visualizations and search queries can be performed inside Kibana at `http://localhost:5601`.

---

## Available Scripts

### Backend (`server/`)

- `npm run dev`: Start development server with hot reload via `tsx watch`
- `npm run build`: Compile TypeScript source code into JavaScript (`tsc`)
- `npm start`: Execute production build (`node dist/index.js`)
- `npm test`: Run test suites using Vitest
- `npm run test:coverage`: Run test suites and generate V8 coverage reports
- `npm run lint`: Check code quality and style using ESLint
- `npm run prisma:generate`: Generate Prisma Client types from `schema.prisma`
- `npm run prisma:migrate`: Apply database migrations in development
- `npm run prisma:studio`: Open Prisma Studio database management GUI

### Frontend (`client/`)

- `npm run dev`: Start Vite development server
- `npm run build`: Compile and bundle frontend assets for production
- `npm run preview`: Serve the production build locally for verification
- `npm test`: Run frontend unit and component tests with Vitest
- `npm run test:coverage`: Generate frontend test coverage reports
- `npm run lint`: Check frontend code style using ESLint
- `npm run typecheck`: Run TypeScript compiler check without emitting files (`tsc --noEmit`)

---

## CI/CD Pipeline & Quality Gates

The repository includes an automated GitHub Actions pipeline (`.github/workflows/ci.yml`) triggered on pushes, pull requests, nightly schedules, and manual triggers:

1. **Dependency Audit**: Runs `npm audit` on both client and server packages to flag known vulnerabilities.
2. **Unit Testing & Coverage**: Executes Vitest test suites, enforces coverage thresholds, and uploads coverage artifacts.
3. **Static Analysis & Security (SonarQube Cloud)**: Performs automated code analysis, reporting code smells, security hotspots, and enforcing the Quality Gate.
4. **Compilation Verification**: Validates production builds for both backend (`tsc`) and frontend (`vite build`).
5. **Container Security Scan (Trivy)**: Scans generated Docker images for high and critical OS/package vulnerabilities before publication.
6. **Container Publication (Docker Hub)**: Builds and pushes production-ready multi-stage Docker images tagged with both the commit SHA and `latest`.

To protect the software supply chain, third-party GitHub Actions are pinned to explicit commit SHAs rather than mutable tags.

---

## Project Structure

```
.
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions CI/CD pipeline
├── client/                      # Frontend React application
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Application page views
│   │   ├── hooks/               # Custom React hooks
│   │   ├── services/            # API client layer
│   │   ├── types/               # TypeScript definitions
│   │   ├── App.tsx              # Root component
│   │   └── main.tsx             # Frontend entry point
│   ├── Dockerfile               # Multi-stage production build (Vite + Nginx)
│   ├── nginx.conf               # Nginx reverse proxy / SPA configuration
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── server/                      # Backend Express application
│   ├── src/
│   │   ├── controllers/         # HTTP request handlers
│   │   ├── services/            # Business logic
│   │   ├── repositories/        # Database access layer (Prisma)
│   │   ├── models/              # Zod validation schemas and types
│   │   ├── routes/              # Express route declarations
│   │   ├── utils/               # Structured Winston logger
│   │   └── index.ts             # Application entry point
│   ├── prisma/
│   │   ├── schema.prisma        # Database models and relations
│   │   └── dev.db               # SQLite database file (local dev)
│   ├── Dockerfile               # Multi-stage production build (Node.js Alpine)
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml           # Core application orchestration
├── docker-compose-elk.yml       # Elasticsearch, Logstash, Kibana stack
├── logstash.conf                # Logstash pipeline configuration
├── sonar-project.properties     # SonarQube Cloud scanner configuration
└── README.md
```

---

## REST API Endpoints

### Organizations

- `GET /api/organizations` - Retrieve all organizations
- `GET /api/organizations/:id` - Retrieve organization by ID
- `POST /api/organizations` - Create a new organization
- `PUT /api/organizations/:id` - Update an existing organization
- `DELETE /api/organizations/:id` - Delete an organization
- `GET /api/organizations/stats` - Retrieve organization statistics

### Contacts

- `GET /api/contacts` - Retrieve all contacts
- `GET /api/contacts/:id` - Retrieve contact by ID
- `POST /api/contacts` - Create a new contact
- `PUT /api/contacts/:id` - Update an existing contact
- `DELETE /api/contacts/:id` - Delete a contact
- `GET /api/contacts/stats` - Retrieve contact statistics

---

## Development Guidelines

- **TypeScript Strict Mode**: No implicit `any` types; all models and payloads must be typed.
- **Architectural Separation**: Strict adherence to the Controller-Service-Repository pattern on the backend.
- **Validation**: Runtime validation of request bodies using Zod schemas.
- **Components**: Functional React components with hooks, TanStack Query for data fetching, and Zustand for global UI state.
- **Non-Root Containers**: Docker images run under unprivileged user accounts (`node` user) to follow security best practices.

## License

This project is licensed under the MIT License.

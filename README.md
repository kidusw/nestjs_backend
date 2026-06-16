# NestJS Concepts — Full-Featured REST API

A NestJS project demonstrating core concepts and best practices: JWT auth, role-based access control, CRUD with pagination, file uploads to Cloudinary, and TypeORM with PostgreSQL.

## Features

- **Authentication** — register, login, JWT access/refresh tokens, rate-limited login
- **Role-based access control** — `USER` and `ADMIN` roles with custom guards and decorators
- **Posts** — full CRUD with pagination and author association
- **File uploads** — upload, list, and delete files stored on Cloudinary
- **User management** — fetch user profiles
- **Global validation** — class-validator DTOs with whitelist and type transformation

## Tech Stack

- NestJS + TypeScript
- TypeORM + PostgreSQL
- Passport + JWT (`@nestjs/jwt`, `passport-jwt`)
- Cloudinary (file storage)
- Multer (multipart uploads)
- Bcrypt (password hashing)
- Throttler (rate limiting)
- Cache Manager

## Prerequisites

- Node.js 18+
- PostgreSQL running on `localhost:5432`
- A [Cloudinary](https://cloudinary.com) account

## Setup

**1. Install dependencies**
```bash
npm install
```

**2. Create the PostgreSQL database**
```sql
CREATE DATABASE "nestjs-full-project";
```

Default connection: `postgres:Bloodsport19@localhost:5432/nestjs-full-project`. Change it in [src/app.module.ts](src/app.module.ts) if needed.

**3. Configure environment variables**

Create a `.env` file in the project root:
```env
APP_NAME=nestapp

# Cloudinary credentials (from cloudinary.com > Dashboard)
cloud_name=your_cloud_name
api_key=your_api_key
api_secret=your_api_secret
```

## Running the App

```bash
# Development (watch mode — restarts on file changes)
npm run start:dev

# Standard development
npm run start

# Production
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

The server starts on **http://localhost:3000** by default. Set a `PORT` env var to override.

TypeORM is configured with `synchronize: true`, so the database schema is created automatically on first run.

## API Overview

### Auth
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/auth/register` | Public | Register a new user |
| POST | `/auth/login` | Public | Login and receive JWT tokens |
| POST | `/auth/refresh` | Public | Refresh access token |
| GET | `/auth/profile` | JWT | Get current user profile |
| POST | `/auth/create-admin` | Admin | Create an admin user |

### Posts
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/posts` | Public | List posts (paginated) |
| GET | `/posts/:id` | Public | Get a post by ID |
| POST | `/posts` | JWT | Create a post |
| PUT | `/posts/:id` | JWT | Update a post |
| DELETE | `/posts/:id` | Admin | Delete a post |

Query params for listing: `page`, `limit`.

### File Upload
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/file-upload` | JWT | Upload a file (multipart) |
| GET | `/file-upload` | JWT | List all uploaded files |
| DELETE | `/file-upload/:id` | Admin | Delete a file |

### Users
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/user/:id` | JWT | Get a user by ID |

## Testing

```bash
npm run test          # Unit tests
npm run test:watch    # Unit tests in watch mode
npm run test:cov      # Unit tests with coverage report
npm run test:e2e      # End-to-end tests
npm run test:debug    # Debug mode
```

## Linting & Formatting

```bash
npm run lint      # ESLint (auto-fix)
npm run format    # Prettier
```

## Project Structure

```
src/
├── auth/           # JWT auth, guards, strategies, decorators
├── posts/          # Posts CRUD, pagination, existence pipe
├── file-upload/    # Cloudinary file upload/delete
├── user/           # User lookup
├── common/         # Shared DTOs and interfaces (pagination)
├── config/         # App configuration
├── app.module.ts   # Root module + TypeORM config
└── main.ts         # Bootstrap
```

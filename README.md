<p align="center">
  <h1 align="center">🧵 Chat Weave</h1>
  <p align="center">A real-time social threading &amp; direct messaging platform built with modern web technologies.</p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Socket.IO-4.x-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.IO" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
</p>

---

## ✨ Features

- **🧵 Threaded Conversations** — Create, browse, and interact with discussion threads. Like, reply, and engage in nested conversations.
- **💬 Real-Time Direct Messaging** — Instant one-on-one messaging powered by Socket.IO with optimistic UI updates.
- **⌨️ Live Typing Indicators** — See when other users are typing in real time.
- **🟢 Online Presence Tracking** — Real-time awareness of who's online with live presence broadcasts.
- **🔔 Notifications** — Stay informed with in-app notifications for interactions on your content.
- **🖼️ Image Uploads** — Share images in threads and DMs via Cloudinary integration.
- **👤 User Profiles** — Customizable user profiles with display names, handles, and bios.
- **🔐 Authentication** — Secure sign-up / sign-in powered by Clerk with session management.
- **📖 API Documentation** — Interactive Swagger UI documentation for all REST endpoints.
- **🛡️ Security Hardened** — Helmet headers, CORS policies, rate limiting, and input validation with Zod.
- **📝 Structured Logging** — Production-grade logging with Winston and request tracing.

---

## 🛠️ Tech Stack

### Backend

| Technology | Purpose |
|---|---|
| **Express 5** | HTTP framework |
| **TypeScript** | Type safety |
| **PostgreSQL 16** | Relational database |
| **Socket.IO** | WebSocket real-time layer |
| **Clerk** | Authentication & user management |
| **Cloudinary** | Image upload & CDN |
| **Zod** | Schema validation |
| **Winston** | Structured logging |
| **Swagger** | API documentation |
| **Helmet** | HTTP security headers |
| **express-rate-limit** | Rate limiting |

### Frontend

| Technology | Purpose |
|---|---|
| **Next.js 16** | React meta-framework |
| **React 19** | UI library |
| **TanStack Query** | Server state & caching |
| **Tailwind CSS 4** | Utility-first styling |
| **Clerk** | Auth UI components & hooks |
| **Socket.IO Client** | Real-time communication |
| **React Hook Form + Zod** | Form handling & validation |
| **Radix UI** | Accessible primitives (Avatar, Slot) |
| **Sonner** | Toast notifications |
| **Lucide React** | Icon library |

### Infrastructure

| Technology | Purpose |
|---|---|
| **Docker Compose** | Local PostgreSQL provisioning |
| **pnpm** | Package manager |
| **tsx** | TypeScript execution (dev) |
| **Prettier** | Code formatting |

---

## 📁 Project Structure

```
chat-weave/
├── backend/
│   └── src/
│       ├── config/           # Env, Clerk, Cloudinary, Swagger, HTTP status configs
│       ├── db/               # Database connection & migration runner
│       ├── lib/              # Shared utilities (logger, etc.)
│       ├── middleware/        # Error handler, rate limiter, request logger, request ID
│       ├── migrations/       # SQL migration files (users, threads, replies, notifications, chat)
│       ├── modules/          # Feature modules (users, threads, chats, notifications)
│       │   ├── chats/        # Direct messaging service & controller
│       │   ├── notifications/# Notification service, controller & types
│       │   ├── threads/      # Thread CRUD, replies, likes
│       │   └── users/        # User profile service & controller
│       ├── realtime/         # Socket.IO initialization & event handlers
│       ├── routes/v1/        # Versioned REST API routes
│       ├── app.ts            # Express app factory
│       └── server.ts         # Server bootstrap & startup
├── frontend/
│   └── src/
│       ├── app/              # Next.js App Router pages
│       │   ├── chat/         # Direct messaging page
│       │   ├── threads/      # Thread feed & detail pages
│       │   ├── notifications/# Notifications page
│       │   ├── profile/      # User profile page
│       │   ├── sign-in/      # Clerk sign-in page
│       │   └── sign-up/      # Clerk sign-up page
│       ├── components/       # React components
│       │   ├── chat/         # Chat UI components
│       │   ├── threads/      # Thread feed, detail, compose components
│       │   ├── notifications/# Notification list components
│       │   ├── layout/       # Navbar & layout shell
│       │   └── ui/           # Shared primitives (Button, Card, Input, etc.)
│       ├── hooks/            # Custom React hooks
│       │   ├── use-chat.ts   # DM data fetching & mutations
│       │   ├── use-socket.ts # Socket.IO connection management
│       │   ├── use-threads.ts# Thread CRUD hooks
│       │   ├── use-notifications.ts
│       │   └── use-profile.ts
│       ├── lib/              # Axios client, query provider, utilities
│       └── types/            # Shared TypeScript type definitions
├── docker-compose.yml        # PostgreSQL container config
├── package.json              # Root package (Prettier)
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Minimum Version |
|---|---|
| **Node.js** | 22+ |
| **pnpm** | 10+ |
| **Docker** | Latest (for PostgreSQL) |

You will also need accounts for:
- [**Clerk**](https://clerk.com) — Authentication (obtain a Publishable Key & Secret Key)
- [**Cloudinary**](https://cloudinary.com) — Image uploads (obtain Cloud Name, API Key & API Secret)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/chat-weave.git
cd chat-weave
```

### 2. Start PostgreSQL

Spin up the database using Docker Compose:

```bash
docker compose up -d
```

This starts a PostgreSQL 16 container on port **6450** with a database named `chat_weave`.

### 3. Configure Environment Variables

#### Backend (`backend/.env`)

Create a `.env` file in the `backend/` directory:

```env
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=6450
DB_NAME=chat_weave
DB_USER=postgres
DB_PASSWORD=changemeinprod!

# Clerk
CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### Frontend (`frontend/.env`)

Create a `.env` file in the `frontend/` directory:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT=/

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key
```

### 4. Install Dependencies

```bash
# Backend
cd backend
pnpm install

# Frontend
cd ../frontend
pnpm install
```

### 5. Run Database Migrations

```bash
cd backend
pnpm migrate
```

This executes the SQL migration files in order to create the database schema:

| Migration | Description |
|---|---|
| `0001_users.sql` | Users table |
| `0002_threads_core.sql` | Threads & core schema |
| `0003_replies_like.sql` | Replies & likes |
| `0004_notifications.sql` | Notifications |
| `0005_chat.sql` | Direct messages |

### 6. Start the Development Servers

Open two terminal windows:

**Terminal 1 — Backend** (runs on `http://localhost:3000`):

```bash
cd backend
pnpm run dev
```

**Terminal 2 — Frontend** (runs on `http://localhost:3001`):

```bash
cd frontend
pnpm run dev
```

---

## 📡 API Overview

All REST endpoints are prefixed with `/api/v1` and require Clerk authentication.

| Route | Description |
|---|---|
| `GET/PUT /api/v1/users/me` | Current user profile |
| `GET/POST /api/v1/threads` | List / create threads |
| `GET/PUT/DELETE /api/v1/threads/:id` | Thread detail operations |
| `POST /api/v1/threads/:id/replies` | Reply to a thread |
| `POST /api/v1/threads/:id/like` | Like / unlike a thread |
| `GET /api/v1/chat` | List DM conversations |
| `GET /api/v1/chat/:userId` | Get messages with a user |
| `GET /api/v1/notifications` | List notifications |
| `PUT /api/v1/notifications/:id/read` | Mark notification as read |
| `POST /api/v1/upload` | Upload an image (Cloudinary) |

### Swagger Documentation

Once the backend is running, access the interactive API docs at:

```
http://localhost:3000/api-docs
```

---

## 🔌 Real-Time Events (Socket.IO)

Chat Weave uses Socket.IO for all real-time features. The client authenticates via Clerk user ID on handshake.

| Event | Direction | Description |
|---|---|---|
| `dm:send` | Client → Server | Send a direct message |
| `dm:message` | Server → Client | Receive a new direct message |
| `dm:typing` | Bidirectional | Typing indicator updates |
| `presence:update` | Server → Client | Online users list broadcast |
| `notification:new` | Server → Client | New notification alert |

---

## 🧪 Scripts Reference

### Backend

| Script | Command | Description |
|---|---|---|
| Dev server | `pnpm dev` | Start with hot-reload via `tsx watch` |
| Migrations | `pnpm migrate` | Run SQL migrations against PostgreSQL |

### Frontend

| Script | Command | Description |
|---|---|---|
| Dev server | `pnpm dev` | Start Next.js on port 3001 |
| Build | `pnpm build` | Production build |
| Start | `pnpm start` | Start production server |

---

## 🐳 Docker

The project includes a `docker-compose.yml` for local development PostgreSQL:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: chat_weave_container
    restart: unless-stopped
    ports:
      - "6450:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

**Commands:**

```bash
docker compose up -d       # Start PostgreSQL
docker compose down        # Stop PostgreSQL
docker compose down -v     # Stop & delete data volume
```

---

## 📄 License

ISC


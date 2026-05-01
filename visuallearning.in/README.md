# VisualLearning - Online Education Platform

A production-ready online education platform for students from Class 9 to Class 12, featuring animated educational videos, subscription management, and an admin panel.

## Tech Stack

| Layer          | Technology                        |
|----------------|-----------------------------------|
| Frontend       | Next.js 14, TailwindCSS, TypeScript |
| Backend        | Node.js, Express.js, TypeScript   |
| Database       | PostgreSQL                        |
| ORM            | Prisma                            |
| Authentication | JWT                               |
| Payments       | Razorpay                          |
| Containerization | Docker                          |

## Project Structure

```
visuallearning-app/
├── backend/                # Express.js API server
│   ├── prisma/             # Database schema & migrations
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── config/         # App configuration
│       ├── controllers/    # Route handlers
│       ├── middleware/      # Auth, validation, error handling
│       ├── routes/         # API route definitions
│       ├── services/       # Business logic (Razorpay, etc.)
│       ├── utils/          # Helpers (JWT, email, password)
│       └── index.ts        # Entry point
├── frontend/               # Next.js 14 app
│   └── src/
│       ├── app/            # App Router pages
│       │   ├── auth/       # Login, Signup, Forgot Password
│       │   ├── (dashboard)/ # Student dashboard
│       │   └── admin/      # Admin panel
│       ├── components/     # Reusable components
│       ├── lib/            # Utilities, API client, auth store
│       └── types/          # TypeScript interfaces
├── docker-compose.yml
├── .env.example
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js 20+
- PostgreSQL 16+ (or Docker)
- npm or yarn

### Step 1: Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd visuallearning-app

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Environment Configuration

```bash
# From project root
cp .env.example .env

# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your database URL, JWT secret, Razorpay keys, SMTP config

# Frontend
cp frontend/.env.example frontend/.env.local
# Edit frontend/.env.local with your API URL and Razorpay public key
```

### Step 3: Database Setup

```bash
cd backend

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed the database with sample data
npm run prisma:seed
```

### Step 4: Start Development Servers

```bash
# Terminal 1 - Backend (port 5000)
cd backend
npm run dev

# Terminal 2 - Frontend (port 3000)
cd frontend
npm run dev
```

### Step 5: Access the Application

| URL | Description |
|-----|-------------|
| http://localhost:3000 | Student-facing website |
| http://localhost:3000/admin/login | Admin panel |
| http://localhost:5000/api | Backend API |

### Default Credentials

| Role    | Email                        | Password  |
|---------|------------------------------|-----------|
| Admin   | admin@visuallearning.com     | admin123  |
| Student | student@demo.com             | student123|

## Docker Setup

```bash
# Start all services
docker-compose up -d

# Run migrations inside container
docker-compose exec backend npx prisma migrate deploy

# Seed database
docker-compose exec backend npx prisma db seed
```

## API Endpoints

### Authentication
| Method | Endpoint                    | Description         |
|--------|-----------------------------|---------------------|
| POST   | /api/auth/signup            | Register new user   |
| POST   | /api/auth/login             | Login               |
| POST   | /api/auth/forgot-password   | Request password reset |
| POST   | /api/auth/reset-password    | Reset password      |
| GET    | /api/auth/verify-email      | Verify email        |
| GET    | /api/auth/profile           | Get current user    |
| PUT    | /api/auth/profile           | Update profile      |

### Courses
| Method | Endpoint                              | Description           |
|--------|---------------------------------------|-----------------------|
| GET    | /api/courses/classes                  | List all classes      |
| GET    | /api/courses/classes/:id/subjects     | Subjects for a class  |
| GET    | /api/courses/subjects/:id/chapters    | Chapters for subject  |
| GET    | /api/courses/chapters/:id/videos      | Videos for chapter    |
| GET    | /api/courses/videos/:id               | Single video detail   |
| GET    | /api/courses/chapters/:id/notes       | Notes for chapter     |
| GET    | /api/courses/chapters/:id/questions   | Questions for chapter |

### Subscription
| Method | Endpoint                         | Description            |
|--------|----------------------------------|------------------------|
| GET    | /api/subscription/plans          | Available plans        |
| GET    | /api/subscription/my-subscription| Current subscription   |
| POST   | /api/subscription/create-order   | Create Razorpay order  |
| POST   | /api/subscription/verify-payment | Verify payment         |

### Admin
| Method | Endpoint                    | Description              |
|--------|-----------------------------|--------------------------|
| GET    | /api/admin/stats            | Dashboard statistics     |
| GET    | /api/admin/users            | List all users           |
| PATCH  | /api/admin/users/:id/block  | Block/unblock user       |
| POST   | /api/admin/classes          | Add class                |
| POST   | /api/admin/subjects         | Add subject              |
| POST   | /api/admin/chapters         | Add chapter              |
| POST   | /api/admin/videos           | Add video                |
| POST   | /api/admin/notes            | Add note                 |
| POST   | /api/admin/questions        | Add question             |
| PUT    | /api/admin/:resource/:id    | Update resource          |
| DELETE | /api/admin/:resource/:id    | Delete resource          |

## Razorpay Integration

1. Create account at https://razorpay.com
2. Get API keys from Dashboard → Settings → API Keys
3. Set up webhook at Dashboard → Settings → Webhooks
   - URL: `https://yourdomain.com/api/subscription/verify-payment`
   - Events: `payment.captured`
4. Add keys to `.env`

## License

MIT

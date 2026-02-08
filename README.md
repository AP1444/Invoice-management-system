# Invoice Management System

Hey! This is an invoice management app I built for tracking invoices. It's a full-stack application using React for the frontend and Node.js/Express for the backend, with Prisma as the ORM connecting to MySQL.

## What I Used

| Layer | Tech |
|-------|------|
| Frontend | React 18, React Router, Axios, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MySQL with Prisma ORM |
| Auth | JWT tokens + bcrypt for password hashing |

## Project Structure

```
├── backend/
│   ├── prisma/          # Database schema and seed
│   └── src/
│       ├── index.js     # Express server setup
│       ├── middleware/  # JWT auth middleware
│       └── routes/      # API endpoints
├── frontend/
│   └── src/
│       ├── api/         # Axios configuration
│       ├── components/  # Layout, ProtectedRoute
│       ├── context/     # Auth state management
│       └── pages/       # Login, Dashboard, Invoices, InvoiceForm
└── README.md
```

## How to Run

### Prerequisites
- Node.js v18 or higher
- MySQL server running on your machine

### Step 1: Set up the database

```sql
CREATE DATABASE invoice_db;
```

### Step 2: Backend setup

```bash
cd backend
npm install

# Open .env and update with your MySQL password
# Then run:
npx prisma generate
npx prisma db push
npm run db:seed    # Creates default user + sample invoices
npm run dev        # Starts on port 3000
```

### Step 3: Frontend setup

```bash
cd frontend
npm install
npm run dev    # Starts on port 5173
```

### Step 4: Open the app

Go to http://localhost:5173 and login with:
- **Email:** admin@example.com
- **Password:** password123

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/login` | Login | Authentication with gradient background |
| `/dashboard` | Dashboard | Stats overview + recent invoices |
| `/invoices` | Invoices | Full list with search/filter capabilities |
| `/invoices/new` | Create Invoice | Form to create new invoice |
| `/invoices/:id/edit` | Edit Invoice | Form to update existing invoice |

## What It Does

- **Authentication** - Login/logout with JWT tokens
- **Dashboard** - Shows total invoices and total amount at a glance
- **Invoice CRUD** - Create, view, edit, and delete invoices
- **Filtering** - Filter by status (Paid/Unpaid) and date range
- **Search** - Find invoices by number or customer name

## API Endpoints

| Method | Route | What it does |
|--------|-------|--------------|
| POST | /api/auth/login | Login and get token |
| GET | /api/auth/me | Get logged in user |
| GET | /api/invoices | List all invoices (supports filters) |
| GET | /api/invoices/:id | Get single invoice |
| POST | /api/invoices | Create new invoice |
| PUT | /api/invoices/:id | Update an invoice |
| DELETE | /api/invoices/:id | Delete an invoice |

## Known Limitations & Bugs

1. **No user registration** - Only the seeded admin user can login. I didn't implement registration since it wasn't in the requirements, but it would be easy to add.

2. **JWT doesn't invalidate on logout** - When you logout, the token is just removed from localStorage. The token itself is still valid until it expires (24 hours). Someone could theoretically reuse it. A proper fix would be to implement a token blacklist.

3. **No pagination** - All invoices load at once. This works fine for small datasets but would need pagination for hundreds of invoices.

4. **Single user system** - There's no concept of invoice ownership. All invoices are visible to anyone who logs in.

## What I'd Improve With More Time

- Add pagination for the invoice list
- Implement proper token invalidation with Redis
- Add user registration and role-based access
- Add PDF export for invoices
- Add email notifications for unpaid invoices

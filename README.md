# MedSearch

MedSearch is a full-stack web application for searching medicines, browsing nearby pharmacies, managing personal reminders, and handling support conversations through a dedicated admin panel. The project combines a React/Vite frontend with a Node.js/Express/MongoDB backend and includes authentication, role-based admin access, notifications, reminders, reservations, and support chat workflows.

## Overview

MedSearch is split into two main surfaces:

- A user-facing application for search, reservations, reminders, profile management, notifications, and consultation chat
- An admin dashboard for managing users, pharmacies, medicines, reminders, reservations, analytics, settings, and support conversations

The codebase is organized as a monorepo-style project with separate `Frontend/` and `backend/` applications.

## Repository

```bash
git clone https://github.com/IlahaBashirova/medsearch-web.git
cd medsearch-web
```

## Live Demo

No live demo URL is configured in this repository.

## Screenshots

Screenshots are not included in the repository at the moment. If you want to showcase the project in a portfolio, add screenshots under a folder such as:

```text
docs/screenshots/
```

Suggested captures:

- Home page
- Search results
- Pharmacy detail / consultation chat
- Profile / reminders
- Admin dashboard
- Admin medicines / pharmacies
- Admin support chat

## Features

### User Features

- User registration and login
- Guest access flow
- Medicine search flow from the home page
- Voice search from the home search bar using browser speech recognition
- Prescription image selection flow from the home page search bar
- Pharmacy listing and detail pages
- Reservation creation and reservation history
- Reminder creation, listing, persistence, and deletion
- User notifications page
- Consultation/support chat tied to pharmacy context
- Chat-related notification deep links

### Admin Features

- Admin authentication and protected admin routes
- Dashboard overview
- User management
- Pharmacy management
- Medicine management with create flow
- Reservation monitoring and status updates
- Reminder monitoring
- Support conversation inbox and replies
- Notifications page
- Analytics page
- Settings page

## Role-Based Access

- `GUEST`: Can browse the public app flow with limited access
- `USER`: Can use reminders, reservations, notifications, and support chat
- `ADMIN`: Can access the admin panel and all admin-only modules

## Tech Stack

### Frontend

- React 19
- React Router DOM 7
- Vite
- Plain CSS (`Frontend/src/styles/global.css`, `Frontend/src/styles/admin.css`)

### Backend

- Node.js
- Express 5
- MongoDB
- Mongoose
- JSON Web Tokens (`jsonwebtoken`)
- Password hashing with `bcryptjs`
- Swagger UI / OpenAPI docs

### Tooling

- ESLint
- Nodemon
- Jest
- Supertest
- `mongodb-memory-server`

## Project Structure

```text
medsearch-web/
├── Frontend/
│   ├── src/
│   │   ├── admin/                # Admin pages, layout, guards, API helpers
│   │   ├── components/           # Shared UI components
│   │   ├── lib/                  # Frontend API clients, auth helpers, storage helpers, mock data
│   │   ├── pages/                # User-facing pages
│   │   ├── styles/               # User/admin CSS
│   │   ├── App.jsx               # Frontend route map
│   │   └── main.jsx              # Frontend entry point
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── src/
│   │   ├── config/               # DB and env configuration
│   │   ├── controllers/          # Express controllers
│   │   ├── middleware/           # Auth, validation, errors, rate limiting
│   │   ├── models/               # Mongoose models
│   │   ├── routes/               # API routes
│   │   ├── scripts/              # Bootstrap and seed scripts
│   │   ├── services/             # Business logic layer
│   │   ├── utils/                # Shared utilities
│   │   ├── validation/           # Request validators
│   │   ├── app.js                # App bootstrap
│   │   └── swagger.js            # OpenAPI configuration
│   ├── package.json
│   └── .env
└── README.md
```

## Core Data Models

The backend defines the following main MongoDB collections via Mongoose models:

- `User`
- `Pharmacy`
- `Medicine`
- `Reservation`
- `Reminder`
- `SupportConversation`
- `Notification`
- `Setting`

## Installation

### 1. Install the frontend

```bash
cd Frontend
npm install
```

### 2. Install the backend

```bash
cd ../backend
npm install
```

## Environment Variables

### Backend

Create `backend/.env`:

```env
PORT=5000
JWT_SECRET=change_this_in_real_environments
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/medsearch
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change_me
ADMIN_NAME=MedSearch Admin
CORS_ORIGIN=http://localhost:5173
LOGIN_RATE_LIMIT_WINDOW_MS=900000
LOGIN_RATE_LIMIT_MAX_REQUESTS=10
```

Notes:

- The backend accepts either `MONGO_URI` or `MONGODB_URI`
- `JWT_SECRET` is required
- If your MongoDB credentials contain special characters such as `@`, `:`, `/`, or `?`, URL-encode them

### Frontend

The frontend reads:

```env
VITE_API_BASE_URL=http://localhost:5000
```

For standard Vite setup, place this in:

```text
Frontend/.env
```

Note:

- The current repository contains `Frontend/src/.env`
- Vite normally loads env files from the project root, so `Frontend/.env` is the recommended location for local setup

## Running the Project

### Backend

```bash
cd backend
npm run dev
```

Runs on:

```text
http://localhost:5000
```

### Frontend

```bash
cd Frontend
npm run dev
```

Runs on:

```text
http://localhost:5173
```

### Frontend production build

```bash
cd Frontend
npm run build
npm run preview
```

## Available Scripts

### Frontend

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

### Backend

```bash
npm run dev
npm start
npm run bootstrap:admin
npm run seed:admin-data
npm test
```

## Development Setup Notes

### Admin bootstrap / seed

The backend includes helper scripts for local setup:

- `npm run bootstrap:admin` creates an admin user from environment variables
- `npm run seed:admin-data` inserts sample admin-facing data such as users, pharmacies, medicines, reminders, reservations, support conversations, and settings

### Development-only credentials

The codebase includes a development admin login path for local testing. Treat any such credentials as development-only and do not reuse them in production. For real deployments:

- provision a secure admin account through backend-managed data
- use strong secrets
- never expose demo credentials publicly

## API Overview

Swagger documentation is served at:

```text
http://localhost:5000/api/docs
```

Main implemented route groups:

### Public / User

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/pharmacies`
- `GET /api/pharmacies/search`
- `GET /api/pharmacies/:id`
- `POST /api/reservations/create`
- `GET /api/reservations/user/:userId`
- `GET /api/reservations/:reservationId`
- `PATCH /api/reservations/:reservationId/status`
- `GET /api/reminders`
- `POST /api/reminders`
- `DELETE /api/reminders/:reminderId`
- `POST /api/support`
- `GET /api/support/my`
- `GET /api/notifications`
- `PATCH /api/notifications/read-all`
- `PATCH /api/notifications/:notificationId/read`

### Admin

- `POST /api/admin/auth/login`
- `GET /api/admin/dashboard`
- `GET /api/admin/users`
- `GET /api/admin/users/:userId`
- `PATCH /api/admin/users/:userId`
- `GET /api/admin/pharmacies`
- `POST /api/admin/pharmacies`
- `PATCH /api/admin/pharmacies/:pharmacyId`
- `GET /api/admin/medicines`
- `POST /api/admin/medicines`
- `GET /api/admin/medicines/:medicineId`
- `PATCH /api/admin/medicines/:medicineId`
- `GET /api/admin/reservations`
- `PATCH /api/admin/reservations/:reservationId/status`
- `GET /api/admin/reminders`
- `POST /api/admin/reminders`
- `PATCH /api/admin/reminders/:reminderId`
- `GET /api/support`
- `POST /api/support/:conversationId/reply`
- `PATCH /api/support/:conversationId/status`
- `GET /api/admin/analytics`
- `GET /api/admin/settings`
- `PATCH /api/admin/settings`
- `GET /api/admin/settings/system-info`
- `GET /api/admin/settings/quick-actions`

## Usage Guide

### User Flow

1. Open the app
2. Register, log in, or continue as guest
3. Search for a medicine from the home page
4. Review pharmacy results
5. Open a pharmacy detail page
6. Reserve a medicine if authenticated
7. Manage reminders and notifications from the profile area
8. Use consultation chat to contact support/admin

### Admin Flow

1. Sign in to the admin area
2. Review dashboard metrics
3. Manage users, pharmacies, and medicines
4. Monitor reservations and reminders
5. Reply to support conversations
6. Review analytics, notifications, and settings

## Architecture Notes

- The frontend and backend are decoupled applications connected through REST APIs
- The backend uses layered routing with controllers, services, models, and validation middleware
- Authentication is JWT-based
- Admin access is enforced through route guards in the frontend and `authorize("ADMIN")` in the backend
- Some user-facing search data currently relies on mock data in the frontend, while admin modules and persisted resources are backend-backed

## Known Issues / Limitations

- No live deployment configuration is included in the repository
- Public medicine/pharmacy search still relies partly on frontend mock data
- Prescription image scan is only partially implemented; image selection exists, but backend OCR/parsing is not present
- Voice search depends on browser support for the Web Speech API
- The repository does not include project screenshots yet
- A root `LICENSE` file is not present

## Future Improvements

- Replace remaining mock search data with backend-backed search
- Add OCR/prescription parsing on the backend
- Add stronger automated test coverage across the full stack
- Add CI/CD and deployment configuration
- Improve accessibility and localization support
- Consider real-time updates for chat/notifications instead of polling

## Contributing

Contributions are welcome.

1. Fork the repository
2. Create a branch

```bash
git checkout -b feature/your-change
```

3. Make your changes
4. Run the relevant checks

```bash
# frontend
cd Frontend && npm run build

# backend
cd ../backend && npm test
```

5. Commit and push
6. Open a pull request with a clear description of the change

Please keep contributions focused and avoid unrelated refactors.

## License

No standalone root license file is included in the repository at this time.

The backend package metadata currently declares:

```text
ISC
```

If you plan to publish this project as an open-source portfolio piece, add a root `LICENSE` file to make the license explicit.

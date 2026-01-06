# TourSeeker Backend API

> Local Guide Platform - Connecting travelers with passionate local experts

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your credentials

# Generate Prisma client
npm run prisma:generate

# Push database schema
npm run prisma:push

# Start development server
npm run dev
```

Server will run at: **http://localhost:5000**

## 📚 Documentation

| File | Purpose |
|------|---------|
| [SESSION_CONTEXT.md](SESSION_CONTEXT.md) | Complete workflow, patterns, and next steps |
| [QUICK_REFERENCE.md](QUICK_REFERENCE.md) | Quick commands and code templates |
| [claude.md](claude.md) | Detailed implementation guide |

## 🎯 Current Status

### ✅ Completed (Week 1)
- **Foundation**: Project structure, config, middlewares, database schema
- **Auth Module**: Tourist/Guide registration, login, JWT tokens, password management
- **User Module**: Profile CRUD, photo uploads, role-based updates

### 🚧 Next (Week 2)
- **Listing Module**: Tour listings CRUD, search, filtering
- **Booking Module**: Booking flow, status management
- **Review Module**: Ratings and reviews system

## 🌐 API Endpoints

**Base URL**: `http://localhost:5000/api/v1`

### Authentication
- `POST /auth/register/tourist` - Register as tourist
- `POST /auth/register/guide` - Register as guide
- `POST /auth/login` - Login
- `POST /auth/refresh-token` - Refresh access token
- `POST /auth/change-password` - Change password

### User Management
- `GET /users/me` - Get own profile
- `GET /users/:id` - Get user profile (public)
- `PATCH /users/tourist` - Update tourist profile
- `PATCH /users/guide` - Update guide profile
- `POST /users/upload-photo` - Upload profile photo

## 🧪 Testing

### Test Accounts
```
Tourist: tourist@test.com / newpass123
Guide:   guide@test.com / test123
```

### Example Request
```bash
# Register a new tourist
curl -X POST http://localhost:5000/api/v1/auth/register/tourist \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "John Doe",
    "phoneNumber": "+1234567890"
  }'
```

## 🏗️ Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (Prisma ORM)
- **Authentication**: JWT (access + refresh tokens)
- **Validation**: Zod
- **File Upload**: Multer + Cloudinary
- **Payment**: Stripe (upcoming)
- **Real-time**: Pusher (upcoming)
- **AI**: Google Gemini Pro (upcoming)

## 📁 Project Structure

```
src/
├── app/
│   ├── middlewares/     # Auth, validation, error handling
│   ├── modules/         # Feature modules (auth, user, listing, etc.)
│   ├── routes/          # Route aggregation
│   ├── shared/          # Shared utilities (prisma, catchAsync, etc.)
│   └── utils/           # Helper functions
├── config/              # Environment configuration
├── app.ts               # Express app setup
└── server.ts            # Server bootstrap

prisma/
└── schema/              # Database schema (split by domain)
```

## 🔧 Available Scripts

```bash
npm run dev                    # Start development server
npm run build                  # Build for production
npm start                      # Start production server
npm run prisma:generate        # Generate Prisma client
npm run prisma:push            # Push schema to database
npm run prisma:migrate         # Create migration
npm run prisma:migrate:deploy  # Deploy migrations (production)
```

## 🌍 Environment Variables

Required variables (see `.env.example`):

```env
# Database
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=your-secret
JWT_REFRESH_SECRET=your-refresh-secret

# Bcrypt
BCRYPT_SALT_ROUNDS=12

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Stripe (for payment module)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Pusher (for chat module)
PUSHER_APP_ID=your-app-id
PUSHER_KEY=your-key
PUSHER_SECRET=your-secret
PUSHER_CLUSTER=your-cluster

# Gemini AI (for recommendations)
GEMINI_API_KEY=your-gemini-key

# Frontend
FRONTEND_URL=http://localhost:3000
```

## 🎨 Code Patterns

### Service Pattern
```typescript
const createSomething = async (payload: IPayload) => {
  const result = await prisma.model.create({ data: payload });
  return result;
};
```

### Controller Pattern
```typescript
const createSomething = catchAsync(async (req: Request, res: Response) => {
  const result = await Service.createSomething(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Created successfully",
    data: result,
  });
});
```

### Route Pattern
```typescript
router.post(
  "/endpoint",
  auth(UserRole.SPECIFIC_ROLE),
  validateRequest(ValidationSchema),
  Controller.method
);
```

## 📞 Support

For questions or issues, refer to:
- [SESSION_CONTEXT.md](SESSION_CONTEXT.md) for detailed workflow
- [claude.md](claude.md) for implementation details
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for quick lookups

## 📄 License

MIT

## 👥 Author

Assignment 8 - Batch 5

---

**Last Updated**: 2026-01-07
**Status**: Week 1 Complete - Auth & User modules implemented and tested

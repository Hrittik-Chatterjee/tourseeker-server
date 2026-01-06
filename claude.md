# TourSeeker - Local Guide Platform Backend

## Project Overview

**Assignment**: Assignment 8 - Batch 5
**Description**: TourSeeker is a comprehensive platform connecting travelers with local guides. The platform enables tourists to discover and book unique local experiences while helping guides showcase their expertise and build their business.

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Language**: TypeScript
- **Authentication**: JWT (Access + Refresh Tokens)
- **Password Hashing**: bcryptjs (12 rounds)

### External Services
- **Image Storage**: Cloudinary
- **Payment Processing**: Stripe
- **Real-time Chat**: Pusher
- **AI Recommendations**: Google Gemini Pro API

### Deployment
- **Backend**: Railway / Render
- **Database**: Railway PostgreSQL
- **Frontend**: Vercel (Next.js)

## Unique Features

### 1. AI-Powered Tour Recommendations
- Uses Google Gemini Pro API to analyze user preferences and booking history
- Generates personalized tour recommendations based on interests
- Smart guide matching algorithm
- Intelligent itinerary suggestions
- Tracks recommendation effectiveness (click-through, conversion rates)

### 2. Real-Time Chat (Pusher)
- Pre-booking communication between tourists and guides
- Message notifications and unread counts
- Online/offline status indicators
- Conversation history linked to bookings
- File attachment support

### 3. Gamification System
- **Guide Badges**: Super Guide, Top Rated, Foodie Expert, History Buff, Newcomer
- **Tourist Explorer Levels**: Level 1-5 based on completed tours
- **Leaderboards**: Weekly, Monthly, Yearly rankings for top guides
- **Automatic Badge Awards**: Triggered after bookings, reviews, and profile updates
- Badge display on profiles

### 4. Advanced Analytics Dashboard
- Revenue trends and insights (6-month view)
- Booking trends with visual charts
- Top-performing tours analysis
- Peak season identification
- View-to-booking conversion rates
- Daily/weekly/monthly snapshots

## Architecture

### Three-Layer Architecture
```
Routes → Controllers → Services → Database
```

### Folder Structure
```
src/
├── app/
│   ├── middlewares/     # Error handling, auth, validation
│   ├── modules/         # Feature modules (auth, user, listing, etc.)
│   ├── routes/          # Centralized route aggregation
│   ├── shared/          # Shared utilities (catchAsync, sendResponse, prisma)
│   └── utils/           # Helper functions
├── config/              # Environment configuration
├── app.ts               # Express app setup
└── server.ts            # Server bootstrap with graceful shutdown
```

### Module Structure (Example: auth)
```
auth/
├── auth.controller.ts   # Request handlers
├── auth.service.ts      # Business logic
├── auth.routes.ts       # Route definitions
├── auth.interface.ts    # TypeScript interfaces
└── auth.validation.ts   # Zod schemas
```

## Database Schema

### Core Models
- **User**: Authentication (email, password, role, status)
- **Tourist**: Tourist-specific fields (preferences, explorer level)
- **Guide**: Guide-specific fields (expertise, pricing, stats)
- **Admin**: Admin-specific fields

### Business Models
- **Listing**: Tour listings with images, categories, pricing
- **Booking**: Booking requests and status tracking
- **Review**: Ratings and comments (1-5 stars)
- **Payment**: Stripe payment tracking

### Feature Models
- **Badge**: Badge definitions
- **TouristBadge/GuideBadge**: Earned badges
- **Leaderboard**: Guide rankings
- **Conversation**: Chat conversations
- **Message**: Chat messages
- **AIInteraction**: AI API call logs
- **AIRecommendation**: Generated recommendations
- **AnalyticsSnapshot**: Periodic analytics data

### Key Design Patterns
- UUID primary keys
- Soft deletes (isDeleted flag)
- Timestamps (createdAt, updatedAt)
- Email-based relations for user profiles
- JSON fields for flexible data (preferences, criteria)

## API Structure

### Base URL
```
http://localhost:5000/api/v1
```

### Module Routes
- `/auth` - Authentication & authorization
- `/users` - User profile management
- `/listings` - Tour listing CRUD
- `/bookings` - Booking management
- `/reviews` - Review system
- `/payments` - Stripe integration
- `/chat` - Real-time messaging
- `/gamification` - Badges & leaderboards
- `/ai` - AI recommendations
- `/analytics` - Dashboard analytics
- `/admin` - Admin operations

## Error Handling

### Global Error Handler
Handles:
- Prisma validation errors
- Prisma known request errors (P2002: duplicate, P2025: not found)
- Zod validation errors
- JWT errors (invalid, expired)
- Custom application errors

### Standardized Response Format
```typescript
{
  success: boolean,
  message: string,
  data: T | null,
  meta?: {
    page: number,
    limit: number,
    total: number
  }
}
```

## Authentication Flow

1. **Registration**: User + role-specific profile created in transaction
2. **Login**: Validate credentials → Generate access + refresh tokens
3. **Token Refresh**: Exchange refresh token for new access token
4. **Password Reset**: Email link with JWT token (15min expiry)
5. **Protected Routes**: Middleware validates JWT and user status

## Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL
- Cloudinary account
- Stripe account
- Pusher account
- Google Gemini API key

### Installation
```bash
# Navigate to backend
cd tourseeker-server

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Fill in all required values in .env

# Generate Prisma Client
npm run prisma:generate

# Push schema to database
npm run prisma:push

# Run development server
npm run dev
```

### Environment Variables
See `.env.example` for all required variables:
- Database connection
- JWT secrets
- Cloudinary credentials
- Stripe keys
- Pusher configuration
- Gemini API key

## Development Workflow

### Adding a New Feature Module

1. Create module folder: `src/app/modules/[feature]/`
2. Create files: controller, service, routes, interface, validation
3. Implement service layer with business logic
4. Create controller using catchAsync wrapper
5. Define routes with auth middleware
6. Add route to `src/app/routes/index.ts`
7. Test endpoints

### Database Changes

```bash
# Update Prisma schema
# Edit prisma/schema/*.prisma files

# Generate Prisma Client
npm run prisma:generate

# Push changes to database
npm run prisma:push

# Or create migration
npm run prisma:migrate
```

## Integration Guides

### Stripe Payment Flow
1. Create checkout session with booking details
2. Redirect user to Stripe hosted page
3. Handle webhook events (payment_intent.succeeded)
4. Update booking and payment status
5. Trigger gamification checks

### Pusher Real-Time Chat
1. Initialize Pusher client on backend
2. Save message to database
3. Trigger Pusher event: `conversation-${id}`, event: `new-message`
4. Update unread counts
5. Send notification to participants

### Gemini AI Recommendations
1. Fetch user preferences and history
2. Build prompt with available tours
3. Call Gemini API
4. Parse JSON response
5. Save recommendations to database
6. Return to frontend

### Cloudinary Image Upload
1. Receive multipart/form-data
2. Upload to Cloudinary with folder structure
3. Save secure_url to database
4. Return URL to frontend

## Key Considerations

### Security
- JWT tokens in httpOnly cookies (frontend)
- Password hashing with bcrypt (12 rounds)
- Input validation with Zod
- Auth middleware for protected routes
- Role-based access control

### Performance
- Database indexing on frequently queried fields
- Pagination for list endpoints
- Caching for analytics snapshots
- Background jobs for badge calculations

### Scalability
- Modular architecture for easy feature addition
- Prisma for database abstraction
- Pusher for scalable real-time features
- Cloudinary for image CDN

## Module Implementation Status

### Phase 1: Foundation (✅ Completed)
- [x] Project structure created
- [x] Dependencies installed
- [x] Configuration management
- [x] Shared utilities (prisma, catchAsync, sendResponse, cloudinary)
- [x] Error handling middleware
- [x] Auth middleware
- [x] Database schema designed

### Phase 2: Core Modules (🚧 To Do)
- [ ] Auth module (register, login, refresh token, password reset)
- [ ] User module (profile CRUD, photo upload)
- [ ] Listing module (CRUD, search, filtering)
- [ ] Booking module (create, accept/decline, status updates)
- [ ] Review module (CRUD, rating aggregation)

### Phase 3: Payment Integration (🚧 To Do)
- [ ] Payment module (Stripe checkout, webhooks, refunds)

### Phase 4: Unique Features (🚧 To Do)
- [ ] Chat module (Pusher integration)
- [ ] Gamification module (badges, leaderboards)
- [ ] AI Recommendation module (Gemini integration)
- [ ] Analytics module (dashboard, trends)

### Phase 5: Admin & Testing (🚧 To Do)
- [ ] Admin module (user/listing management)
- [ ] API testing
- [ ] Deployment preparation

## Next Steps

1. Install dependencies: `npm install`
2. Setup PostgreSQL database
3. Configure environment variables in `.env`
4. Generate Prisma client: `npm run prisma:generate`
5. Push schema to database: `npm run prisma:push`
6. Start implementing modules (beginning with Auth)
7. Test each module thoroughly
8. Deploy to Railway/Render

## Reference Projects

This project follows patterns from:
- **Backend**: [ph-health-care-server-prac](../ph-health-care-server-prac)
- **Frontend**: [ph-health-care](../ph-health-care)

## License
MIT

## Author
Assignment 8 - Batch 5

---
**Last Updated**: 2026-01-06
**Status**: Foundation Complete - Ready for Module Implementation

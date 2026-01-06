# TourSeeker Implementation Guide

## Week-by-Week Backend Implementation Plan

This guide provides a step-by-step roadmap for implementing the TourSeeker backend.

---

## Week 1: Authentication & User Management

### Module 1: Auth Module (`src/app/modules/auth/`)

**Files to Create:**
- `auth.interface.ts` - TypeScript interfaces
- `auth.validation.ts` - Zod validation schemas
- `auth.service.ts` - Business logic (bcrypt + JWT)
- `auth.controller.ts` - Route handlers
- `auth.routes.ts` - Route definitions

**Endpoints:**
- `POST /api/v1/auth/register-tourist` - Register tourist (User + Tourist transaction)
- `POST /api/v1/auth/register-guide` - Register guide (User + Guide transaction)
- `POST /api/v1/auth/login` - Login (returns accessToken + refreshToken)
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `POST /api/v1/auth/forgot-password` - Send password reset email
- `POST /api/v1/auth/reset-password` - Reset password with token
- `POST /api/v1/auth/change-password` - Change password (authenticated)
- `GET /api/v1/auth/me` - Get current user info

**Key Features:**
- bcrypt password hashing (12 rounds)
- JWT access tokens (7 days) + refresh tokens (90 days)
- Transactions for User + Profile creation
- Email-based password reset

---

### Module 2: User Module (`src/app/modules/user/`)

**Files to Create:**
- `user.interface.ts`
- `user.validation.ts`
- `user.service.ts`
- `user.controller.ts`
- `user.routes.ts`

**Endpoints:**
- `GET /api/v1/users/profile/:id` - Get profile (public)
- `GET /api/v1/users/my-profile` - Get own profile
- `PATCH /api/v1/users/my-profile` - Update profile
- `POST /api/v1/users/upload-photo` - Upload photo to Cloudinary
- `DELETE /api/v1/users/my-account` - Soft delete account

**Key Features:**
- Cloudinary image upload integration
- Profile updates with validation
- Soft delete functionality

---

## Week 2: Core Business Logic

### Module 3: Listing Module (`src/app/modules/listing/`)

**Endpoints:**
- `POST /api/v1/listings` - Create listing (Guide only)
- `GET /api/v1/listings` - Get all listings with filters
  - Filters: city, category, minPrice, maxPrice, language, sortBy
  - Pagination: page, limit
- `GET /api/v1/listings/:id` - Get single listing
- `PATCH /api/v1/listings/:id` - Update listing (owner only)
- `DELETE /api/v1/listings/:id` - Soft delete listing
- `GET /api/v1/listings/my-listings` - Get guide's own listings
- `POST /api/v1/listings/:id/images` - Upload listing images
- `PATCH /api/v1/listings/:id/toggle-active` - Activate/deactivate listing

**Key Features:**
- Advanced filtering (city, category, price range, language)
- Search functionality
- Owner-only updates
- Image uploads to Cloudinary

---

### Module 4: Booking Module (`src/app/modules/booking/`)

**Endpoints:**
- `POST /api/v1/bookings` - Create booking (Tourist, auto-creates Conversation)
- `GET /api/v1/bookings/my-bookings` - Tourist's bookings
- `GET /api/v1/bookings/my-guide-bookings` - Guide's bookings
- `GET /api/v1/bookings/:id` - Get single booking
- `PATCH /api/v1/bookings/:id/accept` - Accept booking (Guide)
- `PATCH /api/v1/bookings/:id/decline` - Decline booking (Guide)
- `PATCH /api/v1/bookings/:id/complete` - Mark as completed (Guide)
- `PATCH /api/v1/bookings/:id/cancel` - Cancel booking (Tourist)

**Key Features:**
- Automatic conversation creation on booking
- Status workflow: PENDING → ACCEPTED/DECLINED → COMPLETED
- Payment status tracking
- Role-based actions (tourist vs guide)

---

### Module 5: Review Module (`src/app/modules/review/`)

**Endpoints:**
- `POST /api/v1/reviews` - Create review (after completed booking)
- `GET /api/v1/reviews/listing/:listingId` - Get listing reviews
- `GET /api/v1/reviews/guide/:guideId` - Get guide reviews
- `PATCH /api/v1/reviews/:id` - Update own review
- `DELETE /api/v1/reviews/:id` - Delete own review
- `POST /api/v1/reviews/:id/response` - Guide response to review

**Key Features:**
- 1-5 star rating system
- Only review completed bookings
- Update guide average rating after new review
- Trigger badge check after review creation

---

## Week 3: Payment Integration

### Module 6: Payment Module (`src/app/modules/payment/`)

**Endpoints:**
- `POST /api/v1/payments/create-checkout-session` - Create Stripe checkout session
- `POST /api/v1/payments/webhook` - Handle Stripe webhook events
- `GET /api/v1/payments/:bookingId` - Get payment details
- `POST /api/v1/payments/:bookingId/refund` - Process refund (Admin only)

**Payment Flow:**
1. Tourist creates booking (status: PENDING)
2. Create Stripe checkout session
3. Redirect to Stripe hosted page
4. User completes payment
5. Webhook receives `payment_intent.succeeded`
6. Update booking status to ACCEPTED
7. Create Payment record
8. Trigger gamification checks

**Key Features:**
- Stripe Checkout integration
- Webhook signature verification
- Payment status tracking
- Refund support

---

## Week 4: Unique Features - Chat & Gamification

### Module 7: Chat Module (`src/app/modules/chat/`)

**Additional File:**
- `pusher.config.ts` - Pusher initialization

**Endpoints:**
- `POST /api/v1/chat/conversations` - Create conversation
- `GET /api/v1/chat/conversations` - Get user's conversations
- `GET /api/v1/chat/conversations/:id/messages` - Get messages
- `POST /api/v1/chat/messages` - Send message (triggers Pusher event)
- `PATCH /api/v1/chat/messages/:id/read` - Mark message as read

**Pusher Integration:**
```javascript
// After saving message to DB
await pusher.trigger(`conversation-${conversationId}`, 'new-message', {
  messageId: message.id,
  senderId: data.senderId,
  content: data.content,
  timestamp: message.createdAt
});

// Send notification
await pusher.trigger(`user-${recipientId}`, 'new-message-notification', {
  conversationId,
  unreadCount: newUnreadCount
});
```

**Key Features:**
- Real-time messaging with Pusher
- Unread count tracking
- Message status (SENT, DELIVERED, READ)
- File attachments support

---

### Module 8: Gamification Module (`src/app/modules/gamification/`)

**Additional File:**
- `badge-rules.ts` - Badge criteria definitions

**Endpoints:**
- `GET /api/v1/gamification/badges` - Get all available badges
- `GET /api/v1/gamification/my-badges` - Get user's earned badges
- `GET /api/v1/gamification/leaderboard` - Get leaderboard (query: period, limit)
- `POST /api/v1/gamification/check-achievements` - Manually trigger badge check

**Badge Rules:**
- **Super Guide**: 50+ bookings, 4.8+ rating
- **Top Rated**: 4.9+ rating, 20+ reviews
- **Foodie Expert**: 10+ food tours
- **History Buff**: 10+ history tours
- **Explorer Level 1**: 1 completed tour (Tourist)
- **Explorer Level 2**: 5 completed tours (Tourist)
- **Explorer Level 3**: 10 completed tours (Tourist)

**Trigger Points:**
- After booking completion
- After review creation
- Manual trigger endpoint

**Key Features:**
- Automatic badge awarding
- Leaderboard rankings (daily, weekly, monthly, yearly)
- Badge display on profiles

---

## Week 5: AI & Analytics

### Module 9: AI Recommendation Module (`src/app/modules/ai-recommendation/`)

**Endpoints:**
- `POST /api/v1/ai/recommendations` - Get personalized tour recommendations
- `POST /api/v1/ai/chat` - AI chat for tour queries
- `POST /api/v1/ai/match-guide` - Match tourist with suitable guides
- `POST /api/v1/ai/itinerary` - Generate smart itinerary

**Gemini Integration Example:**
```javascript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(config.gemini_api_key);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

const prompt = `Analyze user preferences: ${JSON.stringify(preferences)}
Past tours: ${JSON.stringify(bookingHistory)}
Available tours: ${JSON.stringify(listings)}
Return top 5 recommendations as JSON: [{listingId, score, reasons[]}]`;

const result = await model.generateContent(prompt);
const recommendations = JSON.parse(result.response.text());
```

**Key Features:**
- Personalized tour recommendations based on preferences
- AI-powered guide matching
- Smart itinerary generation
- Track recommendation effectiveness (clicks, conversions)

---

### Module 10: Analytics Module (`src/app/modules/analytics/`)

**Endpoints:**
- `GET /api/v1/analytics/dashboard` - Get guide's dashboard overview
- `GET /api/v1/analytics/revenue` - Revenue trends (6 months)
- `GET /api/v1/analytics/bookings` - Booking trends
- `GET /api/v1/analytics/popular-tours` - Top performing tours
- `GET /api/v1/analytics/peak-seasons` - Peak booking times
- `GET /api/v1/analytics/conversion-rate` - View-to-booking conversion %

**Dashboard Response:**
```javascript
{
  overview: {
    totalRevenue: 15000,
    totalBookings: 45,
    averageRating: 4.7,
    completionRate: 95
  },
  revenueChart: [/* 6 months data */],
  bookingChart: [/* 6 months data */],
  topTours: [/* top 5 tours */],
  peakDays: ["Saturday", "Sunday"],
  upcomingBookings: [/* next 5 bookings */],
  conversionRate: 23.5
}
```

**Key Features:**
- Revenue trends visualization
- Booking analytics
- Top-performing tours
- Peak season identification
- View-to-booking conversion tracking

---

### Module 11: Admin Module (`src/app/modules/admin/`)

**Endpoints:**
- `GET /api/v1/admin/users` - Get all users with filters
- `PATCH /api/v1/admin/users/:id/suspend` - Suspend user account
- `PATCH /api/v1/admin/users/:id/activate` - Activate user account
- `DELETE /api/v1/admin/users/:id` - Delete user permanently
- `GET /api/v1/admin/listings` - Get all listings
- `DELETE /api/v1/admin/listings/:id` - Delete listing
- `GET /api/v1/admin/stats` - Platform-wide statistics

**Key Features:**
- User management (suspend, activate, delete)
- Listing moderation
- Platform statistics dashboard

---

## Testing Checklist

After implementing all modules:

- [ ] Register as tourist and guide
- [ ] Login with both accounts
- [ ] Create tour listing as guide
- [ ] Search listings with various filters
- [ ] Create booking as tourist
- [ ] Guide accepts booking
- [ ] Complete Stripe payment (test mode)
- [ ] Mark booking as completed
- [ ] Leave review
- [ ] Verify rating update on guide profile
- [ ] Check badge awards
- [ ] Send chat messages between tourist and guide
- [ ] Verify Pusher real-time events
- [ ] Get AI recommendations
- [ ] View analytics dashboard (guide)
- [ ] Test admin endpoints

---

## Git Commit Strategy

Make meaningful commits at each milestone:

```bash
# Week 1
git commit -m "Implement Auth module with JWT and bcrypt"
git commit -m "Implement User module with Cloudinary integration"

# Week 2
git commit -m "Implement Listing module with search and filters"
git commit -m "Implement Booking module with status workflow"
git commit -m "Implement Review module with rating aggregation"

# Week 3
git commit -m "Integrate Stripe payment with webhooks"

# Week 4
git commit -m "Implement real-time chat with Pusher"
git commit -m "Implement gamification system with badges and leaderboards"

# Week 5
git commit -m "Integrate Gemini AI for tour recommendations"
git commit -m "Implement analytics dashboard for guides"
git commit -m "Implement admin module for platform management"
```

---

## Next Steps

1. ✅ Fix Prisma schema error (chat.prisma)
2. ✅ Run `npm run prisma:generate`
3. ✅ Initialize git repository
4. ✅ Create .env file with Railway DATABASE_URL
5. ✅ Run `npm run prisma:push`
6. ✅ Test server with `npm run dev`
7. ⏭️ Start implementing Auth module (Week 1)

---

**Last Updated**: 2026-01-07
**Status**: Foundation Complete - Ready for Module Implementation

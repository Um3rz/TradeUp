# TradeUp Project 

## Overview
This is a public fork of my project at LUMS - An AI Trading Simulation game
Deployment:https://p04-trade-up.vercel.app/
## 1. Trading System 
<img width="2816" height="1536" alt="Gemini_Generated_Image_l6si8wl6si8wl6si" src="https://github.com/user-attachments/assets/918f4da8-4ae8-4943-9ecb-d358e7857638" />

### Backend Addition
<img width="2752" height="1536" alt="Gemini_Generated_Image_abdqk1abdqk1abdq" src="https://github.com/user-attachments/assets/78454c09-7a80-4573-b0d2-e4100df93e57" />

- **New Module**: `src/trades/`
  - `trades.controller.ts` - Buy/Sell endpoints
  - `trades.service.ts` - Trading business logic
  - `dto/buy-stock.dto.ts` - Buy validation
  - `dto/sell-stock.dto.ts` - Sell validation
  - `trades.module.ts` - Module definition

### Database Changes
- **New Model**: `Portfolio`
  - Tracks user stock holdings
  - Fields: id, userId, stockId, quantity, avgPrice, createdAt
  - Unique constraint: userId + stockId

- **New Model**: `Transaction`
  - Records all buy/sell operations
  - Fields: id, userId, stockId, type, quantity, price, total, createdAt
  - Enums: TransactionType (BUY, SELL)

- **User Model Updates**
  - Added `balance` field (Decimal, default: 1000000 PKR)
  - Added `name` field (String, optional)
  - Added `profileImageUrl` field (String, optional)
  - Added relations: portfolio[], transactions[]

- **Stock Model Updates**
  - Added relations: portfolio[], transactions[]

### API Endpoints Added

#### POST /trades/buy
- **Auth**: Required (JWT)
- **Body**: `{ "symbol": "HBL", "quantity": 10 }`
- **Response**: User balance, portfolio item, transaction
- **Validation**: symbol (required), quantity (≥ 1)
- **Errors**: Insufficient balance, stock not found

#### POST /trades/sell
- **Auth**: Required (JWT)
- **Body**: `{ "symbol": "HBL", "quantity": 5 }`
- **Response**: User balance, portfolio item, transaction
- **Validation**: symbol (required), quantity (≥ 1)
- **Errors**: Insufficient shares, stock not found

#### GET /trades/portfolio
- **Auth**: Required (JWT)
- **Response**: 
  - balance, totalInvested, totalPortfolioValue
  - totalUnrealizedPnl, totalPnlPercentage
  - totalAccountValue
  - portfolio array with P&L calculations

#### GET /trades/transactions
- **Auth**: Required (JWT)
- **Query**: ?limit=50&offset=0
- **Response**: Paginated transaction history with metadata

### Frontend Additions

#### New Pages
- **`app/buy/page.tsx`** - Buy stocks interface
  - Stock selection dropdown
  - Quantity input with validation
  - Current price display
  - Total cost calculation
  - Balance check

- **`app/portfolio/page.tsx`** - Portfolio & transactions
  - Portfolio overview with total value
  - Holdings table with P&L
  - Transaction history with pagination
  - Sell functionality

## 2. News Feed System (Fully Implemented)

### Backend Additions
- **New Module**: `src/news/`
  - `news.controller.ts` - News endpoints
  - `news.module.ts` - Module definition

### API Endpoints Added

#### GET /news/latest
- **Auth**: Not required
- **Response**: Array of latest market news articles
- **API**: Financial Modeling Prep

#### POST /news/stock
- **Auth**: Not required
- **Body**: `{ "ticker": "HBL" }`
- **Response**: Stock-specific news articles
- **API**: MarketAux

### Frontend Additions

#### New Files
- **`lib/newsService.ts`** - News API service
  - `fetchLatestNews()` - Get latest news
  - `fetchStockNews(ticker)` - Get stock-specific news

- **`types/news.ts`** - TypeScript types
  - `NewsArticle` interface
  - `StockNewsArticle` interface
  - Response type definitions

- **`app/news/page.tsx`** - News feed page
  - Latest market news display
  - News articles with images
  - Stock-specific filtering

## 3. User Profile Management (Fully Implemented)

### Backend Additions

#### New API Endpoints

##### GET /users/profile
- **Auth**: Required (JWT)
- **Response**: User profile (id, email, name, role, balance, profileImageUrl)

##### PUT /users/email
- **Auth**: Required (JWT)
- **Body**: `{ "newEmail": "...", "currentPassword": "..." }`
- **Response**: Updated user profile

##### PUT /users/password
- **Auth**: Required (JWT)
- **Body**: `{ "currentPassword": "...", "newPassword": "..." }`
- **Response**: Success message

##### PUT /users/name
- **Auth**: Required (JWT)
- **Body**: `{ "newName": "...", "currentPassword": "..." }`
- **Response**: Updated user profile

##### POST /users/profile-picture
- **Auth**: Required (JWT)
- **Body**: `file` (multipart/form-data)
- **Response**: `{ "imageUrl": "..." }`

### Frontend Additions

#### New Files
- **`lib/userService.ts`** - User management service
  - `uploadProfileImage(file)` - Upload profile picture
  - `getUserProfile()` - Get user profile
  - `updateUserEmail(newEmail, currentPassword)`
  - `updateUserPassword(currentPassword, newPassword)`
  - `updateUserName(newName, currentPassword)`

- **`app/settings/page.tsx`** - Settings page
  - Update name, email, password
  - Upload profile picture
  - View account information

## 4. Additional Frontend Pages (Fully Implemented)

### New Pages
- **`app/help/page.tsx`** - Help & documentation
- **`app/settings/page.tsx`** - User profile settings
- **`app/news/page.tsx`** - Latest news feed
- **`app/portfolio/page.tsx`** - Portfolio management
- **`app/buy/page.tsx`** - Buy stocks interface

## 5. Frontend Architecture Improvements

### New Components
- **`components/auth/auth-form.tsx`** - Login/Signup form
- **`components/auth/role-chip.tsx`** - Role display chip
- **`components/auth/tagline.tsx`** - Tagline component
- **`components/spinner.tsx`** - Loading spinner
- **`components/topbar.tsx`** - Navigation top bar

### New Context
- **`context/UserContext.tsx`** - User authentication context
  - Provides user state and authentication methods
  - Replaces localStorage-based auth with React context

### New Utilities
- **`lib/api.ts`** - API base URL configuration
  - Production: `https://p04-trade-up1.vercel.app`
  - Development: `http://localhost:3001`

## 6. Database Schema Updates

### Complete Schema (Prisma)

```prisma
model User {
  id              Int      @id @default(autoincrement())
  email           String   @unique
  passwordHash    String
  role            Role     @default(TRADER)
  createdAt       DateTime @default(now())
  balance         Decimal  @default(1000000)  // NEW
  name            String?  // NEW
  profileImageUrl String?  // NEW
  portfolio       Portfolio[]
  transactions    Transaction[]
  watchlist       WatchlistItem[]
}

model Stock {
  id           Int             @id @default(autoincrement())
  symbol       String          @unique
  name         String?
  marketType   String          @default("REG")
  createdAt    DateTime        @default(now())
  portfolio    Portfolio[]     // NEW
  transactions Transaction[]  // NEW
  watchers     WatchlistItem[]
}

model WatchlistItem {
  id        Int      @id @default(autoincrement())
  userId    Int
  stockId   Int
  createdAt DateTime @default(now())
  stock     Stock    @relation(fields: [stockId], references: [id])
  user      User     @relation(fields: [userId], references: [id])
  @@unique([userId, stockId])
}

model Portfolio {
  id        Int      @id @default(autoincrement())
  userId    Int
  stockId   Int
  quantity  Int
  avgPrice  Decimal
  createdAt DateTime @default(now())
  stock     Stock    @relation(fields: [stockId], references: [id])
  user      User     @relation(fields: [userId], references: [id])
  @@unique([userId, stockId])
}

model Transaction {
  id        Int             @id @default(autoincrement())
  userId    Int
  stockId   Int
  type      TransactionType
  quantity  Int
  price     Decimal
  total     Decimal
  createdAt DateTime        @default(now())
  stock     Stock           @relation(fields: [stockId], references: [id])
  user      User            @relation(fields: [userId], references: [id])
}

enum Role {
  TRADER
  ADMIN
}

enum TransactionType {
  BUY
  SELL
}
```

## 7. Technology Stack Updates
<img width="2816" height="875" alt="Gemini_Generated_Image_84mqbe84mqbe84mq" src="https://github.com/user-attachments/assets/652b45d3-40f5-49c8-9eea-a28455eed169" />

### Backend Version Updates
- **NestJS**: 11.0.1 (updated from 10.x)
- **Next.js**: 16.0.7 (updated from 16.0.0)
- **React**: 19.2.0

### New Dependencies

#### Backend
- `@nestjs/axios`: ^4.0.1 - HTTP client for news API
- `@prisma/client`: ^6.18.0 - Prisma ORM

#### Frontend
- `@radix-ui/react-avatar`: ^1.1.11 - Avatar component
- `@radix-ui/react-label`: ^2.1.7 - Label component
- `@radix-ui/react-separator`: ^1.1.7 - Separator component
- `@radix-ui/react-slot`: ^1.2.3 - Slot component
- `class-variance-authority`: ^0.7.1 - Variant utilities
- `clsx`: ^2.1.1 - Class name utilities
- `lightweight-charts`: ^4.1.3 - Candlestick charts
- `lucide-react`: ^0.552.0 - Icon library
- `next`: ^16.0.7 - Next.js framework
- `react`: 19.2.0 - React library
- `react-dom`: 19.2.0 - React DOM
- `react-hook-form`: ^7.66.0 - Form management
- `tailwind-merge`: ^3.3.1 - Tailwind class merging
- `zod`: ^4.1.12 - Validation

## 8. API Documentation Updates

### New Endpoints Summary

| Category | Endpoint | Method | Auth Required | Description |
|----------|----------|--------|---------------|-------------|
| **Trades** | `/trades/buy` | POST | ✓ | Buy stocks |
| **Trades** | `/trades/sell` | POST | ✓ | Sell stocks |
| **Trades** | `/trades/portfolio` | GET | ✓ | Get portfolio with P&L |
| **Trades** | `/trades/transactions` | GET | ✓ | Get transaction history |
| **News** | `/news/latest` | GET | ✗ | Get latest market news |
| **News** | `/news/stock` | POST | ✗ | Get stock-specific news |
| **Users** | `/users/profile` | GET | ✓ | Get user profile |
| **Users** | `/users/email` | PUT | ✓ | Update email |
| **Users** | `/users/password` | PUT | ✓ | Update password |
| **Users** | `/users/name` | PUT | ✓ | Update name |
| **Users** | `/users/profile-picture` | POST | ✓ | Upload profile picture |

## 9. Frontend Structure Updates

### New Directory Structure

```
frontend/
├── app/
│   ├── buy/              # NEW - Buy page
│   ├── portfolio/        # NEW - Portfolio page
│   ├── settings/         # NEW - Settings page
│   ├── help/             # NEW - Help page
│   ├── news/             # NEW - News page
│   ├── dashboard/
│   ├── charts/
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── auth/             # NEW - Auth components
│   │   ├── auth-form.tsx
│   │   ├── role-chip.tsx
│   │   └── tagline.tsx
│   ├── spinner.tsx       # NEW - Loading spinner
│   ├── topbar.tsx        # NEW - Navigation bar
│   └── ui/
│       └── ... (existing)
│
├── context/              # NEW - React context
│   └── UserContext.tsx
│
├── lib/
│   ├── api.ts            # NEW - API config
│   ├── newsService.ts    # NEW - News service
│   ├── userService.ts    # UPDATED - User service
│   └── utils.ts
│
└── types/                # NEW - TypeScript types
    └── news.ts
```

## 10. Key Features Status

### Phase 1 (Complete ✓)
- ✓ User authentication
- ✓ Stock market data
- ✓ Watchlist management
- ✓ Real-time updates
- ✓ Live candlestick charts
- ✓ Guest browsing

### Phase 2 (Complete ✓)
- ✓ Buy/Sell trading
- ✓ Portfolio management
- ✓ Transaction history
- ✓ News feed
- ✓ User profile settings
- ✓ Profile pictures
- ✓ Additional pages (Help, Settings)

### Phase 3 (Not Started)
- Advanced charts (multiple timeframes, indicators)
- AI features
- Gamification
- Community features
- Educational content
- Mobile app
- Admin dashboard

## 11. Database Migrations

### Migration History

1. **20251022144710_user_auth_watchlist**
   - Initial schema: User, Stock, WatchlistItem

2. **20251124123310_add_user_name_field**
   - Added `name` field to User model

3. **20251128183330_add_profile_image_url**
   - Added `profileImageUrl` field to User model

4. **20251130163218_add_user_balance_field**
   - Added `balance` field to User model

5. **20251130210857_change_default_balance_to_neg1**
   - Changed default balance from 1000000 to -1 (temporary)
   - **Note**: Current default is -1, should be updated to 1000000 for production

### Pending Migration
The balance field default should be updated from -1 to 1000000 for proper functionality.

## 12. Environment Variables Updates

### Backend (.env)

**New Variables:**
```
NEWS_API_KEY=your-news-api-key
STOCK_API_KEY=your-stock-api-key
```

### Frontend (.env.local)

**Updated Variable:**
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

## 13. Build & Deployment

### Build Status
- ✓ Backend builds successfully
- ✓ Frontend builds successfully
- ✓ All TypeScript checks pass
- ✓ All ESLint checks pass

### Deployment
- Backend: Can be deployed to Vercel, Railway, or any Node.js host
- Frontend: Deployed to Vercel (https://p04-trade-up1.vercel.app)

## 14. Testing

### Manual Testing Performed
- ✓ User registration and login
- ✓ Stock data fetching
- ✓ Watchlist management
- ✓ Buy/sell transactions
- ✓ Portfolio calculations
- ✓ Transaction history
- ✓ News feed
- ✓ Profile updates
- ✓ Profile picture upload

### Automated Testing
- Unit tests: Basic structure in place
- E2E tests: Basic structure in place
- Integration tests: Not fully implemented

## 15. Known Issues & Limitations

### Current Limitations
1. **Balance Default**: User balance defaults to -1 instead of 1000000
2. **News API Keys**: Required for news feed to work
3. **Stock News**: Limited to 3 articles per request
4. **WebSocket**: Only works when backend is running
5. **PSX API**: Rate limited to 100 requests per minute

### Workarounds
1. **Balance**: Update migration or manually set balance after user creation
2. **News API**: Use free tiers or obtain API keys
3. **WebSocket**: Ensure backend is always running
4. **PSX API**: Implement caching and rate limiting

## 16. Performance Considerations

### Optimizations Implemented
- ✓ Prisma transactions for atomic operations
- ✓ WebSocket for real-time updates
- ✓ Pagination for transaction history
- ✓ Caching in browser (localStorage)
- ✓ Efficient database queries

### Potential Improvements
- Redis caching for frequent queries
- Query optimization for portfolio calculations
- Load testing and benchmarking
- Database indexing optimization

## 17. Security Considerations

### Security Measures
- ✓ Password hashing with bcrypt
- ✓ JWT authentication with 7-day expiration
- ✓ Input validation with DTOs
- ✓ SQL injection prevention (Prisma ORM)
- ✓ CORS configuration
- ✓ Rate limiting (throttler module)

### Potential Improvements
- Implement refresh tokens
- Add CSRF protection
- Implement security headers
- Regular security audits
- Dependency vulnerability scanning

## 18. Documentation Updates

### Files Updated
- ✓ README.md (this document)
- ✓ CHANGES_SUMMARY.md (new)
- ✓ Backend README (if exists)
- ✓ Frontend README (if exists)

### Documentation Status
- ✓ API documentation complete
- ✓ Setup instructions complete
- ✓ Troubleshooting guide complete
- ✓ Code standards documented

## 19. Version History

| Version | Date | Description |
|---------|------|-------------|
| 1.0.0 | 2025-11-06 | Phase 1 Complete - Auth, Watchlist, Real-time Updates, Charts |
| 2.0.0 | 2025-12-16 | Phase 2 Complete - Trading System, Portfolio, News Feed, User Profile |

## 20. Next Steps

### Immediate Tasks
1. Fix balance default value (-1 → 1000000)
2. Add proper error handling for news API
3. Implement loading states in UI
4. Add more comprehensive tests
5. Improve documentation

### Future Enhancements
1. Advanced charting features
2. Technical indicators
3. AI-powered insights
4. Mobile application
5. Gamification elements
6. Social features

## Summary

The TradeUp project has successfully completed Phase 2 with the following major additions:

1. **Trading System** - Full buy/sell functionality with portfolio tracking
2. **News Feed** - Latest market news and stock-specific articles
3. **User Profile** - Profile management with profile pictures
4. **Additional Pages** - Help, Settings, Portfolio, Buy interfaces
5. **Enhanced Architecture** - React Context, improved service layer



**Last Updated**: December 16, 2025

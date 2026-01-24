# TradeUp Project Context

This file provides context for AI assistants (like Claude Code) working on the TradeUp project.

---

## Project Overview

**TradeUp** is a mock trading platform for the **Pakistan Stock Exchange (PSX)** that allows users to learn and practice stock trading without financial risk.

### Current Status
- **Phase 1**: ✅ Complete (Auth, Watchlist, Real-time data, Charts)
- **Phase 2**: ✅ Complete (Trading system: Buy/Sell functionality, Portfolio, Transactions)
- **Additional Features**: ✅ Complete (Market News, User Profile, Settings, Help Center)

### Tech Stack
- **Backend**: NestJS 11 + PostgreSQL (Prisma 6) + JWT Auth + WebSocket
- **Frontend**: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4
- **Real-time**: Socket.IO + PSX Terminal API WebSocket
- **Charts**: lightweight-charts

---

## Documentation Reference

**Complete project documentation**: `PROJECT_DOCUMENTATION.md`

This file contains:
- Project structure
- **Coding standards and best practices** (Section 4)
- **Folder structure explained** (Section 5)
- Database schema
- API documentation
- Setup instructions
- Troubleshooting guide

**Always refer to `PROJECT_DOCUMENTATION.md` for detailed information.**

---

## Coding Philosophy

### Core Principles
1. **Self-documenting code** - Code should be clear without comments
2. **Type safety first** - Always use TypeScript with explicit types
3. **No inline comments** - Only file-level docs when absolutely necessary
4. **Clean code** - Readable over clever
5. **Single responsibility** - Functions do one thing well

### Comment Policy

**IMPORTANT: Comments are DISCOURAGED**

- ❌ **NO inline comments** explaining what code does
- ❌ **NO commented-out code** (delete instead)
- ❌ **NO obvious comments**
- ✅ **File-level JSDoc** (only for public APIs, if needed)
- ✅ **Complex algorithm explanations** (rare cases only)
- ✅ **TODO/FIXME markers** (temporary, should be resolved)

**Rule**: If you need a comment to explain code, refactor the code to be clearer instead.

### Example

```typescript
// ✅ GOOD: Self-documenting, no comments needed
async function authenticateUser(email: string, password: string) {
  const user = await this.usersService.findByEmail(email);
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new UnauthorizedException('Invalid credentials');
  }

  return this.generateToken(user);
}

// ❌ BAD: Unnecessary inline comments
async function authenticateUser(email: string, password: string) {
  // Find user by email
  const user = await this.usersService.findByEmail(email);

  // Compare password
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  // Check if password is valid
  if (!isPasswordValid) {
    throw new UnauthorizedException('Invalid credentials');
  }

  // Return token
  return this.generateToken(user);
}
```

---

## Project Structure

### Backend (NestJS)
```
backend/src/
├── auth/           # Authentication (JWT, signup/login)
├── users/          # User management
├── stocks/         # Stock data (PSX API integration)
├── watchlist/      # Watchlist management
├── trades/         # Trading system (Buy/Sell, Portfolio, Transactions)
├── news/           # News integration (Financial Modeling Prep, MarketAux)
├── ws/             # WebSocket gateway (real-time)
├── prisma/         # Database ORM
├── common/         # Constants, utilities
└── main.ts         # Application bootstrap
```

### Frontend (Next.js)
```
frontend/
├── app/
│   ├── page.tsx           # Auth page (/)
│   ├── dashboard/         # Dashboard (/dashboard)
│   ├── buy/               # Buy Stocks page (/buy)
│   ├── portfolio/         # Portfolio page (/portfolio)
│   ├── news/              # Market News (/news)
│   ├── profile/           # User Profile (/profile)
│   ├── settings/          # User Settings (/settings)
│   ├── help/              # Help Center & FAQ (/help)
│   └── charts/            # Charts (/charts)
├── components/
│   ├── ui/                # Shadcn UI components
│   └── login-form.tsx     # Custom components
└── lib/                   # Utilities
```

---

## Database Schema (Prisma)

### Current Models
- **User**: id, email, passwordHash, role, createdAt, balance (Decimal), portfolio[], transactions[]
- **Stock**: id, symbol, name, marketType, createdAt, portfolio[], transactions[]
- **WatchlistItem**: id, userId, stockId, createdAt (junction table)
- **Portfolio**: id, userId, stockId, quantity, avgPrice, createdAt
- **Transaction**: id, userId, stockId, type (BUY/SELL), quantity, price, total, createdAt
- **Role Enum**: TRADER, ADMIN
- **TransactionType Enum**: BUY, SELL

---

## Naming Conventions

### Variables & Functions
- **camelCase**: `userBalance`, `isAuthenticated`, `calculateProfit()`
- **Boolean prefix**: `is`, `has`, `should`, `can`
- **Handlers**: `handleClick`, `onSubmit`, `handleLogin`

### Classes & Interfaces
- **PascalCase**: `UserService`, `StockData`, `TransactionType`

### Constants
- **UPPER_SNAKE_CASE**: `FEATURED_SYMBOLS`, `MAX_RETRY_ATTEMPTS`, `API_TIMEOUT_MS`

### Files
- **Backend**: `*.controller.ts`, `*.service.ts`, `*.module.ts`, `*.dto.ts`, `*.guard.ts`
- **Frontend**: `page.tsx`, `layout.tsx`, `kebab-case.tsx` (components)

---

## Code Quality Standards

### TypeScript
```typescript
// ✅ GOOD: Explicit types
function calculateTotal(price: number, quantity: number): number {
  return price * quantity;
}

// ❌ BAD: Implicit any
function calculateTotal(price, quantity) {
  return price * quantity;
}
```

### Avoid `any` Type

**CRITICAL: NEVER use `any` type in the codebase**

```typescript
// ✅ GOOD: Use proper types or unknown
function processData(data: unknown): StockData {
  if (isStockData(data)) {
    return data;
  }
  throw new Error("Invalid data");
}

// ❌ BAD: Using any
function processData(data: any): any {
  return data;
}
```

**Always use explicit types:**
- For unknown data: use `unknown` and add type guards
- For objects: create proper interfaces or types
- For arrays: specify the element type (`string[]`, `StockData[]`)
- For function parameters: always specify types
- For return values: always specify return types

### Functions
- **Keep small**: Max 20-30 lines
- **Single responsibility**: One function, one purpose
- **Descriptive names**: Function name explains what it does
- **Prefer pure functions**: No side effects when possible

### Async/Await
```typescript
// ✅ GOOD: Use async/await
async function getUserWatchlist(userId: number) {
  const items = await this.prisma.watchlistItem.findMany({ where: { userId } });
  return items;
}

// ❌ BAD: Use .then() chains
function getUserWatchlist(userId: number) {
  return this.prisma.watchlistItem.findMany({ where: { userId } })
    .then(items => items);
}
```

### Imports Organization
```typescript
// ✅ GOOD: Organized (built-in → external → internal)
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

// ❌ BAD: Random order
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
```

---

## API Endpoints

### Authentication (No Auth Required)
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login user

### Users (Auth Required)
- `POST /users/profile-picture` - Upload profile image

### Stocks (No Auth Required)
- `GET /stocks/featured` - Get featured stocks with prices
- `GET /stocks/:symbol` - Get single stock price

### Watchlist (Auth Required)
- `GET /watchlist` - Get user's watchlist
- `POST /watchlist` - Add stock to watchlist
- `DELETE /watchlist/:symbol` - Remove from watchlist

### Trades (Auth Required)
- `GET /trades/portfolio` - Get user's portfolio holdings and balance
- `GET /trades/transactions` - Get user's transaction history
- `POST /trades/buy` - Buy stock (deducts balance, updates portfolio)
- `POST /trades/sell` - Sell stock (credits balance, updates portfolio)

### News (No Auth Required)
- `GET /news/latest` - Get general market news
- `POST /news/stock` - Get specific stock news

### WebSocket (Socket.IO)
- **Namespace**: `/ws`
- **Client → Server**: `subscribeSymbol(symbol)`
- **Server → Client**: `tickUpdate(data)`, `subscribed(data)`

---

## External APIs

### PSX Terminal API
- **Base URL**: `https://psxterminal.com`
- **WebSocket**: `wss://psxterminal.com/`
- **Documentation**: https://github.com/mumtazkahn/psx-terminal/blob/main/API.md

### Financial Modeling Prep
- **Purpose**: General market news
- **Base URL**: `https://financialmodelingprep.com/stable`

### MarketAux
- **Purpose**: Stock-specific news
- **Base URL**: `https://api.marketaux.com/v1`

### Featured Symbols
- HBL (Habib Bank Limited)
- UBL (United Bank Limited)
- MCB (MCB Bank Limited)
- HUBC (Hub Power Company Limited)
- FFC (Fauji Fertilizer Company Limited)

### Rate Limits
- **REST API**: 100 requests/minute per IP
- **WebSocket**: 5 connections per IP, 20 subscriptions per connection

---

## Environment Variables

### Backend (.env)
```bash
DATABASE_URL="<postgres-connection-string>"
JWT_SECRET="<jwt-secret>"
PORT=3001
NEWS_API_KEY="<fmp-api-key>"
STOCK_API_KEY="<marketaux-api-key>"
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

---

## Development Workflow

### Backend
```bash
cd backend
npm run start:dev          # Start with hot reload
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Run migrations
npm run prisma:studio      # Open database GUI
npm run lint               # Check code quality
npm run format             # Format with Prettier
```

### Frontend
```bash
cd frontend
npm run dev                # Start dev server
npm run build              # Build for production
npm run lint               # Check code quality
```

---

## Security Guidelines

1. **Never commit secrets** - Use `.env` files (gitignored)
2. **Validate all inputs** - Use DTOs with class-validator
3. **Hash passwords** - Always bcrypt, never plain text
4. **Use parameterized queries** - Prisma handles automatically
5. **Implement rate limiting** - Prevent API abuse
6. **Keep dependencies updated** - Regular security patches

---

## Performance Guidelines

1. **Lazy load components** - Dynamic imports when appropriate
2. **Optimize database queries** - Avoid N+1 queries, use indexes
3. **Use pagination** - Don't load all records at once (implemented in transactions)
4. **WebSocket for real-time** - More efficient than polling
5. **Minimize bundle size** - Tree shaking, code splitting

---

## Testing Standards

### Unit Tests
- **Pattern**: AAA (Arrange, Act, Assert)
- **Naming**: `*.spec.ts` (backend), `*.test.tsx` (frontend)
- **Coverage**: Aim for >80% on critical paths

### Integration Tests
- Test real flows (auth, API calls, database)
- Use separate test database

---

## Git Commit Conventions

Use **conventional commits**:

```
feat: add buy/sell trading functionality
fix: resolve JWT token expiration issue
docs: update API documentation
refactor: simplify stock fetching logic
test: add unit tests for auth service
chore: update dependencies
```

---

## Common Pitfalls to Avoid

1. **Adding inline comments** - Write self-documenting code instead
2. **Using `any` type** - NEVER use `any`; use proper types or `unknown` instead
3. **Skipping linting** - ALWAYS run `npm run lint` after coding
4. **Ignoring type errors** - Fix ALL type errors with proper types, not `any`
5. **Long functions** - Break into smaller, focused functions
6. **Unvalidated inputs** - Always use DTOs for request validation
7. **Hardcoding values** - Use constants or environment variables
8. **Committing secrets** - Use `.env` files and gitignore
9. **Class components** - Use functional components with hooks
10. **Promise chains** - Use async/await instead of `.then()`

---

## File Location Reference

### Key Backend Files
- Database Schema: `backend/prisma/schema.prisma`
- Constants: `backend/src/common/constants.ts`
- Auth Service: `backend/src/auth/auth.service.ts`
- Stocks Service: `backend/src/stocks/stocks.service.ts`
- Trades Service: `backend/src/trades/trades.service.ts`
- News Service: `backend/src/news/news.controller.ts`
- WebSocket Gateway: `backend/src/ws/market.gateway.ts`
- Bootstrap: `backend/src/main.ts`

### Key Frontend Files
- Auth Page: `frontend/app/page.tsx`
- Dashboard: `frontend/app/dashboard/page.tsx`
- Buy Page: `frontend/app/buy/page.tsx`
- Portfolio Page: `frontend/app/portfolio/page.tsx`
- News Page: `frontend/app/news/page.tsx`
- Profile Page: `frontend/app/profile/page.tsx`
- Help Page: `frontend/app/help/page.tsx`
- Settings Page: `frontend/app/settings/layout.tsx`
- Charts: `frontend/app/charts/page.tsx`
- UI Components: `frontend/components/ui/`
- Utilities: `frontend/lib/utils.ts`

---

## When Working on Tasks

### Before Writing Code
1. **Read relevant documentation** in `PROJECT_DOCUMENTATION.md`
2. **Understand the module structure** (controllers, services, DTOs)
3. **Check existing patterns** in similar modules
4. **Plan the implementation** (what models, endpoints, logic needed)

### While Writing Code
1. **Use TypeScript with explicit types** - NEVER use `any` types anywhere
2. **Write self-documenting code** - No inline comments
3. **Keep functions small** - Single responsibility
4. **Follow naming conventions** - camelCase, PascalCase, UPPER_SNAKE_CASE
5. **Organize imports** - Built-in → External → Internal
6. **Use proper error handling** - Try-catch for async, NestJS exceptions
7. **Type everything explicitly** - Parameters, return types, variables, arrays, objects

### After Writing Code
1. **Run linter** - `npm run lint` (MANDATORY after every code change)
2. **Check type errors** - `npx tsc --noEmit`
3. **Fix ALL type errors** - NEVER use `type=any` as a shortcut
4. **Verify proper types** - Ensure all functions, parameters, and variables have explicit types
5. **Test the feature** - Manual testing or unit tests
6. **Update documentation** - If public API or major feature
7. **Commit with conventional message** - `feat:`, `fix:`, `docs:`, etc.

**Type Safety Workflow:**
```bash
# After writing any code:
npm run lint              # Check for errors
# If type errors exist → Fix them with proper types (NOT 'any')
npx tsc --noEmit         # Double-check TypeScript compilation
```

---

## Quick Reference

### When Adding a New Feature

#### Backend (NestJS)
1. Create module directory: `backend/src/feature-name/`
2. Add files: `feature.module.ts`, `feature.service.ts`, `feature.controller.ts`
3. Create DTOs: `dto/create-feature.dto.ts`, `dto/update-feature.dto.ts`
4. Update database schema: `prisma/schema.prisma` (if needed)
5. Run migration: `npm run prisma:migrate`
6. Import module in: `app.module.ts`

#### Frontend (Next.js)
1. Create page: `frontend/app/feature-name/page.tsx`
2. Add components: `frontend/components/feature-component.tsx`
3. Add utilities: `frontend/lib/feature-utils.ts` (if needed)
4. Update navigation: Add links in existing pages

### When Fixing a Bug
1. **Identify the module** - Which service/controller/component?
2. **Understand the flow** - Trace from API call to database
3. **Fix the issue** - Minimal changes, preserve existing patterns
4. **Test the fix** - Ensure bug is resolved, no regressions
5. **Commit** - `fix: resolve issue description`

### When Refactoring
1. **Don't change behavior** - Only improve structure/readability
2. **Test before and after** - Ensure functionality unchanged
3. **Keep commits focused** - One refactor per commit
4. **Update related docs** - If public API changed
5. **Commit** - `refactor: improve feature-name logic`

---

## Questions to Ask Before Implementation

1. **Does this feature belong in a new module or existing module?**
2. **What database models are needed?**
3. **Does this require authentication?** (Use `JwtAuthGuard` if yes)
4. **What validation is needed?** (Create DTOs with class-validator)
5. **Is this real-time or request-response?** (WebSocket vs REST)
6. **What error cases should be handled?**
7. **Can this be done without comments?** (Refactor if answer is no)

---

## Project Values

1. **Quality over speed** - Take time to do it right
2. **Simplicity over complexity** - Simple solutions are better
3. **Type safety** - Catch errors at compile time
4. **Clean code** - Future developers (including you) will thank you
5. **Documentation** - Keep `PROJECT_DOCUMENTATION.md` updated
6. **Testing** - Confidence in changes
7. **Security** - Never compromise user data

---

## Additional Resources

- **Full Documentation**: `PROJECT_DOCUMENTATION.md`
- **NestJS Docs**: https://docs.nestjs.com/
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **PSX API**: https://github.com/mumtazkahn/psx-terminal/blob/main/API.md

---

**Last Updated**: 2026-01-23

**Phase**: Phase 1 & 2 Complete + Extras

**Maintainer**: TradeUp Development Team

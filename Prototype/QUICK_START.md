# TradeUp Quick Start (Local Dev)

## Prereqs (before “one click”)

- Install and run **Docker Desktop**
- Make sure ports are free:
  - **3001** (backend)
  - **5432** (Postgres)

> Note: If you previously logged in and then changed backend secrets, clear this app’s browser `localStorage` to avoid stale JWT errors.

---

## One‑click backend + database (Docker Compose)

From the repo root:

```bash
cd Prototype/backend
docker compose up --build -d
```

### Verify it’s running

```bash
docker compose ps
docker compose logs -f backend
```

- Backend: `http://localhost:3001`

### Stop

```bash
docker compose down
```

---

## UI documentation (for developers)

Canonical UI docs live here:

- `Prototype/frontend/docs/ui/README.md` (start here)
- `Prototype/frontend/docs/ui/DEVELOPER_GUIDE.md` (how to build UI in this codebase)
- `Prototype/frontend/docs/ui/UI_STANDARDS.md` (acceptance criteria + verification commands)

---

## Developer notice: test your use cases on this deployment

Minimum sanity checks:
- Signup → login → navigate core pages
- Create/update/delete flows you touched (watchlist, trades, settings/profile, etc.)
- Error states (bad input, backend down, empty data)
- Loading states (slow network)


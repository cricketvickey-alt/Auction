# Cricket Auction App

Tech stack: React (Vite) + Node.js + Express + MongoDB + Socket.io

## Features
- **User screen**: See current player, live highest bid and team, base price and min increment.
- **Teams screen**: See teams, purchases, and remaining budgets/slots.
- **Team Owner screen**: Code-based access. See current player and raise bid. Enforced max-allowed bid by wallet/slots formula.
- **Admin screen**: Set global base price and raise increment, pick current player, sell to highest bidder, adjust team wallets.

Rules remembered:
- Base price default 1000 for all players.
- Min raise increment is controlled by admin.
- Max a team can bid next = floor(remaining_wallet / (remaining_slots * 1000)) * 1000.
- No time limit per player.
- Mobile responsive layout.

---

## Monorepo structure
- `backend/` Express API + MongoDB models + Socket.io
- `frontend/` React app (Vite)

---

## Local setup

1) Prereqs
- Node.js 18+
- MongoDB Atlas connection string (recommended)

2) Backend
```bash
# in backend/
cp .env.example .env
# edit .env to set MONGO_URI and CORS_ORIGIN (default http://localhost:5173)

npm install
npm run dev
# API on http://localhost:4000
```

3) Frontend
```bash
# in frontend/
cp .env.example .env
# ensure VITE_API_URL points to your backend URL (http://localhost:4000)

npm install
npm run dev
# open http://localhost:5173
```

---

## Create initial data

You can create teams and players with the API using any REST client (Postman, curl):

- Create Team (with simple access code)
```bash
curl -X POST http://localhost:4000/api/teams \
  -H 'Content-Type: application/json' \
  -d '{
    "name":"Team A",
    "code":"TEAM-A-123",
    "wallet":100000,
    "maxPlayers":15
  }'
```

- Create Player (photoUrl optional)
```bash
curl -X POST http://localhost:4000/api/players \
  -H 'Content-Type: application/json' \
  -d '{
    "name":"Player One",
    "batch":12,
    "house":"Aravali",
    "totalMatchPlayed":10,
    "totalScore":350,
    "totalWicket":12,
    "strength":"All rounder",
    "basePrice":1000,
    "photoUrl":"https://..."
  }'
```

- Pick current player for auction (Admin)
```bash
# get a player id from /api/players
curl -X POST http://localhost:4000/api/admin/current-player \
  -H 'Content-Type: application/json' \
  -d '{"playerId":"<PLAYER_ID>"}'
```

- Team Owner logs in with their team code on `/owner` and presses Raise to bid.
- Admin presses Sell to finalize and allocate to the highest bidder.

---

## Free deployment guide

### 1) MongoDB Atlas (free tier)
- Create a free Atlas cluster.
- Create a database user and obtain the `mongodb+srv://` connection string.
- Whitelist all IPs (0.0.0.0/0) for simplicity or add Render/Railway egress IP if preferred.

### 2) Deploy backend (Render or Railway – both have generous free tiers)

Render (recommended):
- Create a new Web Service from your GitHub repo.
- Root directory: `backend/`
- Build command: `npm install`
- Start command: `npm start`
- Environment variables:
  - `MONGO_URI` = your Atlas URI
  - `CORS_ORIGIN` = your frontend URL (e.g., `https://your-site.netlify.app`)
  - `PORT` = 4000 (Render will set `PORT` env; Express already uses it)
- After deploy, note the backend URL, e.g., `https://auction-api.onrender.com`.

Railway (alternative):
- Create a new project, add a service from your GitHub repo.
- Set service root to `backend/`.
- Add env vars as above.

### 3) Deploy frontend (Netlify or Vercel – free tiers)

Netlify:
- New site from Git (root: `frontend/`).
- Build command: `npm run build`
- Publish directory: `dist`
- Environment variable:
  - `VITE_API_URL` = your backend URL from step 2

Vercel:
- Import project, set root to `frontend/`.
- Framework: Vite
- Build command: `npm run build`
- Output dir: `dist`
- Env var: `VITE_API_URL` = backend URL

### CORS & env checks
- Ensure `backend/.env` `CORS_ORIGIN` includes your deployed frontend origin.
- Ensure `frontend/.env` `VITE_API_URL` points to your deployed backend URL.

---

## API overview

- `GET /api/auction/state` – public auction state
- `POST /api/auction/team/login` – body `{ code }`
- `POST /api/auction/bid/raise` – body `{ code }` (uses global minIncrement)
- `GET/POST/PUT /api/players` – manage players
- `GET/POST/PUT /api/teams` – manage teams
- `GET/PUT /api/admin/settings` – base/min increment
- `POST /api/admin/current-player` – set/advance current player
- `POST /api/admin/sell` – sell to highest bidder
- `PUT /api/admin/team/:id/wallet` – adjust wallet absolute amount

Socket.io events broadcasted:
- `bid_updated` { playerId, amount, teamName }
- `settings_updated` { minIncrement, basePrice }
- `current_player_changed` { playerId }
- `player_sold` { playerId, teamName, price }

---

## Notes / next steps
- You can add authentication later for Admin, if needed.
- You can add upload support for player photos via cloud storage; currently expects `photoUrl`.
- If you have fixed team sizes per tournament, set `maxPlayers` per team and enforce via Admin screen.

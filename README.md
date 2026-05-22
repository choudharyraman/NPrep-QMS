# NPrep QMS

NPrep QMS is an offline-first, asynchronous ticketing system optimized for mobile browsers on patchy 4G networks. It uses a Progressive Web App (PWA) frontend with React/Vite and Dexie.js for IndexedDB offline caching, paired with a Python/FastAPI backend utilizing PostgreSQL and pgvector for semantic search.

## Monorepo Layout

- `backend/` - Python FastAPI backend + SQL models and sync routing.
- `frontend/` - React/Vite Progressive Web App configured with Web App Manifest, Service Workers, and Dexie.js offline schema.
- `db/` - Database SQL initialization scripts.
- `docker-compose.yml` - Configures the pgvector-enabled PostgreSQL database for local development.

---

## Offline-First Sync Flow

1. **Local Operation**:
   - Every action (such as creating a new ticket or reading state) takes place directly in the **IndexedDB** local store using **Dexie.js**.
   - If there is no network connection (patchy 4G or offline), changes are saved locally and marked as `dirty: 1`.

2. **Replication/Synchronization Engine**:
   - The React app monitors connectivity status.
   - When online, it initiates a sync cycle with the FastAPI server:
     - **Pull Phase**: Client requests server changes since the last sync timestamp. The backend responds with additions/modifications and deleted items, which the client applies locally.
     - **Push Phase**: Client sends all its locally created or updated records (`dirty: 1`). The backend applies these and updates the database, responding with confirmations.

3. **Optimistic Experience**:
   - Users experience no network spinners or waiting states; state changes are instantaneous on the interface and synchronized in the background.

---

## Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js (v18+)
- Python (v3.10+)

### Running the Database
Spin up the pgvector-enabled PostgreSQL server:
```bash
docker compose up -d
```

### Running the Backend
1. Navigate to `/backend`
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

### Running the Frontend
1. Navigate to `/frontend`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the web server:
   ```bash
   npm run dev
   ```

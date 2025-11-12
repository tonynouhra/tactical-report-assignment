# Tactical Report - Frontend

A modern Next.js application for managing tactical inventory items with real-time activity tracking, search, and filtering capabilities.

## Tech Stack

- **Next.js 16** with App Router
- **React 19.2**
- **Tailwind CSS 4**
- **React Query** for data fetching
- **Framer Motion** for animations
- **Docker** support

## Prerequisites

- Node.js 18+
- npm 9+
- Backend API running on port 8080

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Docker Setup

### Using Docker Compose

**Production:**

```bash
docker-compose up -d
```

**Development with hot-reload:**

```bash
docker-compose --profile dev up frontend-dev
```

**Stop containers:**

```bash
docker-compose down
```

### Using Dockerfile

Build:

```bash
docker build -t tactical-report-frontend .
```

Run:

```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:8080/api \
  tactical-report-frontend
```

## Testing the Application

### 1. Login

Navigate to [http://localhost:3000/login](http://localhost:3000/login)

Default credentials are:
- Username: `admin`
- Password: `password`

### 2. View Items

Go to [http://localhost:3000](http://localhost:3000) to see all items

### 3. Create Item

- Click "Create New Item" button
- Fill in the form:
  - Name (required)
  - SKU (required, unique)
  - Description
  - Category
  - Price (min: 0.01)
  - Quantity (min: 0)
  - Image URL
  - Status
- Click "Create Item"

### 4. Search & Filter

- Use search bar for name, SKU, category, or description
- Set min/max price
- Set min/max quantity
- Filter by status (IN_STOCK, OUT_OF_STOCK, DISCONTINUED)

### 5. Update Item

- Click on any item card
- Click "Edit" button
- Modify fields
- Click "Update Item"

### 6. Delete Item

- Click on item card
- Click "Delete" button
- Confirm deletion

### 7. Activity Log

- Click activity icon in top right corner
- View all user actions
- Filter by action type and date

## API Testing with curl

### Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'
```

### Get All Items

```bash
curl http://localhost:8080/api/items \
```

### Create Item

```bash
curl -X POST http://localhost:8080/api/items \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Item",
    "sku": "TEST-001",
    "description": "Test description",
    "category": "Electronics",
    "price": 99.99,
    "quantity": 10,
    "status": "IN_STOCK"
  }'
```

### Update Item

```bash
curl -X PUT http://localhost:8080/api/items/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Item",
    "price": 149.99
  }'
```

### Delete Item

```bash
curl -X DELETE http://localhost:8080/api/items/{id} \
```

### Search Items

```bash
curl "http://localhost:8080/api/items/search?query=laptop&category=Electronics" \
```

## Project Structure

```
tactical-report-frontend/
├── app/                    # Next.js pages
│   ├── layout.jsx         # Root layout
│   ├── page.jsx           # Home/items page
│   ├── login/             # Login page
│   └── activity-log/      # Activity log page
├── components/            # React components
│   ├── auth/             # Auth components
│   ├── items/            # Item components
│   ├── activity/         # Activity components
│   ├── layout/           # Layout components
│   └── shared/           # Shared components
├── lib/                  # Utilities
│   ├── api/             # API client
│   ├── hooks/           # Custom hooks
│   ├── providers/       # React providers
│   └── utils/           # Helper functions
├── public/              # Static files
├── .env                 # Environment variables
├── docker-compose.yml   # Docker compose config
├── Dockerfile          # Docker image config
└── package.json        # Dependencies
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## Features

- Item CRUD operations
- Advanced search and filtering
- Real-time activity tracking
- Image upload support
- Responsive design
- JWT authentication
- React Query caching

## Troubleshooting

### Port 3000 in use

```bash
# Kill process on port 3000
lsof -i :3000
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

### Cannot connect to API

1. Verify backend is running: `curl http://localhost:8080/api/health`
2. Check `.env` file has correct `NEXT_PUBLIC_API_URL`
3. Check CORS settings in backend

### Docker issues

```bash
# Clean rebuild
docker-compose down
docker system prune -a
docker-compose build --no-cache
docker-compose up
```

### Module not found

```bash
rm -rf node_modules package-lock.json
npm install
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Technical assignment project.
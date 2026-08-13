# PropConnect - Agent / Broker Property Portal

Full-stack property listing portal built with React + Vite, Node.js + Express, MongoDB + Mongoose.

## Implemented features

### Agent / Broker
- Registration and login with JWT authentication
- Forgot/reset password development flow
- Dashboard with total, vacant/available, rented/sold and enquiry counts
- Add/edit/archive/duplicate properties
- Flat/house/plot/commercial property fields
- Rent, deposit, maintenance, brokerage and sale-price fields
- Location and optional latitude/longitude
- Amenities
- Up to 20 JPG/PNG/WEBP photos per property
- Select cover photo and delete photos
- Vacant, rented, available, sold, temporarily unavailable and archived status
- Publish/unpublish listing
- Agent profile and configurable unique public URL slug
- Tenant enquiry management and status tracking

### Public / Tenant
- No login required
- Unique broker catalogue: `/agent/:publicSlug`
- Search/filter by purpose, property type, BHK, area and price
- Property detail page and image gallery
- Call and WhatsApp buttons
- Google Maps link using coordinates/address
- Tenant enquiry form
- Property view counter

### Admin
- Admin dashboard
- List agents
- Block/reactivate agent accounts
- Review all properties

## Technology
- Frontend: React 19, React Router, Axios, Vite
- Backend: Node.js, Express 5
- Database: MongoDB with Mongoose
- Auth: JWT + bcrypt
- Security: Helmet, CORS, rate limiting
- Images: Multer local upload storage for easy local execution

## Prerequisites

Use Node.js 20.19+ or a current Node 22 release. Vite's current documentation requires Node 20.19+ or 22.12+.

Install one of:
- MongoDB Community Server locally, OR
- Docker Desktop, OR
- MongoDB Atlas

## Option A - Quick local start with Docker MongoDB

From the project root:

```bash
docker compose up -d
```

This starts MongoDB on `mongodb://127.0.0.1:27017`.

### 1. Backend

```bash
cd server
cp .env.example .env
npm install
npm run seed:admin
npm run seed:demo
npm run dev
```

Windows PowerShell alternatives for copying env:

```powershell
Copy-Item .env.example .env
```

Backend URL:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

### 2. Frontend

Open a second terminal:

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Frontend URL:

```text
http://localhost:5173
```

## Demo accounts

After running `npm run seed:demo`:

Agent:

```text
Email: demo@saiproperties.com
Password: Demo@12345
```

Public page:

```text
http://localhost:5173/agent/sai-properties
```

After running `npm run seed:admin`:

```text
Email: admin@example.com
Password: Admin@12345
```

Change the admin credentials in `server/.env` before running the seed in a real environment.

## Option B - Run with local MongoDB Community Server

Make sure the MongoDB service is running. Keep this in `server/.env`:

```text
MONGODB_URI=mongodb://127.0.0.1:27017/property_broker_portal
```

Then run the backend/frontend steps above.

## Option C - MongoDB Atlas

Replace `MONGODB_URI` in `server/.env` with your Atlas connection string, for example:

```text
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER/property_broker_portal?retryWrites=true&w=majority
```

Add your IP address to Atlas Network Access first.

## Important environment settings

`server/.env`:

```text
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/property_broker_portal
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
PUBLIC_BASE_URL=http://localhost:5173
UPLOAD_DIR=uploads
MAX_UPLOAD_MB=20
IMAGE_MAX_WIDTH=1600
IMAGE_MAX_HEIGHT=1200
IMAGE_WEBP_QUALITY=82
THUMB_WIDTH=500
THUMB_HEIGHT=375
THUMB_WEBP_QUALITY=75
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@12345
DEV_RETURN_RESET_TOKEN=true
```

`client/.env`:

```text
VITE_API_URL=http://localhost:5000/api
```

## Main API routes

```text
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
POST   /api/auth/forgot-password
POST   /api/auth/reset-password/:token

GET    /api/dashboard
GET    /api/properties
POST   /api/properties
GET    /api/properties/:id
PUT    /api/properties/:id
DELETE /api/properties/:id
POST   /api/properties/:id/duplicate
POST   /api/properties/:id/images
DELETE /api/properties/:id/images/:imageId
PUT    /api/properties/:id/images/:imageId/cover

GET    /api/enquiries
PUT    /api/enquiries/:id/status
POST   /api/enquiries/public

GET    /api/public/agents/:slug
GET    /api/public/agents/:slug/properties
GET    /api/public/agents/:slug/properties/:id

PUT    /api/profile
PUT    /api/profile/change-password

GET    /api/admin/dashboard
GET    /api/admin/agents
PUT    /api/admin/agents/:id/status
GET    /api/admin/properties
```

## Production notes

Before production deployment:
1. Set a strong `JWT_SECRET`.
2. Set `DEV_RETURN_RESET_TOKEN=false` and integrate an email/SMS provider for password reset delivery.
3. Move image storage from local `uploads/` to Azure Blob Storage, AWS S3 or Cloudinary.
4. Set `CLIENT_URL` to your production frontend domain.
5. Use HTTPS.
6. Use a managed MongoDB deployment with backups.
7. Add an audit log if admins will moderate listings.
8. Add phone/email OTP verification if you need verified broker accounts.
9. Add automated tests and CI/CD before production release.

## Build frontend for production

```bash
cd client
npm run build
```

Vite outputs the static production build under `client/dist/`.

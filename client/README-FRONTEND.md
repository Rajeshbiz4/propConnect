# PropConnect Frontend - Fixed Routes + Mobile Responsive

This folder contains only the React/Vite frontend. Keep your existing Node.js + MongoDB backend.

## Run

```bash
cp .env.example .env
npm install
npm run dev
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
npm install
npm run dev
```

Default frontend: http://localhost:5173
Default API expected: http://localhost:5000/api

## Frontend routes checked

Public/auth:
- `/`
- `/login`
- `/register`
- `/forgot-password`
- `/reset-password/:token`
- `/agent/:slug`
- `/agent/:slug/property/:id`

Agent:
- `/app`
- `/app/properties`
- `/app/properties/new`
- `/app/properties/:id/edit`
- `/app/enquiries`
- `/app/profile`

Admin:
- `/admin`
- `/admin/agents`
- `/admin/properties`

Compatibility aliases are also included for old/bookmarked URLs such as `/dashboard`, `/properties`, `/enquiries`, `/profile`, `/app/dashboard`, `/app/properties/:id`, `/admin/dashboard`, and `/agent/:slug/properties/:id`.

## Production route refresh

BrowserRouter needs the hosting server to return `index.html` for unknown frontend paths. This project includes:
- `public/_redirects` for Netlify-style hosts
- `vercel.json` for Vercel
- `public/.htaccess` for Apache

For another web server, configure SPA/history fallback to `index.html`.

## Optional sub-folder hosting

`.env` supports:

```env
VITE_API_URL=http://localhost:5000/api
VITE_BASE_PATH=/
```

If deployed under a subfolder, set for example:

```env
VITE_BASE_PATH=/property-portal/
```

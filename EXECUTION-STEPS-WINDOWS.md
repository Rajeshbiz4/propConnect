# Windows Execution Steps

## 1. Required software

Install:
- Node.js 22 LTS/current (Node 20.19+ is also supported by this project)
- Git (optional)
- Docker Desktop **or** MongoDB Community Server

## 2. Extract the ZIP

Example folder:

```text
C:\Projects\property-broker-platform
```

Open PowerShell in that folder.

## 3. Start MongoDB

### Recommended: Docker Desktop

```powershell
docker compose up -d
```

Check:

```powershell
docker ps
```

You should see `property-broker-mongodb`.

### If MongoDB Community Server is installed

Open `services.msc` and make sure the MongoDB service is running.

Test the default connection in MongoDB Compass:

```text
mongodb://127.0.0.1:27017
```

## 4. Configure and run backend

```powershell
cd .\server
Copy-Item .env.example .env
npm install
npm run seed:admin
npm run seed:demo
npm run dev
```

Expected message:

```text
MongoDB connected
API running on http://localhost:5000
```

Test in browser:

```text
http://localhost:5000/api/health
```

## 5. Configure and run React frontend

Open a second PowerShell window:

```powershell
cd C:\Projects\property-broker-platform\client
Copy-Item .env.example .env
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

## 6. Login and test

### Demo broker

```text
Email: demo@saiproperties.com
Password: Demo@12345
```

Public broker page:

```text
http://localhost:5173/agent/sai-properties
```

### Admin

```text
Email: admin@example.com
Password: Admin@12345
```

## 7. Test the full business flow

1. Login as demo broker.
2. Open Dashboard.
3. Click **Add Property**.
4. Add rent/sale, property details, location, amenities and images.
5. Save the property.
6. Open **Properties** and copy/share the public property link.
7. Open the public link in an Incognito browser window.
8. Submit a tenant enquiry.
9. Return to broker login and open **Enquiries**.
10. Change the enquiry status to Contacted / Visit Scheduled / Interested / Closed.
11. Change a rental property from Vacant to Rented.
12. Verify the dashboard counters update.
13. Login as admin and verify Agents and Properties.

## 8. If MongoDB shows ECONNREFUSED 127.0.0.1:27017

This means MongoDB server is not running. MongoDB Compass is only a GUI and does not start a database server by itself.

Either:

```powershell
docker compose up -d
```

or install/start MongoDB Community Server and verify the Windows MongoDB service.

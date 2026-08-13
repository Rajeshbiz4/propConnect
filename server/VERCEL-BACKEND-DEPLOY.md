# PropConnect Backend - Vercel Deployment

This backend is prepared for Vercel Express zero-configuration deployment.

## Deploy

1. Push the `server` folder to GitHub, or keep it inside the monorepo.
2. In Vercel choose **Add New > Project** and import the GitHub repository.
3. If this is a monorepo, set **Root Directory** to `server`.
4. Leave Framework Preset on the automatically detected/default setting.
5. No MongoDB environment variable is required. MongoDB configuration is in `src/config/databaseConfig.js`.
6. Deploy.

## Verify

After Vercel gives you a URL, open:

- `https://YOUR-BACKEND.vercel.app/api/health`
- `https://YOUR-BACKEND.vercel.app/api-docs`
- `https://YOUR-BACKEND.vercel.app/api/swagger.json`

Use Swagger **Authorize** with the JWT returned by `/api/auth/login` or `/api/auth/register`.

## Important image note

Vercel Functions do not provide persistent local file storage. The current code uses `/tmp` on Vercel so the API can run, but property images stored there are temporary and can disappear when the function instance changes. Move image persistence to Cloudinary, S3, or equivalent object storage before production use.


## Default seeded admin user

The API automatically creates the following user after the first successful MongoDB connection.
It uses an existence check, so later deployments/requests do not create duplicate users.

- Email: `admin@propconnect.com`
- Password: `Admin@12345`
- Role: `admin`

The seed configuration is stored in `src/config/databaseConfig.js`.
Change the default password after first login before using the application in production.

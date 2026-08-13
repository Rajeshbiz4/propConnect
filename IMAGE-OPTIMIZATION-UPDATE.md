# Property Image Optimization Update

This update lets an agent upload normal JPG, PNG or WebP property photos at any pixel dimensions. The backend standardizes them before permanent storage.

## What changed

### Backend

1. `server/package.json`
   - Added `sharp`.

2. `server/src/middleware/upload.js`
   - Uploads first go to a temporary disk folder.
   - Maximum 20 MB per photo.
   - Maximum 20 photos in one request.
   - Accepts JPG/JPEG, PNG and WebP.

3. `server/src/utils/imageOptimizer.js`
   - Verifies that the file is a real decodable image.
   - Auto-rotates from EXIF orientation.
   - Main photo: maximum 1600 x 1200, aspect ratio preserved.
   - Converts main photo to WebP quality 82.
   - Creates a listing thumbnail up to 500 x 375 as WebP quality 75.
   - Deletes temporary/original upload.

4. `server/src/routes/propertyRoutes.js`
   - Runs image optimization during property photo upload.
   - Stores optimized image + thumbnail information in MongoDB.
   - Enforces maximum 20 total photos per property.
   - Deletes both optimized image and thumbnail when a property photo is removed.

5. `server/src/models/Property.js`
   - Image records now also support `thumbnailUrl`, `thumbnailFilename`, `originalName`, `width`, `height`, and `sizeBytes`.
   - Old property image records remain usable.

6. `server/src/middleware/error.js`
   - Better messages for oversized uploads and too many files.

7. `server/.env.example`
   - Added image optimization settings.

### Frontend

1. `client/src/pages/PropertyForm.jsx`
   - Shows that any image dimensions are accepted.
   - Allows up to 20 MB per photo.
   - Validates file type and count before upload.
   - Shows "Saving & optimizing..." while photos are being processed.
   - Uses optimized thumbnails in the edit screen.

2. `client/src/components/PropertyCard.jsx`
   - Uses `thumbnailUrl` for listing cards when available.
   - Falls back to the old `url` field, so existing images still work.

## Install / update

From the backend folder:

```bash
cd server
npm install
```

This installs Sharp from `package.json`.

Make sure your `.env` includes or inherits these defaults:

```env
MAX_UPLOAD_MB=20
IMAGE_MAX_WIDTH=1600
IMAGE_MAX_HEIGHT=1200
IMAGE_WEBP_QUALITY=82
THUMB_WIDTH=500
THUMB_HEIGHT=375
THUMB_WEBP_QUALITY=75
```

Start backend:

```bash
npm run dev
```

Start frontend in another terminal:

```bash
cd client
npm install
npm run dev
```

## Result example

A user can upload a phone/camera image such as 6000 x 4000. The server saves a WebP copy no larger than 1600 x 1200 (while preserving its aspect ratio) and a smaller thumbnail for property cards.

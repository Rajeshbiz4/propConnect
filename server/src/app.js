import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import swaggerSpec from './config/swagger.js';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import enquiryRoutes from './routes/enquiryRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { notFound, errorHandler } from './middleware/error.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.set('trust proxy', 1);

// Swagger is mounted before Helmet so Swagger UI assets/scripts are not
// blocked by Helmet's default content-security-policy headers.
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customSiteTitle: 'PropConnect API Swagger'
}));
app.get('/api/swagger.json', (req, res) => res.json(swaggerSpec));

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// Allow requests from all origins. Authentication uses Bearer tokens rather
// than browser cookies, so wildcard CORS is suitable for the current API.
app.use(cors());

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 500,
  standardHeaders: 'draft-8',
  legacyHeaders: false
}));

// Vercel may create/reuse serverless instances. Connect lazily and reuse the
// cached Mongoose connection for API requests. Swagger assets do not need DB.
app.use(async (req, res, next) => {
  if (req.path.startsWith('/api-docs') || req.path === '/api/swagger.json') {
    return next();
  }

  try {
    await connectDB();
    return next();
  } catch (error) {
    console.error('Database connection failed:', error);
    return res.status(503).json({ message: 'Database connection failed' });
  }
});

const uploadPath = process.env.VERCEL
  ? path.join(os.tmpdir(), 'propconnect-uploads')
  : path.resolve(process.env.UPLOAD_DIR || path.join(__dirname, '../uploads'));
app.use('/uploads', express.static(uploadPath, { maxAge: '7d' }));

app.get('/api/health', (req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;
  res.status(databaseConnected ? 200 : 503).json({
    ok: databaseConnected,
    service: 'propconnect-api',
    database: databaseConnected ? mongoose.connection.name : 'disconnected'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;

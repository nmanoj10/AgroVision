require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { connectDB, getConnectionStatus } = require('./db');
const Scan = require('./models/Scan');
const User = require('./models/User');
const LoginActivity = require('./models/LoginActivity');
const { hashPassword, verifyPassword, createAccessToken, sanitizeUser } = require('./auth');
const { runHybridPrediction } = require('./localModelService');
const { generateChatResponse } = require('./chatService');
const { getWeatherForLocation } = require('./weatherService');

const app = express();
const PORT = process.env.PORT || process.env.BACKEND_PORT || 5000;

app.set('trust proxy', true);

const allowedOrigins = new Set([
  'http://localhost:3000',
  'http://localhost:5173',
]);

const envOrigins = [process.env.FRONTEND_URLS, process.env.FRONTEND_URL]
  .filter(Boolean)
  .flatMap((value) => String(value).split(','))
  .map((value) => value.trim())
  .filter(Boolean);

envOrigins.forEach((origin) => allowedOrigins.add(origin));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      if (origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json());

function getClientIp(req) {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
    return forwardedFor[0];
  }

  if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
    return forwardedFor.split(',')[0].trim();
  }

  return req.ip || req.socket?.remoteAddress || null;
}

async function recordLoginActivity(req, user) {
  try {
    await LoginActivity.create({
      userId: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      ipAddress: getClientIp(req),
      userAgent: req.get('user-agent') || null,
      loggedInAt: new Date(),
    });
  } catch (err) {
    console.warn('Failed to save login activity:', err.message);
  }
}

function ensureDatabaseConnected(res) {
  const dbStatus = getConnectionStatus();
  if (dbStatus.connected) {
    return true;
  }

  res.status(503).json({
    success: false,
    message: 'Database is not connected. Please check the MongoDB configuration and try again.',
    database: dbStatus,
  });
  return false;
}

function getNormalizedThreshold() {
  const rawValue = Number(process.env.MODEL_CONFIDENCE_THRESHOLD || 70);
  if (Number.isNaN(rawValue)) {
    return 70;
  }
  return rawValue <= 1 ? rawValue * 100 : rawValue;
}

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_, file, cb) => cb(null, `scan_${Date.now()}${path.extname(file.originalname)}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    cb(null, allowed.includes(file.mimetype));
  },
});

app.get('/api/health', (req, res) => {
  const db = getConnectionStatus();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: db,
    gemini: !!process.env.GEMINI_API_KEY,
    mode: 'local-model-first-with-gemini-fallback',
    environment: process.env.NODE_ENV || 'development',
  });
});

app.post('/api/auth/signup', async (req, res) => {
  try {
    if (!ensureDatabaseConnected(res)) {
      return;
    }

    const { name, email, password, state } = req.body || {};
    if (!name || !email || !password || !state) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and state are required.',
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail }).lean();
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      passwordHash: hashPassword(String(password)),
      state: String(state).trim(),
    });

    user.lastLoginAt = new Date();
    await user.save();
    await recordLoginActivity(req, user);

    return res.status(201).json({
      success: true,
      user: sanitizeUser(user),
      accessToken: createAccessToken(),
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Signup failed.',
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    if (!ensureDatabaseConnected(res)) {
      return;
    }

    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !verifyPassword(String(password), user.passwordHash)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: 'This account has been disabled.',
      });
    }

    user.lastLoginAt = new Date();
    await user.save();
    await recordLoginActivity(req, user);

    return res.json({
      success: true,
      user: sanitizeUser(user),
      accessToken: createAccessToken(),
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Login failed.',
    });
  }
});

app.get('/api/db-status', (req, res) => {
  res.json(getConnectionStatus());
});

app.get('/api/weather', async (req, res) => {
  const location = req.query.location;
  if (!location || typeof location !== 'string') {
    return res.status(400).json({ success: false, message: 'Location is required.' });
  }

  try {
    const data = await getWeatherForLocation(location.trim());
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Weather lookup failed.' });
  }
});

app.post('/api/detect', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image uploaded' });
  }

  const imagePath = req.file.path;

  try {
    console.log('\nRunning hybrid crop disease detection...');
    console.log(`   File: ${path.basename(imagePath)}`);

    const detectionResult = await runHybridPrediction(imagePath);
    if (!detectionResult?.success) {
      const message = detectionResult?.message || 'Detection failed.';
      const statusCode = message.startsWith('RATE_LIMIT:') ? 429 : 500;
      return res.status(statusCode).json({
        success: false,
        message,
        source: detectionResult?.source || null,
        modelStatus: detectionResult?.modelStatus || null,
      });
    }

    const diseaseData = detectionResult.data;
    const detectionSource = detectionResult.source || 'Gemini AI Fallback';

    console.log('Detection complete:');
    console.log(`   Source  : ${detectionSource}`);
    console.log(`   Disease : ${diseaseData.disease_name}`);
    console.log(`   Confid. : ${diseaseData.confidence}%`);

    let savedScan = null;
    try {
      savedScan = await Scan.create({
        userId: req.headers['x-user-id'] || 'anonymous',
        imageUrl: '',
        detectedDisease: diseaseData.disease_name,
        confidence: diseaseData.confidence,
        severity: diseaseData.severity,
        source: detectionSource,
        causes: diseaseData.causes,
        treatment: diseaseData.treatment,
        prevention: diseaseData.prevention,
        pesticides: diseaseData.pesticides,
        modelError: null,
        isHealthy: diseaseData.is_healthy,
        affectedAreaPercent: diseaseData.affected_area_percent,
      });
      console.log(`   Scan saved: ${savedScan._id}`);
    } catch (dbErr) {
      console.warn('Failed to save scan to MongoDB:', dbErr.message);
    }

    return res.json({
      success: true,
      source: detectionSource,
      scanId: savedScan?._id || null,
      modelStatus:
        detectionResult.modelStatus || { working: true, mode: 'local-model-first-with-gemini-fallback' },
      data: diseaseData,
    });
  } catch (err) {
    console.error('Detection error:', err.message);
    return res.status(500).json({
      success: false,
      message: err.message || 'Hybrid disease analysis failed',
      hint: 'Ensure the local Python environment can load TensorFlow and that GEMINI_API_KEY is configured.',
    });
  } finally {
    try {
      fs.unlinkSync(imagePath);
    } catch {}
  }
});

app.post('/api/chat', async (req, res) => {
  const { message, language } = req.body || {};

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ success: false, message: 'Message is required.' });
  }

  try {
    const result = await generateChatResponse(message, language);
    return res.json({
      success: true,
      reply: result.reply,
      model: result.model,
      language: result.languageName,
    });
  } catch (err) {
    const msg = err.message || 'Chat failed.';
    const statusCode = msg.startsWith('RATE_LIMIT:') ? 429 : 500;
    return res.status(statusCode).json({
      success: false,
      message: msg,
    });
  }
});

app.get('/api/scans', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'anonymous';
    const scans = await Scan.find({ userId }).sort({ createdAt: -1 }).limit(20).lean();

    res.json({
      success: true,
      scans: scans.map((scan) => ({
        id: scan._id,
        imageUrl: scan.imageUrl,
        detectedDisease: scan.detectedDisease,
        severity: scan.severity,
        source: scan.source,
        confidence: scan.confidence,
        isHealthy: scan.isHealthy,
        createdAt: scan.createdAt,
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/scans/related', async (req, res) => {
  const disease = typeof req.query.disease === 'string' ? req.query.disease.trim() : '';
  const limitRaw = typeof req.query.limit === 'string' ? req.query.limit : '';
  const limit = Math.min(Math.max(Number(limitRaw) || 6, 1), 20);

  if (!disease || disease.length < 3) {
    return res.status(400).json({ success: false, message: 'Disease query is required.' });
  }

  if (disease.toLowerCase().includes('healthy')) {
    return res.json({ success: true, scans: [] });
  }

  try {
    const userId = req.headers['x-user-id'] || null;
    const escaped = disease.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');
    const query = { detectedDisease: { $regex: regex } };
    if (userId) {
      query.userId = { $ne: userId };
    }

    const scans = await Scan.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return res.json({
      success: true,
      scans: scans.map((scan) => ({
        id: scan._id,
        imageUrl: scan.imageUrl,
        detectedDisease: scan.detectedDisease,
        severity: scan.severity,
        source: scan.source,
        confidence: scan.confidence,
        isHealthy: scan.isHealthy,
        createdAt: scan.createdAt,
      })),
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Related scans lookup failed.' });
  }
});

app.get('/api/scans/:id', async (req, res) => {
  try {
    const scan = await Scan.findById(req.params.id).lean();
    if (!scan) {
      return res.status(404).json({ success: false, message: 'Scan not found' });
    }
    return res.json({ success: true, scan });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

async function start() {
  console.log('\nAgroVision Backend Starting (Hybrid Detection Mode)...');
  console.log('-'.repeat(55));
  console.log('Detection engine : Local trained model first, Gemini fallback');
  console.log(
    `Model path       : ${
      process.env.MODEL_PATH ||
      'src/models/plant_disease_recog_model_pwp.keras (with Model.hdf5/trained_model.keras fallback)'
    }`
  );
  console.log(`Confidence gate  : ${getNormalizedThreshold()}%`);
  console.log(`Gemini API Key   : ${process.env.GEMINI_API_KEY ? 'Set' : 'Missing - fallback unavailable'}`);

  try {
    await connectDB();
  } catch (err) {
    console.error('Failed to connect to MongoDB. Server will still start but DB features disabled.');
    console.error('Check MONGODB_URI in your .env file');
  }

  app.listen(PORT, () => {
    console.log('-'.repeat(55));
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Health: http://localhost:${PORT}/api/health`);
    console.log(`Detect: POST http://localhost:${PORT}/api/detect`);
    console.log(`Scans : GET  http://localhost:${PORT}/api/scans`);
    console.log('-'.repeat(55));
  });
}

start();

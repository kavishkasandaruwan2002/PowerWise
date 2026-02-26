const express    = require('express');
const cors       = require('cors');
const dotenv     = require('dotenv');
const swaggerUi  = require('swagger-ui-express');
const connectDB  = require('./config/db');
const swaggerSpec = require('./config/swagger');

// Load env vars
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ── Core Middleware ────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Swagger UI ─────────────────────────────────────────────────────────────
app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
        customCss: `
      .swagger-ui .topbar { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); }
      .swagger-ui .topbar-wrapper img { display: none; }
      .swagger-ui .topbar-wrapper::before {
        content: '⚡ Electricity Budget Tracker — Component 1 API';
        color: #f0c040;
        font-size: 18px;
        font-weight: 700;
        letter-spacing: 0.5px;
      }
      .swagger-ui .btn.authorize {
        background: #f0c040; border-color: #f0c040;
        color: #1a1a2e; font-weight: bold;
      }
      .swagger-ui .info .title { color: #1a1a2e; font-weight: 800; }
    `,
        customSiteTitle: '⚡ Electricity Tracker API',
        swaggerOptions: {
            persistAuthorization: true,
            displayRequestDuration: true,
            docExpansion: 'none',
            filter: true,
        },
    })
);

// Raw OpenAPI JSON — import into Postman
app.get('/api/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// ── API Routes ─────────────────────────────────────────────────────────────
// app.use('/api/auth',       require('./routes/authRoutes'));
// app.use('/api/households', require('./routes/householdRoutes'));
// app.use('/api/admin',      require('./routes/adminRoutes'));

// ── Health Check ───────────────────────────────────────────────────────────
app.get('/api/health', (req, res) =>
    res.status(200).json({
        success:   true,
        message:   '⚡ Electricity Budget Tracker API is running!',
        component: 'Component 1 — User & Household Management',
        docs:      `http://localhost:${process.env.PORT || 5000}/api/docs`,
        timestamp: new Date().toISOString(),
    })
);

// ── 404 Handler ────────────────────────────────────────────────────────────
app.use((req, res) =>
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found.`,
        hint:    `Visit http://localhost:${process.env.PORT || 5000}/api/docs for all available routes`,
    })
);

// ── Global Error Handler ───────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('❌', err.stack);
    res.status(err.statusCode || 500).json({
        success: false,
        message:'Internal Server Error',
    });
});

// ── Start Server ───────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('');
    console.log('  ⚡━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⚡');
    console.log('     Electricity Budget Tracker  v1.0.0');
    console.log('     Component 1: User & Household Mgmt');
    console.log('  ⚡━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⚡');
    console.log(`  🚀  Server     →  http://localhost:${PORT}`);
    console.log(`  📖  Swagger UI →  http://localhost:${PORT}/api/docs`);
    console.log(`  📄  API JSON   →  http://localhost:${PORT}/api/docs.json`);
    console.log(`  💚  Health     →  http://localhost:${PORT}/api/health`);
    console.log(`  🌿  MongoDB    →  ${process.env.MONGODB_URI}`);
    console.log('  ⚡━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⚡');
    console.log('');
});
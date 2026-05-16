require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const {
  addAudit,
  authenticate,
  connectDatabase,
  createUser,
  getSnapshot,
  replaceGoals,
  resetDatabase,
} = require('./database');

const app = express();
const port = process.env.PORT || 5000;
const buildPath = path.join(__dirname, '..', 'build');
const databaseReady = connectDatabase()
  .then(({ engine }) => {
    console.log(`AtomQuest database connected with ${engine}`);
    return engine;
  });

const allowedOrigin = process.env.CLIENT_ORIGIN;
app.use(cors({
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }

    const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    callback(null, !allowedOrigin || origin === allowedOrigin || isLocalhost);
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(async (_req, _res, next) => {
  try {
    await databaseReady;
    next();
  } catch (error) {
    next(error);
  }
});

app.get('/api/health', async (_req, res, next) => {
  try {
    const snapshot = await getSnapshot();
    res.json({
      ok: true,
      goals: snapshot.goals.length,
      auditEntries: snapshot.auditLog.length,
      database: process.env.MONGODB_URI ? 'mongodb' : 'json-file',
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/database', async (_req, res, next) => {
  try {
    res.json(await getSnapshot());
  } catch (error) {
    next(error);
  }
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { email = '', password = '' } = req.body || {};
    const session = await authenticate(email, password);

    if (!session) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    res.json(session);
  } catch (error) {
    next(error);
  }
});

app.post('/api/auth/signup', async (req, res, next) => {
  try {
    res.status(201).json(await createUser(req.body || {}));
  } catch (error) {
    next(error);
  }
});

app.put('/api/goals', async (req, res, next) => {
  try {
    const { goals } = req.body || {};
    if (!Array.isArray(goals)) {
      res.status(400).json({ message: 'goals must be an array' });
      return;
    }

    await replaceGoals(goals);
    res.json(await getSnapshot());
  } catch (error) {
    next(error);
  }
});

app.post('/api/audit', async (req, res, next) => {
  try {
    const entry = req.body || {};
    if (!entry.time || !entry.user || !entry.action) {
      res.status(400).json({ message: 'time, user, and action are required' });
      return;
    }

    await addAudit(entry);
    res.json(await getSnapshot());
  } catch (error) {
    next(error);
  }
});

app.post('/api/reset', async (_req, res, next) => {
  try {
    res.json(await resetDatabase());
  } catch (error) {
    next(error);
  }
});

app.use(express.static(buildPath));
app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(error.statusCode || 500).json({
    message: error.statusCode ? error.message : 'Server error',
    detail: error.message,
  });
});

if (require.main === module) {
  databaseReady
    .then(engine => {
    app.listen(port, () => {
      console.log(`AtomQuest API running on port ${port} with ${engine} database`);
    });
  })
  .catch(error => {
    console.error('Failed to connect database', error);
    process.exit(1);
  });
}

module.exports = app;

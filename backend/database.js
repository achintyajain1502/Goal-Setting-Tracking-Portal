const fs = require('fs/promises');
const path = require('path');
const { MongoClient } = require('mongodb');
const { buildSeedDatabase } = require('./seedData');

const dataDir = path.join(__dirname, 'data');
const dataFile = path.join(dataDir, 'database.json');

let mongoClient = null;
let mongoDb = null;
let usingMongo = false;

async function readFileDatabase() {
  try {
    const raw = await fs.readFile(dataFile, 'utf8');
    const database = normalizeSeedDates(JSON.parse(raw));
    await writeFileDatabase(database);
    return database;
  } catch {
    const seed = buildSeedDatabase();
    await writeFileDatabase(seed);
    return seed;
  }
}

async function writeFileDatabase(database) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(dataFile, JSON.stringify({
    ...database,
    updatedAt: new Date().toISOString(),
  }, null, 2));
}

async function seedMongoIfNeeded() {
  const seed = buildSeedDatabase();
  const users = mongoDb.collection('users');
  const goals = mongoDb.collection('goals');
  const auditLog = mongoDb.collection('auditLog');

  if (await users.countDocuments() === 0) await users.insertMany(seed.users);
  if (await goals.countDocuments() === 0) await goals.insertMany(seed.goals);
  if (await auditLog.countDocuments() === 0) await auditLog.insertMany(seed.auditLog);

  await goals.updateOne({ id: 5 }, { $set: seed.goals.find(goal => goal.id === 5) });
  await Promise.all(seed.auditLog.map(entry => auditLog.updateOne(
    { action: entry.action },
    { $set: entry },
    { upsert: true }
  )));
}

function normalizeSeedDates(database) {
  const seed = buildSeedDatabase();
  const datedGoal = seed.goals.find(goal => goal.id === 5);
  const auditByAction = new Map(seed.auditLog.map(entry => [entry.action, entry]));

  return {
    ...database,
    goals: Array.isArray(database.goals)
      ? database.goals.map(goal => goal.id === 5 ? { ...goal, ...datedGoal } : goal)
      : seed.goals,
    auditLog: Array.isArray(database.auditLog)
      ? database.auditLog.map(entry => auditByAction.get(entry.action) || entry)
      : seed.auditLog,
  };
}

async function connectDatabase() {
  if (process.env.MONGODB_URI) {
    mongoClient = new MongoClient(process.env.MONGODB_URI);
    await mongoClient.connect();
    mongoDb = mongoClient.db(process.env.MONGODB_DB || 'atomquest');
    usingMongo = true;
    await seedMongoIfNeeded();
    return { engine: 'mongodb' };
  }

  await readFileDatabase();
  return { engine: 'json-file' };
}

function stripMongoId(document) {
  if (!document) return document;
  const { _id, ...rest } = document;
  return rest;
}

async function getSnapshot() {
  if (usingMongo) {
    const [users, goals, auditLog] = await Promise.all([
      mongoDb.collection('users').find({}, { projection: { _id: 0 } }).toArray(),
      mongoDb.collection('goals').find({}, { projection: { _id: 0 } }).sort({ id: 1 }).toArray(),
      mongoDb.collection('auditLog').find({}).sort({ _id: -1 }).toArray(),
    ]);

    return {
      users,
      goals,
      auditLog: auditLog.map(stripMongoId),
      updatedAt: new Date().toISOString(),
    };
  }

  return readFileDatabase();
}

async function authenticate(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  const database = await getSnapshot();
  const user = database.users.find(
    item => item.email.toLowerCase() === normalizedEmail && item.password === password
  );

  if (!user) return null;

  return buildSession(user);
}

function buildSession(user) {
  return {
    email: user.email,
    id: user.id,
    name: user.name,
    role: user.roleKey,
    signedInAt: new Date().toISOString(),
  };
}

function buildUser({ name, email, password, dept = 'General' }) {
  const trimmedName = name.trim();
  const initials = trimmedName
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('') || 'U';

  return {
    id: `emp-${Date.now()}`,
    name: trimmedName,
    role: 'Employee',
    roleKey: 'employee',
    dept: dept.trim() || 'General',
    email: email.trim().toLowerCase(),
    password,
    color: '#4f7cff',
    initials,
  };
}

async function createUser(payload) {
  const name = String(payload.name || '').trim();
  const email = String(payload.email || '').trim().toLowerCase();
  const password = String(payload.password || '');

  if (!name || !email || !password) {
    const error = new Error('Name, email, and password are required');
    error.statusCode = 400;
    throw error;
  }

  const user = buildUser({ ...payload, name, email, password });

  if (usingMongo) {
    const users = mongoDb.collection('users');
    if (await users.findOne({ email })) {
      const error = new Error('An account already exists for this email');
      error.statusCode = 409;
      throw error;
    }

    await users.insertOne(user);
    return buildSession(user);
  }

  const database = await readFileDatabase();
  if (database.users.some(item => item.email.toLowerCase() === email)) {
    const error = new Error('An account already exists for this email');
    error.statusCode = 409;
    throw error;
  }

  await writeFileDatabase({ ...database, users: [...database.users, user] });
  return buildSession(user);
}

async function replaceGoals(goals) {
  if (usingMongo) {
    const collection = mongoDb.collection('goals');
    await collection.deleteMany({});
    if (goals.length) await collection.insertMany(goals);
    return;
  }

  const database = await readFileDatabase();
  await writeFileDatabase({ ...database, goals });
}

async function addAudit(entry) {
  if (usingMongo) {
    await mongoDb.collection('auditLog').insertOne(entry);
    return;
  }

  const database = await readFileDatabase();
  await writeFileDatabase({ ...database, auditLog: [entry, ...database.auditLog] });
}

async function addNotification(notification) {
  const entry = {
    ...notification,
    id: notification.id || `notif-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: 'queued',
  };

  if (usingMongo) {
    await mongoDb.collection('notifications').insertOne(entry);
    return entry;
  }

  const database = await readFileDatabase();
  await writeFileDatabase({
    ...database,
    notifications: [entry, ...(database.notifications || [])],
  });
  return entry;
}

function buildNotificationEvent({ type, actor, goal, targetRole }) {
  const goalId = goal?.id || '';
  const deepLink = `${process.env.FRONTEND_URL || process.env.CLIENT_ORIGIN || ''}?page=${targetRole === 'manager' ? 'approvals' : 'my-goals'}&goalId=${goalId}`;
  const subjectMap = {
    goal_submission: `Goal submitted: ${goal?.title || 'New goal'}`,
    goal_approval: `Goal approved: ${goal?.title || 'Goal'}`,
    goal_rejection: `Goal returned: ${goal?.title || 'Goal'}`,
    checkin_update: `Check-in updated: ${goal?.title || 'Goal'}`,
    checkin_reminder: 'Check-in reminder',
  };

  return {
    type,
    actor,
    targetRole,
    goalId,
    employee: goal?.emp,
    subject: subjectMap[type] || 'Goal portal notification',
    email: {
      enabled: Boolean(process.env.SMTP_HOST),
      subject: subjectMap[type] || 'Goal portal notification',
      body: `${actor || 'A user'} triggered ${type}. Open: ${deepLink}`,
    },
    teams: {
      enabled: Boolean(process.env.TEAMS_WEBHOOK_URL),
      adaptiveCard: {
        type: 'AdaptiveCard',
        version: '1.4',
        body: [
          { type: 'TextBlock', text: subjectMap[type] || 'Goal notification', weight: 'Bolder' },
          { type: 'TextBlock', text: goal?.emp ? `Employee: ${goal.emp}` : '', wrap: true },
        ],
        actions: [{ type: 'Action.OpenUrl', title: 'Open goal sheet', url: deepLink }],
      },
    },
    deepLink,
  };
}

async function resetDatabase() {
  const seed = buildSeedDatabase();

  if (usingMongo) {
    await Promise.all([
      mongoDb.collection('users').deleteMany({}),
      mongoDb.collection('goals').deleteMany({}),
      mongoDb.collection('auditLog').deleteMany({}),
    ]);
    await Promise.all([
      mongoDb.collection('users').insertMany(seed.users),
      mongoDb.collection('goals').insertMany(seed.goals),
      mongoDb.collection('auditLog').insertMany(seed.auditLog),
    ]);
    return seed;
  }

  await writeFileDatabase(seed);
  return seed;
}

module.exports = {
  addAudit,
  addNotification,
  authenticate,
  buildNotificationEvent,
  connectDatabase,
  createUser,
  getSnapshot,
  replaceGoals,
  resetDatabase,
};

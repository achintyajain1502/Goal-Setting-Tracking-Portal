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
    return JSON.parse(raw);
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

  return {
    email: user.email,
    id: user.id,
    name: user.name,
    role: user.roleKey,
    signedInAt: new Date().toISOString(),
  };
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
  authenticate,
  connectDatabase,
  getSnapshot,
  replaceGoals,
  resetDatabase,
};

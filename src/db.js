import { INITIAL_AUDIT, INITIAL_GOALS, USERS } from './data';

const SESSION_KEY = 'atomquest.session.v1';

export const DEMO_CREDENTIALS = [
  { email: 'priya@local.com', password: 'manager', role: 'manager' },
  { email: 'arjun@local.com', password: 'employee', role: 'employee' },
  { email: 'rahul@local.com', password: 'admin', role: 'admin' },
];

const isLocalFrontend = ['localhost', '127.0.0.1'].includes(window.location.hostname)
  && window.location.port !== '5000';
const API_BASE = process.env.REACT_APP_API_URL
  || (isLocalFrontend ? 'http://localhost:5000' : '');

export const EMPTY_DATABASE = {
  users: DEMO_CREDENTIALS.map(({ email, password, role }) => ({
    ...USERS[role],
    email,
    password,
    roleKey: role,
  })),
  goals: INITIAL_GOALS,
  auditLog: INITIAL_AUDIT,
  updatedAt: new Date().toISOString(),
};

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.message || 'API request failed');
  }

  return data;
}

export function getSession() {
  try {
    const session = window.localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  } catch {
    return null;
  }
}

export function saveSession(session) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  window.localStorage.removeItem(SESSION_KEY);
}

export async function loadDatabase() {
  const database = await request('/api/database');
  return normalizeDatabase(database);
}

export async function authenticate(email, password) {
  const session = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  saveSession(session);
  return session;
}

export async function signupAccount(account) {
  const session = await request('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(account),
  });
  saveSession(session);
  return session;
}

export async function saveGoals(goals) {
  const database = await request('/api/goals', {
    method: 'PUT',
    body: JSON.stringify({ goals }),
  });
  return normalizeDatabase(database);
}

export async function saveAudit(entry) {
  const database = await request('/api/audit', {
    method: 'POST',
    body: JSON.stringify(entry),
  });
  return normalizeDatabase(database);
}

export async function sendNotificationEvent(event) {
  return request('/api/notifications/event', {
    method: 'POST',
    body: JSON.stringify(event),
  });
}

export async function resetDatabase() {
  const database = await request('/api/reset', { method: 'POST' });
  return normalizeDatabase(database);
}

function normalizeDatabase(database) {
  return {
    ...EMPTY_DATABASE,
    ...(database || {}),
    users: Array.isArray(database?.users) ? database.users : EMPTY_DATABASE.users,
    goals: Array.isArray(database?.goals) ? database.goals : EMPTY_DATABASE.goals,
    auditLog: Array.isArray(database?.auditLog) ? database.auditLog : EMPTY_DATABASE.auditLog,
  };
}

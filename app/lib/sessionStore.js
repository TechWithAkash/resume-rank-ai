// app/lib/sessionStore.js

import { v4 as uuidv4 } from 'uuid';

const SESSION_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

// Attach to global so hot-reload doesn't create a second Map instance
if (!global._sessionStore) {
  global._sessionStore = new Map();
}
const sessions = global._sessionStore;

// Auto-cleanup every 30 minutes
if (!global._sessionCleanupInterval) {
  global._sessionCleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [id, session] of sessions.entries()) {
      if (session.expiresAt < now) sessions.delete(id);
    }
  }, 30 * 60 * 1000);

  // Unref the timer so it doesn't hold the Node.js event loop open during builds/compilation
  if (global._sessionCleanupInterval && typeof global._sessionCleanupInterval.unref === 'function') {
    global._sessionCleanupInterval.unref();
  }
}

/**
 * Create a new session.
 * @param {string} jdText
 * @param {number} totalCount
 * @returns {string} sessionId
 */
export function createSession(jdText, totalCount) {
  const sessionId = uuidv4();
  sessions.set(sessionId, {
    sessionId,
    createdAt:      Date.now(),
    expiresAt:      Date.now() + SESSION_TTL_MS,
    jdText,
    status:         'processing',
    totalCount,
    processedCount: 0,
    parsedFiles:    [],   // Set by upload route after parsing
    candidates:     [],   // Set by analyze route after scoring + ranking
  });
  return sessionId;
}

/**
 * Get session by ID. Returns null if not found or expired.
 */
export function getSession(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    sessions.delete(sessionId);
    return null;
  }
  return session;
}

/**
 * Increment processed count on a session.
 * Called after each resume is scored.
 */
export function appendCandidate(sessionId, candidate) {
  const session = sessions.get(sessionId);
  if (!session) return;
  session.processedCount += 1;
  // Note: final ranked candidates array is set in bulk by analyze route
  // This just tracks progress count for polling
}

/**
 * Mark session as failed.
 */
export function failSession(sessionId, error) {
  const session = sessions.get(sessionId);
  if (!session) return;
  session.status = 'failed';
  session.error  = error;
}

/**
 * Delete a session.
 */
export function deleteSession(sessionId) {
  sessions.delete(sessionId);
}
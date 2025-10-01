const express = require('express');
const { v4: uuid } = require('uuid');

const router = express.Router();

const SESSIONS_TTL_MS = 60_000;
const sessions = new Map(); // sessionId -> { rfid_card_id, expiresAt }
let latestScan = { rfid_card_id: null, scanned_at: null };

function isExpired(session) {
  return !session || session.expiresAt < Date.now();
}

function requireDeviceKey(req, res, next) {
  const configured = process.env.IOT_DEVICE_KEY;
  if (!configured) {
    // Dev mode: no key configured, allow requests (not for production)
    return next();
  }
  const key = req.get('x-device-key');
  if (key !== configured) {
    return res.status(401).json({ success: false, message: 'Unauthorized device' });
  }
  next();
}

// Create a new RFID scan session (used by admin UI to wait for a tap)
router.post('/sessions', (req, res) => {
  const id = uuid();
  sessions.set(id, { rfid_card_id: null, expiresAt: Date.now() + SESSIONS_TTL_MS });
  res.json({ success: true, data: { session_id: id, ttl_sec: SESSIONS_TTL_MS / 1000 } });
});

// Get session state (admin UI polls for rfid_card_id)
router.get('/sessions/:id', (req, res) => {
  const s = sessions.get(req.params.id);
  if (isExpired(s)) return res.status(404).json({ success: false, message: 'expired' });
  res.json({ success: true, data: s });
});

// Device posts a scan result
router.post('/scans', requireDeviceKey, (req, res) => {
  const { session_id, rfid_card_id } = req.body || {};
  if (!rfid_card_id) {
    return res.status(400).json({ success: false, message: 'rfid_card_id is required' });
  }
  // Always record latest scan
  latestScan = { rfid_card_id: String(rfid_card_id), scanned_at: new Date().toISOString() };
  // If a session is provided and valid, update it too (for session-based flows)
  if (session_id) {
    const s = sessions.get(session_id);
    if (!isExpired(s)) {
      s.rfid_card_id = String(rfid_card_id);
    }
  }
  return res.json({ success: true });
});

// Get latest scan (for auto-fill flows)
router.get('/latest', (req, res) => {
  res.json({ success: true, data: latestScan });
});

module.exports = router;



// ============================================================
// SECUREVOTE BACKEND — Node.js + Express
// Render deployment ready + duplicate face blocking
// ============================================================

const express = require('express');
const cors    = require('cors');
const crypto  = require('crypto');
const path    = require('path');
const https   = require('https');

const app = express();

// ============================================================
// 🌍 CORS — allow your frontend URL
// On Render: set environment variable FRONTEND_URL to your
// frontend Render URL e.g. https://securevote.onrender.com
// ============================================================
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  process.env.FRONTEND_URL        // set this on Render dashboard
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error('CORS blocked: ' + origin));
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Serve frontend from /public (for single-service Render deploy)
// Put your index.html + admin-register.html inside /public folder
app.use(express.static(path.join(__dirname, 'public')));

// ============================================================
// 📦 VOTER DATABASE
// After running admin-register.html for each student:
//   1. Copy the faceDescriptor array shown on screen
//   2. Paste it below as faceDescriptor: [ ...numbers... ]
//   3. Set faceRegistered: true
// ============================================================

const VOTER_DATABASE = {

  "CS2024001": {
    name: "Rahul Sharma",
    dob: "15/08/2002",
    mobile: "9876543210",
    department: "Computer Science",
    year: "2nd Year",
    faceRegistered: false,    // ← change to true after pasting descriptor
    faceDescriptor: null,     // ← paste [0.12, -0.45, 0.87, ...] here
    hasVoted: false
  },

  "CS2024002": {
    name: "Priya Mehta",
    dob: "22/03/2003",
    mobile: "9123456780",
    department: "Computer Science",
    year: "2nd Year",
    faceRegistered: false,
    faceDescriptor: null,
    hasVoted: false
  },

  "CS2024003": {
    name: "Ankit Verma",
    dob: "10/11/2002",
    mobile: "9988776655",
    department: "Computer Science",
    year: "2nd Year",
    faceRegistered: false,
    faceDescriptor: null,
    hasVoted: false
  },

  "123456": {
    name: "Prince Yadav",
    dob: "24/09/2003",
    mobile: "9373188751",
    department: "ECE",
    year: "3rd Year",
    faceRegistered: false,    // ← set true after pasting YOUR descriptor
    faceDescriptor: null,     // ← paste your descriptor here
    hasVoted: false
  }

};

// ============================================================
// 🏆 NOMINEES DATABASE
// ============================================================
const NOMINEES = [
  { id: 1, name: "Rahul Sharma",  position: "Class Representative", slogan: "Progress with Unity",    symbol: "🌟", votes: 0 },
  { id: 2, name: "Priya Mehta",   position: "Class Representative", slogan: "Your Voice, My Mission", symbol: "🔥", votes: 0 },
  { id: 3, name: "Ankit Verma",   position: "Class Representative", slogan: "Innovation First",       symbol: "⚡", votes: 0 },
];

// In-memory stores
const OTP_STORE     = {};   // { voterId: { otp, expiry } }
const FACE_SESSIONS = {};   // { sessionId: { voterId, faceVerified, expiry } }
const VOTE_LOG      = [];   // all votes (admin only)

// ============================================================
// 🔒 DUPLICATE FACE DETECTION
// Problem: Same person registers with multiple Voter IDs
// Fix: When someone scans their face, we compute the euclidean
// distance between their descriptor and EVERY other registered
// descriptor. If distance < 0.5 → same person → BLOCK.
// ============================================================

// Euclidean distance between two 128-number face descriptors
function euclideanDistance(d1, d2) {
  if (!d1 || !d2 || d1.length !== d2.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < d1.length; i++) {
    sum += (d1[i] - d2[i]) ** 2;
  }
  return Math.sqrt(sum);
}

// Returns { isDuplicate, matchedVoterId } after comparing with all OTHER voters
function checkDuplicateFace(incomingDescriptor, currentVoterId) {
  for (const [voterId, voter] of Object.entries(VOTER_DATABASE)) {
    if (voterId === currentVoterId) continue;           // skip self
    if (!voter.faceRegistered || !voter.faceDescriptor) continue;

    const dist = euclideanDistance(incomingDescriptor, voter.faceDescriptor);

    if (dist < 0.5) {
      // Same face found under a different Voter ID
      console.log(`🚨 DUPLICATE FACE: ${currentVoterId} face matches ${voterId} (dist=${dist.toFixed(3)})`);
      return { isDuplicate: true, matchedVoterId: voterId };
    }
  }
  return { isDuplicate: false, matchedVoterId: null };
}

// Returns true if incoming descriptor matches the voter's OWN stored descriptor
function verifyOwnFace(incomingDescriptor, storedDescriptor) {
  const dist = euclideanDistance(incomingDescriptor, storedDescriptor);
  console.log(`   Own face match distance: ${dist.toFixed(4)} (pass if < 0.5)`);
  return dist < 0.5;
}

// ============================================================
// 🔧 HELPERS
// ============================================================

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateSessionId() {
  return crypto.randomBytes(32).toString('hex');
}

function maskMobile(mobile) {
  return mobile.slice(0, 2) + '******' + mobile.slice(-2);
}

// ============================================================
// 📱 FAST2SMS — Real OTP SMS
// On Render: set environment variable FAST2SMS_KEY
// Locally: set it in your terminal or .env file
// ============================================================

const FAST2SMS_API_KEY = process.env.FAST2SMS_KEY || 'YOUR_FAST2SMS_API_KEY';

function sendSMS(mobile, otp) {
  console.log(`\n📱 OTP [${otp}] → ${mobile}`);

  if (FAST2SMS_API_KEY === 'YOUR_FAST2SMS_API_KEY') {
    console.log(`⚠️  No Fast2SMS key. OTP visible in terminal only.\n`);
    return;
  }

  const msg = `Your SecureVote OTP is ${otp}. Valid 5 minutes. Do not share.`;
  const options = {
    hostname: 'www.fast2sms.com',
    path: `/dev/bulkV2?authorization=${FAST2SMS_API_KEY}&route=q&message=${encodeURIComponent(msg)}&flash=0&numbers=${mobile}`,
    method: 'GET',
    headers: { 'cache-control': 'no-cache' }
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
      try {
        const p = JSON.parse(data);
        console.log(p.return === true ? `✅ SMS sent to ${mobile}` : `❌ SMS error: ${p.message}`);
      } catch { console.log('SMS raw response:', data); }
    });
  });
  req.on('error', e => console.error('SMS failed:', e.message));
  req.end();
}

// ============================================================
// 🌐 API ROUTES
// ============================================================

// 1. Verify Voter ID → send OTP
app.post('/api/verify-voter', (req, res) => {
  const { voterId } = req.body;
  if (!voterId) return res.status(400).json({ success: false, message: 'Voter ID required' });

  const voter = VOTER_DATABASE[voterId.toUpperCase()];
  if (!voter)           return res.status(404).json({ success: false, message: 'Voter ID not found' });
  if (voter.hasVoted)   return res.status(403).json({ success: false, message: 'This ID has already voted' });
  if (!voter.faceRegistered) {
    return res.status(403).json({ success: false, message: 'Face not registered for this ID. Contact admin.' });
  }

  const otp = generateOTP();
  OTP_STORE[voterId.toUpperCase()] = { otp, expiry: Date.now() + 5 * 60 * 1000 };
  sendSMS(voter.mobile, otp);

  return res.json({
    success: true,
    maskedMobile: maskMobile(voter.mobile),
    voterName: voter.name,
    department: voter.department,
    devOTP: process.env.NODE_ENV !== 'production' ? otp : undefined
  });
});

// 2. Verify OTP
app.post('/api/verify-otp', (req, res) => {
  const { voterId, otp } = req.body;
  const record = OTP_STORE[voterId?.toUpperCase()];

  if (!record)                    return res.status(400).json({ success: false, message: 'No OTP found. Please restart.' });
  if (Date.now() > record.expiry) return res.status(400).json({ success: false, message: 'OTP expired. Please restart.' });
  if (record.otp !== otp)         return res.status(401).json({ success: false, message: 'Wrong OTP. Try again.' });

  const sessionId = generateSessionId();
  FACE_SESSIONS[sessionId] = {
    voterId: voterId.toUpperCase(),
    faceVerified: false,
    expiry: Date.now() + 10 * 60 * 1000
  };
  delete OTP_STORE[voterId.toUpperCase()];

  return res.json({ success: true, sessionId });
});

// 3. Verify Face — with full duplicate check
// Frontend sends faceDescriptor: [128 numbers] computed by face-api.js
app.post('/api/verify-face', (req, res) => {
  const { sessionId, faceDescriptor } = req.body;
  const session = FACE_SESSIONS[sessionId];

  if (!session)                    return res.status(400).json({ success: false, message: 'Invalid session. Please restart.' });
  if (Date.now() > session.expiry) return res.status(400).json({ success: false, message: 'Session expired.' });

  if (!Array.isArray(faceDescriptor) || faceDescriptor.length !== 128) {
    return res.status(400).json({ success: false, message: 'Invalid face data. Make sure face is visible.' });
  }

  const voter = VOTER_DATABASE[session.voterId];

  // ── CHECK 1: Is this face already used by ANOTHER voter? ──
  const { isDuplicate, matchedVoterId } = checkDuplicateFace(faceDescriptor, session.voterId);
  if (isDuplicate) {
    delete FACE_SESSIONS[sessionId]; // kill session immediately
    console.log(`🚨 FRAUD BLOCKED: ${session.voterId} tried to use face of ${matchedVoterId}`);
    return res.status(403).json({
      success: false,
      message: 'This face is registered under a different Voter ID. Attempt blocked and logged.'
    });
  }

  // ── CHECK 2: Does this face match THIS voter's own stored face? ──
  const isMatch = verifyOwnFace(faceDescriptor, voter.faceDescriptor);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Face does not match your registered photo. Try better lighting or contact admin.'
    });
  }

  // ── ALL GOOD ──
  session.faceVerified = true;
  console.log(`✅ Face verified: ${voter.name} (${session.voterId})`);

  return res.json({ success: true, voterName: voter.name });
});

// 4. Get nominees (only after face verified)
app.get('/api/nominees', (req, res) => {
  const session = FACE_SESSIONS[req.query.sessionId];
  if (!session?.faceVerified) return res.status(403).json({ success: false, message: 'Unauthorized' });

  return res.json({
    success: true,
    nominees: NOMINEES.map(({ id, name, position, slogan, symbol }) => ({ id, name, position, slogan, symbol }))
  });
});

// 5. Cast vote
app.post('/api/cast-vote', (req, res) => {
  const { sessionId, nomineeId } = req.body;
  const session = FACE_SESSIONS[sessionId];

  if (!session?.faceVerified) return res.status(403).json({ success: false, message: 'Unauthorized' });

  const voter = VOTER_DATABASE[session.voterId];
  if (voter.hasVoted) return res.status(403).json({ success: false, message: 'Already voted' });

  const nominee = NOMINEES.find(n => n.id === nomineeId);
  if (!nominee) return res.status(400).json({ success: false, message: 'Invalid nominee' });

  nominee.votes++;
  voter.hasVoted = true;

  const blockHash = crypto.createHash('sha256')
    .update(session.voterId + nomineeId + Date.now().toString())
    .digest('hex');

  VOTE_LOG.push({
    voterId: session.voterId,
    voterName: voter.name,
    nomineeName: nominee.name,
    timestamp: new Date().toISOString(),
    blockHash
  });

  delete FACE_SESSIONS[sessionId];
  console.log(`✅ VOTE: ${voter.name} → ${nominee.name}`);

  return res.json({
    success: true,
    receipt: { voterName: voter.name, nomineeName: nominee.name, timestamp: new Date().toISOString(), blockHash }
  });
});

// 6. Admin results (password-protected)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin@secure2024';

app.get('/api/admin/results', (req, res) => {
  if (req.query.password !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: 'Wrong password' });
  }
  return res.json({
    success: true,
    totalVotes: VOTE_LOG.length,
    results: NOMINEES.map(({ name, votes }) => ({ name, votes })),
    voteLog: VOTE_LOG
  });
});

// SPA fallback
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============================================================
// 🚀 START SERVER
// ============================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🗳️  SecureVote on port ${PORT}`);
  console.log(`📊  Admin: /api/admin/results?password=${ADMIN_PASSWORD}`);
  console.log(`\n📋  Voter registry:`);
  Object.entries(VOTER_DATABASE).forEach(([id, v]) =>
    console.log(`    ${id} → ${v.name} | face: ${v.faceRegistered ? '✅ ready' : '❌ NOT registered'}`)
  );
  console.log('');
});

// ============================================================
// SECUREVOTE BACKEND — MongoDB + Express
// ============================================================
const express   = require('express');
const cors      = require('cors');
const crypto    = require('crypto');
const path      = require('path');
const https     = require('https');
const mongoose  = require('mongoose');

const app = express();
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ============================================================
// MONGODB CONNECTION
// Replace with your MongoDB Atlas connection string
// ============================================================
const MONGO_URI = process.env.MONGO_URI || 'YOUR_MONGODB_CONNECTION_STRING';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected!'))
  .catch(err => console.log('❌ MongoDB error:', err.message));

// ============================================================
// SCHEMAS
// ============================================================

// Voter Schema
const voterSchema = new mongoose.Schema({
  voterId:        { type: String, required: true, unique: true, uppercase: true },
  name:           { type: String, required: true },
  dob:            { type: String, required: true },
  mobile:         { type: String, required: true },
  department:     { type: String, required: true },
  year:           { type: String, required: true },
  faceRegistered: { type: Boolean, default: false },
  faceDescriptor: { type: [Number], default: null },
  hasVoted:       { type: Boolean, default: false },
  registeredAt:   { type: Date, default: Date.now }
});

// Vote Schema
const voteSchema = new mongoose.Schema({
  voterId:     { type: String, required: true },
  voterName:   { type: String, required: true },
  nomineeName: { type: String, required: true },
  nomineeId:   { type: Number, required: true },
  blockHash:   { type: String, required: true },
  timestamp:   { type: Date, default: Date.now },
  faceDescriptor: { type: [Number] } // store voted face
});

// Nominee Schema
const nomineeSchema = new mongoose.Schema({
  id:       { type: Number, required: true, unique: true },
  name:     { type: String, required: true },
  position: { type: String, required: true },
  slogan:   { type: String, required: true },
  symbol:   { type: String, required: true },
  votes:    { type: Number, default: 0 }
});

const Voter   = mongoose.model('Voter',   voterSchema);
const Vote    = mongoose.model('Vote',    voteSchema);
const Nominee = mongoose.model('Nominee', nomineeSchema);

// ============================================================
// SEED DEFAULT DATA (runs once if DB is empty)
// ============================================================
async function seedDatabase() {
  try {
    // Seed nominees if empty
    const nomineeCount = await Nominee.countDocuments();
    if (nomineeCount === 0) {
      await Nominee.insertMany([
        { id: 1, name: "Rahul Sharma",  position: "Class Representative", slogan: "Progress with Unity",    symbol: "🌟" },
        { id: 2, name: "Priya Mehta",   position: "Class Representative", slogan: "Your Voice, My Mission", symbol: "🔥" },
        { id: 3, name: "Ankit Verma",   position: "Class Representative", slogan: "Innovation First",       symbol: "⚡" },
      ]);
      console.log('✅ Nominees seeded');
    }
    console.log('📊 Database ready!');
  } catch(e) {
    console.log('Seed error:', e.message);
  }
}

mongoose.connection.once('open', seedDatabase);

// ============================================================
// FACE HELPERS
// ============================================================
function euclideanDistance(d1, d2) {
  if (!d1 || !d2 || d1.length !== d2.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < d1.length; i++) sum += (d1[i] - d2[i]) ** 2;
  return Math.sqrt(sum);
}

async function hasFaceAlreadyVoted(descriptor) {
  const votes = await Vote.find({ faceDescriptor: { $exists: true } });
  for (const vote of votes) {
    if (euclideanDistance(descriptor, vote.faceDescriptor) < 0.6) return true;
  }
  return false;
}

async function checkDuplicateFace(descriptor, currentVoterId) {
  const voters = await Voter.find({ faceRegistered: true, voterId: { $ne: currentVoterId } });
  for (const voter of voters) {
    if (euclideanDistance(descriptor, voter.faceDescriptor) < 0.6) {
      return { isDuplicate: true, matchedVoterId: voter.voterId };
    }
  }
  return { isDuplicate: false };
}

// ============================================================
// HELPERS
// ============================================================
const OTP_STORE     = {};
const FACE_SESSIONS = {};

function generateOTP()       { return Math.floor(100000 + Math.random() * 900000).toString(); }
function generateSessionId() { return crypto.randomBytes(32).toString('hex'); }
function maskMobile(mobile)  { return mobile.slice(0, 2) + '******' + mobile.slice(-2); }

// ============================================================
// SMS
// ============================================================
const FAST2SMS_KEY = process.env.FAST2SMS_KEY || 'YOUR_FAST2SMS_KEY';

function sendSMS(mobile, otp) {
  console.log(`📱 OTP [${otp}] → ${mobile}`);
  if (FAST2SMS_KEY === 'YOUR_FAST2SMS_KEY') { console.log('No SMS key set.'); return; }
  const msg = `Your SecureVote OTP is ${otp}. Valid 5 minutes. Do not share.`;
  const options = {
    hostname: 'www.fast2sms.com',
    path: `/dev/bulkV2?authorization=${FAST2SMS_KEY}&route=q&message=${encodeURIComponent(msg)}&flash=0&numbers=${mobile}`,
    method: 'GET', headers: { 'cache-control': 'no-cache' }
  };
  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => { try { const p = JSON.parse(data); console.log(p.return ? `SMS sent` : `SMS error: ${p.message}`); } catch {} });
  });
  req.on('error', e => console.error('SMS failed:', e.message));
  req.end();
}

// ============================================================
// ADMIN REGISTRATION API (auto-saves face to MongoDB!)
// No more copy-paste needed!
// ============================================================

// Register new voter (admin OR self-registration)
app.post('/api/admin/register-voter', async (req, res) => {
  const { adminPassword, voterId, name, dob, mobile, department, year, selfRegister } = req.body;
  // Allow self-registration OR admin registration
  const isAdmin = adminPassword === (process.env.ADMIN_PASSWORD || 'admin@secure2024');
  const isSelfRegister = selfRegister === true && adminPassword === 'self-register';
  if (!isAdmin && !isSelfRegister) {
    return res.status(401).json({ success: false, message: 'Wrong admin password' });
  }
  try {
    const existing = await Voter.findOne({ voterId: voterId.toUpperCase() });
    if (existing) return res.status(400).json({ success: false, message: 'Voter ID already exists' });
    const voter = new Voter({ voterId, name, dob, mobile, department, year });
    await voter.save();
    return res.json({ success: true, message: `Voter ${name} registered successfully!` });
  } catch(e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

// Save face descriptor (admin OR self-registration)
app.post('/api/admin/save-face', async (req, res) => {
  const { adminPassword, voterId, faceDescriptor, selfRegister } = req.body;
  const isAdmin = adminPassword === (process.env.ADMIN_PASSWORD || 'admin@secure2024');
  const isSelfRegister = selfRegister === true && adminPassword === 'self-register';
  if (!isAdmin && !isSelfRegister) {
    return res.status(401).json({ success: false, message: 'Wrong admin password' });
  }
  if (!Array.isArray(faceDescriptor) || faceDescriptor.length !== 128) {
    return res.status(400).json({ success: false, message: 'Invalid face descriptor' });
  }
  try {
    const voter = await Voter.findOneAndUpdate(
      { voterId: voterId.toUpperCase() },
      { faceDescriptor, faceRegistered: true },
      { new: true }
    );
    if (!voter) return res.status(404).json({ success: false, message: 'Voter not found' });
    console.log(`✅ Face saved for ${voter.name} (${voterId})`);
    return res.json({ success: true, message: `Face registered for ${voter.name}!` });
  } catch(e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

// Get all voters (admin)
app.get('/api/admin/voters', async (req, res) => {
  if (req.query.password !== (process.env.ADMIN_PASSWORD || 'admin@secure2024')) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  const voters = await Voter.find({}, '-faceDescriptor'); // don't send descriptor
  return res.json({ success: true, voters });
});

// Delete voter (admin)
app.delete('/api/admin/voter/:voterId', async (req, res) => {
  const { password } = req.body;
  if (password !== (process.env.ADMIN_PASSWORD || 'admin@secure2024')) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  await Voter.deleteOne({ voterId: req.params.voterId.toUpperCase() });
  return res.json({ success: true, message: 'Voter deleted' });
});

// ============================================================
// VOTING APIs
// ============================================================

// 1. Verify Voter ID
app.post('/api/verify-voter', async (req, res) => {
  const { voterId } = req.body;
  if (!voterId) return res.status(400).json({ success: false, message: 'Voter ID required' });
  try {
    const voter = await Voter.findOne({ voterId: voterId.toUpperCase() });
    if (!voter) return res.status(404).json({ success: false, message: 'Voter ID not found' });
    if (voter.hasVoted) return res.status(403).json({ success: false, message: 'This ID has already voted' });
    if (!voter.faceRegistered) return res.status(403).json({ success: false, message: 'Face not registered. Contact admin.' });
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
  } catch(e) { return res.status(500).json({ success: false, message: e.message }); }
});

// 2. Verify OTP
app.post('/api/verify-otp', (req, res) => {
  const { voterId, otp } = req.body;
  const record = OTP_STORE[voterId?.toUpperCase()];
  if (!record)                    return res.status(400).json({ success: false, message: 'No OTP found. Please restart.' });
  if (Date.now() > record.expiry) return res.status(400).json({ success: false, message: 'OTP expired.' });
  if (record.otp !== otp)         return res.status(401).json({ success: false, message: 'Wrong OTP.' });
  const sessionId = generateSessionId();
  FACE_SESSIONS[sessionId] = { voterId: voterId.toUpperCase(), faceVerified: false, expiry: Date.now() + 10 * 60 * 1000 };
  delete OTP_STORE[voterId.toUpperCase()];
  return res.json({ success: true, sessionId });
});

// 3. Verify Face
app.post('/api/verify-face', async (req, res) => {
  const { sessionId, faceDescriptor } = req.body;
  const session = FACE_SESSIONS[sessionId];
  if (!session)                    return res.status(400).json({ success: false, message: 'Invalid session.' });
  if (Date.now() > session.expiry) return res.status(400).json({ success: false, message: 'Session expired.' });
  if (!Array.isArray(faceDescriptor) || faceDescriptor.length !== 128) {
    return res.status(400).json({ success: false, message: 'Invalid face data.' });
  }
  try {
    const voter = await Voter.findOne({ voterId: session.voterId });

    // Check 1: Already voted face?
    if (await hasFaceAlreadyVoted(faceDescriptor)) {
      delete FACE_SESSIONS[sessionId];
      return res.status(403).json({ success: false, message: 'This face has already voted!' });
    }

    // Check 2: Face belongs to different voter?
    const { isDuplicate, matchedVoterId } = await checkDuplicateFace(faceDescriptor, session.voterId);
    if (isDuplicate) {
      delete FACE_SESSIONS[sessionId];
      return res.status(403).json({ success: false, message: 'Face belongs to a different Voter ID. Blocked!' });
    }

    // Check 3: Matches own registered face?
    const dist = euclideanDistance(faceDescriptor, voter.faceDescriptor);
    console.log(`Face distance: ${dist.toFixed(4)}`);
    if (dist >= 0.6) {
      return res.status(401).json({ success: false, message: 'Face does not match. Try better lighting.' });
    }

    session.faceVerified = true;
    session.faceDescriptor = faceDescriptor;
    return res.json({ success: true, voterName: voter.name });
  } catch(e) { return res.status(500).json({ success: false, message: e.message }); }
});

// 4. Get nominees
app.get('/api/nominees', async (req, res) => {
  const session = FACE_SESSIONS[req.query.sessionId];
  if (!session?.faceVerified) return res.status(403).json({ success: false, message: 'Unauthorized' });
  const nominees = await Nominee.find({}, '-__v');
  return res.json({ success: true, nominees });
});

// 5. Cast vote
app.post('/api/cast-vote', async (req, res) => {
  const { sessionId, nomineeId } = req.body;
  const session = FACE_SESSIONS[sessionId];
  if (!session?.faceVerified) return res.status(403).json({ success: false, message: 'Unauthorized' });
  try {
    const voter = await Voter.findOne({ voterId: session.voterId });
    if (voter.hasVoted) return res.status(403).json({ success: false, message: 'Already voted' });
    const nominee = await Nominee.findOne({ id: nomineeId });
    if (!nominee) return res.status(400).json({ success: false, message: 'Invalid nominee' });

    nominee.votes++;
    await nominee.save();
    voter.hasVoted = true;
    await voter.save();

    const blockHash = crypto.createHash('sha256')
      .update(session.voterId + nomineeId + Date.now().toString()).digest('hex');

    await Vote.create({
      voterId: session.voterId,
      voterName: voter.name,
      nomineeName: nominee.name,
      nomineeId,
      blockHash,
      faceDescriptor: session.faceDescriptor
    });

    delete FACE_SESSIONS[sessionId];
    console.log(`✅ VOTE: ${voter.name} → ${nominee.name}`);
    return res.json({
      success: true,
      receipt: { voterName: voter.name, nomineeName: nominee.name, timestamp: new Date().toISOString(), blockHash }
    });
  } catch(e) { return res.status(500).json({ success: false, message: e.message }); }
});

// 6. Admin results
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin@secure2024';
app.get('/api/admin/results', async (req, res) => {
  if (req.query.password !== ADMIN_PASSWORD) return res.status(401).json({ success: false, message: 'Wrong password' });
  try {
    const nominees = await Nominee.find({});
    const votes    = await Vote.find({}, '-faceDescriptor');
    const voters   = await Voter.find({}, '-faceDescriptor');
    return res.json({
      success: true,
      totalVotes: votes.length,
      totalVoters: voters.length,
      results: nominees.map(n => ({ name: n.name, symbol: n.symbol, votes: n.votes })),
      voteLog: votes
    });
  } catch(e) { return res.status(500).json({ success: false, message: e.message }); }
});

// Fallback
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🗳️  SecureVote running on port ${PORT}`);
  console.log(`📊  Admin: /api/admin/results?password=${ADMIN_PASSWORD}`);
  console.log(`🌿  MongoDB: ${MONGO_URI !== 'YOUR_MONGODB_CONNECTION_STRING' ? 'Connected' : 'Not configured'}\n`);
});

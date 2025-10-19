// ─────────────────────────────────────────────────────────────
// 🌐 Imports & Setup
// ─────────────────────────────────────────────────────────────
const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const multer = require('multer');
const sanitize = require('sanitize-filename');
const path = require('path');
const fs = require('fs');
const mongoose = require('./db/db');

const Update = require('./db/models/Update');
const Contact = require('./db/models/Contact');
const Profile = require('./db/models/Profile');
const Application = require('./db/models/Application');
const Customer = require('./db/models/Customer');

const app = express();
const PORT = process.env.PORT || 5002;
const ADMIN_PASSWORD_HASH = '$2b$10$fn.js92SC09fIYETDy/P1.e5xFG6XON0oy218xweTbOdoL9f91i/W';

// ─────────────────────────────────────────────────────────────
// 🔧 Middleware
// ─────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─────────────────────────────────────────────────────────────
// 📦 Multer Setup
// ─────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const profileId = req.query.profileId;
    if (!profileId) return cb(new Error('Missing profileId'), null);
    const uploadPath = path.join(__dirname, '../client/public/images', profileId);
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => cb(null, file.originalname)
});
const upload = multer({ storage });

// ─────────────────────────────────────────────────────────────
// 🔐 Admin Authentication
// ─────────────────────────────────────────────────────────────
let failedAttempts = 0;
let lockoutUntil = null;

function requireAdmin(req, res, next) {
  if (req.cookies.admin === 'true') return next();
  res.sendStatus(401);
}

app.post('/admin-login', express.urlencoded({ extended: true }), async (req, res) => {
  const { password } = req.body;

  if (lockoutUntil && Date.now() < lockoutUntil) {
    return res.status(403).send('Too many failed attempts. Try again later.');
  }

  const match = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
  if (match) {
    failedAttempts = 0;
    lockoutUntil = null;
    res.cookie('admin', 'true', { httpOnly: true });
    return res.redirect('/admin');
  }

  failedAttempts += 1;
  if (failedAttempts >= 5) {
    lockoutUntil = Date.now() + 15 * 60 * 1000;
    return res.status(403).send('Too many failed attempts. Locked out for 15 minutes.');
  }

  res.status(401).send('Incorrect password');
});

app.get('/admin-check', (req, res) => {
  res.sendStatus(req.cookies.admin === 'true' ? 200 : 401);
});

app.post('/admin-logout', (req, res) => {
  res.clearCookie('admin');
  res.sendStatus(200);
});

// ─────────────────────────────────────────────────────────────
// 🔄 API Routes
// ─────────────────────────────────────────────────────────────

// 📰 Updates
app.get('/api/updates', async (req, res) => {
  try {
    const updates = await Update.find({});
    res.json(updates);
  } catch {
    res.status(500).json({ error: 'Failed to fetch updates' });
  }
});

app.post('/api/updates', async (req, res) => {
  try {
    const updates = req.body;
    if (!Array.isArray(updates)) return res.status(400).json({ error: 'Invalid updates format' });
    await Update.deleteMany({});
    if (updates.length > 0) await Update.insertMany(updates);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to save updates' });
  }
});

// 📞 Contact
app.get('/api/contact', async (req, res) => {
  try {
    const contact = await Contact.findOne({});
    res.json(contact);
  } catch {
    res.status(500).json({ error: 'Failed to fetch contact' });
  }
});

app.post('/api/contact', async (req, res) => {
  try {
    const { phoneNumbers = [], email = '', googleMapsUrl = '' } = req.body;
    const cleanedPhones = phoneNumbers.map(p => p.trim()).filter(p => p.length > 0);
    if (cleanedPhones.length > 2) return res.status(400).json({ error: 'Max 2 phone numbers allowed' });

    if (!cleanedPhones.length && !email.trim() && !googleMapsUrl.trim()) {
      await Contact.deleteMany({});
      return res.json({ success: true, message: 'Contact info deleted' });
    }

    await Contact.deleteMany({});
    const newContact = new Contact({ phoneNumbers: cleanedPhones, email: email.trim(), googleMapsUrl: googleMapsUrl.trim() });
    await newContact.save();
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to save contact info' });
  }
});

// 🐾 Profiles
app.get('/api/profiles', async (req, res) => {
  try {
    const profiles = await Profile.find({});
    res.json(profiles);
  } catch {
    res.status(500).json({ error: 'Failed to fetch profiles' });
  }
});

app.get('/api/profiles/:id', async (req, res) => {
  try {
    const profile = await Profile.findOne({ id: req.params.id });
    profile ? res.json(profile) : res.status(404).json({ error: 'Profile not found' });
  } catch {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

app.post('/api/profiles/:id', async (req, res) => {
  try {
    await Profile.updateOne({ id: req.params.id }, { $set: req.body }, { upsert: true });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to save profile' });
  }
});

// 🖼️ Image Upload
app.post('/api/upload-image', requireAdmin, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const originalName = req.file.originalname;
  const normalized = originalName.normalize('NFKC').replace(/[\u200B-\u200F\u202F\uFEFF]/g, '');
  const underscored = normalized.replace(/[^\w.-]/g, '_');
  const safeName = sanitize(underscored);
  const newPath = path.join(req.file.destination, safeName);
  fs.renameSync(req.file.path, newPath);

  res.status(200).json({ message: 'Upload successful', filename: safeName, path: newPath });
});

// 📝 Applications
app.get('/api/applications', requireAdmin, async (req, res) => {
  try {
    const applications = await Application.find({});
    res.json(applications);
  } catch {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// 👥 Customers
app.get('/api/customers', requireAdmin, async (req, res) => {
  try {
    const customers = await Customer.find({});
    res.json(customers);
  } catch {
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

app.post('/api/customers/:id/blacklist', requireAdmin, async (req, res) => {
  const { profileId } = req.body;
  if (!profileId) return res.status(400).json({ error: 'Missing profileId' });

  try {
    const customer = await Customer.findOne({ id: req.params.id });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const profile = customer.profiles.find(p => p.profileId === profileId);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    profile.blackListed = true;
    await customer.save();
    res.json(customer);
  } catch {
    res.status(500).json({ error: 'Failed to update blacklist status' });
  }
});

// ✅ Application Approval / Rejection
app.post('/api/approve-application', requireAdmin, async (req, res) => {
  const { applicationId } = req.body;

  try {
    const application = await Application.findOne({ id: applicationId });
    if (!application) return res.status(404).send('Application not found');

    // Create customer
    const customer = new Customer({
      id: `cust-${applicationId}`,
      name: application.name,
      phoneNumber: application.phoneNumber,
      applicationId: applicationId,
      profiles: [] // You can populate this later
    });
    await customer.save();

    // Update application status
    application.status = 1; // Approved
    await application.save();

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.post('/api/reject-application', requireAdmin, async (req, res) => {
  const { applicationId } = req.body;

  try {
    const application = await Application.findOne({ id: applicationId });
    if (!application) return res.status(404).send('Application not found');

    application.status = 2; // Rejected
    await application.save();

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

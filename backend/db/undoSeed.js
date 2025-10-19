const mongoose = require('./db');
const Update = require('./models/Update');
const Contact = require('./models/Contact');
const Profile = require('./models/Profile');
const Application = require('./models/Application');
const Customer = require('./models/Customer');

async function undoSeed() {
  try {
    await Update.deleteMany({});
    await Contact.deleteMany({});
    await Profile.deleteMany({});
    await Application.deleteMany({});
    await Customer.deleteMany({});
    console.log('🧹 Seed data removed');
  } catch (err) {
    console.error('❌ Error removing seed data:', err);
  } finally {
    mongoose.connection.close();
  }
}

undoSeed();

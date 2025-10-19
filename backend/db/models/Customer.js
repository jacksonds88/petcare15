const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  phoneNumber: String,
  applicationId: Number,
  profiles: [
    {
      profileId: String,
      visitorCount: Number,
      positiveExperience: Boolean,
      charitable: Boolean,
      blackListed: Boolean
    }
  ]
});

module.exports = mongoose.model('Customer', customerSchema);

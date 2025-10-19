const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  phoneNumber: String,
  email: String,
  references: {
    companyName1: String,
    companyPhoneNumber1: String,
    companyName1confirmed: {
      type: Boolean,
      default: false,
    },
    companyName2: String,
    companyPhoneNumber2: String,
    companyName2confirmed: {
      type: Boolean,
      default: false,
    },
  },
  selfieImage: String,
  driverLicenseImage: String,
  status: {
    type: Number,
    enum: [0, 1, 2], // 0 = Pending, 1 = Approved, 2 = Rejected
    required: true,
  },
  note: String,
});

module.exports = mongoose.model('Application', applicationSchema);

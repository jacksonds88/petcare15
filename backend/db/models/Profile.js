const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  profileThumbnail: String,
  profileFullImage: String,
  aboutMe: String,
  available: Boolean,
  breed: String,
  heightCm: Number,
  weightKg: Number,
  harnessSize: String,
  highlights: String,
  review: {
    link: String,
    samples: [
      {
        text: String,
        link: String,
      },
    ],
  },
  indoorServices: String,
  outdoorServices: String,
  specialGallery: {
    description: String,
    gallery: [String],
  },
  gallery: [String],
});

module.exports = mongoose.model('Profile', profileSchema);

const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  phoneNumbers: {
    type: [String],
    validate: {
      validator: function (arr) {
        return arr.length <= 2;
      },
      message: 'Contact can have at most 2 phone numbers'
    }
  },
  email: {
    type: String,
    required: true,
    match: /.+\@.+\..+/,
  },
  googleMapsUrl: { type: String, required: true }
});

module.exports = mongoose.model('Contact', contactSchema);

const mongoose = require('mongoose');

const updateSchema = new mongoose.Schema({
  id: Number,
  update: String,
});

module.exports = mongoose.model('Update', updateSchema);

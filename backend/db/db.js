const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/petcare15', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

module.exports = mongoose;

const mongoose = require('mongoose');

let privatedb;
mongoose.connect('mongodb://localhost:27017/privatedb').then((connection) => {
  console.log('Private database connected');
  privatedb = connection;
});

module.exports = privatedb;
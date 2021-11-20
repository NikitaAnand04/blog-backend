const mongoose = require('mongoose');

let publicdb;
mongoose.connect('mongodb://13.235.241.64:27017/publicdb').then((connection) => {
  console.log('Public database connected');
  publicdb = connection;
});

module.exports = publicdb;
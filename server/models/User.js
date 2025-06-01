const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    userId: {type: String, unique: true},
    userPassword: String
});

module.exports = mongoose.model('User', UserSchema); 
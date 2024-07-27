const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    emailOrPhone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    lastPasswordReset: { type: Date, default: null }
});

module.exports = mongoose.model('User', UserSchema);

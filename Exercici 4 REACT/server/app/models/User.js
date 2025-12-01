const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SessionHistorySchema = new mongoose.Schema({
    loginTime: {
        type: Date,
        required: true,
    },
    logoutTime: {
        type: Date,
    },
});

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    viewedJokes: {
        type: Map,
        of: [String],
        default: {}
    },
    sessionHistory: {
        type: [SessionHistorySchema],
        default: []
    }
});

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);

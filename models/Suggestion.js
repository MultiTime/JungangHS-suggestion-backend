const mongoose = require('mongoose');

const suggestionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['facility', 'meal', 'uniform', 'study', 'event', 'other']
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null  // 익명 건의의 경우 null
    },
    isAnonymous: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['pending', 'reviewing', 'completed', 'rejected'],
        default: 'pending'
    },
    response: {
        content: String,
        responder: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        respondedAt: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Suggestion', suggestionSchema);
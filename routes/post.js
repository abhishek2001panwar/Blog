

const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }, // Reference to the user who created the post
    category: { type: String, required: true },
    title: { type: String, required: true },
    highlight: { type: String, required: true },
    name:String,
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('post', postSchema);



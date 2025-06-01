const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    Author: String,
    Comment: String,
    Time: String
});

const PostSchema = new Schema({
    ImageUrl: String,
    Title: String,
    Post: String,
    Time: String,
    Author: String,
    Comment: [CommentSchema]
});

module.exports = mongoose.model('Post', PostSchema); 
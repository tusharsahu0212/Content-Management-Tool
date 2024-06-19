const mongoose = require('mongoose');
const blogSchema = require('./blog.model')
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    blogs: {
        type: [blogSchema],
        default: []
    }

});

module.exports = userSchema;
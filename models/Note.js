const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const noteSchema = new Schema ({
    email: String,
    title: String,
    desc: String
}, { timestamps: true })

module.exports = mongoose.model('Note', noteSchema)
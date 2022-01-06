const mongoose = require('mongoose');
const {Schema} = mongoose;
const roomSchema = new Schema({
    chatNo:{
        type: String,
        required: true,
        unique: true
    },
    chatLeaderId:{
        type: String,
        required: true,
    },
    regDate: {
        type: Date,
        default: Date.now(),
    },
});

module.exports = mongoose.model('Room', roomSchema);
const mongoose = require('mongoose');
const {Schema} = mongoose;
const roomSchema = new Schema({
    chatNo:{
        type: Number,
        required: true,
    },
    chatLeaderId:{
        type: String,
        required: true,
    },
    max:{
        type: Number,
        required: true,
        default: 10,
    },
    regDate: {
        type: Date,
        default: Date.now(),
    },
});

module.exports = mongoose.model('Room', roomSchema);
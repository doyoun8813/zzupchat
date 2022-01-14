const mongoose = require('mongoose');
const {Schema} = mongoose;
const chatSchema = new Schema({
    chatNo:{
        type: Number,
        required: true,
        ref: 'Room',
    },
    chatMemberId:{
        type: String,
        required: true,
    },
    chatMemberName:{
        type: String,
        required: true,
    },
    chatMemberImg:{
        type: String,
        required: true
    },
    msg: {
        type: String,
        trim: true,
    },
    time: String,
    file: String,
    regDate: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Chat', chatSchema);
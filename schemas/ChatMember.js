const mongoose = require('mongoose');
const {Schema} = mongoose;
const chatSchema = new Schema({
    chatNo:{
        type: Number,
        required: true,
        ref: 'Room',
    },
    MemberId:{
        type: String,
        required: true,
    },
    nickname:{
        type: String,
        required: true,
    },
    profileImg:{
        type: String,
        required: true
    },
    age:{
        type: String,
        required: true
    },
    gender:{
        type: String,
        required: true
    },
    enterDate: {
        type: Date
    },
    outDate: {
        type: Date
    },
    inOutChk:{
        type: Boolean
    }
});

module.exports = mongoose.model('ChatMember', chatSchema);
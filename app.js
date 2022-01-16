//노드 서버 프레임 워크
const express = require('express');
//log 기록하는 3rd-part lib
const morgan = require('morgan');
//express 세션 관리 미들웨어
const session = require('express-session');
//시간 표시 lib
const moment = require('moment');
//몽고DB Driver 모듈
const mongoose = require('mongoose');
//노드의 환경변수 설정
const dotenv = require('dotenv');
//localhost 다른 클라이언트에서 접속했을때 오류나는거 해결해주는 애
const cors = require('cors');
//express 객체 생성
const app = express();
//express http 서버 생성
const server = require('http').createServer(app);
//생성된 서버를 socket.io에 바인딩
const io = require('socket.io')(server,{
    cors:{
        origin: "*",
        method: ["GET", "POST"]
    }
});

const Chat = require('./schemas/Chat');
const Room = require('./schemas/Room');
const ChatMember = require('./schemas/ChatMember');

dotenv.config({path:'.env'});
mongoose.connect(process.env.MONGODB_URL);
let db = mongoose.connection;

db.on('error', () =>{
    console.log('DB Connection Failed!');
});

db.on('open', () =>{
    console.log('DB Connected!');
});

//접속자 카운트
let user_id = '';
let user_name = '';
let user_obj = {};
let user_arr = [];

//소켓에 접속하면..
io.on('connection', socket => {
    console.log('NEW USER CONNECT');

    // 새로운 유저가 접속했을 경우 다른 소켓에 알려줌
    socket.on('new_user', data => {
        console.log(data);
        console.log(data.memberInfo.nickname + ' 님이 접속하였습니다.');

        socket.nickname = data.memberInfo.nickname;
        socket.chatLeaderId = data.memberInfo.chatLeaderId;
        socket.memberId = data.memberInfo.memberId;
        socket.chatNo = data.memberInfo.chatNo;

        //메세지 데이터 몽고디비 저장
        const chat = new Chat({
            chatNo: data.memberInfo.chatNo,
            chatMemberId: data.memberInfo.memberId,
            chatMemberName: data.memberInfo.nickname,
            chatMemberImg: data.memberInfo.profileImage,
            msg: data.memberInfo.nickname + ' 님이 접속하였습니다.',
            msgType: 'system'
        });

        chat.save(function(err, data){
            if(err){
                console.log("error");
            }else{
                console.log("채팅 내용 저장");
            }
        });

        // 클라이언트에 접속정보 보내기
        io.emit('update',{
            type: 'connect',
            msgType: 'system',
            chatNo : data.memberInfo.chatNo,
            message: data.memberInfo.nickname + '님이 접속하였습니다.',
            memberId: data.memberInfo.memberId
        });
    });

    // 모임참여 체크했으면 다른 소켓에 알려줌
    socket.on('ready_check_on', data => {
        console.log(data);
        console.log(data.memberInfo.nickname + ' 님이 모임에 참가 하였습니다.');

        //메세지 데이터 몽고디비 저장
        const chat = new Chat({
            chatNo: data.memberInfo.chatNo,
            chatMemberId: data.memberInfo.memberId,
            chatMemberName: data.memberInfo.nickname,
            chatMemberImg: data.memberInfo.profileImage,
            msg: data.memberInfo.nickname + ' 님이 모임에 참가 하였습니다.',
            msgType: 'system'
        });

        chat.save(function(err, data){
            if(err){
                console.log("error");
            }else{
                console.log("채팅 내용 저장");
            }
        });

        // 클라이언트에 모임참여 참가자 정보 보내기
        io.emit('update',{
            type: 'ready_check',
            msgType: 'system',
            chatNo : data.memberInfo.chatNo,
            message : data.memberInfo.nickname + '님이 모임에 참가 하였습니다.',
            memberId : data.memberInfo.memberId
        });
    });

    // 모임참여 체크 해제했으면 다른 소켓에 알려줌
    socket.on('ready_check_off', data => {
        console.log(data);
        console.log(data.memberInfo.nickname + ' 님이 모임에 참가를 해제 하였습니다.');

        //메세지 데이터 몽고디비 저장
        const chat = new Chat({
            chatNo: data.memberInfo.chatNo,
            chatMemberId: data.memberInfo.memberId,
            chatMemberName: data.memberInfo.nickname,
            chatMemberImg: data.memberInfo.profileImage,
            msg: data.memberInfo.nickname + ' 님이 모임에 참가를 해제 하였습니다.',
            msgType: 'system'
        });

        chat.save(function(err, data){
            if(err){
                console.log("error");
            }else{
                console.log("채팅 내용 저장");
            }
        });

        // 클라이언트에 모임참여 참가자 정보 보내기
        io.emit('update',{
            type: 'ready_check',
            msgType: 'system',
            chatNo : data.memberInfo.chatNo,
            message : data.memberInfo.nickname + '님이 모임에 참가를 해제 하였습니다.',
            memberId : data.memberInfo.memberId
        });
    });

    // 클라이언트가 전송한 메세지 받기
    socket.on('message', data => {
        console.log("=====클라이언트가 전송한 메세지 데이터====");
        console.log(data);
        data.nickname = socket.memberInfo.nickname
        //자신을 제외한 접속자에게 데이터 보내기
        socket.broadcast.emit('update', data);
    });

    socket.on('send_msg', data => {
        const {
            type, msgType, message, memberInfo 
        } = data;
        console.log(data);

        //메세지 데이터 몽고디비 저장
        const chat = new Chat({
            chatNo: data.memberInfo.chatNo,
            chatMemberId: data.memberInfo.memberId,
            chatMemberName: data.memberInfo.nickname,
            chatMemberImg: data.memberInfo.profileImage,
            msg: data.message,
            msgType: data.msgType
        });

        chat.save(function(err, data){
            if(err){
                console.log("error");
            }else{
                console.log("채팅 내용 저장");
            }
        });

        //받은 메세지 모든 접속자에게 뿌려줌
        io.emit('send_msg', {
            message,
            memberInfo,
            regDate: moment(new Date()).format("MM-DD h:mm A")
        });
    });

    socket.on('send_img', data => {
        const {
            type, msgType, message, memberInfo 
        } = data;
        console.log(data);

        //메세지 데이터 몽고디비 저장
        const chat = new Chat({
            chatNo: data.memberInfo.chatNo,
            chatMemberId: data.memberInfo.memberId,
            chatMemberName: data.memberInfo.nickname,
            chatMemberImg: data.memberInfo.profileImage,
            msg: data.message
        });

        chat.save(function(err, data){
            if(err){
                console.log("error");
            }else{
                console.log("채팅 내용 저장");
            }
        });

        //받은 메세지 모든 접속자에게 뿌려줌
        io.emit('send_img', {
            message,
            memberInfo,
            regDate: moment(new Date()).format("MM-DD h:mm A")
        });
    });

    socket.on('bomb_msg', data => {
        //console.log("폭파?");
        console.log(data.chatNo);
        io.emit('bomb_msg', {
            chatNo : data.chatNo
        });
    });

    socket.on('get_out_msg', data => {
        //console.log("강퇴?");
        //console.log(data);
        io.emit('get_out_msg', {
            chatNo : data.memberInfo.chatNo,
            getOutId : data.getOutId
        });
    });

    //접속 종료시
    socket.on('disconnect', () => {

        console.log(socket.memberId+'님이 접속을 종료하였습니다::');

        socket.broadcast.emit('update', {
            type: 'disconnect',
            name: 'SERVER',
            chatNo : socket.chatNo,
            memberId : socket.memberId,
            message: socket.nickname + '님이 접속을 종료하였습니다.'
        });

        io.emit('on_users', user_arr);
    });
});

//서버 페이지를 get방식, /경로로 요청 했을 때(기본 첫 페이지)
app.get('/', (req, res) => {
    res.send('Hello Express');
});

//server는 listen 메서드 통해 3000번 포트를 사용한다.
server.listen(3000, () => {
    //콘솔창에 출력
    console.log('listening on *:3000');
});

app.use(cors());
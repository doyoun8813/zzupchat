//노드 서버 프레임 워크
const express = require('express');
//log 기록하는 3rd-part lib
const morgan = require('morgan');
//express 세션 관리 미들웨어
const session = require('express-session');
//시간 표시 lib
const moment = require("moment");
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

dotenv.config({path:".env"});
mongoose.connect(process.env.MONGODB_URL);
let db = mongoose.connection;

db.on('error', () =>{
    console.log("DB Connection Failed!");
});

db.on('open', () =>{
    console.log("DB Connected!");
});

//접속자 카운트
let count = 0;
let user_id = 0;
let user_name = "";
let All_USER = [];

//소켓에 접속하면..
io.on('connection', socket => {
    count++;
    user_id++;
    console.log("NEW USER CONNECT ("+user_id+")");
    All_USER.push({"user_id":user_id, "user_name":""});  

    //클라이언트에서 접속시 보내는 name 정보 받음
    socket.on('name', (data) => {
        const name = data;
        user_name = data;
        console.log(user_name+"님이 입장하셨습니다.");

        //다시 클라이언트로 보냄
        io.emit('send_user_id',{
            user_name,
            user_id
        });
    });

    socket.on('connect_name', (data) => {
        const { name, user_id } = data;
        console.log(data);
        All_USER.forEach(function(element, index){
            if(element.user_id == data.user_id){
                element.user_name = data.name;
            }
        });
        console.log(All_USER);
        sendAllUsers();
    });

    //전체 사용자 정보 보냄
    function sendAllUsers(){
        All_USER.forEach(function(element, index){
            socket.emit('all_users', All_USER);
        });
    }    

    //console.log(user_id+'님이 입장하셨습니다.', socket.id);
    console.log("현재 접속자수 : " + count);

    socket.on('disconnect', () => {
        count--;
        user_id--;
        console.log(user_id+'님이 퇴장하셨습니다. ::', socket.id);
        console.log("현재 접속자수 : " + count);
        All_USER.splice(user_id-1,1);
        console.log("out All_USER : " + JSON.stringify(All_USER));
    });

    socket.on('send_msg', (data) => {
        const { room, name, msg } = data;
        console.log(data);

        // const newChat = new ChatTest(data);
        // newChat.save();

        io.emit('send_msg', {
            name,
            msg,
            time: moment(new Date()).format("h:mm A")
        });
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
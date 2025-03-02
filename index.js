const express = require('express');
const handlebars = require('express-handlebars');
const socketIo = require('socket.io');
const http = require('http');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const { param } = require('express/lib/request');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', (socket) => {
    console.log('Новое подключение!');
    
    socket.on('move', (moveObj) => {
        console.log(moveObj);
    });

});

const host = 'localhost';
const port = 7000;

app.engine(
    'handlebars',
    handlebars.engine({ defaultLayout: 'main' })
);
app.set('views', './views');
app.set('view engine', 'handlebars');
app.use(express.static(`${__dirname}/assets`));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

class Lobby{
    constructor(){
        this.players = [];
        this.countPlayers = 0;
    }

    isPlayerIn(username){
        for (let i = 0; i < this.players.length; i++) {
            if(this.players[i] == username){
                return true;
            }
        }
        return false;
    }

    isFull(){
        return this.countPlayers < 2; // пока 2 для теста
    }

    addPlayer(username){
        if (this.isPlayerIn(username)) throw new Error('already have that player');
        if(this.isFull()) throw new Error('too much players');
        this.players.push(username);
        this.countPlayers++;
    }
};

const lobby = new Lobby();

app.get('/', (req, res) => {
    if(req.cookies.username === undefined){
        res.redirect('/login');
        return;
    }

    try{
        lobby.addPlayer(req.cookies.username);
    }
    catch(e){
        console.error(e.message);
    }

    console.table(lobby.players);

    res.render('home', {username: req.cookies.username});
});

app.get('/login', (req, res) => {
    let params = {
        styles: ['login.css']
    }
    res.render('login', params);
});

app.post('/login', (req, res) => {
    let name;
    console.log(`POST запрос`);
    console.table(req.body);
    if (req.body !== undefined && req.body.username !== undefined){
        name = req.body.username;
        res.cookie('username', name, {maxAge: 3600000 }); // время жизни куки - 1 час
    }
    res.redirect('/');
});

server.listen(port, host, () => {
    console.log(`Сервак пашет на http://${host}:${port}`);
});
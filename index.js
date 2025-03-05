const express = require('express');
const handlebars = require('express-handlebars');
const socketIo = require('socket.io');
const http = require('http');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const { param } = require('express/lib/request');
const { monitorEventLoopDelay } = require('perf_hooks');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', (socket) => {
    console.log('Новое подключение!');
    
    socket.on('move', (moveObj) => {
        io.emit('move', moveObj);
    });

    socket.on('getLobby', () => {
        io.emit('setLobby', lobby.players, lobby.hostPlayer);
    });

    socket.on('exitFromLobby', (name) => {
        console.log(`request to exit from ${name}`)
        lobby.removePlayer(name);
        io.emit('setLobby', lobby.players, lobby.hostPlayer);
    });

    socket.on('startGame', () => {
        io.emit('startGame');
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
        this.hostPlayer = null;
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
        return this.players.length >= 2; // пока 2 для теста
    }

    isEmpty(){
        return this.players.length == 0;
    }

    addPlayer(username){
        if (this.isPlayerIn(username)) throw new Error('already have that player');
        if(this.isFull()) throw new Error('too much players');

        if(this.isEmpty()) this.hostPlayer = username;
        this.players.push(username);
        // хост - первый зашедший в лобби
    }

    removePlayer(username){
        if(username === undefined) throw new Error('undefined deleted player')
        this.players = this.players.filter(name => name !== username);

        // если удалили хоста и есть кем его заменить - сделать это
        if(username == this.hostPlayer && !this.isEmpty()) this.hostPlayer = this.players[0];
        // если список игроков опустел - хоста нет
        else if (this.isEmpty()) this.hostPlayer = null;
        // иначе - хост в порядке
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
        res.redirect('/lobby');
        return;
    }
    catch(e){
        console.error(e.message);
    }
});

app.get('/game', (req, res) => {
    let params = {
        username: req.cookies.username
    }
    res.render('home', {username: req.cookies.username});
});

app.get('/login', (req, res) => {
    let params = {
        styles: ['login.css']
    }
    res.render('login', params);
});

app.get('/lobby', (req, res) => {
    let params = {
        styles: ['lobby.css'],
        me: req.cookies.username,
    }
    res.render('lobby', params);
});


app.post('/login', (req, res) => {
    let name;
    if (req.body !== undefined && req.body.username !== undefined){
        name = req.body.username;
        res.cookie('username', name); // время жизни куки - 1 час
    }
    res.redirect('/');
});

app.get('/exit', (req, res) => {
    try{
        lobby.removePlayer(req.cookies.username);
    }
    catch(e){
        console.error(e.message);
    }
    res.clearCookie('username');
    res.redirect('/');
});

server.listen(port, host, () => {
    console.log(`Сервак пашет на http://${host}:${port}`);
});
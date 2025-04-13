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
const connections = {};

io.on('connection', (socket) => {
    console.log(`Новое подключение! ${socket.id}`);
    connections[socket.id] = socket;
    
    

    socket.on('move', (moveObj) => {
        console.log(`move from ${moveObj.username} to [${moveObj.xTo}, ${moveObj.yTo}]`);
        console.table(moveObj);
        try{
            const opponent = lobby.getPlayersOpponent(moveObj.username);
            const opponentSocket = lobby.getPlayerWithUsername(opponent).socket;

            // чтобы на перевернутой доске оппонента шашки были на верных местах
            // меняем координаты для оппонента
            const opponentMoveObj = { // username клиенту не нужен
                xFrom: 7 - moveObj.xFrom,
                yFrom: 7 - moveObj.yFrom,
                xTo: 7 - moveObj.xTo,
                yTo: 7 - moveObj.yTo,
            }
            opponentSocket.emit('move', opponentMoveObj);
        }
        catch(e){
            console.error(e.message);
        }
    });

    socket.on('getLobby', () => {
        io.emit('setLobby', lobby.getPlayersUsernames(), lobby.hostPlayer);
    });

    socket.on('getPairs', () => {
        io.emit('setPairs', lobby.pairs);
    });

    socket.on('exitFromLobby', (name) => {
        console.log(`request to exit from ${name}`)
        try{
            lobby.removePlayer(name);
        } catch(ex){
            console.error(ex.message);
        }
        io.emit('setLobby', lobby.getPlayersUsernames(), lobby.hostPlayer);
    });

    // запрос на начало игры
    socket.on('startGame', () => {
        io.emit('startGame');
    });

    // запрос на привязку текущего сокета к игроку для обработки мультиплеерных запросов
    socket.on('startingGame', (username) => {
        try{
            console.log(`player ${username} requested to start game`);
            const player = lobby.getPlayerWithUsername(username);
            player.setSocket(socket);
            console.log(`player ${username} is ready to play`);
        }
        catch(e){
            console.error(e.message);
            socket.emit('error', e.message);
            socket.disconnect();
        }
    });

    socket.on('pairClick', (name) => {
        console.log(`request to pair with ${name}`)
        console.table(lobby.pairs);
        try{
            lobby.addToPair(name);
            io.emit('setPairs', lobby.pairs);

            if(lobby.arePairsFull()){
                io.emit('canStartGame', lobby.hostPlayer);
            }
        }
        catch(e){
            console.error(e.message);
        }
    })

    socket.on('disconnect', () => {
        console.log(`Отключение! ${socket.id}`);
        delete connections[socket.id];
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

class Player{
    constructor(name){
        this.name = name;
        this.isHost = false;
        this.socket = null;
    }

    setSocket(socket){
        this.socket = socket;
    }
}

class Lobby{
    constructor(){
        this.players = [];
        this.hostPlayer = null;
        this.pairs = [];
        this.maxPairs = 1;  //2; пока что 1 пара
        // создание пустых пар
        for (let i = 0; i < this.maxPairs; i++) {
            this.pairs.push([]);
        }
    }

    getPlayerWithUsername(username){
        let player = this.players.find(player => player.name === username)
        if(player) return player;
        throw new Error('no such player');
    }

    isPlayerIn(username) {
        return this.players.some(player => player.name === username);
    }

    getPlayersOpponent(username){
        if (!this.isPlayerIn(username)) throw new Error('no such player');
        for (let i = 0; i < this.pairs.length; i++) {
            if(this.pairs[i][0] == username){
                return this.pairs[i][1];
            }
            if(this.pairs[i][1] == username){
                return this.pairs[i][0];
            }
        }
        throw new Error('no opponent');
    }

    getPlayersUsernames(){
        let usernames = [];
        for (let i = 0; i < this.players.length; i++) {
            usernames.push(this.players[i].name);
        }
        return usernames;
    }

    isFull(){
        return this.players.length >= 2; // пока 2 для теста
    }

    isEmpty(){
        return this.players.length == 0;
    }

    arePairsFull() {
        return this.pairs.every(pair => pair.length === 2);
    }

    addToPair(username){
        if(this.pairs.length > this.maxPairs) throw new Error('too much pairs');

        // проверка вхождения username в пары
        for (let i = 0; i < this.pairs.length; i++) {
            if(this.pairs[i].includes(username)){
                throw new Error('already in pair');
            }
        }

        for (let i = 0; i < this.pairs.length; i++) {
            if(this.pairs[i].length < 2){
                this.pairs[i].push(username);
                return;
            }
        }
        throw new Error('no empty pairs');
    }

    removeFromPair(username){
        for (let i = 0; i < this.pairs.length; i++) {
            if(this.pairs[i].length == 2){
                if(this.pairs[i][0] == username){
                    this.pairs[i].shift();
                    return;
                }
                if(this.pairs[i][1] == username){
                    this.pairs[i].pop();
                    return;
                }
            }
        }
    }

    addPlayer(username){
        if (this.isPlayerIn(username)) throw new Error('already have that player');
        if(this.isFull()) throw new Error('too much players');

        let player = new Player(username);
        if(this.isEmpty()) {
            this.hostPlayer = username;
            player.isHost = true;
        }
        this.players.push(player);
        // хост - первый зашедший в лобби
    }

    removePlayer(username) {
        if (username === undefined) throw new Error('undefined deleted player');
        if (!this.isPlayerIn(username)) throw new Error('no such player');
        // Фильтруем массив игроков, исключая игрока с указанным именем
        this.players = this.players.filter(player => player.name !== username);
        
        // Игрок не может занимать пару после выхода из лобби
        this.removeFromPair(username);
        
        // Если удалили хоста и есть кем его заменить - сделать это
        if (username === this.hostPlayer && !this.isEmpty()) {
            this.hostPlayer = this.players[0].name;
        }
        // Если список игроков опустел - хоста нет
        else if (this.isEmpty()) {
            this.hostPlayer = null;
        }
        // Иначе - хост в порядке
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
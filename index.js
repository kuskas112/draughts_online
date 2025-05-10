const { SerializablePlayField } = require('./game.js');
const { Lobby, Pair, Player } = require('./LobbyClasses.js');
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
const host = 'localhost';
const port = 7000;
const lobby = new Lobby();


io.on('connection', (socket) => {
    console.log(`Новое подключение! ${socket.id}`);
    connections[socket.id] = socket;
    
    socket.on('move', (moveObj) => {
        console.log(`move from ${moveObj.username} to [${moveObj.xTo}, ${moveObj.yTo}]`);
        try {
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

            // Поиск пары с ходящим игроком,
            // совершение хода в SerializablePlayField на сервере, для сохранения
            // игровой ситуации после перезагрузки
            const pf = lobby.pairs.find(pair => pair.isIn(moveObj.username)).playfield;
            let xFrom = moveObj.xFrom, yFrom = moveObj.yFrom, xTo = moveObj.xTo, yTo = moveObj.yTo;
            // если ходили черные - надо "перевернуть" доску
            if (moveObj.checkerColor === 'black'){
                xFrom = 7 - moveObj.xFrom;
                yFrom = 7 - moveObj.yFrom;
                xTo = 7 - moveObj.xTo;
                yTo = 7 - moveObj.yTo;
            }
            pf.makeMove(xFrom, yFrom, xTo, yTo);
            pf.printCheckersBoard();
        }
        catch(ex){
            console.error(ex.message);
        }

    });

    socket.on('getLobby', () => {
        io.emit('setLobby', lobby.getPlayersUsernames(), lobby.hostPlayer);
    });

    socket.on('getPairs', () => {
        let serializablePairs = lobby.pairs.map(pair => pair.players);
        io.emit('setPairs', serializablePairs);
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

            lobby.pairs.forEach(pair => {
                if(pair.isIn(username)){
                    pair.setPlayfield(new SerializablePlayField());
                }
            });
            console.log(`player ${username} is ready to play`);
        }
        catch(e){
            console.error(e.message);
            socket.emit('error', e.message);
            socket.disconnect();
        }
    });

    socket.on('pairClick', (name) => {
        console.log(`request to pair from ${name}`)
        console.table(lobby.pairs);
        try{
            lobby.addToPair(name);
            io.emit('setPairs', lobby.pairs.map(pair => pair.players));

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


// ROOTS
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
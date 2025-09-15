import { SerializablePlayField } from '../SerializablePlayField.js';
import { Lobby, Pair, Player } from '../assets/js/LobbyClasses.js';
import express from 'express';
import handlebars from 'express-handlebars';
import { Server } from 'socket.io';
import http from 'http';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import pkg from 'express/lib/request.js';
const { param } = pkg;
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { pathToFileURL } from 'url';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';

const app = express();
const server = http.createServer(app);
const io = new Server(server);  // Изменено на new Server()
const connections = {};
const host = 'localhost';
const port = 3000;
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
            if (moveObj.cellEated !== null) {
                pf.removeChecker(moveObj.cellEated[0], moveObj.cellEated[1]);
            }
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

    socket.on('getPlayField', () => {
        const player = lobby.getPlayerBySocket(socket);
        const pf = lobby.pairs.find(pair => pair.isIn(player.name)).playfield;
        socket.emit('setPlayField', pf);
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
        console.log(`request to pair from ${name}`)
        console.table(lobby.pairs);
        try{
            lobby.addToPair(name);
            io.emit('setPairs', lobby.pairs.map(pair => pair.players));

            if(lobby.arePairsFull()){
                lobby.pairs.forEach(pair => pair.setPlayfield(new SerializablePlayField()));
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
app.use(express.static(path.join(__dirname, '../assets')));
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


import { userService } from '../tscompiled/services/UserService.js'; 

// ROUTES
app.post('/api/login', (req, res) => {
    console.log(req.body);
    if(req.body.action !== 'login'){
        res.json({success: false});
        return;
    }
    let hashedPassword = req.body.password; //bcrypt.hashSync(req.body.password, 10);
    console.log(`Хешированный пароль: ${hashedPassword}`);
    const user = {
        name: req.body.username,
        password: hashedPassword,
    };
    userService.createUser(user).then((result) => {
        res.json({
            success: true,
            data: req.body,
        });
    });
    // if (req.body !== undefined && req.body.username !== undefined){
    //     name = req.body.username;
    //     res.cookie('username', name); // время жизни куки - 1 час
    // }
});

// ВАЖНО
// Этот обработчик должен идти после всех определений роутов
if (!isProduction) {
    const vite = await createViteServer({
        server: { middlewareMode: 'html' },
    });

    // Используем Vite как middleware
    app.use(vite.middlewares);
} else {
    // В production используем собранные файлы
    app.use(express.static('dist-public'));
}

// app.get('/game', (req, res) => {
//     let params = {
//         username: req.cookies.username
//     }
//     res.render('home', {username: req.cookies.username});
// });

// app.get('/api/login', (req, res) => {
//     let params = {
//         styles: ['login.css']
//     }
//     res.render('login', params);
// });

// app.get('/lobby', (req, res) => {
//     let params = {
//         styles: ['lobby.css'],
//         me: req.cookies.username,
//     }
//     res.render('lobby', params);
// });



// app.get('/exit', (req, res) => {
//     try{
//         lobby.removePlayer(req.cookies.username);
//     }
//     catch(e){
//         console.error(e.message);
//     }
//     res.clearCookie('username');
//     res.redirect('/');
// });


// Проверка, запущен ли файл напрямую (а не импортирован)
const isMainModule = import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
    server.listen(port, host, () => {
        console.log(`Сервак пашет на http://${host}:${port}`);
    });
}

export { app };
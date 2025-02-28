const express = require('express');
const handlebars = require('express-handlebars');
const socketIo = require('socket.io');
const http = require('http');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const host = '192.168.155.80';
const port = 7000;

app.engine(
    'handlebars',
    handlebars.engine({ defaultLayout: 'main' })
);
app.set('views', './views');
app.set('view engine', 'handlebars');

app.get('/', (req, res) => {
    var params = {
        header: 'Кранты...'
    };
    
    res.render('home', params);
});

server.listen(port, host, () => {
    console.log(`Сервак пашет на http://${host}:${port}`);
});
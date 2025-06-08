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
class Pair{
    constructor(){
        this.players = [];
        this.playfield = null;
    }

    setPlayfield(serializablePlayField){
        this.playfield = serializablePlayField;
    }

    addPlayer(username){
        if(this.players.length == 2) throw new Error('too much players in pair');
        if(this.players.includes(username)) throw new Error('already in pair');
        this.players.push(username);
    }

    removePlayer(username){
        if(!this.isIn(username)) throw new Error('no such player in pair');
        if(this.players.length == 2){
            if(this.players[0] == username){
                this.players.shift();
                return;
            }
            if(this.players[1] == username){
                this.players.pop();
                return;
            }
        }
    }

    isIn(username){
        return this.players.includes(username);
    }

    isFull(){
        return this.players.length == 2;
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
            this.pairs.push(new Pair());
        }
    }

    getPlayerWithUsername(username){
        let player = this.players.find(player => player.name === username)
        if(player) return player;
        throw new Error('no such player');
    }

    getPlayerBySocket(socket){
        let player = this.players.find(player => player.socket === socket)
        if(player) return player;
        throw new Error('no such player');
    }

    isPlayerIn(username) {
        return this.players.some(player => player.name === username);
    }

    getPlayersOpponent(username){
        if (!this.isPlayerIn(username)) throw new Error('no such player');
        for (let i = 0; i < this.pairs.length; i++) {
            if(this.pairs[i].players[0] == username){
                return this.pairs[i].players[1];
            }
            if(this.pairs[i].players[1] == username){
                return this.pairs[i].players[0];
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
        return this.players.length >= this.maxPairs * 2; // пока 2 для теста
    }

    isEmpty(){
        return this.players.length == 0;
    }

    arePairsFull() {
        return this.pairs.every(pair => pair.isFull());
    }

    addToPair(username){
        if(this.pairs.length > this.maxPairs) throw new Error('too much pairs');

        // проверка наличия username в парах
        const isPlayerInPairs = this.pairs.some(pair => pair.isIn(username));
        if (isPlayerInPairs) {
            throw new Error('already in pair');
        }

        let isPaired = false;
        // добавление username в пару
        this.pairs.forEach(pair => {
            if(!pair.isFull()){
                pair.addPlayer(username);
                isPaired = true;
                return;
            }
        })

        if (!isPaired) throw new Error('no empty pairs');
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

    removeFromPair(username){
        this.pairs.forEach(pair => {
            if(pair.isIn(username)) pair.removePlayer(username);
        })
    }
};

export { Lobby, Pair, Player };
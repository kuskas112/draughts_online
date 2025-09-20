class Player{
    constructor(id, username){
        this.id = id;
        this.name = username;
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

    addPlayer(player){
        if(this.players.length == 2) throw new Error('too much players in pair');
        if(this.isIn(player.id)) throw new Error('already in pair');
        this.players.push(player);
    }

    removePlayer(playerId){
        if(!this.isIn(playerId)) throw new Error('no such player in pair');
        if(this.players.length == 2){
            if(this.players[0].id == playerId){
                this.players.shift();
                return;
            }
            if(this.players[1].id == playerId){
                this.players.pop();
                return;
            }
        }
    }

    isIn(playerId){
        return this.players.some(inPlayer => inPlayer.id == playerId)
    }

    isFull(){
        return this.players.length >= 2;
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

    isPlayerIn(playerId) {
        return this.pairs.some(pair => pair.isIn(playerId));
    }

    getPlayerById(playerId){
        let player = this.players.find(player => player.id === playerId)
        if(player) return player;
        throw new Error('no such player');
    }

    getPlayersOpponent(playerId){
        const player = this.getPlayerById(playerId);
        for (let i = 0; i < this.pairs.length; i++) {
            if(this.pairs[i].players[0] == player.id){
                return this.pairs[i].players[1];
            }
            if(this.pairs[i].players[1] == player.id){
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

    addToPair(player){
        if(this.pairs.length > this.maxPairs) throw new Error('too much pairs');

        // проверка наличия player в парах
        const isPlayerInPairs = this.pairs.some(pair => pair.isIn(player.id));
        if (isPlayerInPairs) {
            throw new Error('already in pair');
        }

        let isPaired = false;
        // добавление player в пару
        this.pairs.forEach(pair => {
            if(!pair.isFull()){
                pair.addPlayer(player);
                isPaired = true;
                return;
            }
        })

        if (!isPaired) throw new Error('no empty pairs');
    }

    addPlayer(player){
        if (this.isPlayerIn(player.id)) throw new Error('already have that player');
        if(this.isFull()) throw new Error('too much players');

        if(this.isEmpty()) {
            this.hostPlayer = player.id;
            player.isHost = true;
        }
        this.players.push(player);
        // хост - первый зашедший в лобби
    }

    removePlayer(playerId) {
        if (playerId === undefined) throw new Error('undefined deleted player');
        if (!this.isPlayerIn(playerId)) throw new Error('no such player');
        // Фильтруем массив игроков, исключая игрока с указанным id
        this.players = this.players.filter(player => player.id !== playerId);
        
        // Игрок не может занимать пару после выхода из лобби
        this.removeFromPair(playerId);
        
        // Если удалили хоста и есть кем его заменить - сделать это
        if (username === this.hostPlayer && !this.isEmpty()) {
            this.hostPlayer = this.players[0].id;
        }
        // Если список игроков опустел - хоста нет
        else if (this.isEmpty()) {
            this.hostPlayer = null;
        }
        // Иначе - хост в порядке
    }

    removeFromPair(playerId){
        this.pairs.forEach(pair => {
            if(pair.isIn(playerId)) pair.removePlayer(playerId);
        })
    }
};

export { Lobby, Pair, Player };
class MoveInfo{
    constructor(cellFrom, cellTo){
        this.cellFrom = cellFrom;
        this.cellTo = cellTo;
        this.cellEated = null; // клетка с шашкой, которую планируется съесть
    }
}

class PlayField{
    constructor(){
        this.cells = [];                    // поля игровой доски
        this.currentMove = 'white';         // кто сейчас ходит
        this.selectedChecker = null;        // выбранная для хода шашка
        this.isCapturingObligation = true;  // необходимость съесть шашку противника при возможности
        this.highlightedCells = null;       // подсвечиваемые клетки поля (находятся под угрозой съедения)
        this.remainingCheckers = {
            'white': 12,
            'black': 12
        };

        // заполнение поля игровой доски
        for (let y = 0; y < 8; y++) {
            this.cells[y] = [];
            for (let x = 0; x < 8; x++) {
                if ((x + y) % 2 == 1) {
                    this.cells[y][x] = new Cell(x, y, this);
                }
                else {
                    this.cells[y][x] = null;
                }
            }
        }
        // размещение шашек
        for (let y = 0; y < 3; y++) {
            for (let x = 0; x < 8; x++) {
                if (this.cells[y][x] != null) {
                    this.cells[y][x].setChecker(new Checker('black', x, y, this));
                }
            }
        }
        for (let y = 5; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                if (this.cells[y][x] != null) {
                    this.cells[y][x].setChecker(new Checker('white', x, y, this));
                }
            }
        }
    }

    setSocket(socket){
        this.socket = socket;
        this.socket.on('move', (checkerData) => {
            let xFrom = checkerData.xFrom;
            let yFrom = checkerData.yFrom;
            let cellFrom = this.cells[yFrom][xFrom];
            let checker = cellFrom.checker;

            let xTo = checkerData.xTo;
            let yTo = checkerData.yTo;
            let cellTo = this.cells[yTo][xTo];

            try{
                this.makeMove(checker, cellTo);
            }
            catch(e){
                console.error(e.message);
            }
        });
    }

    /**
     * 
     * Совершение хода и его обработка
     * 
     * @param {Checker} checkerFrom - Идущая шашка
     * @param {Cell} cellTo - Клетка назначения
     * @returns {void}
     */
    makeMove(checkerFrom, cellTo){
        // перед отправкой хода проверяем его валидность и делаем его
        let moveInfo = checkerFrom.goTo(cellTo);
        let cellEated = moveInfo.cellEated;

        if(this.highlightedCells != null && this.highlightedCells.length > 0){ 
            // если были шашки противника под угрозой, но они не были съедены
            if(!cellEated) throw new Error('Required checker hasnt been eated');
            this.highlightedCells.forEach(cell => cell.removeHighLight());
        }
        this.highlightedCells = [];

        // совершение хода
        moveInfo.cellFrom.removeChecker();
        checkerFrom.x = cellTo.x;
        checkerFrom.y = cellTo.y;
        moveInfo.cellTo.setChecker(checkerFrom);
        if (cellTo.y == 0 || cellTo.y == 7) checkerFrom.activateQueenMode();

        if(!cellEated) this.changeMove();
        else{
            this.remainingCheckers[cellEated.checker.color]--;
            cellEated.removeChecker();
            this.highlightedCells = checkerFrom.checkForEatableCells();
            // ход переходит только если больше нечего есть
            if(this.highlightedCells.length == 0) this.changeMove();
            else{
                this.highlightedCells.forEach(innerCell => {
                    innerCell.highLightMe();
                });
            }
            
        }
    }

    changeMove(){
        this.currentMove = this.currentMove == 'white' ? 'black' : 'white';
        // проход по ВСЕМ клеткам игрового поля и проверка на необходимость поедания
        // шашки противника
        // заодно проверяется - остались ли у игрока возможные ходы
        let isMovesRemaining = false;
        for(let y = 0; y < this.cells.length; y++){
            for(let x = 0; x < this.cells.length; x++){
                let cell = this.cells[y][x];
                if(cell == null) continue;
                if(cell.checker == null) continue;
                if(cell.checker.color != this.currentMove) continue;
                let eatableCells = cell.checker.checkForEatableCells();
                if(eatableCells.length > 0){
                    isMovesRemaining = true;
                    eatableCells.forEach(innerCell => {
                        innerCell.highLightMe();
                        this.highlightedCells.push(innerCell);
                        // найденные кандидаты на съедение в массив highlightedCells
                    });
                }
                //TODO: доделать проверку на возможность хода
            }
        }
    }
}

class Cell{
    constructor(x, y, playField, checker = null){
        if (!this.inBounds(x, y)) throw new Error('invalid cell coordinates');
        this.x = x;
        this.y = y;
        this.pf = playField;
        this.checker = checker;
    }

    setChecker(checker){
        if(this.checker !== null) this.removeChecker();
        this.checker = checker;
    }

    removeChecker(){
        this.checker = null;
    }

    inBounds(x, y){
        return x >= 0 && y >= 0 && x < 8 && y < 8;
    }

    highLightMe(){
        this.highlihted = true;
    }

    removeHighLight(){
        this.highlihted = false;
    }
}

class Checker {
    constructor(color, i, j, playField){
        if (!this.inBounds(j, i)) throw new Error('invalid checker coordinates');
        this.color = color;
        this.x = i;
        this.y = j;
        this.pf = playField;
        this.isQueen = false;
    }

    highLightMe(){
        this.highlihted = true;
    }
    removeHighLight(){
        this.highlihted = false;
    }

    // Лежит ли поле на одной диагонали с шашкой и черное ли оно
    checkFieldForMove(x, y){
        return Math.abs(x - this.x) === Math.abs(y - this.y) && (x + y) % 2 != 0;
    }

    inBounds(x, y){
        return x >= 0 && y >= 0 && x < 8 && y < 8;
    }

    // проверка на возможность съесть шашку
    // вокруг текущей
    // возвращает массив клеток с шашками которые можно съесть
    checkForEatableCells(){
        let x = this.x;
        let y = this.y;
        let eatableCells = [];
        let directions = {
            leftUp: {x: -1, y: -1},
            rightUp: {x: 1, y: -1},
            leftDown: {x: -1, y: 1},
            rightDown: {x: 1, y: 1}
        };
        let maxDistance = this.isQueen ? 6 : 1;
        for(let i = 1; i <= maxDistance; i++){
            for(let dir in directions){
                let newX = x + directions[dir].x * i;
                let newY = y + directions[dir].y * i;
                if(!this.inBounds(newX, newY)) continue;
                let cell = this.pf.cells[newY][newX];
                if(cell.checker == null) continue;
                if(cell.checker.color == this.color) continue;
                // код ниже сработает если была найдена шашка противника
                let nextX = x + directions[dir].x * (i + 1);
                let nextY = y + directions[dir].y * (i + 1);
                if(!this.inBounds(nextX, nextY)) continue;
                let nextCell = this.pf.cells[nextY][nextX];
                if(nextCell.checker != null) continue;
                eatableCells.push(cell);
            }
        }
        return eatableCells;
    }

    // метод для перемещения шашки на другую клетку
    // не проверяет цвет шашки, которой ходит игрок.
    // Возвращает объект moveInfo
    goTo(cell){
        let x = cell.x;
        let y = cell.y;
        
        if(this.pf.currentMove != this.color) throw new Error('Not your move');
        if(!this.checkFieldForMove(x, y) || !this.inBounds(x, y)) throw new Error('Not valid move');
        if (this.pf.cells[y][x].checker != null) throw new Error('Theres already another checker');
        if (this.pf.cells[this.y][this.x].checker == null) throw new Error('Current cell is empty');

        let distance = this.y - y; // дистанция хода. Больше нуля - вверх, меньше - вниз
        if (distance == 0) throw new Error('0 distance move');
        if (!this.isQueen && distance > 2) throw new Error('Too far move for not-a-queen checker');
        if (
            (!this.isQueen && distance == -1 && this.color == 'white') || 
            (!this.isQueen && distance == 1 && this.color == 'black') // проверка на ход назад
        ) throw new Error('Cant go back if not a queen');

        let oldCell = this.pf.cells[this.y][this.x]; // клетка, на которой текущая шашка
        let moveInfo = new MoveInfo(oldCell, cell); // информация о ходе

        if (Math.abs(distance) > 1){ // либо ходит дамка, либо кого то щас съедят, либо и то и то
            let xSign = Math.sign(x - this.x); // получаем знаки для координатных осей
            let ySign = Math.sign(y - this.y);
            let eatenCell = null; // клетка с шашкой, которую планируется съесть
            for(let i = 1; i <= Math.abs(distance); i++){
                // одна из клеток на диагонали поедания
                let newX = this.x + i * xSign;
                let newY = this.y + i * ySign;

                let innerCell = pf.cells[newY][newX];
                if (innerCell.checker == null) continue;
                if (innerCell.checker.color == oldCell.checker.color) throw new Error('cant eat your checkers');
                if (eatenCell != null) throw new Error('cant eat more then 1 checker at a time');
                eatenCell = innerCell;
            }
            // если был ход на дистанцию 2, там не было что есть, а шашка не дамка
            if (eatenCell == null && !this.isQueen) throw new Error('too far move for not-a-queen checker');
            if(eatenCell){
                moveInfo.cellEated = eatenCell;
            }
        }
        return moveInfo;
    }

    activateQueenMode(){
        this.isQueen = true;
    }

    disableQueenMode(){
        this.isQueen = false;
    }
}

module.exports = { PlayField, Checker, Cell, MoveInfo };
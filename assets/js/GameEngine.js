const CHECKER_BLACK_COLOR = 'b';
const CHECKER_WHITE_COLOR = 'w';

// класс, объекты которого содержат информацию о совершенном ходе
class MoveInfo{
    constructor(cellFrom, cellTo){
        this.cellFrom = cellFrom;
        this.cellTo = cellTo;
        this.cellEated = null; // клетка с шашкой, которую планируется съесть
    }
}

class PlayField{
    constructor(){
        this.cells = [];                        // поля игровой доски
        this.currentMove = CHECKER_WHITE_COLOR; // кто сейчас ходит
        this.isCapturingObligation = true;      // необходимость съесть шашку противника при возможности
        this.remainingCheckers = {
            'white': 12,
            'black': 12
        };
    }

    // совершение хода и его обработка
    // возвращает объект MoveInfo
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
        return moveInfo;
    }

    changeMove(){
        this.currentMove = this.currentMove == CHECKER_WHITE_COLOR ? CHECKER_BLACK_COLOR : CHECKER_WHITE_COLOR;
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

    
    initGameField(){
        this.currentMove = CHECKER_WHITE_COLOR;
        // Игровое поле 8 на 8, заполненное null-ами
        this.cells = new Array(8).fill(null).map(() => new Array(8).fill(null));

        const CHECKER_BLACK_ROW = [0, 1, 2];
        const CHECKER_WHITE_ROW = [5, 6, 7];

        for (let y of CHECKER_BLACK_ROW) {
            for (let x = ((y+1) % 2); x < 8; x += 2) {
                this.setChecker(x, y, CHECKER_BLACK_COLOR);
            }
        }

        for (let y of CHECKER_WHITE_ROW) {
            for (let x = ((y+1) % 2); x < 8; x += 2) {
                this.setChecker(x, y, CHECKER_WHITE_COLOR);
            }
        }
    }

    setChecker(x, y, color){
        this.cells[y][x] = new Checker(color, x, y);
    }

    removeChecker(x, y){
        this.cells[y][x] = null;
    }

    //TODO: поле из SerializablePlayField
}

class Checker {
    constructor(color, x, y){
        if (!this.inBounds(x, y)) throw new Error('invalid checker coordinates');
        if (color != CHECKER_WHITE_COLOR && color != CHECKER_BLACK_COLOR) throw new Error('invalid checker color');
        this.color = color;
        this.x = x;
        this.y = y;
        this.isQueen = false;
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
    // возвращает массив шашек которые можно съесть
    checkForEatableCheckers(cells){
        let x = this.x;
        let y = this.y;
        let eatableCheckers = [];
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
                let checker = cells[newY][newX];
                if(checker == null) continue;
                if(checker.color == this.color) continue;
                // код ниже сработает если была найдена шашка противника
                let nextX = x + directions[dir].x * (i + 1);
                let nextY = y + directions[dir].y * (i + 1);
                if(!this.inBounds(nextX, nextY)) continue;
                let nextChecker = cells[nextY][nextX];
                if(nextChecker != null) continue;
                eatableCheckers.push(checker);
            }
        }
        return eatableCheckers;
    }

    // метод для перемещения шашки на другую клетку
    // Возвращает объект moveInfo
    goTo(x, y, fieldCells){
        if(!this.checkFieldForMove(x, y) || !this.inBounds(x, y)) throw new Error('Not valid move');
        if (fieldCells[y][x] != null) throw new Error('Theres already another checker');
        if (fieldCells[this.y][this.x] == null) throw new Error('Current cell is empty');

        let distance = this.y - y; // дистанция хода. Больше нуля - вверх, меньше - вниз
        if (distance == 0) throw new Error('0 distance move');
        if (!this.isQueen && distance > 2) throw new Error('Too far move for not-a-queen checker');
        if (
            (!this.isQueen && distance == -1 && this.color == CHECKER_WHITE_COLOR) || 
            (!this.isQueen && distance == 1 && this.color == CHECKER_BLACK_COLOR) // проверка на ход назад
        ) throw new Error('Cant go back if not a queen');

        let moveInfo = new MoveInfo({x:this.x, y:this.y}, {x: x, y: y}); // информация о ходе

        if (Math.abs(distance) > 1){ // либо ходит дамка, либо кого то щас съедят, либо и то и то
            let xSign = Math.sign(x - this.x); // получаем знаки для координатных осей
            let ySign = Math.sign(y - this.y);
            let eatenCell = null; // клетка с шашкой, которую планируется съесть
            for(let i = 1; i <= Math.abs(distance); i++){
                // одна из клеток на диагонали поедания
                let newX = this.x + i * xSign;
                let newY = this.y + i * ySign;

                let innerCell = fieldCells[newY][newX];
                if (innerCell == null) continue;
                if (innerCell.color == oldCell.color) throw new Error('cant eat your checkers');
                if (eatenCell != null) throw new Error('cant eat more then 1 checker at a time');
                eatenCell = innerCell;
            }
            // если был ход на дистанцию 2, там не было что есть, а шашка не дамка
            if (eatenCell == null && !this.isQueen) throw new Error('too far move for not-a-queen checker');
            if(eatenCell){
                moveInfo.cellEated = eatenCell;
            }
        }
        this.x = x;
        this.y = y;
        return moveInfo;
    }

    activateQueenMode(){
        this.isQueen = true;
    }

    disableQueenMode(){
        this.isQueen = false;
    }
}

export { PlayField, Checker, CHECKER_BLACK_COLOR, CHECKER_WHITE_COLOR, MoveInfo };
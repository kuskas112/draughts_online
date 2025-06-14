import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { CHECKER_BLACK_COLOR, CHECKER_WHITE_COLOR } from './Constraints.js';

// класс, объекты которого содержат информацию о совершенном ходе
class MoveInfo{
    constructor(cellFrom, cellTo){
        this.cellFrom = cellFrom;
        this.cellTo = cellTo;
        this.checkerEated = null; // клетка с шашкой, которую планируется съесть
    }
}

class PlayField{
    constructor(){
        this.cells = [];
        this.initEmptyGameField();                        // поля игровой доски
        this.currentMove = CHECKER_WHITE_COLOR; // кто сейчас ходит
        this.isCapturingObligation = true;      // необходимость съесть шашку противника при возможности
        this.remainingCheckers = {
            [CHECKER_WHITE_COLOR]: 12,
            [CHECKER_BLACK_COLOR]: 12
        };
    }

    
    /**
     * Cовершение хода и его обработка
     * Возвращает объект MoveInfo
     * @param {Object} cellFrom - The starting position of the move.
     * @param {number} cellFrom.x - The x-coordinate of the starting position.
     * @param {number} cellFrom.y - The y-coordinate of the starting position.
     * @param {Object} cellTo - The destination position of the move.
     * @param {number} cellTo.x - The x-coordinate of the destination position.
     * @param {number} cellTo.y - The y-coordinate of the destination position.
     * @returns {MoveInfo} Information about the move.
     * @throws Will throw an error if the move is invalid.
     */
    makeMove(cellFrom, cellTo){
        // перед отправкой хода проверяем его валидность и делаем его
        let checkerFrom = this.cells[cellFrom.y][cellFrom.x];
        if(!checkerFrom) throw new Error('From cell is empty');
        if(checkerFrom.color != this.currentMove) throw new Error('It is not your turn');

        let eatableCheckers = checkerFrom.checkForEatableCheckers(this.cells);

        let moveInfo = checkerFrom.goTo(cellTo.x, cellTo.y, this.cells);
        let checkerEated = moveInfo.checkerEated;
        if(eatableCheckers.length > 0 && this.isCapturingObligation && !checkerEated) throw new Error('Required checker hasnt been eated');

        // совершение хода
        // после goTo в checkerFrom уже изменены координаты
        this.setChecker(checkerFrom);
        this.removeChecker(cellFrom.x, cellFrom.y);

        if (cellTo.y == 0 || cellTo.y == 7) checkerFrom.activateQueenMode();

        if(!checkerEated) this.changeMove();
        else{
            this.remainingCheckers[checkerEated.color]--;
            this.removeChecker(checkerEated.x, checkerEated.y);
            // ход переходит только если больше нечего есть
            let eatableCheckers = checkerFrom.checkForEatableCheckers(this.cells);
            if(eatableCheckers.length == 0) this.changeMove();
        }
        return moveInfo;
    }

    changeMove(){
        this.currentMove = this.currentMove == CHECKER_WHITE_COLOR ? CHECKER_BLACK_COLOR : CHECKER_WHITE_COLOR;
    }
    
    initEmptyGameField(){
        // Игровое поле 8 на 8, заполненное null-ами
        this.cells = new Array(8).fill(null).map(() => new Array(8).fill(null));
    }

    initGameField(){
        this.currentMove = CHECKER_WHITE_COLOR;
        this.initEmptyGameField();
        const CHECKER_BLACK_ROW = [0, 1, 2];
        const CHECKER_WHITE_ROW = [5, 6, 7];

        for (let y of CHECKER_BLACK_ROW) {
            for (let x = ((y+1) % 2); x < 8; x += 2) {
                this.setChecker(new Checker(CHECKER_BLACK_COLOR, x, y));
            }
        }

        for (let y of CHECKER_WHITE_ROW) {
            for (let x = ((y+1) % 2); x < 8; x += 2) {
                this.setChecker(new Checker(CHECKER_WHITE_COLOR, x, y));
            }
        }
    }

    hasChecker(x, y){
        if (x < 0 || y < 0 || x >= 8 || y >= 8) throw new Error('Checker coordinates are out of bounds');
        if (this.cells[y][x] != null){
            if (!(this.cells[y][x] instanceof Checker)) throw new Error('Checker cell is not a checker');
            let checker = this.cells[y][x];
            if (checker.x != x || checker.y != y) throw new Error('Checker has wrong coordinates');
            return true;
        }
        return false;
    }

    getChecker(x, y){
        return this.cells[y][x];
    }

    setChecker(checker){
        if (!(checker instanceof Checker)) {
            throw new Error('setChecker argument must be instance of Checker');
        }
        this.cells[checker.y][checker.x] = checker;
    }

    removeChecker(x, y){
        this.cells[y][x] = null;
    }

    // Prints the current state of the checkers board to the console.
    printPlayField() {
        const cells = this.cells;
        // Стили для консоли
        const styles = {
            black: 'color: white; background: black; padding: 2px 5px; border-radius: 3px;',
            white: 'color: black; background: white; padding: 2px 5px; border-radius: 3px; border: 1px solid #ccc;',
            empty: 'color: #999; background: #f0f0f0; padding: 2px 5px;',
            border: 'color: #333; font-weight: bold;'
        };
        
        // Верхняя граница таблицы
        console.log('%c   ┌───┬───┬───┬───┬───┬───┬───┬────┐', styles.border);
        
        // Проходим по каждой строке
        cells.forEach((row, rowIndex) => {
            let rowStr = '%c ' + (rowIndex) + ' │';
            
            // Проходим по каждой клетке в строке
            row.forEach((cell, colIndex) => {
            if (cell === null){
                rowStr += `%c · ${colIndex === row.length - 1 ? '' : '│'}`;
            } else if (cell.color === CHECKER_BLACK_COLOR) {
                rowStr += `%c ♔ ${colIndex === row.length - 1 ? '' : '│'}`;
            } else if (cell.color === CHECKER_WHITE_COLOR) {
                rowStr += `%c ♚ ${colIndex === row.length - 1 ? '' : '│'}`;
            } 
            });
        
            rowStr += '%c │';
            
            // Собираем аргументы для console.log
            const args = [rowStr, styles.border];
            row.forEach(cell => {
            if (cell === null){
                args.push(styles.empty);
            } else if (cell.color === CHECKER_BLACK_COLOR) {
                args.push(styles.black);
            } else if (cell.color === CHECKER_WHITE_COLOR) {
                args.push(styles.white);
            } 
            });
            args.push(styles.border);
            
            console.log.apply(console, args);
        
            // Горизонтальные разделители (кроме последней строки)
            if (rowIndex < cells.length - 1) {
                console.log('%c   ├───┼───┼───┼───┼───┼───┼───┼────┤', styles.border);
            }
        });
        
        // Нижняя граница таблицы
        console.log('%c   └───┴───┴───┴───┴───┴───┴───┴────┘', styles.border);
    }

    jsonify(){
        return JSON.stringify(this);
    }

    static fromJSON(jsonString){
        const data = JSON.parse(jsonString);
        const pf = plainToInstance(PlayField, data); 
        for (let i = 0; i < pf.cells.length; i++) {
            for (let j = 0; j < pf.cells.length; j++) {
                if(pf.cells[i][j] != null){
                    pf.setChecker(Checker.fromPlain(pf.cells[i][j]));
                }
            } 
        } 
        return pf;
    }
    
}

class Checker {
    constructor(color, x, y){
        if(!this.isCellBlack(x, y)) throw new Error('invalid checker cell');
        if (!this.inBounds(x, y)) throw new Error(`invalid checker coordinates ${x}, ${y}`);
        if (color != CHECKER_WHITE_COLOR && color != CHECKER_BLACK_COLOR) throw new Error('invalid checker color');
        this.color = color;
        this.x = x;
        this.y = y;
        this.isQueen = false;
    }

    static fromPlain(plain){
        const color = plain.color;
        const x = plain.x;
        const y = plain.y;
        const isQueen = plain.isQueen;
        const checker = new Checker(color, x, y);
        checker.isQueen = isQueen;
        return checker;
    }

    // Лежит ли клетка на одной диагонали с шашкой и черное ли оно
    checkCellForMove(x, y){
        return Math.abs(x - this.x) === Math.abs(y - this.y) && this.isCellBlack(x, y);
    }

    isCellBlack(x, y){
        return (x + y) % 2 != 0;
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

    // Метод для перемещения шашки на другую клетку
    // Не изменяет fieldCells, только возвращает информацию о ходе.
    // Изменяет поля this.x, this.y
    // Возвращает объект moveInfo
    goTo(x, y, fieldCells){
        if(!this.checkCellForMove(x, y) || !this.inBounds(x, y)) throw new Error('Not valid move');
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
                if (innerCell.color == this.color) throw new Error('cant eat your checkers');
                if (eatenCell != null) throw new Error('cant eat more then 1 checker at a time');
                eatenCell = innerCell;
            }
            // если был ход на дистанцию 2, там не было что есть, а шашка не дамка
            if (eatenCell == null && !this.isQueen) throw new Error('too far move for not-a-queen checker');
            if(eatenCell){
                moveInfo.checkerEated = eatenCell;
            }
        }
        this.x = x;
        this.y = y;
        return moveInfo;
    }

    hasCoordinates(x, y){
        return this.x == x && this.y == y;
    }

    activateQueenMode(){
        this.isQueen = true;
    }

    disableQueenMode(){
        this.isQueen = false;
    }
}

export { PlayField, Checker, CHECKER_BLACK_COLOR, CHECKER_WHITE_COLOR, MoveInfo };
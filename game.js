const CHECKER_BLACK_COLOR = 'b';
const CHECKER_WHITE_COLOR = 'w';

class PlayField{
    constructor() {
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

    setChecker(x, y, color = CHECKER_WHITE_COLOR){
        this.cells[y][x] = color;
    }

    removeChecker(x, y){
        this.cells[y][x] = null;
    }

    makeMove(xFrom, yFrom, xTo, yTo){
        this.removeChecker(xFrom, yFrom);
        this.setChecker(xTo, yTo, this.currentMove);
        this.currentMove = CHECKER_WHITE_COLOR === this.currentMove ? CHECKER_BLACK_COLOR : CHECKER_WHITE_COLOR;
    }

    printCheckersBoard() {
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
            if (cell === 'b') {
                rowStr += `%c ♔ ${colIndex === row.length - 1 ? '' : '│'}`;
            } else if (cell === 'w') {
                rowStr += `%c ♚ ${colIndex === row.length - 1 ? '' : '│'}`;
            } else {
                rowStr += `%c · ${colIndex === row.length - 1 ? '' : '│'}`;
            }
            });
        
            rowStr += '%c │';
            
            // Собираем аргументы для console.log
            const args = [rowStr, styles.border];
            row.forEach(cell => {
            if (cell === 'b') {
                args.push(styles.black);
            } else if (cell === 'w') {
                args.push(styles.white);
            } else {
                args.push(styles.empty);
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
}

module.exports = { PlayField, CHECKER_BLACK_COLOR, CHECKER_WHITE_COLOR };
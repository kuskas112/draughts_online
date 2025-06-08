// 1. Импорт необходимых библиотек
import { expect } from 'chai';
import { PlayField, Checker, CHECKER_BLACK_COLOR, CHECKER_WHITE_COLOR, MoveInfo } from '../../assets/js/GameEngine.js';

function createEmptyGameGrid(){
    return new Array(8).fill(null).map(() => new Array(8).fill(null));
}

describe('Checker Class Tests', () => {
    it('Checker invalid color', () => {
        expect(() => {let checker = new Checker('hghjg', 0, 1);}).to.throw('invalid checker color');
    });

    it('Checker not in bounds', () => {
        expect(() => {let checker = new Checker('black', 14, 1);}).to.throw('invalid checker coordinates');
    });

    it('Eatable cells test', () => {
        let grid = createEmptyGameGrid();
        let movingChecker = new Checker(CHECKER_WHITE_COLOR, 3, 4);
        grid[4][3] = movingChecker;

        let expectedCheckers = [
            new Checker(CHECKER_BLACK_COLOR, 2, 5),
            new Checker(CHECKER_BLACK_COLOR, 4, 5),
            new Checker(CHECKER_BLACK_COLOR, 2, 3),
            new Checker(CHECKER_BLACK_COLOR, 4, 3),
        ];

        grid[5][2] = expectedCheckers[0];
        grid[5][4] = expectedCheckers[1];
        grid[3][2] = expectedCheckers[2];
        grid[3][4] = expectedCheckers[3];

        let eatableCheckers = movingChecker.checkForEatableCheckers(grid);
        eatableCheckers.sort((a, b) => a.y - b.y);
        expectedCheckers.sort((a, b) => a.y - b.y);

        expect(eatableCheckers).to.be.deep.equal(expectedCheckers);
    });

    it('Goto function', () => {
        let grid = createEmptyGameGrid();
        let checker = new Checker(CHECKER_WHITE_COLOR, 3, 4);
        grid[4][3] = checker;

        let moveInfo = checker.goTo(4, 3, grid);
        let fromCell = moveInfo.cellFrom;
        let resultCell = moveInfo.cellTo;

        let result = fromCell.x == 3 && fromCell.y == 4 &&
                     resultCell.x == 4 && resultCell.y == 3 &&
                     checker.x == 4 && checker.y == 3; 
        expect(result).to.be.true;
    });

    it('Goto function - going backwards', () => {
        let grid = createEmptyGameGrid();
        let checker = new Checker(CHECKER_BLACK_COLOR, 3, 4);
        grid[4][3] = checker;

        expect(() => {checker.goTo(4, 3, grid)}).to.throw(Error);
    });

    it('Goto function - going backwards, but queen', () => {
        let grid = createEmptyGameGrid();
        let checker = new Checker(CHECKER_BLACK_COLOR, 3, 4);
        checker.activateQueenMode();
        grid[4][3] = checker;

        let moveInfo = checker.goTo(4, 3, grid);
        let fromCell = moveInfo.cellFrom;
        let resultCell = moveInfo.cellTo;

        let result = fromCell.x == 3 && fromCell.y == 4 &&
                     resultCell.x == 4 && resultCell.y == 3 &&
                     checker.x == 4 && checker.y == 3; 
        expect(result).to.be.true;
    });

    it('Goto function - checker not in grid', () => {
        let grid = createEmptyGameGrid();
        let checker = new Checker(CHECKER_BLACK_COLOR, 3, 4);
        // grid has no idea about this checker

        expect(() => {checker.goTo(4, 3, grid)}).to.throw(Error);
    });

    it('Goto function - out of bounds', () => {
        let grid = createEmptyGameGrid();
        let checker = new Checker(CHECKER_BLACK_COLOR, 7, 6);
        grid[6][7] = checker;

        expect(() => {checker.goTo(8, 7, grid)}).to.throw(Error);
    });

    it('Goto function - too far move', () => {
        let grid = createEmptyGameGrid();
        let checker = new Checker(CHECKER_BLACK_COLOR, 3, 0);
        grid[0][3] = checker;

        expect(() => {checker.goTo(5, 2, grid)}).to.throw(Error);
    });

    it('Goto function - too far move, but queen', () => {
        let grid = createEmptyGameGrid();
        let checker = new Checker(CHECKER_WHITE_COLOR, 3, 4);
        checker.activateQueenMode();
        grid[4][3] = checker;

        let moveInfo = checker.goTo(5, 6, grid);
        let fromCell = moveInfo.cellFrom;
        let resultCell = moveInfo.cellTo;

        let result = fromCell.x == 3 && fromCell.y == 4 &&
                     resultCell.x == 5 && resultCell.y == 6 &&
                     checker.x == 5 && checker.y == 6; 
        expect(result).to.be.true;
    });
});

describe('Playfield Class Tests', () => {
    let pf;

    beforeEach(() => {
        pf = new PlayField();
    });

    it('Init field', () => {
        let expectedGrid = createEmptyGameGrid();
        const CHECKER_BLACK_ROW = [0, 1, 2];
        const CHECKER_WHITE_ROW = [5, 6, 7];

        for (let y of CHECKER_BLACK_ROW) {
            for (let x = ((y+1) % 2); x < 8; x += 2) {
                expectedGrid[y][x] = new Checker(CHECKER_BLACK_COLOR, x, y);
            }
        }

        for (let y of CHECKER_WHITE_ROW) {
            for (let x = ((y+1) % 2); x < 8; x += 2) {
                expectedGrid[y][x] = new Checker(CHECKER_WHITE_COLOR, x, y);
            }
        }

        pf.initGameField();
        expect(pf.cells).to.be.deep.equal(expectedGrid);
    });

});
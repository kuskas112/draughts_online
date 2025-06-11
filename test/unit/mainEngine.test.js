// 1. Импорт необходимых библиотек
import { expect } from 'chai';
import { PlayField, Checker, CHECKER_BLACK_COLOR, CHECKER_WHITE_COLOR, MoveInfo } from '../../assets/js/GameEngine.js';

function createEmptyGameGrid(){
    return new Array(8).fill(null).map(() => new Array(8).fill(null));
}

describe('Checker Class Tests', () => {
    it('Checker invalid color', () => {
        expect(() => {let checker = new Checker('hghjg', 0, 1);}).to.throw(Error);
    });
    
    it('Checker invalid cell', () => {
        expect(() => {let checker = new Checker(CHECKER_WHITE_COLOR, 0, 0);}).to.throw(Error);
    });

    it('Checker not in bounds', () => {
        expect(() => {let checker = new Checker(CHECKER_BLACK_COLOR, 14, 1);}).to.throw(Error);
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

    it('Goto function - another checker in the way', () => {
        let grid = createEmptyGameGrid();
        let checker = new Checker(CHECKER_WHITE_COLOR, 3, 4);
        grid[4][3] = checker;

        let opponentChecker = new Checker(CHECKER_BLACK_COLOR, 4, 3);
        grid[3][4] = opponentChecker;

        expect(() => {checker.goTo(4, 3, grid)}).to.throw(Error);
    });

    it('Goto function - cell eated', () => {
        let grid = createEmptyGameGrid();
        let checker = new Checker(CHECKER_WHITE_COLOR, 3, 4);
        grid[4][3] = checker;

        let opponentChecker = new Checker(CHECKER_BLACK_COLOR, 4, 3);
        grid[3][4] = opponentChecker;

        let moveInfo = checker.goTo(5, 2, grid);
        let fromCell = moveInfo.cellFrom;
        let resultCell = moveInfo.cellTo;
        let eatedCell = moveInfo.checkerEated;

        expect(eatedCell).to.be.equal(opponentChecker);
        expect(fromCell.y == 4 && fromCell.x == 3 && resultCell.y == 2 && resultCell.x == 5).to.be.true;
        expect(checker.x == 5 && checker.y == 2).to.be.true;
    });

    it('Goto function - same color cell eated', () => {
        let grid = createEmptyGameGrid();
        let checker = new Checker(CHECKER_WHITE_COLOR, 3, 4);
        grid[4][3] = checker;

        let opponentChecker = new Checker(CHECKER_WHITE_COLOR, 4, 3);
        grid[3][4] = opponentChecker;

        expect(() => {checker.goTo(5, 2, grid)}).to.throw(Error);
    });

    it('Goto function - cell eated, but too far move', () => {
        let grid = createEmptyGameGrid();
        let checker = new Checker(CHECKER_WHITE_COLOR, 3, 4);
        grid[4][3] = checker;

        let opponentChecker = new Checker(CHECKER_BLACK_COLOR, 4, 3);
        grid[3][4] = opponentChecker;

        expect(() => {checker.goTo(6, 1, grid)}).to.throw(Error);
    });

    it('Goto function - cell eated, but too far move, but queen', () => {
        let grid = createEmptyGameGrid();
        let checker = new Checker(CHECKER_WHITE_COLOR, 3, 4);
        checker.activateQueenMode();
        grid[4][3] = checker;

        let opponentChecker = new Checker(CHECKER_BLACK_COLOR, 4, 3);
        grid[3][4] = opponentChecker;

        let moveInfo = checker.goTo(6, 1, grid);
        let fromCell = moveInfo.cellFrom;
        let resultCell = moveInfo.cellTo;
        let eatedCell = moveInfo.checkerEated;

        expect(eatedCell).to.be.equal(opponentChecker);
        expect(fromCell.y == 4 && fromCell.x == 3 && resultCell.y == 1 && resultCell.x == 6).to.be.true;
        expect(checker.x == 6 && checker.y == 1).to.be.true;
    });

    it('Goto function - many checkers eated', () => {
        let grid = createEmptyGameGrid();
        let checker = new Checker(CHECKER_WHITE_COLOR, 3, 4);
        checker.activateQueenMode();
        grid[4][3] = checker;

        let opponentChecker = new Checker(CHECKER_BLACK_COLOR, 4, 3);
        grid[3][4] = opponentChecker;

        let secondOpponentChecker = new Checker(CHECKER_BLACK_COLOR, 5, 2);
        grid[2][5] = secondOpponentChecker;

        expect(() => {checker.goTo(7, 0, grid)}).to.throw(Error);
    });

    it('Goto function - far eated cell', () => {
        let grid = createEmptyGameGrid();
        let checker = new Checker(CHECKER_WHITE_COLOR, 3, 4);
        checker.activateQueenMode();
        grid[4][3] = checker;

        let opponentChecker = new Checker(CHECKER_BLACK_COLOR, 5, 2);
        grid[2][5] = opponentChecker;

        let moveInfo = checker.goTo(7, 0, grid);
        let fromCell = moveInfo.cellFrom;
        let resultCell = moveInfo.cellTo;
        let eatedCell = moveInfo.checkerEated;

        expect(eatedCell).to.be.equal(opponentChecker);
        expect(fromCell.y == 4 && fromCell.x == 3 && resultCell.y == 0 && resultCell.x == 7).to.be.true;
        expect(checker.x == 7 && checker.y == 0).to.be.true;
    });

    // TODO: тест на то, когда за съедобным противником кончается поле
    // TODO: тест на то, когда за съедобным противником другой противник

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

    it('HasChecker function', () => {
        pf.initGameField();
        expect(pf.hasChecker(0, 7)).to.be.true;
        expect(pf.hasChecker(3, 4)).to.be.false;
        expect(() => {pf.hasChecker(-1, 10)}).to.throw(Error);
    });

    it('Simple Move', () => {
        pf.initGameField();
        //0,5 - 1,4
        expect(pf.hasChecker(0, 5)).to.be.true;
        expect(pf.hasChecker(1, 4)).to.be.false;
        expect(pf.currentMove).to.be.equal(CHECKER_WHITE_COLOR);

        const cellFrom = {x: 0, y: 5};
        const cellTo = {x: 1, y: 4};
        pf.makeMove(cellFrom, cellTo);

        expect(pf.hasChecker(0, 5)).to.be.false;
        expect(pf.hasChecker(1, 4)).to.be.true;
        expect(pf.currentMove).to.be.equal(CHECKER_BLACK_COLOR);
    });

    it('Eating move', () => {
        expect(pf.hasChecker(2, 5)).to.be.false;
        expect(pf.hasChecker(3, 4)).to.be.false;
        expect(pf.remainingCheckers[CHECKER_WHITE_COLOR]).to.be.equal(12);
        pf.changeMove();

        const checker = new Checker(CHECKER_BLACK_COLOR, 3, 4);
        const opponentChecker = new Checker(CHECKER_WHITE_COLOR, 2, 5);
        pf.setChecker(checker);
        pf.setChecker(opponentChecker);

        expect(pf.hasChecker(2, 5)).to.be.true;
        expect(pf.hasChecker(3, 4)).to.be.true;
        expect(pf.currentMove).to.be.equal(CHECKER_BLACK_COLOR);

        const cellFrom = {x: 3, y: 4};
        const cellTo = {x: 1, y: 6};
        let move = pf.makeMove(cellFrom, cellTo);

        expect(pf.hasChecker(3, 4)).to.be.false;
        expect(pf.hasChecker(2, 5)).to.be.false;
        expect(pf.hasChecker(1, 6)).to.be.true;
        expect(move.checkerEated).to.be.equal(opponentChecker);
        expect(pf.currentMove).to.be.equal(CHECKER_WHITE_COLOR);
        expect(pf.remainingCheckers[CHECKER_WHITE_COLOR]).to.be.equal(11);
    });

    it('Queen mode', () => {
        const checker = new Checker(CHECKER_BLACK_COLOR, 2, 5);
        const opponentChecker = new Checker(CHECKER_WHITE_COLOR, 1, 6);
        pf.setChecker(checker);
        pf.setChecker(opponentChecker);
        pf.changeMove();

        expect(pf.hasChecker(2, 5)).to.be.true;
        expect(pf.hasChecker(1, 6)).to.be.true;
        expect(pf.hasChecker(0, 7)).to.be.false;
        expect(pf.currentMove).to.be.equal(CHECKER_BLACK_COLOR);

        const cellFrom = {x: 2, y: 5};
        const cellTo = {x: 0, y: 7};
        let move = pf.makeMove(cellFrom, cellTo);

        expect(pf.hasChecker(2, 5)).to.be.false;
        expect(pf.hasChecker(1, 6)).to.be.false;
        expect(pf.hasChecker(0, 7)).to.be.true;
        expect(checker.isQueen).to.be.true;
    });

    it('Multiple eatable opponent checkers', () => {
        pf.changeMove();
        const checker = new Checker(CHECKER_BLACK_COLOR, 3, 2);
        const opponentChecker = new Checker(CHECKER_WHITE_COLOR, 4, 3);
        const opponentChecker2 = new Checker(CHECKER_WHITE_COLOR, 6, 5);
        pf.setChecker(checker);
        pf.setChecker(opponentChecker);
        pf.setChecker(opponentChecker2);

        //ход черных
        expect(pf.currentMove).to.be.equal(CHECKER_BLACK_COLOR);

        const cellFrom = {x: 3, y: 2};
        const cellTo = {x: 5, y: 4};
        let move = pf.makeMove(cellFrom, cellTo);

        expect(pf.hasChecker(3, 2)).to.be.false;
        expect(pf.hasChecker(4, 3)).to.be.false;
        expect(pf.hasChecker(5, 4)).to.be.true;
        expect(move.checkerEated).to.be.equal(opponentChecker);
        // продолжаем ходить, можем еще съесть шашку на (6, 5)
        expect(pf.currentMove).to.be.equal(CHECKER_BLACK_COLOR);
    });

});
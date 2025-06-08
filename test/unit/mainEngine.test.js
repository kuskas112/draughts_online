// 1. Импорт необходимых библиотек
import { expect } from 'chai';
import { PlayField, Checker, CHECKER_BLACK_COLOR, CHECKER_WHITE_COLOR } from '../../assets/js/GameEngine.js';

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
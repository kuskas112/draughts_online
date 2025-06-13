import { expect } from 'chai';
import { Lobby, Pair, Player } from '../../assets/js/LobbyClasses.js';

describe('Pair Class Tests', () => {
    it('Init pair', () => {
        const pair = new Pair();
        expect(pair.players.length).to.equal(0);
    });
});

// 1. Импорт необходимых библиотек
import { expect } from 'chai';
import { PlayField } from '../../assets/js/GameEngine.js';

describe('Game Logic Unit Tests', () => {
  let game;
  
  it('should be true', () => {
    // 5. Вызов тестируемого метода
    const result = 2 + 2 == 4
    expect(result).to.be.true;
  });
});
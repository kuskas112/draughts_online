<script>
    import { PlayField } from '../../assets/js/GameEngine.js';

    function initGameGrid(){
        this.cells = new Array(8).fill(null).map(() => new Array(8).fill(null));
        const tbody = document.getElementById('game-grid');
        for (let y = 0; y < 8; y++) {
            const row = document.createElement('tr');
            for (let x = 0; x < 8; x++) {
                const cell = document.createElement('td');
                const isWhite = (x + y) % 2 === 0;
                cell.className = `cell ${isWhite ? 'white' : 'black'}`;
                row.appendChild(cell);
            }
            tbody.appendChild(row);
        }
    }

    export default {
        mounted(){
            this.initGameGrid();
            this.pf.initGameField();
            this.pf.printPlayField();
        },
        data(){
            return {
                cells: [],
                pf: new PlayField(),
            }
        },
        methods: {
            initGameGrid,
        }

    }
</script>

<template>
    <div>
        <table class="game-grid" id="game-grid">

        </table>
    </div>
</template>

<style scoped>
    .game-grid{
        position: relative;
    }

    tr{
        display: flex;
        flex-direction: row;
    }

    .cell {
        display: flex;
        height: 30px;
        width: 30px;
        justify-content: center;
        align-items: center;
        font-size: 20px;
        font-weight: bold;
    }
    
    .white {
        background-color: #f0d9b5;
    }
    
    .black {
        background-color: #b58863;
        color: white;
    }
</style>


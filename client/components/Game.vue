<script>
    function coordTrans(x, y) {
        if(this.checkerColor == 'black'){
            return {
                x: 7 - x,
                y: 7 - y,
            };
        }
        return {
            x: x,
            y: y,
        };
    }

    async function getGameField(){
        let result = await fetch('/api/getplayfield', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        result = await result.json();
        this.pf = result.playfield;
        this.checkerColor = result.checkerColor;
        console.log(this.checkerColor);
    }

    function drawGameField(){
        const tbody = document.getElementById('table-body');
        tbody.innerHTML = '';
        for(var i = 0; i < 8; i++){
            const row = document.createElement('tr');
            for(var j = 0; j < 8; j++){
                var td = document.createElement('td');
                let color = (i + j) % 2 == 0 ? 'white' : 'black'; 
                // описание поля с шашкой или без
                td.classList.add('cell');
                td.classList.add(color);

                const {x, y} = this.coordTrans(i, j);
                const pfElement = this.pf.cells[x][y];
                if(pfElement){
                    const checker = document.createElement('div');
                    checker.classList.add('checker');
                    const colors = {
                        'w': 'white',
                        'b': 'black',
                    };
                    checker.style.backgroundColor = colors[pfElement.color];
                    checker.addEventListener('click', () => {
                        console.log(pfElement)
                    })
                    td.appendChild(checker);
                }

                row.appendChild(td);
                this.cells[i][j] = td;
            }
            tbody.appendChild(row);
        }
    }

    export default {
        async mounted(){
            await this.getGameField();
            this.drawGameField();
        },
        data(){
            return {
                pf: null,    
                checkerColor: null,
                cells: new Array(8).fill(null).map(() => new Array(8).fill(null)),   
            }
        },
        methods: {
            getGameField,
            drawGameField,
            coordTrans
        }

    }
</script>

<template>
    <div>
        <table class="game-grid" id="game-grid">
            <tbody id='table-body'></tbody>
        </table>
    </div>
</template>

<style>
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
    
    .checker{
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: red;
    }

    .white {
        background-color: #f0d9b5;
    }
    
    .black {
        background-color: #b58863;
        color: white;
    }
</style>


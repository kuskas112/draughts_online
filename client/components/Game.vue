<script>
    async function getGameField(){
        let result = await fetch('/api/getplayfield', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        result = await result.json();
        return result.playfield;
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

                const pfElement = this.pf.cells[i][j];
                if(pfElement){
                    const checker = document.createElement('div');
                    checker.classList.add('checker');
                    const colors = {
                        'w': 'white',
                        'b': 'black',
                    };
                    console.log(pfElement);
                    checker.style.backgroundColor = colors[pfElement.color];
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
            this.pf = await getGameField();
            this.drawGameField();
            console.log(this.cells);
        },
        data(){
            return {
                pf: null,    
                cells: new Array(8).fill(null).map(() => new Array(8).fill(null)),   
            }
        },
        methods: {
            drawGameField,
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


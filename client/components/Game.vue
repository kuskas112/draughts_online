<script>
    async function getGameField(){
        let result = await fetch('/api/getplayfield', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        result = await result.json();
        console.log('Game Field:');
        console.log(result);
    }

    export default {
        mounted(){
            getGameField();
        },
        data(){
            return {
                cells: [],
            }
        },
        methods: {
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


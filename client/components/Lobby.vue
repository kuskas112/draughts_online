<script>

    async function getLobbies(){
        let result = await fetch('/api/getlobbies', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        result = await result.json();
        console.log(result);
    }
    export default {
        mounted(){
            this.getLobbies();
        },
        data(){
            return {
            }
        },
        methods: {
            getLobbies,
        }

    }
</script>

<template>
    <div>
        <div class="lobbies-list">
            <div class="lobby">
                <div class="lobby-players">
                    <div class="pair">
                        <div>Player</div>
                        <div>Player</div>
                    </div>
                </div>
                <div class="lobby-button">
                    <button>+ Join Lobby</button>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
    .lobbies-list{
        display: flex;
        width: 100%;
        justify-content: center;
    }

    .lobby{
        font-size: 20px;
        display: flex;
        justify-content: space-between;
        position: relative;
        width: 70%;
        height: 100px;
        background-color: aqua;
        border-radius: 8px;
        padding: 20px;
    }

    .lobby-button{
        display: flex;
        align-items: center;
    }
    .lobby button{
        position: relative;
        height: 50%;
    }

    .lobby-players{
        display: flex;
        align-items: center;
    }
</style>


<script>

    export default {
        // Явно объявляем props которые ожидаем получить
        props: {
            lobby: {
                type: Object,
                default: null
            }
        },
        mounted(){
            console.log(this.lobby);
        },
        methods: {
        }

    }
</script>

<template>
        <div class="lobby">
            <div class="lobby-players">
                <div class="pair">
                    <div v-for="(player, index) in this.lobby.players" :key="index">
                        <!-- TODO изменить на username -->
                        {{player.user}}
                    </div>
                </div>
            </div>
            <div class="lobby-button">
                <button>+ Join Lobby</button>
            </div>
        </div>
</template>

<style>
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


<script>

    export default {
        // Явно объявляем props которые ожидаем получить
        props: {
            lobby: {
                type: Object,
                default: null
            },
            authStatus: {
                type: Object,
                default: null,
            },      
        },
        mounted(){
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
                        {{player.name}}
                    </div>
                </div>
            </div>
            <div v-if="this.lobby.players.some(player => player.id !== this.authStatus.user.id)" class="lobby-button">
                <button>+ Join Lobby</button>
            </div>
        </div>
</template>

<style scoped>
    .lobby{
        font-size: 20px;
        display: flex;
        justify-content: space-between;
        position: relative;
        width: 100%;
        height: 100px;
        background-color: aqua;
        border-radius: 8px;
        margin-bottom: 20px;
        margin-top: 20px;
    }

    .lobby-button{
        display: flex;
        align-items: center;
    }
    .lobby button{
        position: relative;
        height: 50%;
        margin-right: 20px;
    }

    .lobby-players{
        margin-left: 20px;
        display: flex;
        align-items: center;
    }
</style>


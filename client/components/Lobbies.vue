<script>
    import Lobby from './Lobby.vue';

    async function getLobbies(){
        let result = await fetch('/api/getlobbies', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        result = await result.json();
        this.lobbies = result.lobbies;
        console.log(this.lobbies);
    }

    export default {
        mounted(){
            this.getLobbies();
        },
        data(){
            return {
                lobbies: [],
            }
        },
        methods: {
            getLobbies,
        },
        components: {
            Lobby,
        },

    }
</script>

<template>
    <div style="display: flex; justify-content: center;">
        <div class="lobbies-list">
            <button class="create-lobby-button">+ Create Lobby</button>
            <Lobby v-for="(lobby, index) in this.lobbies" :key="index" 
            :lobby = "lobby"
            />
        </div>
    </div>
</template>

<style scoped>
    .lobbies-list{
        width: 40%;
        justify-content: center;
        position: relative;
    }

    .create-lobby-button{
        width: 100%;
        margin-top: 20px;
        min-height: 40px;
    }
</style>


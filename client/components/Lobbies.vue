<script>
    import Lobby from './Lobby.vue';
    import { getStatus } from '@js/SessionStatusManager.js';

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

    async function createLobby(){
        let result = await fetch('/api/addlobby', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        result = await result.json();
        console.log(result);
        this.getLobbies();
    }

    export default {
        mounted(){
            this.getLobbies();
        },
        async beforeCreate() {
            this.authStatus = await getStatus();
        },
        data(){
            return {
                lobbies: [],
                authStatus: null,
            }
        },
        methods: {
            getLobbies,
            createLobby,
        },
        components: {
            Lobby,
        },

    }
</script>

<template>
    <div style="display: flex; justify-content: center;">
        <div class="lobbies-list">
            <button @click="createLobby" class="create-lobby-button">+ Create Lobby</button>
            <Lobby v-if="this.authStatus" v-for="(lobby, index) in this.lobbies" :key="index" 
            :lobby = "lobby"
            :authStatus = "this.authStatus"
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


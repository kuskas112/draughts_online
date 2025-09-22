<script>
    import Lobby from './Lobby.vue';
    import { getStatus } from '@js/SessionStatusManager.js';
    import socketService from '@js/SocketService.js';
    

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
    }

    export default {
        mounted(){
        },

        async beforeCreate() {
            this.authStatus = await getStatus();

            this.getLobbies();
            const socket = socketService.connect();
            socket.on('updateLobbies', () => {
                console.log('Lobbies updated, fetching new list...');
                this.getLobbies();
            });

            socket.on('startGame', () => {
                console.log('Starting game');
                this.$router.push('/game');
            });
            
            socket.emit('joinToLobbyListeners');
            socket.emit('setGamerSocket', this.authStatus.user.id);
        },
        beforeUnmount() {
            socketService.disconnect();
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


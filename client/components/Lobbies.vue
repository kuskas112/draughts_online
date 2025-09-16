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
    <div>
        <div class="lobbies-list">
            <Lobby v-for="(lobby, index) in this.lobbies" :key="index" 
            :lobby = "lobby"
            />
        </div>
    </div>
</template>

<style>
    .lobbies-list{
        width: 100%;
        justify-content: center;
    }
</style>


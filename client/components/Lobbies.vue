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
        },
        components: {
            Lobby,
        },

    }
</script>

<template>
    <div>
        <div class="lobbies-list">
            <Lobby></Lobby>
        </div>
    </div>
</template>

<style>
    .lobbies-list{
        display: flex;
        width: 100%;
        justify-content: center;
    }
</style>


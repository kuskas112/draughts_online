<script>

    import { isAuth, getUser } from '@js/SessionStatusManager.js';

    export default {
        async mounted() {
            let isLoggedIn = await isAuth();
            if(!isLoggedIn){
                this.$router.push('/login');
            }

            console.log(await getUser());
        },
        methods: {
            async logout() {
                await fetch('/api/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                this.$router.push('/login');
            },
        },
    };

</script>
<template>
    <div>
        <button @click="logout" class="logout-button">Logout</button>
        <a href="/lobbies">
            <button class="lobbies-button">Lobbies</button>
        </a>
    </div>
</template>

<style scoped>
    .logout-button {
        padding: 10px 20px;
        background-color: #ff4d4d;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 16px;
    }

    .logout-button:hover {
        background-color: #ff1a1a;
    }

    .lobbies-button{
        padding: 10px 20px;
        background-color: #4d4dff;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 16px;
    }
</style>
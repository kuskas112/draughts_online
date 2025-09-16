<script>
    import Cookies from 'js-cookie';

    export default {
        mounted() {
            const isLoggedIn = Cookies.get('isLoggedIn') === 'true' ? true : false;
            if (!isLoggedIn) {
                console.log('User is not logged in, redirecting to login page...');
                this.$router.push('/login');
            }
        },
        methods: {
            logout() {
                Cookies.remove('username');
                Cookies.set('isLoggedIn', 'false');
                console.log('User logged out, redirecting to login page...');
                this.$router.push('/login');
            },
        },
    };

</script>
<template>
    <div>
        <button @click="logout" class="logout-button">Logout</button>
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
</style>
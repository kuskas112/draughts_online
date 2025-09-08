<script>
    function inputUsername() {
        console.log(this.username);
    }

    
    export default {
        data() {
            return {
                username: '',
            }
        },
        methods: {
            inputUsername,
        },
    };
</script>

<template>
    <div class="form-container">
            <label for="username">Введите ваше имя</label> <br>
            <input v-model="username" type="text" name="username" id="username" placeholder="Имя...">
            <input @click="inputUsername" type="submit" value="Отправить">
    </div>
</template>

<style>
    .form-container{
        font-size: large;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
    }
</style>
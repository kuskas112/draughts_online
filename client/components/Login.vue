<script>
    function inputUsername(event){
        console.log(event.target);
        this.username = username;
        console.log(this.username);
    }

    export default {
        username: '',
        methods:[
            inputUsername,
        ],
    };
</script>

<template>
    <div class="form-container">
        <form>
            <label for="username">Введите ваше имя</label> <br>
            <input type="text" name="username" id="username" placeholder="Имя...">
            <input type="submit" value="Отправить">
        </form>
    </div>
</template>

<style>
    .form-container{
        font-size: large;
    }
</style>
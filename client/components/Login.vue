<script>
    function sendForm(){
        console.log('start fetch');
        fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({username: this.username}),
        }).then(res => res.json())
            .then(data => {
                console.log(data);
                if (data.success) {
                    //this.$router.push('/');
                }
            });
    }

    export default {
        data() {
            return {
                username: '',
            }
        },
        methods: {
            sendForm,
        }
    };
</script>

<template>
    <div class="form-container">
        <label for="username">Введите ваше имя</label> <br>
        <input v-model="username" type="text" name="username" id="username" placeholder="Имя...">
        <input @click="sendForm" type="submit" value="Отправить">
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
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
                    this.$router.push('/');
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
        },
    };
</script>

<template>
    <div class="form-container">
        <div class="form">
            <label for="username">Введите ваше имя</label> <br>
            <input v-model="username" type="text" name="username" id="username" placeholder="Имя...">
            <input @click="sendForm" type="submit" value="Отправить">
        </div>
    </div>
</template>

<style>
    .form-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh; /* Высота экрана */
    }

    .form {
        text-align: center;
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 20px;
        border: 2px solid black;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
</style>
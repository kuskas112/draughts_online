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
            moveButtonSelector,
        },
    };

    function moveButtonSelector(animationName){
        const buttonSelector = document.getElementById('button-selector');
        buttonSelector.style.animation = `${animationName} 0.4s ease forwards`;
    }

</script>
<template>
    <div class="form-container">
        <div class="auth-buttons-container">
            <div class="button-selector" id="button-selector"></div>
            <div @click="moveButtonSelector('move-left')" class="auth-button login-button" id="login-button">Login</div>
            <div @click="moveButtonSelector('move-right')" class="auth-button signup-button" id="signup-button">Sign up</div>
        </div>
        <div class="form">
            <label for="username">Введите ваше имя</label> <br>
            <input v-model="username" type="text" name="username" id="username" placeholder="Имя...">
            <input @click="sendForm" type="submit" value="Отправить">
        </div>
    </div>
</template>

<style>

    .auth-buttons-container {
        width: 50%;
        height: 10%;
        position: relative;
        margin-bottom: 20px;
        border: 2px solid pink;
        font-size: 40px;
    }

    .auth-button{
        position: absolute;
        height: 100%;
        width: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background-color 0.2s ease;
    }
    /* .auth-button:hover{
        background-color: #f0f0f0;
    } */

    .login-button{
        left: 0;   
    }
    .signup-button{
        right: 0;
    }

    .button-selector {
        content: "";
        position: absolute;
        bottom: 0;
        left: 0;
        width: 50%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5); /* замените rgba(0, 0, 0, 0.5) на желаемый цвет и прозрачность прямоугольника */
        z-index: -1;
    }

    .form-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh; /* Высота экрана */
        flex-direction: column;
    }

    .form {
        width: 50%;
        text-align: center;
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 20px;
        border: 2px solid black;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    @keyframes move-right {
        from {
            transform: translateX(0);
        }
        to {
            transform: translateX(100%);
        }
    }

    @keyframes move-left {
        from {
            transform: translateX(100%);
        }
        to {
            transform: translateX(0);
        }
    }

</style>
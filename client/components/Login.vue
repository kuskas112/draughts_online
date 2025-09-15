<script>
    import Cookies from 'js-cookie';

    function sendForm(){
        console.log('start fetch');
        const action = this.currentSelectedButton // 'login' или 'signup'
        const data = {
            username: this.username,
            password: this.password,
        };
        const url = action === 'login' ? '/api/login' : '/api/signup';
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        }).then(res => res.json())
            .then(data => {
                console.log(data);
            });
    }

    function chooseLoginButton(){
        if (this.currentSelectedButton === 'login') return;
        this.currentSelectedButton = 'login';
        this.moveButtonSelector('move-left');
    }

    function chooseSignupButton(){
        if (this.currentSelectedButton === 'signup') return;
        this.currentSelectedButton = 'signup';
        this.moveButtonSelector('move-right');
    }

    function moveButtonSelector(animationName){
        const buttonSelector = document.getElementById('button-selector');
        buttonSelector.style.animation = `${animationName} 0.4s ease forwards`;
    }

    export default {
        mounted() {
            const isLoggedIn = Cookies.get('isLoggedIn') === 'true' ? true : false;
            if (isLoggedIn) {
                console.log('User is already logged in, redirecting to profile...');
                //this.$router.push('/profile');
            }
        },
        data() {
            return {
                username: '',
                password: '',
                currentSelectedButton: 'login', // 'login' или 'signup'
            }
        },
        methods: {
            sendForm,
            moveButtonSelector,
            chooseLoginButton,
            chooseSignupButton,
        },
    };

</script>
<template>
    <div class="form-container">
        <div class="auth-buttons-container">
            <div class="button-selector" id="button-selector"></div>
            <div @click="chooseLoginButton" class="auth-button login-button" id="login-button">Login</div>
            <div @click="chooseSignupButton" class="auth-button signup-button" id="signup-button">Sign up</div>
        </div>
        <div v-if="currentSelectedButton === 'login'" class="form">
            <label for="username">Вход в аккаунт</label> <br>
            <input v-model="username" type="text" name="username" id="username" placeholder="Имя...">
            <input v-model="password" type="text" name="password" id="password" placeholder="Пароль...">
            <input @click="sendForm" type="submit" value="Отправить">
        </div>
        <div v-else-if="currentSelectedButton === 'signup'" class="form">
            <label for="username">Регистрация</label> <br>
            <input v-model="username" type="text" name="username" id="username" placeholder="Имя...">
            <input v-model="password" type="text" name="password" id="password" placeholder="Пароль...">
            <input @click="sendForm" type="submit" value="Отправить">
        </div>
    </div>
</template>

<style>

    .auth-buttons-container {
        width: 40%;
        height: 10%;
        position: relative;
        margin-bottom: 20px;
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
        background-color: rgba(53, 53, 53, 0.5); /* замените rgba(0, 0, 0, 0.5) на желаемый цвет и прозрачность прямоугольника */
        z-index: -1;
        border-radius: 8px;
    }

    .form-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh; /* Высота экрана */
        flex-direction: column;
    }

    .form {
        width: 40%;
        text-align: center;
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 20px;
        border: 2px solid black;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .form input{
        padding: 10px;
        font-size: 16px;
        border: 1px solid #ccc;
        border-radius: 4px;
    }

    .form label{
        font-size: 18px;
        margin-bottom: 10px;
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
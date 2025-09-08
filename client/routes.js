// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import NotFound from './components/NotFound.vue'
import Game from './components/Game.vue'
import Login from './components/Login.vue'


// 1. Определяем массив маршрутов (routes)
const routes = [
  {
    path: '/game',        // URL в браузере
    name: 'Game',     // Имя маршрута для удобства
    component: Game   // Компонент, который будет отображен
  },
  {
    path: '/login',        // URL в браузере
    name: 'Login',     // Имя маршрута для удобства
    component: Login   // Компонент, который будет отображен
  },
  {
    path: '/:pathMatch(.*)*', // Этот маршрут ловит все пути, не указанные выше
    name: 'NotFound',
    component: NotFound
  }
]

// 2. Создаем экземпляр роутера
const router = createRouter({
  history: createWebHistory(), // Используем History API для красивых URL (без #)
  routes // сокращение от `routes: routes`
})

// 3. Экспортируем роутер
export default router
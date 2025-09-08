// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import ExampleComponent from '../components/ExampleComponent.vue'

// 1. Определяем массив маршрутов (routes)
const routes = [
  {
    path: '/',        // URL в браузере
    name: 'Home',     // Имя маршрута для удобства
    component: ExampleComponent   // Компонент, который будет отображен
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
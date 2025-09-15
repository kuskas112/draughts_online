import { createRouter, createWebHistory } from 'vue-router'
import NotFound from './components/NotFound.vue'
import Game from './components/Game.vue'
import Login from './components/Login.vue'
import Profile from './components/Profile.vue'


const routes = [
  {
    path: '/game',        // URL в браузере
    name: 'Game',     // Имя маршрута для удобства
    component: Game   // Компонент, который будет отображен
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
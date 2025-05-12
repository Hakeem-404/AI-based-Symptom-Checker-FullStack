// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Landing from '../views/Landing.vue'
import Login from '../views/auth/Login.vue'
import Register from '../views/auth/Register.vue'
import SymptomChecker from '../views/SymptomChecker.vue'
import Profile from '../views/profile/Profile.vue'
import ForgotPassword from '../views/auth/ForgotPassword.vue'
import Insights from '../views/Insights.vue'
import HealthHistory from '../views/HealthHistory.vue'
import ProfileCompletion from '../views/profile/ProfileCompletion.vue'
import SymptomHistory from '../views/SymptomHistory.vue'

const routes = [
 { path: '/', component: Landing },
 { path: '/home', name: 'Home', component: Home },
 { path: '/login', component: Login },
 { path: '/register', component: Register },
 { path: '/symptoms', component: SymptomChecker },
 { path: '/symptoms/history', component: SymptomHistory },
 { path: '/profile', component: Profile },
 { path: '/forgotpassword', component: ForgotPassword },
 { path: '/insights', component: Insights },
 { path: '/history', component: HealthHistory},
 {
    path: '/profile/complete',
    name: 'ProfileCompletion',
    component: ProfileCompletion,
    meta: { requiresAuth: true }
}
]

const router = createRouter({
 history: createWebHistory(),
 routes
})

export default router
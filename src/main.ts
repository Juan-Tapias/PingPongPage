import './assets/main.css'
import './assets/styles/main.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import Modal from '@/components/Modal.vue'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.component('Modal', Modal)
app.component('Navbar', Navbar)
app.component('Footer', Footer)

const authStore = useAuthStore()
authStore.inicializarAuth()

app.mount('#app')

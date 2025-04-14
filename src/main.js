import { createApp } from 'vue'
import pinia from '@/stores/index.js'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import '@/assets/main.scss'
import '@fortawesome/fontawesome-free/css/all.css'
import VueVideoPlayer from '@videojs-player/vue'

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(ElementPlus)
app.use(VueVideoPlayer)
app.mount('#app')

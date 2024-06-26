import './playground/app.css'

import { createApp } from 'vue'

import App from './playground/App.vue'

import Exstasy from './index'

const app = createApp(App)

app.use(Exstasy)
app.mount('#app')

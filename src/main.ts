import './playground/app.css'

import { createApp } from 'vue'

import App from './playground/App.vue'

import Ecstasy from './index'

const app = createApp(App)

app.use(Ecstasy)
app.mount('#app')

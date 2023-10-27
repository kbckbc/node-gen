import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
// Importing the global css file
import '@/assets/global.css'
import { func } from './assets/func.js'

const vue = createApp(App)
vue.config.globalProperties.$func = func
vue.config.globalProperties.$hostname = process.env.VUE_APP_ROOT_API
vue.use(store).use(router).mount('#app')
// global variables

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import 'katex/dist/katex.min.css'
import { Quasar } from 'quasar';
import quasarUserOptions from './quasar-user-options';

const app = createApp(App)
app.use(Quasar, quasarUserOptions);

const pinia = createPinia()
app.use(pinia)
app.use(router)


app.mount('#app')

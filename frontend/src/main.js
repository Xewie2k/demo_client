import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "material-icons/iconfont/material-icons.css";
import "@/assets/styles/admin.css";
import 'bootstrap-icons/font/bootstrap-icons.css'

import vSelect from "vue-select";
import "vue-select/dist/vue-select.css";

import PrimeVue from "primevue/config";
import ToastService from "primevue/toastservice";
import Toast from "primevue/toast";
import "primeicons/primeicons.css";

import Aura from "@primeuix/themes/aura";

const app = createApp(App);

app.use(router);

// vue-select global
app.component("v-select", vSelect);

// PrimeVue
app.use(PrimeVue, {
  theme: {
    preset: Aura,
  },
});

// ✅ BẮT BUỘC: ToastService để useToast() hoạt động
app.use(ToastService);

// ✅ Có thể dùng <Toast /> ở layout/page
app.component("Toast", Toast);

app.mount("#app");

declare module "@tsparticles/vue3";

import "./assets/main.css";
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import Particles from "@tsparticles/vue3";
import { loadFull } from "tsparticles";

const app = createApp(App);

app.use(router);

app.use(Particles, { init: loadFull });

app.mount("#app");

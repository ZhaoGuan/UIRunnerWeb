import Vue from 'vue'
import VueRouter from 'vue-router'
import Device from "@/views/Device";

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Device
    },
]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
})

export default router

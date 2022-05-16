import Vue from 'vue'
import VueRouter from 'vue-router'
import Device from "@/views/Mobile/Device";
import Web from "@/views/Web/Web"
import Cases from "@/views/Cases/Cases"

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'mobile-phone',
        component: Device,
        meta: {
            icon: 'el-icon-mobile',
            title: '手机',
            hide: false
        },
    },
    {
        path: '/web',
        name: 'web',
        component: Web,
        meta: {
            icon: 'el-icon-discover',
            title: 'WEB',
            hide: false
        },
    },
    {
        path: '/cases',
        name: 'cases',
        component: Cases,
        meta: {
            icon: 'el-icon-folder',
            title: '用例',
            hide: false
        },
    },

]


const router = new VueRouter({
    // mode: 'history',
    base: process.env.BASE_URL,
    routes: routes
})

export {router, routes}
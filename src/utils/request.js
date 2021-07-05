import axios from 'axios'
import {Message} from 'element-ui'

const proEnv = require('@/config/pro.env'); // 生产环境
const devEnv = require('@/config/dev.env'); // 本地环境
let baseUrl = null
switch (process.env.NODE_ENV) {
    case 'development':
        baseUrl = devEnv.baseurl;
        break;
    case 'production':
        baseUrl = proEnv.baseurl; //打包完路径
        break;
}
// create an axios instance
const service = axios.create({
    baseURL: baseUrl,// url = base url + request url
    // withCredentials: true, // send cookies when cross-domain requests
    timeout: 100000 // request timeout
})

// request interceptor
service.interceptors.request.use(
    config => {
        // do something before request is sent
        return config
    },
    error => {
        // do something with request error
        console.log(error) // for debug
        return Promise.reject(error)
    }
)

// response interceptor
service.interceptors.response.use(
    /**
     * If you want to get http information such as headers or status
     * Please return  response => response
     */

    /**
     * Determine the request status by custom code
     * Here is just an example
     * You can also judge the status by HTTP Status Code
     */
    response => {
        const res = response.data
        if (res.code !== 20000) {
            Message({
                message: res.message || 'Error',
                type: 'error',
                duration: 1000
            })
            return Promise.reject(new Error(res.message || 'Error'))
        } else {
            return res
        }
    },
    error => {
        Message({
            message: error.message,
            type: 'error',
            duration: 1000
        })
        return Promise.reject(error)
    }
)

export default service

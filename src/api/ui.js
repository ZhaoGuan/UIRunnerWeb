import request from "@/utils/request";

const basePath = "/ui"

export function connect(request_body) {
    return request({
        url: basePath + '/uia2/connect',
        method: 'post',
        data: request_body
    })
}

export function hierarchy(deviceId) {
    return request({
        url: basePath + '/uia2/hierarchy',
        method: 'get',
        params: {deviceId}
    })
}

export function screenshot(deviceId) {
    return request({
        url: basePath + '/uia2/screenshot',
        method: 'get',
        params: {deviceId}
    })
}

export function functionList(funcType) {
    return request({
        url: '/driver/function/list',
        method: 'get',
        params: {funcType}
    })
}

export function caseTest(request_body) {
    return request({
        url: '/case/test',
        method: 'post',
        data: request_body
    })
}

export function taskResult(taskId) {
    return request({
        url: '/task/result',
        method: 'get',
        params: {taskId}
    })
}
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
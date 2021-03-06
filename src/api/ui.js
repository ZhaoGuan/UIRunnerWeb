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

export function getNotRunDevices() {
    return request({
        url: '/devices/all_not_running',
        method: 'get',
    })
}

export function setDeviceStatus(request_body) {
    return request({
        url: '/devices/set_run',
        method: 'post',
        data: request_body
    })
}

export function checkDeviceRunning(request_body) {
    return request({
        url: '/devices/check_running',
        method: 'post',
        data: request_body
    })
}

export function getChromeList() {
    return request({
        url: '/web-docker/all',
        method: 'get',
    })
}

export function createChrome() {
    return request({
        url: '/web-docker',
        method: 'post',
    })
}

export function stopChrome(body) {
    return request({
        url: '/web-docker',
        method: 'delete',
        data: body
    })
}

export function getDriver(dockerName) {
    return request({
        url: '/web-docker-driver',
        method: 'get',
        params: {dockerName}
    })
}


export function getDockerDriverScreen(dockerName) {
    return request({
        url: '/web-docker/screen',
        method: 'get',
        params: {dockerName}
    })
}

export function getCaseTree() {
    return request({
        url: '/case/tree',
        method: 'get',
    })
}

export function renameCaseTree(body) {
    return request({
        url: '/case/tree',
        method: 'put',
        data: body
    })
}

export function getCaseDir() {
    return request({
        url: '/case/dir',
        method: 'get',
    })
}

export function createCaseDir(body) {
    return request({
        url: '/case/dir',
        method: 'post',
        data: body
    })
}


export function checkCaseExists(path) {
    return request({
        url: '/case/exists-check',
        method: 'get',
        params: {path}
    })
}

export function getCaseData(path) {
    return request({
        url: '/case',
        method: 'get',
        params: {path}
    })
}

export function saveCaseData(body) {
    return request({
        url: '/case',
        method: 'post',
        data: body
    })
}

export function deleteCase(body) {
    return request({
        url: '/case',
        method: 'delete',
        data: body
    })
}


export function ignoreCases(body) {
    return request({
        url: '/case/ignore',
        method: 'post',
        data: body
    })
}

export function unIgnoreCases(body) {
    return request({
        url: '/case/ignore',
        method: 'delete',
        data: body
    })
}
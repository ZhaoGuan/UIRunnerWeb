import {alertMessage, message} from "@/utils/tools";

export const Python = {}

Python.pyshell = {
    ws: null,
    wsOpen: null,
    base: false,
    running: false
}
Python.loading = null
Python.platform = null
Python.deviceId = null
Python.canvas = null
Python.setLoadingData = []
Python.running = false
Python.setLoading = function () {
    for (const key in Python.setLoadingData) {
        const callBack = Python.setLoadingData[key]
        if (callBack.data) {
            callBack.func(callBack.data)
        } else {
            callBack.func()
        }
    }
}
Python.callBackData = []
Python.callBack = function () {
    for (const key in Python.callBackData) {
        const callBack = Python.callBackData[key]
        if (callBack.data) {
            callBack.func(callBack.data)
        } else {
            callBack.func()
        }
    }
}
Python.nodeSelectedXpath = null
// Functions
Python.initPythonWebSocket = function () {
    // 初始化变量
    const proEnv = require('@/config/pro.env'); // 生产环境
    const devEnv = require('@/config/dev.env'); // 本地环境
    let baseUrl = null
    let host = null
    switch (process.env.NODE_ENV) {
        case 'development':
            baseUrl = devEnv.baseurl;
            break;
        case 'production':
            baseUrl = proEnv.baseurl; //打包完路径
            break;
    }
    if (baseUrl && baseUrl.includes("http://")) {
        host = baseUrl.replace("http://", "")
    }
    if (baseUrl && baseUrl.includes("https://")) {
        host = baseUrl.replace("https://", "")
    }
    const ws = this.pyshell.ws = new WebSocket("ws://" + host + "/ui/ws/python")
    ws.onopen = () => {
        this.pyshell.wsOpen = true
        console.log("websocket opened")
    }
    ws.onmessage = (messageData) => {
        const data = JSON.parse(messageData.data)
        this.pyshell.running = false
        console.log("Python Run", data)
        if (data.status === "SUCCESS") {
            message("操作执行成功", "请等待页面刷新!")
            this.callBack()
        }
        if (data.status === "FAIL") {
            alertMessage("操作执行错误", "错误内容: " + data.message)
        }
    }
    ws.onclose = () => {
        this.pyshell.wsOpen = false
        this.pyshell.running = false
        console.log("websocket closed")
    }
}
Python.generatePreloadCode = function () {
    const m = this.deviceId.match(/^([^:]+):(.*)/)
    const deviceUrl = m[2]
    let codeLines;
    if (m[1] === "ios") {
        codeLines = [
            "import os",
            "from mobile.mobile_driver import MobileDriver",
            "from mobile.mobile_customize_action import MobileCustomize",
            `md = MobileDriver("ios","${deviceUrl}")`,
            "d = md()",
            "action = MobileCustomize(d)",
        ]
    } else if (m[1] === "android") {
        codeLines = [
            "import os",
            "from mobile.mobile_driver import MobileDriver",
            "from mobile.mobile_customize_action import MobileCustomize",
            `md = MobileDriver("android","${deviceUrl}")`,
            "d = md()",
            "action = MobileCustomize(d)",
        ]
    } else {
        console.error("Unsupported deviceId", this.deviceId)
        codeLines = [
            `print("Unsupported deviceId: ${this.deviceId}")`
        ]
    }
    this.pyshell.base = true
    return codeLines.join("\n") + "\n";
}
Python.runPython = function (code) {
    if (!this.pyshell.running) {
        console.log(code)
        message("已执行", "请等待结果!")
        return new Promise((resolve) => {
            this.pyshell.running = true
            this.pyshell.ws.send(JSON.stringify({method: "input", value: code}))
            resolve()
        }).then()
    }

}
Python.doUnlock = function () {
    const code = `d.unlock()`
    this.loading = true;
    this.runPython(code)
}
Python.doSendKeys = function (text) {
    if (!text) {
        text = window.prompt("Input text?")
    }
    if (!text) {
        return;
    }
    const code = `d.shell(f"input text ${text}")`
    // const code = `d.send_keys("${text}")`
    this.loading = true;
    this.runPython(code)
}
Python.doSetText = function (text) {
    if (!text) {
        text = window.prompt("Input text?")
    }
    if (!text) {
        return;
    }
    if (this.nodeSelectedXpath) {
        let code = this.generateNodeSelectorCode(this.nodeSelectedXpath)
        code += `.set_text("${text}")`
        this.loading = true;
        this.runPython(code)
    }
}
Python.doClear = function () {
    if (this.nodeSelectedXpath) {
        let code = ""
        if (this.platform === 'iOS') {
            code = this.generateNodeSelectorCode(this.nodeSelectedXpath)
            code += '.clear_text()'
        } else {
            code = this.generateNodeSelectorCode(this.nodeSelectedXpath)
            code += ".click()\n"
            code += 'd.clear_text()'
        }
        this.loading = true;
        this.runPython(code)
    }
}
Python.doPositionTap = function (x, y) {
    const code = 'd.click(' + x + ', ' + y + ')'
    this.runPython(code)
}
Python.generateNodeSelectorCode = function () {
    return `d.xpath('${this.nodeSelectedXpath}')`
}
Python.doTap = function () {
    let code = this.generateNodeSelectorCode();
    // FIXME(ssx)= put into a standalone function
    code += ".click()"
    this.nodeSelectedXpath = null;
    this.loading = true;
    this.runPython(code)
}
Python.doLocationTap = function () {
    const code = `action.click_element_rect('${this.nodeSelectedXpath}')`
    this.nodeSelectedXpath = null;
    this.loading = true;
    this.runPython(code)
}
Python.doKeyEventNu = function (meta) {
    let code = 'd.shell("input keyevent ' + meta + '")'
    this.loading = true
    this.runPython(code)
}
Python.doKeyEvent = function (meta) {
    let code = 'd.press("' + meta + '")'
    if (this.platform !== 'Android' && meta === 'home') {
        code = 'd.home()'
    }
    this.loading = true
    this.runPython(code)
}
Python.doSwipe = function (begin, end) {
    let code = null
    const canvasWidth = this.canvas.fg.offsetWidth
    const canvasHeight = this.canvas.fg.offsetHeight
    if (this.pyshell.wsOpen) {
        if (this.platform === "Android") {
            code = `d.swipe(${begin.x / canvasWidth}, ${begin.y / canvasHeight},${end.x / canvasWidth}, ${end.y / canvasHeight})`
        } else {
            code = `d.swipe(${begin.x / canvasWidth}, ${begin.y / canvasHeight},${end.x / canvasWidth}, ${end.y / canvasHeight})`
        }
        this.loading = true;
        this.runPython(code)
    }
}
Python.iOSBack = function () {
    // const code = `d.swipe(0,0.5,0.5,0.5)`
    const code = `action.back()`
    this.runPython(code)
}
Python.startApp = function (packName, activity) {
    // start_app()
    let code = null
    if (this.platform === 'Android') {
        code = `md.start_app("${packName}","${activity}")`
    } else {
        code = `md.start_app("${packName}")`
    }
    this.runPython(code)
}
Python.androidUnlock = function (passWord) {
    const code = `md.android_unlock('${passWord}')`
    this.runPython(code)
}
Python.findElement = function (location) {
    const code = `action.wait_element('${location}')`
    this.runPython(code)
}
Python.doClick = function (location) {
    const code = `action.click_element('${location}')`
    this.runPython(code)
}
Python.doImgCheck = function (search_b64_img) {
    const code = `action.image_match('${search_b64_img}')`
    this.runPython(code)
}
Python.androidSetOrientation = function (value) {
    const code = `action.android_set_orientation(${value})`
    this.runPython(code)
}
Python.doFuncTest = function (value) {
    const func = value.TYPE
    let params = ''
    for (const key in value.DATA) {
        params += `${key}='${value.DATA[key]}',`
    }
    const code = `action.${func}(${params})`
    this.runPython(code)
}
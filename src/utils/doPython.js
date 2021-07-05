export const Python = {}
Python.pyshell = {
    ws: null,
    wsOpen: null,
}
Python.loading = null
Python.platform = null
Python.deviceId = null
Python.canvas = null
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
    ws.onmessage = (message) => {
        const data = JSON.parse(message.data)
        console.log(data)
    }
    ws.onclose = () => {
        this.pyshell.wsOpen = false
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
            "from commen.action_import import MobileActionImport",
            `d = MobileDriver("ios","${deviceUrl}")`,
            "d = d()",
            "ai = MobileActionImport(d())",
            "d.healthcheck()"
        ]
    } else if (m[1] === "android") {
        codeLines = [
            "import os",
            "from mobile.mobile_driver import MobileDriver",
            "from commen.action_import import MobileActionImport",
            `d = MobileDriver("android","${deviceUrl}")`,
            "d = d()",
            "ai = MobileActionImport(d())",
        ]
    } else {
        console.error("Unsupported deviceId", this.deviceId)
        codeLines = [
            `print("Unsupported deviceId: ${this.deviceId}")`
        ]
    }
    return codeLines.join("\n") + "\n";
}
Python.runPython = function (code) {
    console.log(code)
    return new Promise((resolve) => {
        this.pyshell.running = true
        console.log(this.pyshell.ws)
        this.pyshell.ws.send(JSON.stringify({method: "input", value: code}))
        resolve()
    }).then(this.callBack)
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
        this.doClear()
        let code = this.generateNodeSelectorCode(this.nodeSelectedXpath)
        code += `.set_text("${text}")`
        this.loading = true;
        this.runPython(code)
    }
}
Python.doClear = function () {
    if (this.nodeSelectedXpath) {
        let code = this.generateNodeSelectorCode(this.nodeSelectedXpath)
        code += '.clear_text()'
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
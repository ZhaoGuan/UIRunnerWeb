import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import {hierarchy, screenshot, functionList} from "@/api/ui";
import {b64toBlob} from "@/utils/common"

Vue.use(Vuex)
/* eslint-disable no-new */
const store = new Vuex.Store({
    plugins: [
        createPersistedState,
    ],
    state: {
        deviceUrl: null,
        platform: "Android",
        deviceId: null,
        serial: localStorage.serial || "",
        ScreenUrl: localStorage.ScreenUrl || "",
        BaseIosScreenUrl: localStorage.BaseIosScreenUrl || "",
        iosScreenUrl: null,
        loading: false,
        liveScreen: false,
        pythonWs: null,
        PythonWsOpen: null,
        hierarchy: null,
        jsonHierarchy: null,
        activity: null,
        packageName: null,
        windowSize: null,
        imgBlob: null,
        cursor: null,
        nodeSelected: null,
        nodeSelectedId: null,
        selectedElement: null,
        funDocList: null,
        tapPoint: null,
        actionList: [],
        mouseHoverLock: false,
        alertClose: [],
        saveAlertClose: localStorage.saveAlertClose || ""
    },
    getters: {
        getDeviceUrl: state => state.deviceUrl,
        getPlatform: state => state.platform,
        getDeviceId: state => state.deviceId,
        getSerial: state => state.serial,
        getScreenUrl: state => state.ScreenUrl,
        getIosScreenUrl: state => state.iosScreenUrl,
        getBaseIosScreenUrl: state => state.BaseIosScreenUrl,
        getLoading: state => state.loading,
        getLiveScreen: state => state.liveScreen,
        getJsonHierarchy: state => state.jsonHierarchy,
        getImgBlob: state => state.imgBlob,
        getActivity: state => state.activity,
        getXpath: state => state.xpath,
        getPythonWs: state => state.pythonWs,
        getPythonWsOpen: state => state.PythonWsOpen,
        getCursor: state => state.cursor,
        getNodeSelected: state => state.nodeSelected,
        getNodeSelectedId: state => state.nodeSelectedId,
        getSelectedElement: state => state.selectedElement,
        getWindowSize: state => state.windowSize,
        getFuncDocList: state => state.funDocList,
        getTapPoint: state => state.tapPoint,
        getActionList: state => state.actionList,
        getMouseHoverLock: state => state.mouseHoverLock,
        getAlertClose: state => state.alertClose,
        getSaveAlertClose: state => state.saveAlertClose

    },
    mutations: {
        setDeviceUrl(state, data) {
            state.deviceUrl = data
        },
        setPlatform(state, data) {
            console.log(data)
            state.platform = data
        },
        setDeviceId(state, data) {
            state.deviceId = data
        },
        setSerial(state, data) {
            localStorage.setItem("serial", data)
            state.serial = data
        },
        setScreenUrl(state, data) {
            localStorage.setItem("ScreenUrl", data)
            state.ScreenUrl = data
        },
        setIosScreenUrl(state, data) {
            state.iosScreenUrl = data
        },
        setBaseIosScreenUrl(state, data) {
            localStorage.setItem("BaseIosScreenUrl", data)
            // state.iosScreenUrl = data
        },
        setLoading(state, data) {
            state.loading = data
        },
        setLiveScreen(state, data) {
            state.liveScreen = data
        },
        setJsonHierarchy(state, data) {
            state.jsonHierarchy = data
        },
        setActivity(state, data) {
            state.activity = data
        },
        setXpath(state, data) {
            state.xpath = data
        },
        setImgBlob(state, data) {
            state.imgBlob = data
        },
        setPythonWs(state, data) {
            state.pythonWs = data
        },
        setPythonWsOpen(state, data) {
            state.PythonWsOpen = data
        },
        setCursor(state, data) {
            state.cursor = data
        },
        setNodeSelected(state, data) {
            state.nodeSelected = data
        },
        setNodeSelectedId(state, data) {
            state.nodeSelectedId = data
        },
        setSelectedElement(state, data) {
            state.selectedElement = data
        },
        setWindowSize(state, data) {
            state.windowSize = data
        },
        setFuncDocList(state, data) {
            state.funDocList = data
        },
        setTapPoint(state, data) {
            state.tapPoint = data
        },
        setActionList(state, data) {
            state.actionList = data
        },
        setMouseHoverLock(state, data) {
            state.mouseHoverLock = data
        },
        setAlertClose(state, data) {
            state.alertClose = data
        },
        setSaveAlertClose(state, data) {
            localStorage.setItem("saveAlertClose", data)
        }
    },
    modules: {},
    actions: {
        setIsLoading({commit}) {
            commit("setLoading", true)
        },
        initPythonWebSocket({commit}) {
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
                commit("setPythonWsOpen", true)
                console.log("websocket opened")
            }
            ws.onmessage = (message) => {
                const data = JSON.parse(message.data)
                console.log(data)
            }
            ws.onclose = () => {
                this.pyshell.wsOpen = false
                commit("setPythonWsOpen", false)
            }
        },
        screenRefresh({commit}) {
            if (!this.getters.getLiveScreen) {
                commit("setLoading", true)
                console.log("Do Screen")
                screenshot(this.getters.getDeviceId)
                    .then(function (ret) {
                        commit("setImgBlob", b64toBlob(ret.data.data, 'image/' + ret.data.type))
                        commit("setLoading", false)
                    })
            }
        },
        hierarchyRefresh({commit}) {
            if (!this.getters.getLiveScreen) {
                commit("setLoading", true)
            }
            hierarchy(this.getters.getDeviceId).then(response => {
                console.log("Do Hierarchy")
                commit("setJsonHierarchy", JSON.parse(JSON.stringify(response.data.jsonHierarchy)))
                commit("setActivity", response.data.packageName + "/" + response.data.activity)
                // state.packageName = response.data.packageName
                // state.windowSize = response.data.windowSize
                commit("setWindowSize", response.data.windowSize)
                if (!this.getters.getLiveScreen) {
                    commit("setLoading", false)
                }
            })
            // return state.jsonHierarchy
        },
        RefreshHierarchyWithScreen({commit}) {
            this.screenRefresh(commit)
            this.hierarchyRefresh(commit)
            commit("setLoading", false)
        },
        getFuncDocList({commit}) {
            functionList("mobil").then(response => {
                if (response.code === 20000) {
                    commit("setFuncDocList", response.data)
                }
            })
        }
    }
})

export default store

import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import {hierarchy, screenshot, functionList, getDockerDriverScreen} from "@/api/ui";
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
        resetHierarchy: 0,
        activity: null,
        packageName: null,
        windowSize: null,
        imgBlob: null,
        cursor: null,
        nodeSelected: null,
        nodeSelectedId: null,
        isUseFullXpath: false,
        selectedElementXpathLite: null,
        selectedElementXpath: null,
        funDocList: null,
        tapPoint: null,
        actionList: [],
        mouseHoverLock: false,
        alertClose: [],
        customizeLocation: null,
        saveAlertClose: localStorage.saveAlertClose || "",
        saveScreen: null,
        swipePoint: null,
        deviceType: null,
        webDockerName: null,
        sessionId: null,
        driverUrl: null,
        webXpath: null,
        webLocation: null,
        iframe: null
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
        getResetHierarchy: state => state.resetHierarchy,
        getImgBlob: state => state.imgBlob,
        getActivity: state => state.activity,
        getXpath: state => state.xpath,
        getPythonWs: state => state.pythonWs,
        getPythonWsOpen: state => state.PythonWsOpen,
        getCursor: state => state.cursor,
        getNodeSelected: state => state.nodeSelected,
        getNodeSelectedId: state => state.nodeSelectedId,
        getIsUseFullXpath: state => state.isUseFullXpath,
        getSelectedElementXpathLite: state => state.selectedElementXpathLite,
        getSelectedElementXpath: state => state.selectedElementXpath,
        getSelectedElement: state => {
            if (state.isUseFullXpath) {
                return state.selectedElementXpath
            } else {
                return state.selectedElementXpathLite
            }
        },
        getWindowSize: state => state.windowSize,
        getFuncDocList: state => state.funDocList,
        getTapPoint: state => state.tapPoint,
        getActionList: state => state.actionList,
        getMouseHoverLock: state => state.mouseHoverLock,
        getAlertClose: state => state.alertClose,
        getSaveAlertClose: state => state.saveAlertClose,
        getCustomizeLocation: state => state.customizeLocation,
        getSaveScreen: state => state.saveScreen,
        getSwipePoint: state => state.swipePoint,
        getDeviceType: state => state.deviceType,
        getWebDockerName: state => state.webDockerName,
        getDriverUrl: state => state.driverUrl,
        getSessionId: state => state.sessionId,
        getWebXpath: state => state.webXpath,
        getWebLocation: state => JSON.parse(state.webLocation),
        getIframe: state => state.iframe
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
            state.BaseIosScreenUrl = data
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
        setRestHierarchy(state, data) {
            state.resetHierarchy = data
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
        setIsUseFullXpath(state, data) {
            state.isUseFullXpath = data
        },
        setSelectedElementXpathLite(state, data) {
            state.selectedElementXpathLite = data
        },
        setSelectedElementXpath(state, data) {
            state.selectedElementXpath = data
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
        },
        setCustomizeLocation(state, data) {
            state.customizeLocation = data
        },
        setSaveScreen(state, data) {
            state.saveScreen = data
        },
        setSwipePoint(state, data) {
            state.swipePoint = data
        },
        setDeviceType(state, data) {
            state.deviceType = data
        },
        setWebDockerName(state, data) {
            state.webDockerName = data
        },
        setDriverUrl(state, data) {
            state.driverUrl = data
        },
        setSessionId(state, data) {
            state.sessionId = data
        },
        setWebXpath(state, data) {
            state.webXpath = data
        },
        setWebLocation(state, data) {
            state.webLocation = data
        },
        setIframe(state, data) {
            state.iframe = data
        }
    },
    modules: {},
    actions: {
        setIsLoading({commit}) {
            commit("setLoading", true)
        },
        screenRefresh({commit}) {
            if (this.state.deviceType === "mobile") {
                commit("setLoading", true)
                screenshot(this.getters.getDeviceId)
                    .then(function (ret) {
                        commit("setImgBlob", b64toBlob(ret.data.data, 'image/' + ret.data.type))
                        commit("setLoading", false)
                    })
            } else {
                console.log("WEB SCREEN")
                getDockerDriverScreen(this.getters.getWebDockerName).then(res => {
                    commit("setImgBlob", b64toBlob(res.data.data, 'image/' + res.data.type))
                })
            }

        },
        hierarchyRefresh({commit}) {
            if (!this.getters.getLiveScreen) {
                commit("setLoading", true)
            }
            hierarchy(this.getters.getDeviceId).then(response => {
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
            if (!this.getters.getLiveScreen) {
                this.screenRefresh(commit)
            }
            this.hierarchyRefresh(commit)
            commit("setLoading", false)
        },
        getFuncDocList({commit}) {
            functionList(this.state.deviceType).then(response => {
                if (response.code === 20000) {
                    commit("setFuncDocList", response.data)
                }
            })
        }
    }
})

export default store

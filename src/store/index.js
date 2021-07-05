import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import {hierarchy, screenshot} from "@/api/ui";
import {b64toBlob} from "@/utils/common"

Vue.use(Vuex)
/* eslint-disable no-new */
const store = new Vuex.Store({
    plugins: [
        createPersistedState,
    ],
    state: {
        deviceUrl: null,
        platform: localStorage.platform || "Android",
        deviceId: null,
        serial: localStorage.serial || "",
        ScreenUrl: null,
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
        nodeSelectedId: null
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

    },
    mutations: {
        setDeviceUrl(state, data) {
            state.deviceUrl = data
        },
        setPlatform(state, data) {
            localStorage.setItem("platform", data)
            // state.platform = data

        },
        setDeviceId(state, data) {
            state.deviceId = data
        },
        setSerial(state, data) {
            localStorage.setItem("serial", data)
            // state.serial = data
        },
        setScreenUrl(state, data) {
            state.ScreenUrl = data
        },
        setIosScreenUrl(state,data){
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
            console.log(data)
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
        }
    },
    modules: {},
    actions: {
        screenRefresh({commit}) {
            console.log(this.getters.getLiveScreen)
            if (!this.getters.getLiveScreen) {
                screenshot(this.getters.getDeviceId)
                    .then(function (ret) {
                        console.log("Image")
                        commit("setImgBlob", b64toBlob(ret.data.data, 'image/' + ret.data.type))
                    })
            }
        },
        hierarchyRefresh({commit}) {
            hierarchy(this.getters.getDeviceId).then(response => {
                console.log("Do Hierarchy")
                // this.$bus.$emit("jsonHierarchy", response.data.jsonHierarchy)
                commit("setJsonHierarchy", JSON.parse(JSON.stringify(response.data.jsonHierarchy)))
                commit("setActivity", response.data.packageName + "/" + response.data.activity)
                // state.packageName = response.data.packageName
                // state.windowSize = response.data.windowSize
            })
            // return state.jsonHierarchy
        },
    }
})

export default store

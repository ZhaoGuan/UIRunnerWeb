<template>
  <el-card>
    <el-row>
      <el-col :span="3">
        <el-select size="mini" v-model="deviceFrom" placeholder="请选择设备源">
          <el-option
              v-for="item in deviceFromOptions"
              :key="item.value"
              :label="`设备来源${item.label}`"
              :value="item.value">
          </el-option>
        </el-select>
      </el-col>
      <el-col v-if="deviceFrom==='free'" :span="2">
        <el-select size="mini" v-model="platform">
          <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value">
          </el-option>
        </el-select>
      </el-col>
      <el-col v-if="deviceFrom==='free'" :span="8">
        <div v-show="platform==='Android'">
          <el-input size="mini" v-model="serial"/>
        </div>
        <div v-show="platform==='iOS'">
          <el-col :span="12">
            <el-input size="mini" v-model="serial"/>
          </el-col>
          <el-col :span="12">
            <el-input size="mini" v-model="iosScreenUrl"/>
          </el-col>
        </div>
      </el-col>
      <el-col v-if="deviceFrom==='local'" :span="9">
        <el-select size="mini" v-model="localDeviceId" style="width: 100%">
          <el-option
              v-for="item in deviceList"
              :key="item.udid"
              :label="`${item.device_type}-${item.udid}`"
              :value="item.udid">
          </el-option>
        </el-select>
      </el-col>
      <el-col v-if="deviceFrom==='local'" :span="1">
        <el-button icon="el-icon-refresh-left" size="mini" type="success" @click="toGetNorRunDevices"/>
      </el-col>
      <el-col :span="2">
        <el-button size="mini" @click="doConnect" style="width:100%"
                   :disabled="(serial===null&&deviceFrom==='local')||deviceFrom===null">
          连接设备
        </el-button>
      </el-col>
      <el-col :span="2">
        <el-popover
            placement="top-start"
            title="备注"
            :width="200"
            trigger="hover"
            content='页面结构有不准确的时候请做以下事情：1.请关闭虚拟按钮 2.横屏的时候旋转手机的留海至右侧'
        >
          <template #reference>
            <el-button size="mini" :disabled="loading || connecting" style="width:100%"
                       @click="dumpHierarchyWithScreen">获取页面结构
            </el-button>
          </template>
        </el-popover>
      </el-col>
      <el-col :span="2">
        <el-popover
            v-show="platform==='Android'"
            placement="top-start"
            title="备注"
            :width="200"
            trigger="hover"
            content='主要用于横屏兼容问题，用于强制刷新页面结构。问题原因是Android11的时候UIA2做横屏兼容与MiniCap冲突导致横向截图变回纵向'
        >
          <template #reference>
            <el-button size="mini" style="width:100%"
                       @click="setRestHierarchy">重置页面结构
            </el-button>
          </template>
        </el-popover>
      </el-col>
      <el-col :span="2">
        <el-popover
            placement="top-start"
            title="备注"
            :width="200"
            trigger="hover"
            content='由于现在UIA2兼容问题现在只能通过切换实时和静态来保证抓到的页面显示正确'
        >
          <template #reference>
            <el-switch v-model="liveScreen" active-text="实时" inactive-text="静态" @change="liveDevice">
            </el-switch>
          </template>
        </el-popover>
      </el-col>
      <el-col :span="1">
        <el-button size="mini" v-if="platform==='iOS'&&liveScreen" class="btn btn-default" @click="iosLiveScreen">刷新
        </el-button>
      </el-col>
    </el-row>
  </el-card>
</template>

<script>
import {connect, getNotRunDevices, setDeviceStatus} from "@/api/ui"
import {Python} from "@/utils/doPython";
import {message} from "@/utils/tools";

const {checkDeviceRunning} = require("@/api/ui");

export default {
  name: "DeviceHeader",
  data() {
    return {
      options: [
        {key: "Android", value: "Android"},
        {key: "iOS", value: "iOS"}
      ],
      deviceFrom: null,
      deviceFromOptions: [{label: "自由", value: "free"}, {label: "本地", value: "local"}],
      deviceList: [],
      deviceMapping: {},
      localDeviceId: null,
      oldLocalDeviceId: null,
      platform: this.$store.getters.getPlatform,
      ScreenUrl: this.$store.getters.getScreenUrl,
      iosScreenUrl: this.$store.getters.getBaseIosScreenUrl,
      serial: this.$store.getters.getSerial,
      liveScreen: false,
      connecting: false,
      python: Python
    }
  },
  watch: {
    "this.python.pyshell.wsOpen": function (event) {
      if (!event) {
        this.python.initPythonWebSocket()
        setTimeout(() => this.python.runPython(this.python.generatePreloadCode()), 2000)
      }
    },
    platform: function (event) {
      this.$store.commit("setPlatform", event)
      this.python.platform = event
    },
    deviceFrom: function (event) {
      if (event === "local") {
        this.serial = null
        this.toGetNorRunDevices()
      } else {
        this.localDeviceId = null
        this.platform = this.$store.getters.getPlatform
        this.ScreenUrl = this.$store.getters.getScreenUrl
        this.iosScreenUrl = this.$store.getters.getBaseIosScreenUrl
      }
    },
    localDeviceId: function (value, old) {
      this.toCheckDeviceRunning(old, value)
    },
    deviceId: function (event) {
      this.$store.commit("setDeviceId", event)
      let deviceUrl = null
      if (this.platform === 'Android') {
        deviceUrl = this.platform + ":" + this.serial
      } else {
        deviceUrl = this.serial
      }
      this.$store.commit("setDeviceUrl", deviceUrl)
    },
    serial: function (event) {
      this.$store.commit("setSerial", event)
    },
    liveScreen: function (event) {
      this.$store.commit("setLiveScreen", event)
    },
    "$store.state.liveScreen": function () {
      if (this.$store.getters.getLiveScreen !== this.liveScreen) {
        this.liveScreen = this.$store.getters.getLiveScreen
      }
    },
    iosScreenUrl: function (event) {
      this.iosScreenUrl = event
      this.$store.commit("setBaseIosScreenUrl", event)
      this.$store.commit("setIosScreenUrl", event + '?random=' + Math.random())
    }
  },
  created() {
  },
  beforeDestroy() {
    if (this.localDeviceId) {
      this.toSetDeviceStata(this.localDeviceId, false)
    }
    if (this.python.ws) {
      this.python.ws.close()
    }
  },
  computed: {
    loading() {
      return this.$store.getters.getLoading
    },
  },
  methods: {
    toGetNorRunDevices() {
      getNotRunDevices().then(response => {
        if (response.code === 20000) {
          this.deviceList = response.data
          this.deviceMapping = {}
          for (const index in this.deviceList) {
            const temp = this.deviceList[index]
            this.deviceMapping[temp.udid] = temp
          }
          message("刷新本地设备成功!", "请查看设备列表")
        }
      })
    },
    doConnect() {
      // TODO 设备被使用 准备使用socketIo 其实http接口就好 页面销毁 更换设备连接的时候都要 取消设备状态
      this.python.initPythonWebSocket()
      setTimeout(() => this.python.runPython(this.python.generatePreloadCode()), 2000)
      this.$store.commit("setLoading", true)
      connect({
        deviceUrl: this.serial,
        platform: this.platform
      }).then((ret) => {
        if (this.oldLocalDeviceId) {
          this.toSetDeviceStata(this.oldLocalDeviceId, false)
        }
        this.toSetDeviceStata(this.localDeviceId, true)
        const deviceId = ret.data.deviceId
        this.$store.commit("setDeviceId", deviceId)
        this.screenWebSocketUrl = ret.data.screenWebSocketUrl
        this.$store.commit("setScreenUrl", ret.data.screenWebSocketUrl)
        this.python.platform = this.platform
        this.python.deviceId = deviceId
        // TODO WDA能获取到DeviceId这个就不需要了
        this.python.iosDeviceId = this.localDeviceId
        this.python.callBackData = [
          {
            func: this.$store.dispatch,
            data: "screenRefresh"
          }, {
            func: this.$store.dispatch,
            data: "hierarchyRefresh"
          },
        ]
        this.python.setLoadingData = [
          {
            func: this.$store.dispatch,
            data: "setIsLoading"
          }
        ]
        this.python.runPython(this.python.generatePreloadCode())
        this.dumpHierarchyWithScreen()
        this.toGetNorRunDevices()
      })
    },
    dumpHierarchyWithScreen() {
      this.$store.dispatch("screenRefresh")
      this.$store.dispatch("hierarchyRefresh")
    },
    setRestHierarchy() {
      let count = this.$store.getters.getResetHierarchy
      this.$store.commit("setRestHierarchy", count += 1)
    },
    liveDevice() {
      switch (this.$store.getters.getPlatform) {
        case ("Android"): {
          if (this.$store.getters.getScreenUrl === null) {
            this.doConnect()
            this.liveScreen = false
          } else {
            this.$store.commit("setLiveScreen", this.liveScreen)
          }
          break
        }
        case ("iOS"): {
          if (this.$store.getters.getDeviceId === null) {
            this.doConnect()
            this.liveScreen = false
          } else {
            this.$store.commit("setIosScreenUrl", this.iosScreenUrl + '?random=' + Math.random())
            this.$store.commit("setLiveScreen", this.liveScreen)
          }
        }
      }

    },
    iosLiveScreen() {
      this.$store.commit("setIosScreenUrl", this.iosScreenUrl + '?random=' + Math.random())
    },
    toSetDeviceStata(duid, setStatus) {
      setDeviceStatus({
        duid: duid,
        status: setStatus
      })
    },
    toCheckDeviceRunning(old, value) {
      checkDeviceRunning({duid: this.localDeviceId}).then(res => {
        if (res.code === 20000) {
          this.oldLocalDeviceId = old
          if (value !== null) {
            const deviceData = this.deviceMapping[this.localDeviceId]
            if (deviceData.device_type === 'android') {
              this.platform = "Android"
              this.serial = `${deviceData.host}:${deviceData.udid}`
            } else {
              this.platform = 'iOS'
              this.serial = deviceData.udid_data.wda_url
              this.iosScreenUrl = deviceData.udid_data.screen_url
            }
          }
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
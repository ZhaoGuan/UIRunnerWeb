<template>
  <el-card>
    <el-row>
      <el-col :span="2">
        <el-select size="mini" v-model="platform">
          <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value">
          </el-option>
        </el-select>
      </el-col>
      <el-col :span="8">
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
      <el-col :span="2">
        <el-button size="mini" @click="doConnect" style="width:100%" :disabled="connecting">
          Connect
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
      <el-col :span="1">
        <el-button size="mini" type="danger" v-if="pythonReconnect===false" class="btn btn-default"
                   @click="pythonReConnect">
          重连
        </el-button>
      </el-col>
    </el-row>
  </el-card>
</template>

<script>
import {connect} from "@/api/ui"
import {Python} from "@/utils/doPython";

export default {
  name: "DeviceHeader",
  data() {
    return {
      options: [
        {key: "Android", value: "Android"},
        {key: "iOS", value: "iOS"}
      ],
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
    platform: function (event) {
      this.$store.commit("setPlatform", event)
      this.python.platform = event
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
    this.python.initPythonWebSocket()
  },
  computed: {
    loading() {
      return this.$store.getters.getLoading
    },
    pythonReconnect() {
      return Python.pyshell.wsOpen
    }
  },
  methods: {
    pythonReConnect() {
      this.python.initPythonWebSocket()
      setTimeout(() => this.python.runPython(this.python.generatePreloadCode()), 2000)
    },
    doConnect() {
      this.$store.commit("setLoading", true)
      connect({
        deviceUrl: this.serial,
        platform: this.platform
      }).then((ret) => {
        const deviceId = ret.data.deviceId
        this.$store.commit("setDeviceId", deviceId)
        this.screenWebSocketUrl = ret.data.screenWebSocketUrl
        this.$store.commit("setScreenUrl", ret.data.screenWebSocketUrl)
        this.python.platform = this.platform
        this.python.deviceId = deviceId
        console.log(deviceId)
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
    }
  }
}
</script>

<style scoped>

</style>
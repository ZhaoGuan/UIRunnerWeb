<template>
  <div style="width: 100%">
    <el-row type="flex" justify="start">
      <el-card style="width: 100%;height: 8vh">
        <el-col :span="10">
          <el-select size="mini" v-model="selected" placeholder="请选择Web Docker" style="width: 100%">
            <el-option
                v-for="item in chromeList"
                :key="item.dockerName"
                :label="`本地ChromeDocker:${item.dockerName}`"
                :value="item.dockerName">
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="14" style="text-align: left">
          <el-button size="mini" type="success" @click="doCreateDocker">创建Web Docker</el-button>
          <el-button size="mini" type="success" @click="doGetChromeList" icon="el-icon-refresh-left"/>
          <el-button size="mini" type="success" :disabled="selected===null" @click="connectWebDocker">连接
          </el-button>
          <el-button size="mini" type="danger" :disabled="selected===null" icon="el-icon-delete" @click="doStopDocker"/>
          <el-button size="mini" type="success" :disabled="!python.pyshell.base" @click="doRecording">获取页面布局</el-button>
          <el-button size="mini" type="danger" :disabled="!python.pyshell.base" @click="doStopRecording">关闭页面布局
          </el-button>
        </el-col>
      </el-card>
    </el-row>
    <el-row>
      <el-col :span="15">
        <el-card shadow="never">
          <vncView ref="vncView" style="height: 84vh"/>
        </el-card>
      </el-col>
      <el-col :span="9">
        <el-tabs type="border-card" style="height: 89vh;overflow: auto;">
          <el-tab-pane label="用例动作">
            <WebUICase ref="WebUICase"/>
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import vncView from "@/views/VncView/vncView"
import {getChromeList, createChrome, stopChrome, getDriver} from "@/api/ui"
import {message} from "@/utils/tools";
import WebUICase from "@/views/Web/WebUICase"
import {Python} from "@/utils/doPython";
import {io} from "socket.io-client"

export default {
  name: "Web",
  components: {vncView, WebUICase},
  data() {
    return {
      chromeList: [],
      selected: null,
      chromeData: null,
      driverData: null,
      python: Python,
      socket: null
    }
  },
  watch: {
    "this.sideex.file.command": function (event) {
      console.log(event)
    },
    selected: function (event) {
      this.$store.commit("setWebDockerName", event)
    }
  },
  computed: {
    chromeMapping() {
      let chromeMapping = {}
      for (const index in this.chromeList) {
        const temp = this.chromeList[index]
        chromeMapping[temp.dockerName] = temp
      }
      return chromeMapping
    }
  },
  created() {
    this.socketConnect()
    if (this.python.pyshell.wsOpen) {
      this.python.pyshell.ws.close()
    }
    this.$store.commit("setDeviceType", "web")
    this.$store.commit("setIsUseFullXpath", true)
    this.doGetChromeList()
  },
  destroyed() {
    if (this.socket !== null) {
      this.socket.disconnect()
    }
  },
  mounted() {
  },
  methods: {
    doGetChromeList() {
      getChromeList().then(res => {
        if (res.code === 20000) {
          this.chromeList = res.data
          this.selected = null
        }
        message("刷新WebDocker列表成功!", "请查看WebDocker列表")
      })
    },
    doCreateDocker() {
      createChrome().then(res => {
        if (res.code === 20000) {
          this.chromeList = res.data
        }
        message("Chrome启动成功", "请查看WebDocker列表")
      })
    },
    doStopDocker() {
      this.$refs.vncView.disconnectVnc()
      stopChrome({dockerName: this.selected}).then(res => {
        if (res.code === 20000) {
          this.$refs.vncView.show = false
          this.selected = null
          this.driverData = null
          this.doGetChromeList()
        }
      })
    },
    connectWebDocker() {
      getDriver(this.selected).then(res => {
        if (res.code === 20000) {
          const token = this.chromeMapping[this.selected].token
          // this.$refs.vncView.token = token
          this.$refs.vncView.connectVnc(token)
          this.driverData = res.data
          this.python.initPythonWebSocket()
          setTimeout(() => this.python.runPython(this.python.webDriverConnect(this.driverData.url, this.driverData.sessionId)), 2000)
          this.$store.commit("setDriverUrl", this.driverData.url)
          this.$store.commit("setSessionId", this.driverData.sessionId)
        } else {
          console.log("!!!!!!!")
          this.selected = null
          this.chromeList = []
        }
      })
    },
    socketConnect() {
      this.socket = io("http://0.0.0.0:8888")
      this.socket.on("connect", () => {
        console.log("SocketIO Connect")
      });
      this.socket.on("recording", (data) => {
        this.$store.commit("setSelectedElementXpath", data.xpath)
        console.log(data)
      })
      this.socket.on("disconnect", (reason) => {
        console.log(reason)
      });
    },
    doRecording() {
      this.python.recording(this.$store.getters.getWebDockerName)

    },
    doStopRecording() {
      this.python.stopRecording()
    }
  }
}
</script>

<style scoped>

</style>
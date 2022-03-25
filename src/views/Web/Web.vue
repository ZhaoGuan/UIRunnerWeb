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
        </el-col>
      </el-card>
    </el-row>
    <el-row>
      <el-col :span="12">
        <el-card shadow="never">
          <vncView ref="vncView" style="height: 84vh"/>
        </el-card>
      </el-col>
      <el-col :span="12">
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
      sideex: null
    }
  },
  watch: {
    "this.sideex.file.command": function (event) {
      console.log(event)
    },
    selected: function (event) {
      console.log(event)
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
    this.sideex = new SideeX()
    if (this.python.pyshell.wsOpen) {
      this.python.pyshell.ws.close()
    }
    this.$store.commit("setDeviceType", "web")
    this.doGetChromeList()
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
      this.$refs.vncView.connectVnc(this.chromeMapping[this.selected].token)
      getDriver(this.selected).then(res => {
        if (res.code === 20000) {
          this.driverData = res.data
          this.python.initPythonWebSocket()
          setTimeout(() => this.python.runPython(this.python.webDriverConnect(this.driverData.url, this.driverData.sessionId)), 2000)
        }
      })
    },
  }
}
</script>

<style scoped>

</style>
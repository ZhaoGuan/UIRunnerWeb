<template>
  <div style="width: 100%">
    <el-row type="flex" justify="start">
      <el-card style="width: 100%;height: 8vh">
        <el-col :span="10">
          <el-select size="mini" v-model="selected" placeholder="请选择Web Docker" style="width: 100%">
            <el-option
                v-for="item in chromeList"
                :key="item.chromeIndex"
                :label="`本地ChromeDocker-序号-${item.chromeIndex}`"
                :value="item.chromeIndex">
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-button size="mini" type="success" @click="doCreateDocker">创建Web Docker</el-button>
          <el-button size="mini" type="success" @click="doGetChromeList" icon="el-icon-refresh-left"/>
          <el-button size="mini" type="success" :disabled="selected===null" @click="connectWebDocker">连接
          </el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete" @click="doStopDocker"/>
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
        <el-card shadow="never">
          <WebUICase ref="WebUICase"/>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import vncView from "@/views/VncView/vncView"
import {getChromeList, createChrome, stopChrome, getDriver} from "@/api/ui"
import {message} from "@/utils/tools";
import WebUICase from "@/views/Web/WebUICase"

export default {
  name: "Web",
  components: {vncView, WebUICase},
  data() {
    return {
      chromeList: [],
      selected: null,
      chromeData: null
    }
  },
  watch: {
    // selected: function (event) {
    //   console.log(event)
    //   this.$refs.vncView.connectVnc(this.chromeList[event].token)
    // }
  },
  computed: {},
  mounted() {
    this.doGetChromeList()
  },
  methods: {
    doGetChromeList() {
      getChromeList().then(res => {
        if (res.code === 20000) {
          this.chromeList = res.data
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
      stopChrome({index: this.selected}).then(res => {
        if (res.code === 20000) {
          this.$refs.vncView.show = false
          this.selected = null
          this.doGetChromeList()
        }
      })
    },
    connectWebDocker() {
      this.$refs.vncView.connectVnc(this.chromeList[this.selected].token)
      getDriver(this.selected).then(res => {
        if (res.code === 20000) {
          console.log(res.data)
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
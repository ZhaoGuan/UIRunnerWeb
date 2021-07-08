<template>
  <el-collapse>
    <el-collapse-item title="基础设置">
      <el-form :data="template">
        <el-form-item :size="formItemSize" label="用例名称">
          <el-input :size="formItemSize" label="用例名称" v-model="template.TITLE"></el-input>
        </el-form-item>
        <el-form-item :size="formItemSize" label="用例描述">
          <el-input :size="formItemSize" v-model="template.DESCRIPTION"></el-input>
        </el-form-item>
        <el-form-item v-if="platform==='ANDROID'" :size="formItemSize" label="设备密码">
          <el-input :size="formItemSize" v-model="template.DESIRED_CAPS.passWord"></el-input>
        </el-form-item>
        <el-form-item :size="formItemSize" label="appPackage">
          <el-input :size="formItemSize" v-model="template.DESIRED_CAPS.appPackage"></el-input>
        </el-form-item>
        <el-form-item :size="formItemSize" v-if="platform==='ANDROID'" label="appActivity">
          <el-input :size="formItemSize" v-model="template.DESIRED_CAPS.appPackage"></el-input>
        </el-form-item>
        <el-form-item :size="formItemSize">
          <el-button v-if="platform==='ANDROID'" type="success" :size="formItemSize" @click="unlockDevice">解锁设备
          </el-button>
          <el-button type="success" :size="formItemSize" @click="startApp">启动应用</el-button>
        </el-form-item>
      </el-form>
    </el-collapse-item>
    <el-collapse-item title="动作列表">
      <funcDialog ref="funcDialog"/>
      <el-button type="success" size="mini" @click="openDialog">添加动作</el-button>
      <el-button type="success" size="mini" @click="addTap">添加坐标动作</el-button>
      <el-button type="success" size="mini" @click="clearActionList">清空动作</el-button>

      <el-row v-for="(actioin,key) in actionList" v-bind:key="key">
        {{ actioin }}
      </el-row>
    </el-collapse-item>
  </el-collapse>
</template>

<script>
import {Python} from "@/utils/doPython";
import funcDialog from "./components/funcDialog"

export default {
  name: "UICase",
  components: {funcDialog},
  data() {
    return {
      template: {
        'TITLE': '在线鉴定-鉴定视频',
        'DESCRIPTION': '在线鉴定-鉴定视频',
        'TYPE': this.platform,
        'DESIRED_CAPS':
            {
              'URL': '',
              'appPackage': null,
              'appActivity': null,
              'deviceName': null,
              'passWord': 888888,
              'performance': false,
              'perfHost': "ip",
            },
        'ALERT_CLOSE_ELEMENTS': [],
        'ACTIONS': []
      },
      formItemSize: "mini",
      python: Python,
      actionList: this.$store.getters.getActionList,
      platform: this.$store.getters.getPlatform.toUpperCase(),
      deviceName: this.$store.getters.getDeviceUrl
    }
  },
  created() {
  },
  mounted() {
  },
  watch: {
    '$store.state.platform': function () {
      this.platform = this.$store.getters.getPlatform.toUpperCase()
    },
    '$store.state.deviceUrl': function () {
      this.deviceName = this.$store.getters.getDeviceUrl
    },
    '$store.state.actionList': function () {
      this.actionList = this.$store.getters.getActionList
    },
  },
  computed: {},
  methods: {
    unlockDevice() {
      this.python.androidUnlock(this.template.DESIRED_CAPS.passWord)

    },
    startApp() {
      const appPackage = this.template.DESIRED_CAPS.appPackage
      const appActivity = this.template.DESIRED_CAPS.appActivity
      this.python.startApp(appPackage, appActivity)
    },
    openDialog() {
      this.$refs.funcDialog.openDialog()
    },
    addTap() {
      const point = this.$store.getters.getTapPoint
      if (point === null) {
        return
      }
      const actionList = this.$store.getters.getActionList
      actionList.push({})
      this.$store.commit("setActionList", actionList)
    },
    clearActionList() {
      this.$store.commit("setActionList", [])
    }
  }
}
</script>

<style scoped>

</style>
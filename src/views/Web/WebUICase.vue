<template>
  <div style="overflow: auto">
    <div style="color: black;text-align: left"><code>元素定位:</code></div>
    <el-input size="mini" v-model="elementXpath" clearable @change="clearXpath"></el-input>
    <el-row style="color: black;;text-align: left">
      <el-col :span="6"><code>鼠标点击坐标:</code></el-col>
      <el-col :span="9"><code>x: {{ elementLocation.x }}</code></el-col>
      <el-col :span="9"><code>y: {{ elementLocation.y }}</code></el-col>
    </el-row>
    <el-row style="color: black;;text-align: left">
      <el-col :span="4"><code>iframe:</code></el-col>
      <el-col :span="20">
        <el-input size="mini" v-model="iframeXpath" clearable @change="clearIframeXpath"></el-input>
      </el-col>
    </el-row>
    <el-row>
      <el-button size="mini" type="info" style="text-align: left" @click="saveXpath()">保存自定义Xpath</el-button>
      <el-button size="mini" type="warning" style="text-align: left" @click="testXpath()">元素Xpath测试</el-button>
    </el-row>
    <el-collapse>
      <el-collapse-item title="基础设置">
        <el-form :model="template" :rules="rules" ref="templateForm">
          <el-form-item :size="formItemSize" label="用例名称" prop="TITLE">
            <el-input :size="formItemSize" label="用例名称" v-model="template.TITLE"></el-input>
          </el-form-item>
          <el-form-item :size="formItemSize" label="用例描述" prop="DESCRIPTION">
            <el-input :size="formItemSize" v-model="template.DESCRIPTION"></el-input>
          </el-form-item>
          <el-form-item :size="formItemSize" label="URL" prop="DESIRED_CAPS.URL">
            <el-input :size="formItemSize" v-model="template.DESIRED_CAPS.URL"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button :disabled="show" type="success" :size="formItemSize" @click="getUrl">访问地址</el-button>
            <el-button type="success" :size="formItemSize" @click="clearTemplate">清空设置</el-button>
            <el-button type="info" :size="formItemSize" @click="$refs.fileCaseSelect.caseTreeDialog=true">选择用例
            </el-button>
            <el-upload action="" :auto-upload="false" :on-change="loadYamlCase" accept=".yaml" :show-file-list="false">
              <el-button type="info" :size="formItemSize">本地导入用例</el-button>
            </el-upload>
          </el-form-item>
        </el-form>
      </el-collapse-item>
      <el-collapse-item title="弹窗关闭">
        <el-row>
          <el-input size="mini" v-model="alertCloseName" placeholder="弹窗操作名称"></el-input>
        </el-row>
        <el-row>
          <el-select size="mini" v-model="alertCloseAction">
            <el-option
                v-for="item in alertCloseActionOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
            </el-option>
          </el-select>
          <el-button type="success" size="mini" @click="addAlertClose">添加Alert关闭元素</el-button>
        </el-row>
        <el-table :data="alertCloseList">
          <el-table-column
              prop="name"
              label="名称"
              width="150"
          />
          <el-table-column
              prop="action"
              label="动作"
              width="100"
          />
          <el-table-column
              prop="value"
              label="元素定位"
          />
          <el-table-column label="操作" width="100">
            <template slot-scope="scope">
              <el-button size="mini" type="danger"
                         @click="delAlertClose(scope.row)">DELETE
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-collapse-item>
      <el-collapse-item title="动作列表">
        <el-row>
          <el-button type="success" size="mini" @click="openDialog">添加动作</el-button>
          <el-button type="success" size="mini" @click="addElementClick">元素点击</el-button>
          <el-button type="success" size="mini" @click="addMouseOver">鼠标悬停</el-button>
          <!--        <el-col :span="4">-->
          <!--          <el-button type="success" :disabled="$store.getters.getSwipePoint===null" size="mini" @click="addSwipe">获取页面滑动-->
          <!--          </el-button>-->
          <!--        </el-col>-->
          <el-button :disabled="show" type="success" size="mini" @click="$refs.ScreenTool.openDialog()">图像识别</el-button>
          <el-button type="danger" size="mini" @click="clearActionList">清空动作</el-button>
        </el-row>
        <ScreenTool ref="ScreenTool" device-type="web"/>
        <el-table
            :data="actionList"
            stripe
            :key="Math.random()"
            style="width: 100%">
          <el-table-column
              prop="NAME"
              label="动作名称"
          />
          <el-table-column
              prop="TYPE"
              label="方法"
          />
          <el-table-column label="操作" width="250">
            <template slot-scope="scope">
              <el-row type="flex" justify="center">
                <el-col :span="12" style="text-align:center">
                  <el-button size="mini" icon="el-icon-arrow-up"
                             @click="actionUp(scope.row)">
                  </el-button>
                </el-col>
                <el-col :span="12" style="text-align:center">
                  <el-button size="mini" icon="el-icon-arrow-down"
                             @click="actionDown(scope.row)">
                  </el-button>
                </el-col>
              </el-row>
              <el-row style="text-align:center">
                <el-button size="mini" type="info" @click="funcTest(scope.row)">测试</el-button>
                <el-button size="mini" type="success"
                           @click="editAction(scope.row,scope.$index)">修改
                </el-button>
                <el-button size="mini" type="danger" @click="deleteAction(scope.row)">删除</el-button>
              </el-row>
            </template>
          </el-table-column>
        </el-table>
        <el-row>
          <el-button :disabled="show" type="success" size="mini" @click="yamlCase">生成YML用例
          </el-button>
          <el-button :disabled="show" type="danger" size="mini" @click="runCase">运行</el-button>
          <el-button :disabled="show" type="success" size="mini"
                     @click="getCase() ? $refs.fileCaseSave.saveCaseDialog=true:false">保存
          </el-button>
          <el-button v-if="debugTaskResult" type="danger" size="mini" @click="debugTaskResult=null">清空结果数据</el-button>
        </el-row>
        <div v-if="debugTaskResult">
          <el-table
              :data="debugTaskResult"
              :show-header="true"
              style="width: 100%"
          >
            <el-table-column
                label="动作名称"
                prop="label"
                min-width="180">
            </el-table-column>
            <el-table-column
                label="结果"
                prop="result"
                min-width="80">
            </el-table-column>
            <el-table-column
                label="信息"
                prop="message"
                min-width="180"
            >
            </el-table-column>
          </el-table>
        </div>
      </el-collapse-item>
    </el-collapse>
    <funcDialog ref="funcDialog"/>
    <fileCaseSelect ref="fileCaseSelect" case-type="web"/>
    <fileCaseSave ref="fileCaseSave"/>
  </div>
</template>

<script>
import {Python} from "@/utils/doPython";
import funcDialog from "../components/funcDialog"
import {message} from "@/utils/tools";
import {caseTest, taskResult} from "@/api/ui";
import ScreenTool from "@/views/components/screenTool"
import fileCaseSelect from "@/views/components/fileCaseSelect"
import fileCaseSave from "@/views/components/fileCaseSave"


export default {
  name: "WebUICase",
  components: {funcDialog, ScreenTool, fileCaseSelect, fileCaseSave},
  data() {
    return {
      actionList: this.$store.getters.getActionList,
      alertCloseName: null,
      alertCloseAction: "click",
      alertCloseActionOptions: [
        {label: "点击", value: "click"},
        {label: "接受弹窗", value: "accept_alert"},
        {label: "取消弹窗", value: "cancel_alert"}
      ],
      template: {
        'TITLE': null,
        'DESCRIPTION': null,
        'TYPE': "WEB",
        'DESIRED_CAPS':
            {
              'URL': null,
              'SESSION_ID': null,
              'DRIVER_URL': null
            },
        'ALERT_CLOSE_ELEMENTS': [],
        'ORIENTATION': null,
        'ACTIONS': []
      },
      rules: {
        'TITLE': [
          {required: true, type: 'string', message: '请添加用例名称', trigger: 'change'},
        ],
        'DESCRIPTION': [
          {required: true, type: 'string', message: '请添加描述', trigger: 'blur'}
        ],
        'DESIRED_CAPS.URL': [
          {required: true, type: 'string', message: '请输入URL', trigger: 'blur'}
        ],
      },
      formItemSize: "mini",
      python: Python,
      debugTaskId: null,
      debugTaskTimer: null,
      debugTaskResult: null,
      elementXpath: null,
      elementLocation: {
        x: null,
        y: null
      },
      iframeXpath: null
    }
  },
  created() {
    this.template = {
      'TITLE': null,
      'DESCRIPTION': null,
      'TYPE': "WEB",
      'DESIRED_CAPS':
          {
            'URL': null,
            'SESSION_ID': null,
            'DRIVER_URL': null
          },
      'ALERT_CLOSE_ELEMENTS': [],
      'ORIENTATION': null,
      'ACTIONS': []
    }
  },
  mounted() {
    this.debugTaskTimer = setInterval(this.getDebugTaskResult, 5000)
    const saveAlertClose = this.$store.getters.getSaveAlertClose
    if (saveAlertClose) {
      this.$store.commit("setAlertClose", JSON.parse(saveAlertClose))
    }
  },
  watch: {
    '$store.state.actionList': {
      handler: function () {
        this.actionList = this.$store.getters.getActionList
      },
      immediate: true,
      deep: true
    },
    '$store.state.selectedElementXpath': {
      handler: function () {
        this.elementXpath = this.$store.getters.getSelectedElementXpath
      },
      immediate: true,
      deep: true
    },
    '$store.state.webLocation': {
      handler: function () {
        if (this.$store.getters.getWebLocation) {
          this.elementLocation = this.$store.getters.getWebLocation
        } else {
          this.elementLocation = {
            x: null,
            y: null
          }
        }
      },
      immediate: true,
      deep: true
    },
    '$store.state.iframe': {
      handler: function () {
        this.iframeXpath = this.$store.getters.getIframe
      },
      immediate: true,
      deep: true
    },
    '$store.state.caseBaseData': {
      handler: function () {
        const data = this.$store.getters.getCaseBaseData
        if (data !== null) {
          this.template.TITLE = data.TITLE
          this.template.DESCRIPTION = data.DESCRIPTION
          this.template.ORIENTATION = data.ORIENTATION
          this.template.TYPE = data.TYPE
          this.template.DESIRED_CAPS.URL = data.DESIRED_CAPS.URL
        }
      },
      immediate: true,
      deep: true
    },
  },
  beforeDestroy() {
    this.$store.commit('setCaseBaseData', null)
    this.$store.commit("setActionList", [])
    this.$store.commit("setAlertClose", [])
  },
  computed: {
    show() {
      return !(this.python.pyshell.wsOpen && this.python.pyshell.base);
    },
    alertCloseList() {
      return this.$store.getters.getAlertClose
    }
  },
  methods: {
    getUrl() {
      if (this.template.DESIRED_CAPS.URL) {
        this.python.getUrl(this.template.DESIRED_CAPS.URL, this.$store.getters.getWebDockerName)
      }
    },
    startApp() {
      const appPackage = this.template.DESIRED_CAPS.appPackage
      const appActivity = this.template.DESIRED_CAPS.appActivity
      this.python.startApp(appPackage, appActivity)
    },
    openDialog() {
      if (this.$store.getters.getSelectedElementXpath === null || this.$store.getters.getSelectedElementXpath === "") {
        return
      }
      this.$refs.funcDialog.openDialog()
    },
    addAlertClose() {
      const element = this.elementXpath
      if (this.$store.getters.getSelectedElementXpath === null || this.$store.getters.getSelectedElementXpath === "") {
        return
      }
      const alertCloseList = this.$store.getters.getAlertClose
      if (JSON.stringify(alertCloseList).includes(JSON.stringify(element))) {
        return;
      }
      alertCloseList.push({name: this.alertCloseName, value: element, action: this.alertCloseAction})
      this.$store.commit("setAlertClose", alertCloseList)
      this.$store.commit("setSaveAlertClose", JSON.stringify(alertCloseList))
      this.alertCloseName = null
      this.alertElementLocation = null
    },
    delAlertClose(data) {
      this.alertCloseList.splice(this.alertCloseList.indexOf(data), 1)
      this.$store.commit("setAlertClose", this.alertCloseList)
      this.$store.commit("setSaveAlertClose", JSON.stringify(this.alertCloseList))
    },
    addElementClick() {
      let element = this.elementXpath
      if (element === null || element === "") {
        return
      }
      const actionList = this.$store.getters.getActionList
      actionList.push({
        'NAME': "点击元素:" + element,
        'TYPE': "click_element",
        'DATA': {"location": element}
      })
      this.$store.commit("setActionList", actionList)
    },
    addMouseOver() {
      let element = this.elementXpath
      if (element === null || element === "") {
        return
      }
      const actionList = this.$store.getters.getActionList
      actionList.push({
        'NAME': "悬停元素:" + element,
        'TYPE': "web_mouse_over",
        'DATA': {"location": element}
      })
      this.$store.commit("setActionList", actionList)

    },
    addTap() {
      const point = this.$store.getters.getTapPoint
      if (point === null) {
        return
      }
      const actionList = this.$store.getters.getActionList
      actionList.push({
        'NAME': "点击 坐标点:(" + point.x + "," + point.y + ")",
        'TYPE': "tap",
        'DATA': point
      })
      this.$store.commit("setActionList", actionList)
    },
    clearActionList() {
      this.$store.commit("setActionList", [])
      this.debugTaskResult = null
    },
    funcTest(data) {
      this.python.doWebFuncTest(data)
    },
    editAction(data, index) {
      console.log(this.$store.getters.getActionList)
      this.$refs.funcDialog.updateDialog(data, index)
    },
    deleteAction(data) {
      this.actionList.splice(this.actionList.indexOf(data), 1)
      this.$store.commit("setActionList", this.actionList)

    },
    actionUp(data) {
      const index = this.actionList.indexOf(data)
      if (index !== 0) {
        this.actionList[index] = this.actionList.splice(index - 1, 1, this.actionList[index])[0];
      } else {
        this.actionList.push(this.actionList.shift());
      }
      this.$store.commit("setActionList", this.actionList)
    },
    actionDown(data) {
      const index = this.actionList.indexOf(data)
      if (index !== this.actionList.length - 1) {
        this.actionList[index] = this.actionList.splice(index + 1, 1, this.actionList[index])[0];

      } else {
        this.actionList.unshift(this.actionList.splice(index, 1)[0]);
      }
      this.$store.commit("setActionList", this.actionList)
    },
    addSwipe() {
      const point = this.$store.getters.getSwipePoint
      const actionList = this.$store.getters.getActionList
      actionList.push({
        'NAME': `滑动坐标(${point.begin.x},${point.begin.y})(${point.end.x},${point.end.y})`,
        'TYPE': "swipe",
        'DATA': {
          "begin_x": point.begin.x,
          "begin_y": point.begin.y,
          "end_x": point.end.x,
          "end_y": point.end.y,
        }
      })
      this.$store.commit("setActionList", actionList)
      this.$store.commit("setSwipePoint", null)
    },
    clearTemplate() {
      this.template = {
        'TITLE': null,
        'DESCRIPTION': null,
        'TYPE': "WEB",
        'DESIRED_CAPS':
            {
              'URL': '',
              'SESSION_ID': null,
              'DRIVER_URL': null
            },
        'ORIENTATION': null,
        'ALERT_CLOSE_ELEMENTS': [],
        'ACTIONS': []
      }
    },
    getCase() {
      const caseResult = JSON.parse(JSON.stringify(this.template))
      const actionList = this.$store.getters.getActionList
      let formRules = true
      this.$refs.templateForm.validate((valid) => {
        if (!valid) {
          message("基础设置错误", "有基础内容没有填写")
          formRules = false
        }
      });
      if (!formRules) {
        return false
      }
      if (actionList.length === 0) {
        message("没有操作步骤", "请填加操作步骤！")
        return false
      }
      caseResult.DESIRED_CAPS.SESSION_ID = this.$store.getters.getSessionId
      caseResult.DESIRED_CAPS.DRIVER_URL = this.$store.getters.getDriverUrl
      caseResult.ACTIONS = actionList
      const alertCloseList = []
      for (const index in this.$store.getters.getAlertClose) {
        alertCloseList.push({
          value: this.$store.getters.getAlertClose[index].value,
          action: this.$store.getters.getAlertClose[index].action
        })
      }
      caseResult.ALERT_CLOSE_ELEMENTS = alertCloseList
      return caseResult
    },
    yamlCase() {
      const caseResult = this.getCase()
      caseResult.DESIRED_CAPS.DRIVER_URL = null
      caseResult.DESIRED_CAPS.SESSION_ID = null
      if (!caseResult) {
        return
      }
      const yaml = require('js-yaml')
      const yaml_data = yaml.safeDump(caseResult)


      function downloadFileHelper(fileName, content) {
        const aTag = document.createElement('a');
        const blob = new Blob([content]);

        aTag.download = fileName + ".yaml";
        aTag.style = "display: none";
        aTag.href = URL.createObjectURL(blob);
        document.body.appendChild(aTag);
        aTag.click();

        setTimeout(function () {
          document.body.removeChild(aTag);
          window.URL.revokeObjectURL(blob);
        }, 100);
      }

      downloadFileHelper(caseResult.TITLE, yaml_data)
    },
    runCase() {
      this.debugTaskResult = null
      const caseResult = this.getCase()
      if (!caseResult) {
        return
      }
      caseTest(caseResult).then(response => {
        if (response.code === 20000 && response.data !== null) {
          this.debugTaskId = response.data.taskId
          message("执行成功！", "等待运行")
        }
      })
    },
    getDebugTaskResult() {
      if (this.debugTaskId) {
        taskResult(this.debugTaskId).then(response => {
          if (response.code === 20000 && response.data.status === "SUCCESS") {
            this.debugTaskResult = response.data.result
            this.debugTaskId = null
            message("用例执行结束请查看结果!")
          }
        })
      }
    },
    loadYamlCase(f) {
      let yaml = require('js-yaml')
      const reader = new FileReader()
      let that = this
      reader.onload = function () {
        if (reader.result) {
          const caseData = yaml.safeLoad(reader.result)
          that.template = caseData
          that.$store.commit("setActionList", caseData["ACTIONS"])
          that.$store.commit("setAlertClose", caseData["ALERT_CLOSE_ELEMENTS"])
        }
      }
      reader.readAsText(f.raw)
    },
    saveXpath() {
      this.$store.commit("setSelectedElementXpath", this.elementXpath)
      this.$store.commit("setIframe", this.iframeXpath)
      message("保存自定义路径成功!")
    },
    clearXpath(event) {
      if (event === "" || event === null) {
        this.$store.commit("setSelectedElementXpath", event)
        this.$store.commit("setWebLocation", null)
      }
    },
    clearIframeXpath(event) {
      if (event === "" || event === null) {
        this.$store.commit("setIframe", event)
      }
    },
    testXpath() {
      this.python.doWebFuncTest({
        'NAME': "定位测试",
        'TYPE': "find_element",
        'DATA': {"location": this.elementXpath}
      })
    }
  }
}
</script>

<style scoped>

</style>
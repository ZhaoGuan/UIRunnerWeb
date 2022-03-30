<template>
  <el-collapse>
    <el-collapse-item title="基础设置">
      <el-form :model="template" :rules="rules" ref="templateForm">
        <el-form-item :size="formItemSize" label="用例名称" prop="TITLE">
          <el-input :size="formItemSize" label="用例名称" v-model="template.TITLE"></el-input>
        </el-form-item>
        <el-form-item :size="formItemSize" label="用例描述" prop="DESCRIPTION">
          <el-input :size="formItemSize" v-model="template.DESCRIPTION"></el-input>
        </el-form-item>
        <el-form-item :size="formItemSize" label="设备密码" prop="DESIRED_CAPS.passWord">
          <el-input :size="formItemSize" v-model="template.DESIRED_CAPS.passWord"></el-input>
        </el-form-item>
        <el-form-item :size="formItemSize" label="appPackage" prop="DESIRED_CAPS.appPackage">
          <el-input :size="formItemSize" v-model="template.DESIRED_CAPS.appPackage"></el-input>
        </el-form-item>
        <el-form-item :size="formItemSize" v-if="platform==='ANDROID'" label="appActivity"
                      prop="DESIRED_CAPS.appActivity">
          <el-input :size="formItemSize" v-model="template.DESIRED_CAPS.appActivity"></el-input>
        </el-form-item>
        <el-form-item :size="formItemSize" v-if="platform==='ANDROID'" label="方向">
          <el-popover
              placement="top-start"
              title="允许值:"
              :width="200"
              trigger="hover"
              content='90 180 270'
          >
            <template #reference>
              <el-input :size="formItemSize" v-model="template.ORIENTATION"></el-input>
            </template>
          </el-popover>
        </el-form-item>
        <el-form-item>
          <el-button :disabled="show" type="success" :size="formItemSize"
                     @click="unlockDevice">解锁设备
          </el-button>
          <el-button :disabled="show" type="success" :size="formItemSize" @click="startApp">启动应用</el-button>
          <el-button type="success" :size="formItemSize" @click="clearTemplate">清空设置</el-button>
          <el-button type="success" :size="formItemSize" @click="androidSetOrientation">
            旋转屏幕
          </el-button>
          <el-upload action="" :auto-upload="false" :on-change="loadYamlCase" accept=".yaml" :show-file-list="false">
            <el-button type="info" :size="formItemSize">导入用例</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
    </el-collapse-item>
    <el-collapse-item title="弹窗关闭">
      <el-col :span="14">
        <el-input size="mini" v-model="alertCloseName"></el-input>
      </el-col>
      <el-col :span="10">
        <el-col :span="8">
          <el-select size="mini" v-model="alertCloseAction">
            <el-option
                v-for="item in alertCloseActionOptions"
                :key="item.value"
                :label="item.value"
                :value="item.value">
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="16">
          <el-button type="success" size="mini" @click="addAlertClose">添加Alert关闭元素</el-button>
        </el-col>
      </el-col>
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
      <el-col :span="4">
        <el-button type="success" size="mini" @click="openDialog">添加动作</el-button>
      </el-col>
      <el-col :span="4">
        <el-popover
            placement="top-start"
            title="规则"
            :width="50"
            trigger="hover"
            content='如果保存了自定义路径则会使用自定义路径'
        >
          <template #reference>
            <el-button type="success" size="mini" @click="addElementClick">元素点击</el-button>
          </template>
        </el-popover>
      </el-col>
      <el-col :span="4">
        <el-button type="success" size="mini" @click="addTap">坐标点击</el-button>
      </el-col>
      <el-col :span="4">
        <el-button type="success" :disabled="$store.getters.getSwipePoint===null" size="mini" @click="addSwipe">获取页面滑动
        </el-button>
      </el-col>
      <el-col :span="4">
        <el-button :disabled="show" type="success" size="mini" @click="$refs.ScreenTool.openDialog()">图像识别</el-button>
      </el-col>
      <el-col :span="4">
        <el-button type="danger" size="mini" @click="clearActionList">清空动作</el-button>
      </el-col>
      <ScreenTool ref="ScreenTool" device-type="mobile"/>
      <el-table
          :data="actionList"
          stripe
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
            <el-button size="mini" icon="el-icon-arrow-up"
                       @click="actionUp(scope.row)">
            </el-button>
            <el-button size="mini" icon="el-icon-arrow-down"
                       @click="actionDown(scope.row)">
            </el-button>
            <el-button size="mini" type="info" @click="funcTest(scope.row)">测试</el-button>
<!--            <el-button size="mini" type="success"-->
<!--                       @click="editAction(scope.row,scope.$index)">EDIT-->
<!--            </el-button>-->
            <el-button size="mini" type="danger" @click="deleteAction(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-row>
        <el-button :disabled="show" type="success" size="mini" @click="yamlCase">生成YML用例
        </el-button>
        <el-button :disabled="show" type="danger" size="mini" @click="runCase">运行</el-button>
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
    <funcDialog ref="funcDialog"/>
  </el-collapse>
</template>

<script>
import {Python} from "@/utils/doPython";
import funcDialog from "../components/funcDialog"
import {message} from "@/utils/tools";
import {caseTest, taskResult} from "@/api/ui";
import ScreenTool from "@/views/components/screenTool"

export default {
  name: "UICase",
  components: {funcDialog, ScreenTool,},
  data() {
    return {
      platform: this.$store.getters.getPlatform.toUpperCase(),
      deviceName: this.$store.getters.getSerial,
      actionList: this.$store.getters.getActionList,
      alertCloseName: null,
      alertCloseAction: "click",
      alertCloseActionOptions: [{value: "click"}, {value: "back"}],
      template: {
        'TITLE': null,
        'DESCRIPTION': null,
        'TYPE': null,
        'DESIRED_CAPS':
            {
              'URL': '',
              'appPackage': 'com.pplingo.chinese',
              'appActivity': 'com.example.connectapp.MainActivity',
              'deviceName': null,
              'passWord': 888888,
              'performance': false,
              'perfHost': "ip",
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
        'DESIRED_CAPS.appPackage': [
          {required: true, type: 'string', message: '请输入appPackage', trigger: 'blur'}
        ],
        'DESIRED_CAPS.appActivity': [
          {required: true, type: 'string', message: '请输入appActivity', trigger: 'blur'}
        ],
      },
      formItemSize: "mini",
      python: Python,
      debugTaskId: null,
      debugTaskTimer: null,
      debugTaskResult: null
    }
  },
  created() {
  },
  mounted() {
    this.debugTaskTimer = setInterval(this.getDebugTaskResult, 5000)
    const saveAlertClose = this.$store.getters.getSaveAlertClose
    if (saveAlertClose) {
      this.$store.commit("setAlertClose", JSON.parse(saveAlertClose))
    }
  },
  watch: {
    '$store.state.platform': function () {
      this.platform = this.$store.getters.getPlatform.toUpperCase()
    },
    '$store.state.serial': function () {
      this.deviceName = this.$store.getters.getSerial
    },
    '$store.state.actionList': function () {
      this.actionList = this.$store.getters.getActionList
    },
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
    unlockDevice() {
      if (this.platform === 'ANDROID') {
        this.python.androidUnlock(this.template.DESIRED_CAPS.passWord)
      } else {
        this.python.iosUnlock(this.template.DESIRED_CAPS.passWord)
      }
    },
    androidSetOrientation() {
      if (this.template.ORIENTATION) {
        this.python.androidSetOrientation(this.template.ORIENTATION)
      }
    },
    startApp() {
      const appPackage = this.template.DESIRED_CAPS.appPackage
      const appActivity = this.template.DESIRED_CAPS.appActivity
      this.python.startApp(appPackage, appActivity)
    },
    openDialog() {
      this.$refs.funcDialog.openDialog()
    },
    addAlertClose() {
      const element = this.$store.getters.getSelectedElement
      if (element === null) {
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
    },
    delAlertClose(data) {
      this.alertCloseList.splice(this.alertCloseList.indexOf(data), 1)
      this.$store.commit("setAlertClose", this.alertCloseList)
      this.$store.commit("setSaveAlertClose", JSON.stringify(this.alertCloseList))
    },
    addElementClick() {
      let element = this.$store.getters.getCustomizeLocation
      if (this.$store.getters.getCustomizeLocation === null) {
        element = this.$store.getters.getSelectedElement
      }
      if (element === null) {
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
      this.python.doFuncTest(data)
    },
    editAction(data, index) {
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
        'TYPE': this.platform,
        'DESIRED_CAPS':
            {
              'URL': '',
              'appPackage': "com.yiding.jianhuo",
              'appActivity': 'com.yiding.jianhuo.SplashActivity',
              'deviceName': null,
              'passWord': 888888,
              'performance': false,
              'perfHost': "ip",
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
      caseResult.ACTIONS = actionList
      caseResult.TYPE = this.platform
      const alertCloseList = []
      for (const index in this.$store.getters.getAlertClose) {
        alertCloseList.push({
          value: this.$store.getters.getAlertClose[index].value,
          action: this.$store.getters.getAlertClose[index].action
        })
      }
      caseResult.ALERT_CLOSE_ELEMENTS = alertCloseList
      caseResult.DESIRED_CAPS.deviceName = this.deviceName
      return caseResult
    },
    yamlCase() {
      const caseResult = this.getCase()
      console.log(caseResult)
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
    }
  }
}
</script>

<style scoped>

</style>
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
        <el-form-item v-if="platform==='ANDROID'" :size="formItemSize" label="设备密码" prop="DESIRED_CAPS.passWord">
          <el-input :size="formItemSize" v-model="template.DESIRED_CAPS.passWord"></el-input>
        </el-form-item>
        <el-form-item :size="formItemSize" label="appPackage" prop="DESIRED_CAPS.appPackage">
          <el-input :size="formItemSize" v-model="template.DESIRED_CAPS.appPackage"></el-input>
        </el-form-item>
        <el-form-item :size="formItemSize" v-if="platform==='ANDROID'" label="appActivity"
                      prop="DESIRED_CAPS.appActivity">
          <el-input :size="formItemSize" v-model="template.DESIRED_CAPS.appActivity"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button :disabled="show" v-if="platform==='ANDROID'" type="success" :size="formItemSize"
                     @click="unlockDevice">解锁设备
          </el-button>
          <el-button :disabled="show" type="success" :size="formItemSize" @click="startApp">启动应用</el-button>
          <el-button type="success" :size="formItemSize" @click="clearTemplate">清空设置</el-button>
        </el-form-item>
      </el-form>
    </el-collapse-item>
    <el-collapse-item title="弹窗关闭">
      <el-col :span="14">
        <el-input size="mini" v-model="alertCloseName"></el-input>
      </el-col>
      <el-col :span="10">
        <el-col :span="12">
          <el-select size="mini" v-model="alertCloseAction">
            <el-option
                v-for="item in alertCloseActionOptions"
                :key="item.value"
                :label="item.value"
                :value="item.value">
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="12">
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
      <funcDialog ref="funcDialog"/>
      <el-button type="success" size="mini" @click="openDialog">添加动作</el-button>
      <el-button type="success" size="mini" @click="addElementClick">添加元素点击</el-button>
      <el-button type="success" size="mini" @click="addTap">添加坐标动作</el-button>
      <el-button type="success" size="mini" @click="clearActionList">清空动作</el-button>
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
        <!--        <el-table-column-->
        <!--            label="DATA"-->
        <!--        >-->
        <!--          <template slot-scope="scope">{{ scope.row.DATA }}</template>-->
        <!--        </el-table-column>-->
        <el-table-column label="操作" width="250">
          <template slot-scope="scope">
            <el-button size="mini" icon="el-icon-arrow-up"
                       @click="actionUp(scope.row)">
            </el-button>
            <el-button size="mini" icon="el-icon-arrow-down"
                       @click="actionDown(scope.row)">
            </el-button>
            <el-button size="mini" type="danger"
                       @click="deleteAction(scope.row)">DELETE
            </el-button>
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
  </el-collapse>
</template>

<script>
import {Python} from "@/utils/doPython";
import funcDialog from "./components/funcDialog"
import {message} from "@/utils/tools";
import {caseTest, taskResult} from "@/api/ui";

export default {
  name: "UICase",
  components: {funcDialog},
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
              'appPackage': 'com.pplingo.connect',
              'appActivity': 'com.pplingo.connect.MainActivity',
              'deviceName': null,
              'passWord': 888888,
              'performance': false,
              'perfHost': "ip",
            },
        'ALERT_CLOSE_ELEMENTS': [],
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
      const element = this.$store.getters.getSelectedElement
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
      const caseResult = this.getCase()
      if (!caseResult) {
        return
      }
      caseTest(caseResult).then(response => {
        if (response.code === 20000 && response.data !== null) {
          this.debugTaskId = response.data.taskId
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
    }
  }
}
</script>

<style scoped>

</style>
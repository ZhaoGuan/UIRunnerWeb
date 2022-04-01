<template>
  <el-dialog :title="title" :visible.sync="funcDialog" :close-on-click-modal="false" @close="clearDialog">
    <el-form label-width="150px">
      <el-form-item label="动作名称">
        <el-input v-model.trim="actionName" size="mini">动作名称</el-input>
      </el-form-item>
      <el-form-item v-if="customizeLocation" label="自定义定位">
        <el-checkbox v-model="useCustomizeLocation" size="mini">是否使用自定义路径</el-checkbox>
        <el-input size="mini" :value="customizeLocation"></el-input>
      </el-form-item>
      <el-form-item label="选择方法">
        <el-select v-model="func" size="mini" placeholder="请选择" style="width: 100%">
          <el-option
              v-for="item in funcList"
              size="mini"
              :key="item.func"
              :label="item.name"
              :value="item.func">
          </el-option>
        </el-select>
        <el-input v-model.trim="funcData.doc" type="textarea" :disabled="true"
                  :autosize="{ minRows: 2, maxRows: 8}">
        </el-input>
      </el-form-item>
      <el-form-item v-for="(key) in funcData.params" v-bind:key="key" :label="key">
        <el-switch v-if="key.substring(0,3)==='is_'" size="mini" v-model="funcParams[key]"
                   active-text="True" inactive-text="False"/>
        <fucSelect v-else-if="key==='func'" ref="fucSelect"/>
        <el-input v-else-if="key==='location' && isCreate" size="mini" v-model="elementLocation"></el-input>
        <el-input v-else-if="key==='location' && !isCreate" size="mini" v-model="editLocation"></el-input>
        <el-input v-else-if="key==='params'" size="mini" :disabled="true" value="参数为所选方法参数"></el-input>
        <el-input v-else size="mini" v-model="funcParams[key]"></el-input>
      </el-form-item>
    </el-form>
    <el-row>
      <el-button v-if="isAdd" type="success" @click="addAction">添加动作</el-button>
      <el-button v-else type="success" @click="updateAction">更新动作</el-button>
      <el-button type="danger" @click="closeDialog">取消</el-button>
    </el-row>
  </el-dialog>
</template>

<script>
import fucSelect from "./fucSelect"

export default {
  name: "funcDialog",
  components: {fucSelect},
  data() {
    return {
      title: null,
      useCustomizeLocation: false,
      funcDialog: false,
      func: null,
      funcParams: {},
      actionName: null,
      isAdd: true,
      isCreate: true,
      actionIndex: null,
      editLocation: null
    }
  },
  created() {
    this.$store.dispatch("getFuncDocList")
  },
  watch: {
    useCustomizeLocation(event) {
      if (this.$refs.fucSelect && this.$refs.fucSelect[0]) {
        this.$refs.fucSelect[0].useCustomizeLocation = event
        this.$refs.fucSelect[0].customizeLocation = this.$store.getters.getCustomizeLocation
      }
    }
  },
  computed: {
    customizeLocation() {
      return this.$store.getters.getCustomizeLocation
    },
    elementLocation() {
      if (this.func.includes('iframe')) {
        return this.$store.getters.getIframe
      } else {
        if (this.useCustomizeLocation) {
          return this.customizeLocation
        } else {
          return this.$store.getters.getSelectedElement
        }
      }
    },
    funcList() {
      return this.$store.getters.getFuncDocList
    },
    funcData() {
      if (this.func) {
        return this.funcMap[this.func]
      } else {
        return {doc: null, params: []}
      }
    },
    funcMap() {
      const map = {}
      for (const index in this.funcList) {
        const funcData = this.funcList[index]
        map[funcData.func] = funcData
      }
      return map
    }
  },
  methods: {
    openDialog() {
      this.title = "添加动作"
      this.funcDialog = true
      this.isCreate = true
    },
    updateDialog(data, actionIndex) {
      this.title = "修改动作"
      this.actionIndex = actionIndex
      this.isCreate = false
      this.funcDialog = true
      this.isAdd = false
      const temp = Object.assign({}, data)
      this.actionName = temp.NAME
      this.func = temp.TYPE
      const dataFuncParams = temp.DATA
      const funcParams = this.funcMap[this.func]
      for (const index in funcParams.params) {
        const funcParamsKey = funcParams.params[index]
        if (Object.keys(dataFuncParams).includes(funcParamsKey)) {
          this.funcParams[funcParamsKey] = dataFuncParams[funcParamsKey]
        } else {
          this.funcParams[funcParamsKey] = null
        }
      }
      if (Object.keys(this.funcParams).includes("location")) {
        this.editLocation = data.DATA.location
      }
      this.$nextTick(() => {
        if (Object.keys(this.funcParams).includes("func")) {
          this.editLocation = data.DATA.params.location
          this.$refs.fucSelect[0].updateDialog(this.funcParams, false)
        }
      })
    },
    closeDialog() {
      this.funcDialog = false
      this.isCreate = true
      this.actionIndex = null
      this.editLocation = null
    },
    clearDialog() {
      this.actionName = null
      this.funcParams = {}
      this.func = null
      this.isAdd = true
    },
    addAction() {
      if (this.funcData.params.includes("func")) {
        const funcSelect = this.$refs["fucSelect"][0]
        this.funcParams.func = funcSelect.func
        this.funcParams.params = funcSelect.getFuncParams()
      }
      if (this.funcData.params.includes("location")) {
        if (this.func.includes('iframe')) {
          this.funcParams.location = this.$store.getters.getIframe
        } else {
          if (this.useCustomizeLocation) {
            this.funcParams.location = this.customizeLocation
          } else {
            this.funcParams.location = this.$store.getters.getSelectedElement
          }
        }
      }
      for (const i in this.funcData.params) {
        const key = this.funcData.params[i]
        if (key.substring(0, 3) === 'is_' && !Object.keys(this.funcParams).includes(key)) {
          this.funcParams[key] = false
        }
      }
      const actionList = this.$store.getters.getActionList
      actionList.push({
        'NAME': this.actionName,
        'TYPE': this.func,
        'DATA': JSON.parse(JSON.stringify(this.funcParams))
      })
      this.$store.commit("setActionList", actionList)
      this.closeDialog()
    },
    updateAction() {
      if (this.funcData.params.includes("func")) {
        const funcSelect = this.$refs["fucSelect"][0]
        this.funcParams.func = funcSelect.func
        this.funcParams.params = funcSelect.getFuncParams()
      }
      if (this.funcData.params.includes("location")) {
        this.funcParams.location = this.editLocation
      }
      for (const i in this.funcData.params) {
        const key = this.funcData.params[i]
        if (key.substring(0, 3) === 'is_' && !Object.keys(this.funcParams).includes(key)) {
          this.funcParams[key] = false
        }
      }
      const actionList = this.$store.getters.getActionList
      actionList.splice(this.actionIndex, 1, {
        'NAME': this.actionName,
        'TYPE': this.func,
        'DATA': JSON.parse(JSON.stringify(this.funcParams))
      })
      this.$store.commit("setActionList", actionList)
      this.closeDialog()
    }
  }
}
</script>

<style scoped>

</style>
<template>
  <el-dialog title="添加动作" :visible.sync="funcDialog" @close="clearDialog">
    <el-form label-width="150px">
      <el-form-item label="动作名称">
        <el-input v-model.trim="actionName">动作名称</el-input>
      </el-form-item>
      <el-form-item label="选择方法">
        <el-select v-model="func" placeholder="请选择" style="width: 100%">
          <el-option
              v-for="item in funcList"
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
        <el-switch v-if="key.substring(0,3)==='is_'" v-model="funcParams[key]" active-text="false"
                   inactive-text="true"/>
        <fucSelect v-else-if="key==='func'" ref="fucSelect"/>
        <el-input v-else-if="key==='location'" size="mine"
                  :value="$store.getters.getSelectedElement"></el-input>
        <el-input v-else-if="key==='params'" size="mine" :disabled="true" value="参数为所选方法参数"></el-input>
        <el-input v-else size="mini" v-model="funcParams[key]"></el-input>
      </el-form-item>
    </el-form>
    <el-row>
      <el-button type="success" @click="addAction">添加动作</el-button>
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
      funcDialog: false,
      func: null,
      funcParams: {},
      actionName: null,

    }
  },
  created() {
    this.$store.dispatch("getFuncDocList")
  },
  watch: {},
  computed: {
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
      this.funcDialog = true
    },
    closeDialog() {
      this.funcDialog = false
    },
    clearDialog() {
      this.actionName = null
      this.funcParams = {}
      this.func = null
    },
    addAction() {
      if (this.funcData.params.includes("func")) {
        const funcSelect = this.$refs["fucSelect"][0]
        this.funcParams.func = funcSelect.func
        this.funcParams.params = funcSelect.getFuncParams()
      }
      if (this.funcData.params.includes("location")) {
        this.funcParams.location = this.$store.getters.getSelectedElement
      }
      const actionList = this.$store.getters.getActionList
      console.log(this.funcParams)
      actionList.push({
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
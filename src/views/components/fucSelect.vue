<template>
  <el-form label-width="150px">
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
      <el-switch v-if="key.substring(0,3)==='is_'" v-model="funcParams[key]" active-text="True" inactive-text="False"/>
      <el-input v-else-if="key==='location'&&isCreate" size="mine" v-model="elementLocation"></el-input>
      <el-input v-else-if="key==='location'&&!isCreate" size="mine" v-model="editLocation"></el-input>
      <el-input v-else size="mini" v-model.trim="funcParams[key]"></el-input>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  name: "fucSelect",
  data() {
    return {
      funcDialog: false,
      func: null,
      isCreate: true,
      funcParams: {},
      actionName: null,
      customizeLocation: false,
      useCustomizeLocation: null,
      editLocation: null
    }
  },
  watch: {},
  computed: {
    elementLocation() {
      if (this.useCustomizeLocation) {
        return this.customizeLocation
      } else {
        return this.$store.getters.getSelectedElement
      }
    },
    funcData() {
      if (this.func) {
        return this.funcMap[this.func]
      } else {
        return {doc: null, params: []}
      }
    },
    funcList() {
      const baseFuncList = this.$store.getters.getFuncDocList
      const funcList = []
      for (const index in baseFuncList) {
        if (!baseFuncList[index].params.includes("func")) {
          funcList.push(baseFuncList[index])
        }
      }
      return funcList
    },
    funcMap() {
      const map = {}
      for (const index in this.funcList) {
        const funcData = this.funcList[index]
        map[funcData.func] = funcData
      }
      return map
    },
  },
  methods: {
    clear() {
      this.func = null
      this.funcData = {
        doc: null,
        params: []
      }
      this.funcParams = null
    },
    updateDialog(data, isCreate) {
      const temp = Object.assign({}, data)
      this.isCreate = isCreate
      this.func = temp.func
      this.funcParams = temp.params
      if (Object.keys(this.funcParams).includes("location")) {
        this.editLocation = data.params.location
      }
    },
    getFuncParams() {
      if (this.funcData.params.includes("location")) {
        if (this.useCustomizeLocation) {
          this.funcParams.location = this.customizeLocation
        } else {
          this.funcParams.location = this.$store.getters.getSelectedElement
        }
      }
      for (const i in this.funcData.params) {
        const key = this.funcData.params[i]
        if (key.substring(0, 3) === 'is_' && !Object.keys(this.funcParams).includes(key)) {
          this.funcParams[key] = false
        }
      }
      return this.funcParams
    }
  }
}
</script>

<style scoped>

</style>
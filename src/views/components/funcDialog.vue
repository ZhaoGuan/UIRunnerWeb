<template>
  <el-dialog title="添加动作" :visible.sync="funcDialog" @close="clearDialog">
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
    <el-row v-for="(value) in funcData.params" v-bind:key="value">
      <el-col :span="4">{{ value }}</el-col>
      <el-col :span="20">
        <el-switch v-if="value.substring(0,3)==='is_'" v-model.trim="funcParams[value]" active-text="false"
                   inactive-text="true"/>
        <el-input v-else v-model.trim="funcParams[value]"></el-input>
      </el-col>
    </el-row>
    <el-row>
      <el-button @click="addAction">添加动作</el-button>
      <el-button @click="closeDialog">取消</el-button>
    </el-row>
  </el-dialog>
</template>

<script>
export default {
  name: "funcDialog",
  data() {
    return {
      funcDialog: false,
      funcList: [
        {
          "func": "android_get_activity_name",
          "name": "# 获取activity名称，可以校验是否符合预期",
          "doc": ":param check_name: 校验的名称\n:param is_assert: 是否报错\n:return: Str/False",
          "params": [
            "check_name",
            "is_assert"
          ]
        },
        {
          "func": "assert_action_fail",
          "name": "# 上文tag执行失败才执行这个动作",
          "doc": ":param func: 使用的方法名\n:param params: 方法名参数\n:param tag: temp_save中的标识内容\n:return:",
          "params": [
            "func",
            "params",
            "tag"
          ]
        },
        {
          "func": "assert_action_pass",
          "name": "# 上文tag执行成功才执行这个动作",
          "doc": ":param func: 使用的方法名\n:param params: 方法名参数\n:param tag: temp_save中的标识内容\n:return:",
          "params": [
            "func",
            "params",
            "tag"
          ]
        },
        {
          "func": "assert_attribute",
          "name": "# 返回元素的方法其中的一个属性是否等于result",
          "doc": ":param func: 返回element的方法\n:param params: 方法名参数\n:param attribute: 获取的属性\n:param result: 校验的结果\n:param is_assert: 是否报错\n:return: bool",
          "params": [
            "func",
            "params",
            "attribute",
            "result",
            "is_assert"
          ]
        },
        {
          "func": "assert_result",
          "name": "# 失败截图判断",
          "doc": ":param result: 输入结果\n:param step_message: 输入错误提示内容\n:return: None",
          "params": [
            "result",
            "step_message"
          ]
        },
        {
          "func": "assert_save_result",
          "name": "# 调用方法将结果保存至临时内容中",
          "doc": ":param func: 使用的方法名\n:param params: 方法名参数\n:param tag: temp_save中的标识内容\n:return:",
          "params": [
            "func",
            "params",
            "tag"
          ]
        },
        {
          "func": "check_attribute_change",
          "name": "# 校验元素的属性和之前保存的是否一致",
          "doc": ":param location: 元素xpath路径,如果定位内容能定位到多个则随机返回元素进行操作\n:param tag: 要从临时存储中获取的tag\n:param attribute: 要获取的属性\n:return: bool",
          "params": [
            "location",
            "tag",
            "attribute"
          ]
        },
        {
          "func": "check_attribute_not_change",
          "name": "# 校验元素的属性和之前保存的是否不一致",
          "doc": ":param location: 元素xpath路径,如果定位内容能定位到多个则随机返回元素进行操作\n:param tag: 要从临时存储中获取的tag\n:param attribute: 要获取的属性\n:return: bool",
          "params": [
            "location",
            "tag",
            "attribute"
          ]
        },
        {
          "func": "clear_element",
          "name": "# 清空输入框",
          "doc": ":param location: 元素xpath路径,如果定位内容能定位到多个则随机返回元素进行操作\n:return: 返回请空前元素",
          "params": [
            "location"
          ]
        },
        {
          "func": "click_element",
          "name": "# 点击元素操作",
          "doc": ":param location: 元素xpath路径,如果定位内容能定位到多个则随机返回元素进行操作\n:return: 返回点击前元素",
          "params": [
            "location"
          ]
        },
        {
          "func": "click_element_change",
          "name": "# 元素点击后是否发生了变化",
          "doc": ":param location: 元素xpath路径,如果定位内容能定位到多个则随机返回元素进行操作\n:return: None",
          "params": [
            "location"
          ]
        },
        {
          "func": "find_element",
          "name": "# 返回发现的元素",
          "doc": ":param location: 元素xpath路径,如果定位内容能定位到多个则随机返回元素进行操作\n:param is_assert: 是否报错，默认为True\n:return: 返回找到的元素",
          "params": [
            "location",
            "is_assert"
          ]
        },
        {
          "func": "get_element_attribute",
          "name": "# 获取元素的特定属性",
          "doc": ":param location: 元素xpath路径,如果定位内容能定位到多个则随机返回元素进行操作\n:param attribute: 要获取的属性\n        bounds 右上宽高",
          "params": [
            "location",
            "attribute"
          ]
        },
        {
          "func": "random_click_element",
          "name": "# 对滑动组件中的元素随机点击",
          "doc": ":param location: 滑动组件中的某个元素xpath路径\n:return: None",
          "params": [
            "location"
          ]
        },
        {
          "func": "save_attribute",
          "name": "# 将元素的属性按照tag：value的形式保存到临时存储中",
          "doc": ":param location: 元素xpath路径,如果定位内容能定位到多个则随机返回元素进行操作\n:param tag: 所保存的tag\n:param attribute: 要获取的属性\n:return: None",
          "params": [
            "location",
            "tag",
            "attribute"
          ]
        },
        {
          "func": "send_element",
          "name": "# 元素输入",
          "doc": ":param location: 元素xpath路径,如果定位内容能定位到多个则随机返回元素进行操作\n:param message: 需要传入的具体内容，也可以是文件路径\n:return: 返回输入前元素",
          "params": [
            "location",
            "message"
          ]
        },
        {
          "func": "shake",
          "name": "# ios摇手机",
          "doc": ":return:",
          "params": []
        },
        {
          "func": "sleep",
          "name": "# 强制等待",
          "doc": ":param wait_time: 等待时间\n:return:",
          "params": [
            "wait_time"
          ]
        },
        {
          "func": "swipe",
          "name": "# 滑动页面",
          "doc": ":param value: 字典形内容\n:return: None\neg: android 使用坐标 ,iOS使用几分之几例如中间点为 (0.5,0.5)\n    selenium {\"begin\":\"\",\"end\":\"\"}",
          "params": [
            "value"
          ]
        },
        {
          "func": "swipe_container",
          "name": "# 对元素进行滑动",
          "doc": ":param location: 元素的xpath路径\n:param deriction: 方向（上下左右）\n:return: None",
          "params": [
            "location",
            "deriction"
          ]
        },
        {
          "func": "swipe_with_percent",
          "name": "# 按屏幕比例滑动页面",
          "doc": ":param percent: 百分比（0-50）\n:param deriction: 方向（上下左右）\n:return: None",
          "params": [
            "percent",
            "deriction"
          ]
        },
        {
          "func": "wait_element",
          "name": "# 等待元素",
          "doc": ":param location: 元素xpath路径,如果定位内容能定位到多个则随机返回元素进行操作\n:param is_assert: 是否报错\n:return: bool",
          "params": [
            "location",
            "is_assert"
          ]
        }],
      func: null,
      funcData: {
        doc: null,
        params: []
      },
      funcParams: {}
    }
  },
  watch: {
    func() {
      this.funcData = this.funcMap[this.func]
    },
    funcParams() {
      console.log(this.funcParams)
      for (const key in this.funcParams) {
        if (key === 'location') {
          this.funcParams[key] = this.$store.getters.getSelectedElement
        }
      }
    }
  },
  computed: {
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
    },
    addAction() {

    }
  }
}
</script>

<style scoped>

</style>
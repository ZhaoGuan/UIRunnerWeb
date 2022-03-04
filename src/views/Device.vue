<template>
  <div>
    <el-row>
      <DeviceHeader ref="DeviceHeader"/>
    </el-row>
    <el-row>
      <el-col :span="8">
        <screen ref="screen"/>
      </el-col>
      <el-col :span="6">
        <nodeDetail ref="nodeDetail"/>
      </el-col>
      <el-col :span="10">
        <el-tabs type="border-card">
          <el-tab-pane label="页面结构">
            <hierarchy-tree ref="hierarchy"/>
          </el-tab-pane>
          <el-tab-pane label="用例动作">
            <UICase ref="UICase"/>
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>
    <el-row>
      <ScreenTool></ScreenTool>
    </el-row>
  </div>
</template>

<script>
import Screen from "@/views/screen";
import hierarchyTree from "@/views/hierarchyTree";
import nodeDetail from "@/views/nodeDetail"
import DeviceHeader from "@/views/header"
import UICase from "@/views/UICase"
import ScreenTool from "@/views/components/screenTool"

export default {
  name: "Device",
  components: {
    hierarchyTree, Screen, nodeDetail, DeviceHeader, UICase, ScreenTool
  },
  mounted() {
    this.$store.dispatch("getFuncDocList")
  },
  data() {
    return {
      swipeBegin: {},
      swipeEnd: {},
      cursor: null,
      nodeSelected: null,
    }
  },
  watch: {},
  methods: {}
}
</script>

<style scoped>

</style>
<template>
  <div id="device" style="width: 100%">
    <el-row style="height: 8vh">
      <DeviceHeader ref="DeviceHeader" />
    </el-row>
    <el-row style="height: 90vh">
      <el-col :span="12">
        <screen ref="screen" style="height: 100%"/>
      </el-col>
      <el-col :span="12" class="device-detail">
        <el-tabs type="border-card">
          <el-tab-pane label="元素操作">
            <nodeDetail ref="nodeDetail"/>
          </el-tab-pane>
          <el-tab-pane label="用例动作">
            <UICase ref="UICase"/>
          </el-tab-pane>
          <el-tab-pane label="页面结构">
            <hierarchy-tree ref="hierarchy"/>
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import Screen from "@/views/Mobile/screen";
import hierarchyTree from "@/views/Mobile/hierarchyTree";
import nodeDetail from "@/views/Mobile/nodeDetail"
import DeviceHeader from "@/views/Mobile/header"
import UICase from "@/views/Mobile/UICase"

export default {
  name: "Device",
  components: {
    hierarchyTree, Screen, nodeDetail, DeviceHeader, UICase
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
#device {

}

.device-detail {
  height: 100%;
  overflow: auto;
}
</style>
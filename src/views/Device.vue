<template>
  <div id="device">
    <el-row>
      <DeviceHeader ref="DeviceHeader" style="height: 8vh"/>
    </el-row>
    <el-row>
      <el-col :span="12">
        <screen ref="screen" style="height: 90vh;"/>
      </el-col>
      <!--      <el-col :span="7">-->
      <!--        <nodeDetail ref="nodeDetail" class="device-detail"/>-->
      <!--      </el-col>-->
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
import Screen from "@/views/screen";
import hierarchyTree from "@/views/hierarchyTree";
import nodeDetail from "@/views/nodeDetail"
import DeviceHeader from "@/views/header"
import UICase from "@/views/UICase"

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
  height: 90vh;
  overflow: scroll;
}
</style>
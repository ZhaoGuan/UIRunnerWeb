<template>
  <div>
    <el-row>
      <DeviceHeader ref="DeviceHeader"/>
    </el-row>
    <el-row>
      <el-col :span="8">
        <screen ref="screen"/>
      </el-col>
      <el-col :span="8">
        <nodeDetail ref="nodeDetail"/>
      </el-col>
      <el-col :span="8">
        <hierarchy-tree ref="hierarchy"/>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import Screen from "@/views/screen";
import hierarchyTree from "@/views/hierarchyTree";
import nodeDetail from "@/views/nodeDetail"
import DeviceHeader from "@/views/header"

export default {
  name: "Device",
  components: {hierarchyTree, Screen, nodeDetail, DeviceHeader},
  mounted() {
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
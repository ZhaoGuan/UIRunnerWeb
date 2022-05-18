<template>
  <el-dialog title="请选择用例" :visible.sync="caseTreeDialog" :close-on-click-modal="false" @close="clearCreateDialog">
    <el-tree v-if="caseTreeDialog" class='caseTree' :data="treeData" :props="defaultProps"
             node-key="path"
             ref="tree"
             accordion
             highlight-current
             :expand-on-click-node="false">
          <span class="custom-tree-node" slot-scope="{ node, data }">
        <span>{{ node.label }}</span>
        <span style="float: right">
          <el-button
              v-if="data.type!=='dir'"
              type="text"
              size="mini"
              @click="() => selectCase(data)">
           Select
          </el-button>
        </span>
      </span>
    </el-tree>
  </el-dialog>
</template>

<script>
import {getCaseTree, getCaseData} from "@/api/ui";
import {message} from "@/utils/tools";

export default {
  name: "fileCaseSelect",
  props: ["caseType"],
  data() {
    return {
      treeData: [],
      defaultProps: {
        children: 'cases',
        label: 'name'
      },
      caseTreeDialog: false,
    }
  },
  created() {
    this.toGetCaseTree()
  },
  methods: {
    toGetCaseTree() {
      getCaseTree().then(res => {
        this.treeData = res.data
      })
    },
    clearCreateDialog() {
    },
    selectCase(data) {
      getCaseData(data.path).then(res => {
        if (res.code === 20000) {
          const caseData = res.data
          const caseType = caseData['TYPE']
          if (this.caseType === 'web' && caseType !== 'web') {
            message('所选用例非web用例')
            return
          }
          if (this.caseType !== 'web' && caseType === 'web') {
            message('所选用例非手机用例')
            return
          }
          // 这部分内容需要精细化
          this.$store.commit("setCaseBaseData", caseData)
          this.$store.commit("setActionList", caseData["ACTIONS"])
          this.$store.commit("setAlertClose", caseData["ALERT_CLOSE_ELEMENTS"])
          this.caseTreeDialog = false
        }
      })
    }
  }
}
</script>

<style scoped>
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
</style>
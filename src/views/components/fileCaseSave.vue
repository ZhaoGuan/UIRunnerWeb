<template>
  <el-dialog title="存储用例" :visible.sync="saveCaseDialog" :close-on-click-modal="false" @close="closeDialog">
    <el-form v-model="body" ref="saveBody">
      <el-form-item label="文件夹" prop="dirPath" :rules="[{ required: true, message: '请填选择一个文件夹', trigger: 'blur' }]">
        <el-select size="mini" v-model="body.dirPath" placeholder="请选择用例文件夹" style="width: 100%">
          <el-option
              v-for="item in dirList"
              :key="item.dirName"
              :label="item.dirName"
              :value="item.dirPath">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="文件名称" :rules="[{ required: true, message: '请输入用例名称', trigger: 'blur' }]">
        <el-input size="mini" v-model="body.fileName"></el-input>
      </el-form-item>
    </el-form>
    <el-button size="mini" type="success" @click="saveCase">保存</el-button>
    <el-button size="mini" type="danger" @click="saveCaseDialog=false">取消</el-button>

  </el-dialog>
</template>

<script>
import {getCaseDir, checkCaseExists, saveCaseData} from "@/api/ui";

const {Message} = require("element-ui");

export default {
  name: "fileCaseSave",
  data() {
    return {
      saveCaseDialog: false,
      dirList: [],
      body: {
        dirPath: null,
        fileName: null
      },
    }
  },
  created() {
    this.toGetCaseDir()
  },
  methods: {
    doSaveCase(caseData) {
      saveCaseData({
        dirPath: this.body.dirPath,
        fileName: this.body.fileName,
        caseData: caseData
      }).then(res => {
            if (res.code === 20000) {
              this.saveCaseDialog = false
            }
          }
      )
    },
    saveCase() {
      const caseData = this.$parent.getCase()
      const casePath = this.body.dirPath + "/" + this.body.fileName + ".yml"
      checkCaseExists(casePath).then(res => {
        if (res.data) {
          this.doSaveCase(caseData)
        } else {
          this.$confirm('文件已经存在是否要覆盖', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.doSaveCase(caseData)
          }).catch(() => {
            Message({
              type: 'info',
              message: '已取消覆盖'
            });
          });
        }
      })

    },
    toGetCaseDir() {
      getCaseDir().then(res => {
        if (res.code === 20000) {
          this.dirList = res.data
        }
      })
    },
    closeDialog() {
      this.selectDir = null
    }
  }
}
</script>

<style scoped>

</style>
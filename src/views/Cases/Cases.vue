<template>
  <div style="width: 100%">
    <el-col>
      <el-card style="height: 100%">
        <h3><code>用例列表</code></h3>
        <el-row type="flex" justify="left">
          <el-button size="mini" type="success" @click="createDir=true">创建文件夹</el-button>
          <el-button size="mini" type="danger" @click="deleteCases">批量删除用例</el-button>
          <el-button size="mini" type="danger" @click="ignoreCases">批量忽略用例</el-button>
          <el-button size="mini" type="success" @click="unIgnoreCases">取消忽略用例</el-button>
          <el-button size="mini" type="primary" @click="resetChecked">清空</el-button>
        </el-row>
        <el-tree class='caseTree' :data="treeData" :props="defaultProps" show-checkbox
                 node-key="path"
                 ref="tree"
                 accordion
                 highlight-current
                 :expand-on-click-node="false">
          <span class="custom-tree-node" slot-scope="{ node, data }">
        <span>{{ node.label }}</span>
        <span style="float: right">
          <el-button
              type="text"
              size="mini"
              @click="() => renamePath(data)">
           Rename
          </el-button>
          <el-button
              type="text"
              size="mini"
              @click="() => remove(node, data)">
            Delete
          </el-button>
        </span>
      </span>
        </el-tree>
      </el-card>
    </el-col>
    <el-dialog title="创建用例文件夹" :visible.sync="createDir" :close-on-click-modal="false" @close="clearCreateDialog">
      <el-input size="mini" v-model="dirName"></el-input>
      <el-button size="mini" type="success" @click="toCreateCaseDir">创建文件夹</el-button>
      <el-button size="mini" type="danger" @click="createDir=false">关闭</el-button>
    </el-dialog>
    <el-dialog title="修改名称" :visible.sync="renameDir" :close-on-click-modal="false" @close="clearRenameDialog">
      <p><code>用例名称以!开头表明为略的用例</code></p>
      <el-input size="mini" v-model="newName"></el-input>
      <el-button size="mini" type="success" @click="toRename">修改</el-button>
      <el-button size="mini" type="danger" @click="renameDir=false">关闭</el-button>
    </el-dialog>
  </div>
</template>

<script>
import {getCaseTree, createCaseDir, renameCaseTree, deleteCase, ignoreCases,unIgnoreCases} from "@/api/ui";
import {message} from "@/utils/tools";

const {Message} = require("element-ui");

export default {
  name: "Cases",
  data() {
    return {
      treeData: [],
      defaultProps: {
        children: 'cases',
        label: 'name'
      },
      createDir: false,
      dirName: null,
      renameDir: false,
      selectPath: null,
      newName: null,
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
    toCreateCaseDir() {
      createCaseDir({dirName: this.dirName}).then(res => {
        if (res.code === 20000) {
          this.createDir = false
          message("创建文件夹成功", "")
          this.toGetCaseTree()
        }
      })
    },
    toRename() {
      if (this.selectPath.type === 'file' && (!this.newName.endsWith('.yml' && !this.newName.endsWith('.yaml')))) {
        message('用例需要是.yaml获.yml')
        return
      }
      renameCaseTree({
        oldPath: this.selectPath.path,
        newPath: this.selectPath.root + "/" + this.newName
      }).then(res => {
        if (res.code === 20000) {
          this.renameDir = false
          message("修改名称成功", "")
          this.toGetCaseTree()
        }
      })
    },
    clearCreateDialog() {
      this.dirName = null
    },
    clearRenameDialog() {
      this.selectPath = null
      this.newName = null
    },
    deleteCases() {
      let casePathList = []
      const nodes = this.$refs.tree.getCheckedNodes()
      for (const index in nodes) {
        const tempNode = nodes[index]
        if (tempNode.type === 'file') {
          casePathList.push(tempNode.path)
        }
      }
      this.$confirm('是否要删除所选用例？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteCase({pathList: casePathList}).then(res => {
          if (res.code === 20000) {
            Message({
              type: 'success',
              message: '删除成功!'
            });
            this.toGetCaseTree()
          }
        })
      }).catch(() => {
        Message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },
    ignoreCases() {
      let caseList = []
      const nodes = this.$refs.tree.getCheckedNodes()
      for (const index in nodes) {
        const tempNode = nodes[index]
        if (tempNode.type === 'file') {
          caseList.push({root: tempNode.root, name: tempNode.name})
        }
      }
      this.$confirm('是否要忽略这些用例？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        ignoreCases({cases: caseList}).then(res => {
          if (res.code === 20000) {
            Message({
              type: 'success',
              message: '忽略执行成功!'
            });
            this.toGetCaseTree()
          }
        })
      }).catch(() => {
        Message({
          type: 'info',
          message: '已取消'
        });
      });

    },
    unIgnoreCases() {
      let caseList = []
      const nodes = this.$refs.tree.getCheckedNodes()
      for (const index in nodes) {
        const tempNode = nodes[index]
        if (tempNode.type === 'file') {
          caseList.push({root: tempNode.root, name: tempNode.name})
        }
      }
      this.$confirm('是否要忽略这些用例？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        unIgnoreCases({cases: caseList}).then(res => {
          if (res.code === 20000) {
            Message({
              type: 'success',
              message: '忽略执行成功!'
            });
            this.toGetCaseTree()
          }
        })
      }).catch(() => {
        Message({
          type: 'info',
          message: '已取消'
        });
      });

    },
    resetChecked() {
      this.$refs.tree.setCheckedKeys([]);
    },
    renamePath(data) {
      this.selectPath = data
      this.renameDir = true
    },
    remove(node, data) {
      this.selectPath = data
      const pathType = data.type
      let message = null
      if (pathType === 'dir') {
        message = '是否要删除文件夹？也会删除其中所有用例!'
      } else {
        message = '是否要删除用例？'
      }
      this.$confirm(message, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteCase({pathList: [this.selectPath.path]}).then(res => {
          if (res.code === 20000) {
            Message({
              type: 'success',
              message: '删除成功!'
            });
            this.toGetCaseTree()
          }
        })
      }).catch(() => {
        Message({
          type: 'info',
          message: '已取消删除'
        });
      });
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
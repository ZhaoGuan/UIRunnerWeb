<template>
  <el-card shadow="hover">
    <el-tree ref="tree"
             :highlight-current="true"
             :check-on-click-node="true"
             :render-after-expand="false"
             :data="hierarchyData"
             :props="defaultProps"
             :default-expanded-keys="expandedKeys"
             @node-click="handleNodeClick"
             node-key="_id"
    style="overflow: auto">
    </el-tree>
  </el-card>
</template>

<script>
export default {
  name: "hierarchyTree",
  data() {
    return {
      search: true,
      filterNodeId: null,
      filterNodeData: null,
      expandedKeys: [],
      defaultProps: {
        children: 'children',
        label: '_type'
      }
    }
  },
  watch: {
    "$store.state.nodeSelectedId": function () {
      this.setFilterNode(this.$store.getters.getNodeSelectedId)
    }
  },
  computed: {
    hierarchyData() {
      if (this.$store.getters.getJsonHierarchy === null) {
        return []
      } else {
        return [this.$store.getters.getJsonHierarchy]
      }
    },
    nodesMap() {
      const nodesMap = {}

      function sourceMap(source) {
        for (const key in source) {
          const node = source[key]
          if (node.key && node.parent) {
            let tempParentId = null
            let tempParentData = null
            const tempParent = node.parent
            if (tempParent) {
              tempParentId = tempParent.key
              tempParentData = tempParent.data
            }
            const tempData = node.data
            const nodeId = node.key
            const children = []
            for (const child in node.childNodes) {
              children.push(node.childNodes[child].data)
              sourceMap(node.childNodes)
            }
            nodesMap[nodeId] = tempData
            nodesMap[nodeId]["children"] = children
            nodesMap[nodeId]["parentId"] = tempParentId
            nodesMap[nodeId]["parent"] = tempParentData
          } else {
            sourceMap(source.childNodes)
          }
        }
      }

      sourceMap(this.$refs.tree.root.childNodes)
      return nodesMap
    }
  },
  methods: {
    setFilterNode(NodeId) {
      this.unExpandAll()
      this.filterNodeId = NodeId
      this.showNode()
    },
    expandNode(node) {
      node.expanded = true
      if (node.parent) {
        this.expandNode(node.parent)
      }
    },
    showNode() {
      if (this.filterNodeId in this.$refs.tree.store.nodesMap) {
        const filterNode = this.$refs.tree.store.nodesMap[this.filterNodeId]
        this.expandNode(filterNode)
        this.$refs.tree.setCurrentKey(this.filterNodeId)
        this.filterNodeData = filterNode.data
      }
    },
    unExpandAll() {
      for (let key in this.$refs.tree.store.nodesMap) {
        if (this.$refs.tree.store.nodesMap[key].expanded) {
          this.$refs.tree.store.nodesMap[key].expanded = false
        }
      }
    },
    handleNodeClick(data) {
      this.filterNodeData = data
      this.$store.commit("setNodeSelected", data)
    }
  }
}
</script>

<style scoped>

</style>
<template>
  <el-card shadow="hover">
    <el-row class="panel-heading">
      <el-col :span="12">
        <label>选择的元素</label>
      </el-col>
      <el-col :span="12">
        <el-button size="mini" :disabled="loading" @click="clearCanvas()">
          Clear Canvas
        </el-button>
      </el-col>
    </el-row>
    <el-row class="panel-body">
      <div class="text-center">
        <el-button size="mini" v-show="platform==='Android'" class="btn btn-default btn-sm" @click="doUnlock()">
          Unlock
        </el-button>
        <el-button
            size="mini"
            class="btn btn-default btn-sm"
            @click="doSendKeys('')">
          Send Keys
        </el-button>
        <el-button size="mini" v-show="platform==='Android'" class="btn btn-default btn-sm"
                   @click="doKeyEventNu('66')">
          <i class="fa fa-power-off color-red"></i> enter
        </el-button>
        <el-button size="mini" :disabled="!nodeSelected" @click="doTap()">Tap
        </el-button>
        <el-button size="mini" :disabled="!nodeSelected" @click="doSetText('')">
          Send Text
        </el-button>
        <el-button size="mini" :disabled="!nodeSelected" @click="doClear()">Clear
          Text
        </el-button>
      </div>
    </el-row>
    <el-row border=“true”>
      <el-col :span="6">
        <el-checkbox v-model="showCursorPercent">点击坐标</el-checkbox>
        <i v-if="showCursorPercent">(px)</i>
        <i v-else>(%)</i>
      </el-col>
      <el-col border="true" :span="18">
        <code class="prop-value">X:{{ cursorValue.x }} </code>
        <code class="prop-value">Y:{{ cursorValue.y }} </code>
        <el-button size="mini" @click="doPositionTap(cursorValue.x, cursorValue.y)">点击</el-button>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="6"><code>名称</code></el-col>
      <el-col :span="18"><code>内容</code></el-col>
    </el-row>
    <el-row v-if="platform === 'Android'">
      <el-col :span="6"><code>activity</code></el-col>
      <el-col :span="18">
        <el-input type="textarea" :autosize="{ minRows: 1, maxRows: 6 }" v-model="activity"></el-input>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="6"><code>XPathLite</code></el-col>
      <el-col :span="18">
        <el-input type="textarea" :autosize="{ minRows: 1, maxRows: 6 }" v-model="elemXPathLite"></el-input>
      </el-col>
    </el-row>
    <el-row v-if="nodeSelected&&nodeSelected._type!==null">
      <el-col :span="6"><code>ClassName</code></el-col>
      <el-col :span="18">
        <code class="prop-value" v-if="platform === 'iOS'">XCUIElementType </code>
        <code v-text="nodeSelected._type"></code>
      </el-col>
    </el-row>
    <template v-if="nodeSelected">
      <el-row v-for="(eleKey) in filterAttributeKeys(nodeSelected)"
              :key="eleKey">
        <el-col :span="6"><code>{{ eleKey }}</code></el-col>
        <el-col :span="18"><code>{{ nodeSelected[eleKey] }}</code></el-col>
      </el-row>
    </template>
    <template v-if="nodeSelected&&nodeSelected.rect">
      <el-row>
        <el-col :span="6">rect</el-col>
        <el-col :span="18">
          <span v-for="(value,key) in nodeSelected.rect" class="prop-value" :key="key">
              <code class="prop-value">{{ key }}:{{ value }} </code>
            </span></el-col>
      </el-row>
    </template>
  </el-card>
</template>

<script>
import {nodesMap} from "@/utils/common";
import {Python} from "@/utils/doPython";

export default {
  name: "nodeDetail",
  data() {
    return {
      elem: {
        rect: null
      },
      python: Python,
      generatedCode: '',
      autoCopy: true,
      useXPathOnly: false,
      canvas: null,
      cursor: {},
      showCursorPercent: true,
      mapAttrCount: {},
      originNodeMaps: null,
      nodeSelected: null
    }
  },
  created() {
  },
  computed: {
    loading() {
      return this.$store.getters.getLoading
    },
    activity() {
      return this.$store.getters.getActivity
    },
    platform() {
      return this.$store.getters.getPlatform
    },
    nodes: function () {
      const nodesList = []
      for (const key in this.originNodeMaps) {
        nodesList.push(this.originNodeMaps[key])
      }
      return nodesList
    },
    cursorValue: function () {
      const cursor = this.$store.getters.getCursor
      if (cursor === null) {
        return {}
      }
      if (this.showCursorPercent) {
        return {x: cursor.px, y: cursor.py}
      } else {
        return cursor
      }
    },
    elemXPathLite: function () {
      this.emptyMapAttrCount()
      this.nodes.forEach((n) => {
        this.incrAttrCount("label", n.label)
        this.incrAttrCount("resourceId", n.resourceId)
        this.incrAttrCount("text", n.text)
        this.incrAttrCount("_type", n._type)
        this.incrAttrCount("description", n.description)
      })
      let node = this.nodeSelected;
      let array = [];
      while (node && node.parentId) {
        const parent = this.originNodeMaps[node.parentId]
        if (this.getAttrCount("label", node.label) === 1) {
          array.push(`*[@label="${node.label}"]`)
          break
        } else if (this.getAttrCount("resourceId", node.resourceId) === 1) {
          array.push(`*[@resource-id="${node.resourceId}"]`)
          break
        } else if (this.getAttrCount("text", node.text) === 1) {
          array.push(`*[@text="${node.text}"]`)
          break
        } else if (this.getAttrCount("description", node.description) === 1) {
          array.push(`*[@content-desc="${node.description}"]`)
          break
        } else if (this.getAttrCount("_type", node._type) === 1) {
          array.push(`${node._type}`)
          break
        } else if (!parent) {
          array.push(`${node._type}`)
        } else {
          let index = 0;
          parent.children.some((n) => {
            if (n._type === node._type) {
              index++
            }
            return n._id === node._id
          })
          array.push(`${node._type}[${index}]`)
        }
        if (node.parent && node.parent._type) {
          node = parent;
        } else {
          break
        }
      }
      return `//${array.reverse().join("/")}`
    },
    deviceUrl: function () {
      if (this.platform === 'Android' && this.serial === '') {
        return '';
      }
      if (this.platform === 'iOS' && this.serial === '') {
        return 'http://localhost:8100';
      }
      if (this.platform === 'Neco') {
        const ipex = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b:?\d*/;
        const t = this.serial.match(ipex);
        return t ? t[0] : '';
      }
      return this.serial;
    },
  },
  watch: {
    '$store.state.platform': function () {
      this.platform = this.$store.getters.getPlatform
    },
    // '$store.state.loading': function () {
    //   this.loading = this.$store.getters.getLoading
    // },
    '$store.state.jsonHierarchy': function () {
      this.originNodeMaps = nodesMap(this.$store.getters.getJsonHierarchy)
    },
    '$store.state.nodeSelected': function () {
      this.nodeSelected = this.$store.getters.getNodeSelected
      this.python.nodeSelectedXpath = this.elemXPathLite
    }
  },
  methods: {
    emptyMapAttrCount() {
      this.mapAttrCount = {}
    },
    incrAttrCount(collectionKey, key) {
      if (!Object.prototype.hasOwnProperty.call(this.mapAttrCount, collectionKey)) {
        this.mapAttrCount[collectionKey] = {}
      }
      let count = this.mapAttrCount[collectionKey][key] || 0;
      this.mapAttrCount[collectionKey][key] = count + 1;
    },
    getAttrCount(collectionKey, key) {
      let mapCount = this.mapAttrCount[collectionKey];
      if (!mapCount) {
        return 0
      }
      return mapCount[key] || 0;
    },
    filterAttributeKeys(elem) {
      return Object.keys(elem).filter(k => {
        if (['children', 'rect', "parent", "parentId"].includes(k)) {
          return false;
        }
        return !k.startsWith("_");
      })
    },
    // canvas
    clearCanvas: function () {
      const canvas = document.getElementById('fgCanvas')
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    },
    // code
    doUnlock() {
      this.python.doUnlock()
    }, doSendKeys() {
      this.python.doSendKeys()
    }, doKeyEventNu(meta) {
      this.python.doKeyEventNu(meta)
    }, doTap() {
      this.python.doTap()
    }, doSetText() {
      this.python.doSetText()
    }, doClear() {
      this.python.doClear()
    }, doPositionTap(x, y) {
      this.python.doPositionTap(x, y)
    }
  }
}
</script>

<style scoped>

</style>